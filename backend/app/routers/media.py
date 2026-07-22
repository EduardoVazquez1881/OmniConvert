import os
import re
import uuid
import requests
from urllib.parse import quote
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query, Form
from fastapi.responses import FileResponse
import yt_dlp

from app.utils.file_manager import get_temp_path, cleanup_old_files, TEMP_DIR

router = APIRouter(prefix="/api/media", tags=["media"])

COOKIES_FILE = Path(__file__).resolve().parent.parent.parent / "cookies.txt"

def get_ytdl_opts(extra_opts: dict = None) -> dict:
    opts = {
        "quiet": True,
        "no_warnings": True,
        "nocheckcertificate": True,
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "extractor_args": {
            "youtube": {
                "player_client": ["web", "mweb", "android"]
            }
        }
    }
    
    cookie_path = None
    if COOKIES_FILE.exists() and COOKIES_FILE.stat().st_size > 0:
        cookie_path = str(COOKIES_FILE)
    elif os.environ.get("YOUTUBE_COOKIES"):
        try:
            TEMP_DIR.mkdir(parents=True, exist_ok=True)
            cookies_env_path = TEMP_DIR / "env_cookies.txt"
            raw_cookies = os.environ.get("YOUTUBE_COOKIES", "").strip()
            
            if "\\n" in raw_cookies:
                raw_cookies = raw_cookies.replace("\\n", "\n")
                
            if not raw_cookies.startswith("# Netscape"):
                raw_cookies = "# Netscape HTTP Cookie File\n" + raw_cookies
                
            with open(cookies_env_path, "w", encoding="utf-8") as f:
                f.write(raw_cookies)
                
            cookie_path = str(cookies_env_path)
        except Exception:
            pass
            
    if cookie_path:
        opts["cookiefile"] = cookie_path
        
    if extra_opts:
        opts.update(extra_opts)
        
    return opts

def extract_youtube_video_id(url: str) -> str:
    """Extract YouTube video ID from various URL formats"""
    match = re.search(r"(?:v=|\/|youtu\.be\/)([a-zA-Z0-9_-]{11})", url)
    return match.group(1) if match else None

def fetch_oembed_youtube_info(raw_url: str):
    """Fallback metadata extractor using YouTube No-Cookie OEMBED API (Never blocked on Datacenter IPs)"""
    try:
        encoded_url = quote(raw_url.strip(), safe='')
        oembed_url = f"https://www.youtube-nocookie.com/oembed?url={encoded_url}&format=json"
        r = requests.get(oembed_url, timeout=5)
        if r.status_code == 200:
            data = r.json()
            return {
                "title": data.get("title", "Video de YouTube"),
                "thumbnail": data.get("thumbnail_url"),
                "duration": 0,
                "uploader": data.get("author_name", "YouTube Channel"),
                "formats": [
                    {"format_id": "best", "resolution": "720p / 360p (MP4 Video)", "height": 720, "ext": "mp4"},
                ]
            }
    except Exception:
        pass
    return None

@router.get("/info")
async def get_media_info(url: str = Query(...)):
    if not url.strip():
        raise HTTPException(status_code=400, detail="Debe ingresar una URL válida.")
        
    ydl_opts = get_ytdl_opts({
        "skip_download": True
    })
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if not info:
                raise HTTPException(status_code=400, detail="No se pudo extraer información del enlace.")
                
            formats = []
            seen_res = set()
            raw_formats = info.get("formats", [])
            
            for f in raw_formats:
                height = f.get("height")
                ext = f.get("ext", "mp4")
                vcodec = f.get("vcodec", "")
                if height and vcodec != "none" and height not in seen_res:
                    seen_res.add(height)
                    formats.append({
                        "format_id": f.get("format_id"),
                        "resolution": f"{height}p",
                        "height": height,
                        "ext": ext if ext in ["mp4", "webm"] else "mp4",
                    })
                    
            formats.sort(key=lambda x: x["height"], reverse=True)
            
            if not formats:
                formats = [
                    {"format_id": "best", "resolution": "Máxima Calidad (Auto)", "height": 1080, "ext": "mp4"}
                ]
            
            return {
                "title": info.get("title", "Video Multimedia"),
                "thumbnail": info.get("thumbnail"),
                "duration": info.get("duration", 0),
                "uploader": info.get("uploader", "Desconocido"),
                "formats": formats[:6]
            }
    except Exception:
        if "youtube.com" in url or "youtu.be" in url:
            fallback_data = fetch_oembed_youtube_info(url)
            if fallback_data:
                return fallback_data
                
        raise HTTPException(
            status_code=400, 
            detail="No se pudo obtener información del video. Prueba con otro enlace multimedia."
        )

@router.post("/download")
async def download_media(
    url: str = Form(...),
    download_type: str = Form("video"),
    format_id: str = Form(None)
):
    cleanup_old_files()
    file_id = uuid.uuid4().hex[:8]
    out_template = str(TEMP_DIR / f"media_{file_id}.%(ext)s")
    
    last_err = ""
    try:
        if download_type == "audio":
            ydl_opts = get_ytdl_opts({
                "format": "bestaudio/best",
                "outtmpl": out_template,
            })
        else:
            ydl_opts = get_ytdl_opts({
                "format": "best/b/bestvideo+bestaudio",
                "outtmpl": out_template,
            })
            
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            
            if not os.path.exists(filename):
                candidates = list(TEMP_DIR.glob(f"media_{file_id}.*"))
                if candidates:
                    filename = str(candidates[0])
                    
            if os.path.exists(filename):
                safe_title = "".join([c if c.isalnum() or c in ("-", "_") else "_" for c in info.get("title", "download")])
                ext = Path(filename).suffix
                download_name = f"{safe_title}{ext}"
                media_type = "audio/mpeg" if ext in [".mp3", ".m4a", ".aac"] else "video/mp4"
                return FileResponse(filename, filename=download_name, media_type=media_type)
    except Exception as e:
        last_err = str(e)
        
    raise HTTPException(
        status_code=500, 
        detail=f"Error durante la descarga: {last_err or 'No se pudo obtener el archivo.'}"
    )
