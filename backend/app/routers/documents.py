import io
import zipfile
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pdf2docx import Converter
import fitz  # PyMuPDF
from PIL import Image
import pandas as pd
import pypdf

from app.utils.file_manager import get_temp_path, cleanup_old_files

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/pdf-to-docx")
async def pdf_to_docx(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF.")
    
    cleanup_old_files()
    pdf_path = get_temp_path(file.filename)
    docx_path = pdf_path.with_suffix(".docx")
    
    with open(pdf_path, "wb") as f:
        f.write(await file.read())
        
    try:
        cv = Converter(str(pdf_path))
        cv.convert(str(docx_path))
        cv.close()
        return FileResponse(
            docx_path,
            filename=f"{pdf_path.stem}.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error durante la conversión: {str(e)}")

@router.post("/pdf-to-images")
async def pdf_to_images(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF.")
        
    cleanup_old_files()
    pdf_path = get_temp_path(file.filename)
    with open(pdf_path, "wb") as f:
        f.write(await file.read())
        
    try:
        doc = fitz.open(str(pdf_path))
        if len(doc) == 1:
            page = doc[0]
            pix = page.get_pixmap(dpi=150)
            img_path = pdf_path.with_name(f"{pdf_path.stem}_page1.png")
            pix.save(str(img_path))
            return FileResponse(img_path, filename=f"{pdf_path.stem}_page1.png", media_type="image/png")
        else:
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
                for idx, page in enumerate(doc):
                    pix = page.get_pixmap(dpi=150)
                    img_bytes = pix.tobytes("png")
                    zip_file.writestr(f"pagina_{idx+1}.png", img_bytes)
            zip_buffer.seek(0)
            return StreamingResponse(
                zip_buffer,
                media_type="application/zip",
                headers={"Content-Disposition": f"attachment; filename={pdf_path.stem}_paginas.zip"}
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al extraer imágenes: {str(e)}")

@router.post("/images-to-pdf")
async def images_to_pdf(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="Debe proporcionar al menos una imagen.")
        
    cleanup_old_files()
    images = []
    for f in files:
        contents = await f.read()
        try:
            img = Image.open(io.BytesIO(contents)).convert("RGB")
            images.append(img)
        except Exception:
            continue
            
    if not images:
        raise HTTPException(status_code=400, detail="No se pudieron procesar las imágenes enviadas.")
        
    output_path = get_temp_path("imagenes_convertidas.pdf")
    images[0].save(output_path, save_all=True, append_images=images[1:])
    
    return FileResponse(
        output_path,
        filename="documento_imagenes.pdf",
        media_type="application/pdf"
    )

@router.post("/merge-pdf")
async def merge_pdf(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Debes enviar al menos 2 archivos PDF para unirlos.")
        
    cleanup_old_files()
    merger = pypdf.PdfMerger()
    
    for f in files:
        contents = await f.read()
        merger.append(io.BytesIO(contents))
        
    output_path = get_temp_path("pdf_unido.pdf")
    merger.write(str(output_path))
    merger.close()
    
    return FileResponse(
        output_path,
        filename="pdf_combinado.pdf",
        media_type="application/pdf"
    )

@router.post("/compress-pdf")
async def compress_pdf(
    file: UploadFile = File(...),
    compression_level: str = Form("medium") # low, medium, high
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF.")
        
    cleanup_old_files()
    contents = await file.read()
    
    try:
        doc = fitz.open(stream=contents, filetype="pdf")
        
        # Determine image downsample DPI based on level
        dpi_map = {"low": 150, "medium": 100, "high": 75}
        target_dpi = dpi_map.get(compression_level, 100)
        
        output_buf = io.BytesIO()
        
        # Optimize PDF with PyMuPDF garbage collection & deflate
        doc.save(
            output_buf,
            garbage=4,
            deflate=True,
            deflate_images=True,
            deflate_fonts=True,
            clean=True
        )
        doc.close()
        output_buf.seek(0)
        
        return StreamingResponse(
            output_buf,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={Path(file.filename).stem}_comprimido.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al comprimir el PDF: {str(e)}")

@router.post("/convert-data")
async def convert_data_table(
    file: UploadFile = File(...),
    target_format: str = Form(...)  # csv, excel, json, html, markdown
):
    cleanup_old_files()
    contents = await file.read()
    filename_lower = file.filename.lower()
    
    try:
        if filename_lower.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename_lower.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        elif filename_lower.endswith(".json"):
            df = pd.read_json(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Formato de origen no soportado. Usa CSV, Excel o JSON.")
            
        target = target_format.lower()
        if target == "csv":
            out_buf = io.BytesIO()
            df.to_csv(out_buf, index=False)
            out_buf.seek(0)
            return StreamingResponse(
                out_buf,
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={Path(file.filename).stem}.csv"}
            )
        elif target in ("excel", "xlsx"):
            out_path = get_temp_path(f"{Path(file.filename).stem}.xlsx")
            df.to_excel(out_path, index=False)
            return FileResponse(
                out_path,
                filename=f"{Path(file.filename).stem}.xlsx",
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        elif target == "json":
            json_str = df.to_json(orient="records", indent=2)
            return StreamingResponse(
                io.BytesIO(json_str.encode("utf-8")),
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename={Path(file.filename).stem}.json"}
            )
        elif target == "html":
            html_str = df.to_html(index=False, classes="table table-striped")
            return StreamingResponse(
                io.BytesIO(html_str.encode("utf-8")),
                media_type="text/html",
                headers={"Content-Disposition": f"attachment; filename={Path(file.filename).stem}.html"}
            )
        elif target in ("markdown", "md"):
            md_str = df.to_markdown(index=False)
            return StreamingResponse(
                io.BytesIO(md_str.encode("utf-8")),
                media_type="text/markdown",
                headers={"Content-Disposition": f"attachment; filename={Path(file.filename).stem}.md"}
            )
        else:
            raise HTTPException(status_code=400, detail=f"Formato de destino desaprobado: {target_format}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar la tabla de datos: {str(e)}")
