# 🚀 OmniConverter Suite Web App

Una suite web completa, privada y futurista para la conversión de documentos, imágenes y descarga de videos por URL, ejecutada totalmente en tu entorno local.

---

## 🛠️ Herramientas Incluidas

1. **📄 Conversor de Documentos y Tablas**:
   - PDF a Word editable (`.docx`).
   - PDF a imágenes PNG (páginas individuales o ZIP).
   - Imágenes a PDF.
   - Unir (Merge) múltiples archivos PDF.
   - Conversión de tablas: **CSV ↔ Excel (.xlsx) ↔ JSON ↔ HTML ↔ Markdown**.

2. **🎥 Descargador de Videos & Audio (URL)**:
   - Motor `yt-dlp` integrado compatible con más de 1000 plataformas (YouTube, TikTok, Vimeo, Twitter/X, etc.).
   - Selección de resolución (4K, 1080p, 720p, etc.).
   - Extracción de audio en alta calidad MP3 (192kbps).

3. **🖼️ Estudio de Imágenes & Favicons**:
   - Conversión entre **PNG, JPG, WEBP, ICO (favicons), BMP**.
   - Generación de Favicon multi-resolución (16x16 hasta 256x256).
   - Redimensionado de ancho/alto con relación de aspecto preservada.
   - Ajuste de calidad y compresión de peso.

---

## 🚀 Cómo Ejecutar

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
cd ~/Desktop/OmniConverter-Web
./start.sh
```

Abre tu navegador en: **`http://localhost:8000`**

---

## 🏗️ Estructura del Código

- `backend/`: API FastAPI en Python 3.13 con routers para documentos, media e imágenes.
- `frontend/`: Interfaz React 18 + Vite + Tailwind CSS (Diseño Dark Glassmorphic).
- `start.sh`: Script ejecutable en 1 solo paso.
# OmniConvert
