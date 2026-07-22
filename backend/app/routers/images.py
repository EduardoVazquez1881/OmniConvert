import io
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from PIL import Image, ExifTags

from app.utils.file_manager import get_temp_path, cleanup_old_files

router = APIRouter(prefix="/api/images", tags=["images"])

SUPPORTED_FORMATS = {
    "png": ("PNG", "image/png", ".png"),
    "jpg": ("JPEG", "image/jpeg", ".jpg"),
    "jpeg": ("JPEG", "image/jpeg", ".jpg"),
    "webp": ("WEBP", "image/webp", ".webp"),
    "ico": ("ICO", "image/x-icon", ".ico"),
    "bmp": ("BMP", "image/bmp", ".bmp"),
}

@router.post("/convert")
async def convert_image(
    file: UploadFile = File(...),
    target_format: str = Form(...), # png, jpg, webp, ico, bmp
    quality: int = Form(90),
    width: Optional[int] = Form(None),
    height: Optional[int] = Form(None)
):
    cleanup_old_files()
    contents = await file.read()
    
    target_key = target_format.lower()
    if target_key not in SUPPORTED_FORMATS:
        raise HTTPException(status_code=400, detail=f"Formato no soportado: {target_format}")
        
    pil_format, mime_type, ext = SUPPORTED_FORMATS[target_key]
    
    try:
        img = Image.open(io.BytesIO(contents))
        
        # Resize if dimensions provided
        if width or height:
            orig_w, orig_h = img.size
            new_w = width if width else int(orig_w * (height / orig_h))
            new_h = height if height else int(orig_h * (width / orig_w))
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
        # Convert RGBA to RGB for JPEG
        if pil_format == "JPEG" and img.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
            img = background
            
        out_buf = io.BytesIO()
        if pil_format == "ICO":
            sizes = [(16,16), (32,32), (48,48), (64,64), (128,128), (256,256)]
            img.save(out_buf, format="ICO", sizes=sizes)
        elif pil_format in ("JPEG", "WEBP"):
            img.save(out_buf, format=pil_format, quality=quality, optimize=True)
        else:
            img.save(out_buf, format=pil_format, optimize=True)
            
        out_buf.seek(0)
        output_filename = f"{Path(file.filename).stem}{ext}"
        
        return StreamingResponse(
            out_buf,
            media_type=mime_type,
            headers={"Content-Disposition": f"attachment; filename={output_filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el procesamiento de la imagen: {str(e)}")

@router.post("/create-gif")
async def create_gif_from_images(
    files: List[UploadFile] = File(...),
    frame_duration_ms: int = Form(200),
    loop: int = Form(0) # 0 = infinite loop
):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Debe subir al menos 2 imágenes para crear un GIF animado.")
        
    cleanup_old_files()
    frames = []
    
    for f in files:
        contents = await f.read()
        try:
            img = Image.open(io.BytesIO(contents)).convert("RGBA")
            frames.append(img)
        except Exception:
            continue
            
    if len(frames) < 2:
        raise HTTPException(status_code=400, detail="No se pudieron procesar suficientes imágenes.")
        
    out_buf = io.BytesIO()
    frames[0].save(
        out_buf,
        format="GIF",
        save_all=True,
        append_images=frames[1:],
        duration=frame_duration_ms,
        loop=loop,
        optimize=True
    )
    out_buf.seek(0)
    
    return StreamingResponse(
        out_buf,
        media_type="image/gif",
        headers={"Content-Disposition": "attachment; filename=animacion.gif"}
    )

@router.post("/metadata")
async def get_image_metadata(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents))
        exif_data = {}
        
        raw_exif = img._getexif() if hasattr(img, '_getexif') and img._getexif() else None
        if raw_exif:
            for tag_id, value in raw_exif.items():
                tag_name = ExifTags.TAGS.get(tag_id, tag_id)
                # Filter printable strings/numbers
                if isinstance(value, (int, float, str)):
                    exif_data[str(tag_name)] = value
                elif isinstance(value, bytes):
                    exif_data[str(tag_name)] = value.hex()[:30]
                    
        return {
            "filename": file.filename,
            "format": img.format,
            "mode": img.mode,
            "dimensions": f"{img.width} x {img.height} px",
            "width": img.width,
            "height": img.height,
            "exif_count": len(exif_data),
            "exif": exif_data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al analizar la imagen: {str(e)}")

@router.post("/clean-metadata")
async def clean_image_metadata(file: UploadFile = File(...)):
    cleanup_old_files()
    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents))
        # Re-save image without EXIF payload
        data = list(img.getdata())
        clean_img = Image.new(img.mode, img.size)
        clean_img.putdata(data)
        
        out_buf = io.BytesIO()
        fmt = img.format if img.format in ("PNG", "JPEG", "WEBP") else "PNG"
        clean_img.save(out_buf, format=fmt)
        out_buf.seek(0)
        
        ext = f".{fmt.lower()}"
        return StreamingResponse(
            out_buf,
            media_type=f"image/{fmt.lower()}",
            headers={"Content-Disposition": f"attachment; filename={Path(file.filename).stem}_sin_metadatos{ext}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al limpiar metadatos: {str(e)}")
