#!/bin/bash

# Navigation to script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "============================================================"
echo "🚀 Iniciando OmniConverter Suite Web App..."
echo "============================================================"

# Ensure virtualenv exists
if [ ! -d "backend/venv" ]; then
    echo "⚙️ Configurando entorno virtual de Python..."
    python3 -m venv backend/venv
    backend/venv/bin/pip install --upgrade pip
    backend/venv/bin/pip install -r backend/requirements.txt
fi

# Build frontend if dist doesn't exist
if [ ! -d "frontend/dist" ]; then
    echo "📦 Compilando aplicación Frontend (React + Glassmorphism UI)..."
    cd frontend && npm run build && cd ..
fi

echo "✅ Todo listo. Abriendo el servidor web en http://localhost:8000"
echo "💡 Presiona Ctrl+C para detener el servidor en cualquier momento."
echo "============================================================"

# Run FastAPI backend with uvicorn
backend/venv/bin/python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
