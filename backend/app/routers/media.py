import os
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query, Form
from fastapi.responses import FileResponse
import yt_dlp

from app.utils.file_manager import get_temp_path, cleanup_old_files, TEMP_DIR

router = APIRouter(prefix="/api/media", tags=["media"])

@router.get("/info")
async def get_media_info(url: str = Query(...)):
    if not url.strip():
        raise HTTPException(status_code=400, detail="Debe ingresar una URL válida.")
        
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
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
                "formats": formats[:6]  # Top resolutions
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo obtener información del enlace: {str(e)}")

@router.post("/download")
async def download_media(
    url: str = Form(...),
    download_type: str = Form("video"), # 'video' or 'audio'
    format_id: str = Form(None)
):
    cleanup_old_files()
    file_id = uuid.uuid4().hex[:8]
    out_template = str(TEMP_DIR / f"media_{file_id}.%(ext)s")
    
    if download_type == "audio":
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": out_template,
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }],
            "quiet": True,
        }
    else:
        fmt_spec = format_id if format_id else "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"
        ydl_opts = {
            "format": fmt_spec,
            "outtmpl": out_template,
            "quiet": True,
        }
        
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            
            if download_type == "audio":
                # Ensure .mp3 extension if converted or fallback
                base = os.path.splitext(filename)[0]
                if os.path.exists(f"{base}.mp3"):
                    filename = f"{base}.mp3"
                    
            if not os.path.exists(filename):
                # Search for created file with matching file_id
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
        raise HTTPException(status_code=500, detail=f"Error durante la descarga: {str(e)}")
