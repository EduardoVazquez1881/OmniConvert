import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import documents, media, images, tools

app = FastAPI(
    title="OmniConverter Suite API",
    description="Backend completo para conversión de documentos, imágenes, descarga de videos por URL, compresor PDF, GIF studio y códigos QR.",
    version="1.1.0"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(documents.router)
app.include_router(media.router)
app.include_router(images.router)
app.include_router(tools.router)

@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "OmniConverter Suite Ready v1.1"}

# Serve static frontend dist if it exists
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
