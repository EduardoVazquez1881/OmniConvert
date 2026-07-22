import os
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query, Form
from fastapi.responses import FileResponse
import yt_dlp

from app.utils.file_manager import get_temp_path, cleanup_old_files, TEMP_DIR

router = APIRouter(prefix="/api/media", tags=["media"])

# Path for optional cookies file if uploaded or set via environment
COOKIES_FILE = Path(__file__).resolve().parent.parent.parent / "cookies.txt"

def get_ytdl_opts(extra_opts: dict = None) -> dict:
    opts = {
        "quiet": True,
        "no_warnings": True,
        "nocheckcertificate": True,
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "extractor_args": {
            "youtube": {
                "player_client": ["web_creator", "tv_embedded", "mweb", "ios", "android"],
                "player_skip": ["configs", "webpage"]
            }
        }
    }
    
    # Use cookies.txt if exists on server or if set via YOUTUBE_COOKIES env var
    if COOKIES_FILE.exists():
        opts["cookiefile"] = str(COOKIES_FILE)
    elif os.environ.get("YOUTUBE_COOKIES"):
        cookies_env_path = TEMP_DIR / "env_cookies.txt"
        with open(cookies_env_path, "w") as f:
            f.write(os.environ.get("YOUTUBE_COOKIES"))
        opts["cookiefile"] = str(cookies_env_path)
        
    if extra_opts:
        opts.update(extra_opts)
        
    return opts

@router.get("/info")
async def get_media_info(url: str = Query(...)):
    if not url.strip():
        raise HTTPException(status_code=400, detail="Debe ingresar una URL válida.")
        
    ydl_opts = get_ytdl_opts({"skip_download": True})
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if not info:
                raise HTTPException(status_code=400, detail="No se pudo extraer información del video.")
                
            formats = []
            seen_res = set()
            for f in info.get("formats", []):
                height = f.get("height")
                ext = f.get("ext", "mp4")
                vcodec = f.get("vcodec", "")
                if height and vcodec != "none" and height not in seen_res:
                    seen_res.add(height)
                    formats.append({
                        "format_id": f.get("format_id"),
                        "resolution": f"{height}p",
                        "height": height,
                        "ext": ext,
                    })
                    
            formats.sort(key=lambda x: x["height"], reverse=True)
            
            return {
                "title": info.get("title", "Video"),
                "thumbnail": info.get("thumbnail"),
                "duration": info.get("duration", 0),
                "uploader": info.get("uploader", "Desconocido"),
                "formats": formats[:6]
            }
    except Exception as e:
        err_str = str(e)
        if "Sign in to confirm" in err_str or "bot" in err_str:
            raise HTTPException(
                status_code=400, 
                detail="YouTube ha restringido temporalmente este enlace por detección de bot en el servidor. Intenta con otro enlace o agrega cookies en configuración."
            )
        raise HTTPException(status_code=400, detail=f"No se pudo obtener información del enlace: {err_str}")

@router.post("/download")
async def download_media(
    url: str = Form(...),
    download_type: str = Form("video"),
    format_id: str = Form(None)
):
    cleanup_old_files()
    file_id = uuid.uuid4().hex[:8]
    out_template = str(TEMP_DIR / f"media_{file_id}.%(ext)s")
    
    if download_type == "audio":
        ydl_opts = get_ytdl_opts({
            "format": "bestaudio/best",
            "outtmpl": out_template,
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }],
        })
    else:
        fmt_spec = format_id if format_id else "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"
        ydl_opts = get_ytdl_opts({
            "format": fmt_spec,
            "outtmpl": out_template,
        })
        
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            
            if download_type == "audio":
                base = os.path.splitext(filename)[0]
                if os.path.exists(f"{base}.mp3"):
                    filename = f"{base}.mp3"
                    
            if not os.path.exists(filename):
                candidates = list(TEMP_DIR.glob(f"media_{file_id}.*"))
                if candidates:
                    filename = str(candidates[0])
                else:
                    raise FileNotFoundError("Archivo descargado no encontrado en almacenamiento temporal.")
                    
            safe_title = "".join([c if c.isalnum() or c in ("-", "_") else "_" for c in info.get("title", "download")])
            ext = Path(filename).suffix
            download_name = f"{safe_title}{ext}"
            
            media_type = "audio/mpeg" if ext == ".mp3" else "video/mp4"
            return FileResponse(filename, filename=download_name, media_type=media_type)
            
    except Exception as e:
        err_str = str(e)
        if "Sign in to confirm" in err_str or "bot" in err_str:
            raise HTTPException(
                status_code=500, 
                detail="YouTube bloqueó temporalmente la descarga en la nube. Intenta con un enlace de TikTok, Vimeo, Twitter o agrega cookies."
            )
        raise HTTPException(status_code=500, detail=f"Error durante la descarga: {err_str}")
