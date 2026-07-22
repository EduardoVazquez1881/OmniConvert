import io
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
import qrcode
from PIL import Image

from app.utils.file_manager import get_output_dir, set_output_dir, DEFAULT_OUTPUT_DIR

router = APIRouter(prefix="/api/tools", tags=["tools"])

COOKIES_FILE = Path(__file__).resolve().parent.parent.parent / "cookies.txt"

@router.get("/settings")
async def get_settings():
    current_dir = get_output_dir()
    return {
        "output_dir": str(current_dir),
        "default_dir": str(DEFAULT_OUTPUT_DIR),
        "exists": current_dir.exists()
    }

@router.post("/settings")
async def update_settings(output_dir: str = Form(...)):
    if not output_dir.strip():
        raise HTTPException(status_code=400, detail="Debes proporcionar una ruta válida.")
    try:
        updated_path = set_output_dir(output_dir.strip())
        return {
            "status": "success",
            "output_dir": str(updated_path),
            "message": f"Ruta de almacenamiento actualizada a {updated_path}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo configurar la carpeta: {str(e)}")

@router.get("/cookies")
async def get_cookies_status():
    has_file = COOKIES_FILE.exists()
    size = COOKIES_FILE.stat().st_size if has_file else 0
    return {
        "active": has_file and size > 0,
        "size_bytes": size
    }

@router.post("/cookies")
async def save_cookies(
    cookies_text: str = Form(None),
    file: UploadFile = File(None)
):
    try:
        content = ""
        if file:
            file_bytes = await file.read()
            content = file_bytes.decode("utf-8", errors="ignore")
        elif cookies_text:
            content = cookies_text.strip()
            
        if not content:
            raise HTTPException(status_code=400, detail="Debes subir un archivo cookies.txt o pegar su contenido.")
            
        with open(COOKIES_FILE, "w", encoding="utf-8") as f:
            f.write(content)
            
        return {
            "status": "success",
            "message": "Cookies de YouTube guardadas y activadas correctamente.",
            "active": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar cookies: {str(e)}")

@router.delete("/cookies")
async def delete_cookies():
    if COOKIES_FILE.exists():
        try:
            COOKIES_FILE.unlink()
        except Exception:
            pass
    return {"status": "success", "active": False, "message": "Cookies de YouTube eliminadas."}

@router.post("/qr/generate")
async def generate_qr_code(
    text: str = Form(...),
    box_size: int = Form(10),
    border: int = Form(2),
    fill_color: str = Form("#000000"),
    back_color: str = Form("#ffffff")
):
    if not text.strip():
        raise HTTPException(status_code=400, detail="Debes ingresar texto o una URL para generar el código QR.")
        
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=box_size,
            border=border,
        )
        qr.add_data(text.strip())
        qr.make(fit=True)
        
        img = qr.make_image(fill_color=fill_color, back_color=back_color)
        out_buf = io.BytesIO()
        img.save(out_buf, format="PNG")
        out_buf.seek(0)
        
        return StreamingResponse(
            out_buf,
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=codigo_qr.png"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar código QR: {str(e)}")
