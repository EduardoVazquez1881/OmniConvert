import React, { useState } from 'react';
import axios from 'axios';
import { QrCode, Download, Loader2, Sparkles } from 'lucide-react';

const API_BASE = "http://localhost:8000/api/tools";

export default function QrView() {
  const [text, setText] = useState('https://github.com');
  const [fillColor, setFillColor] = useState('#000000');
  const [backColor, setBackColor] = useState('#ffffff');
  const [boxSize, setBoxSize] = useState(10);
  const [qrBlobUrl, setQrBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('text', text.trim());
      formData.append('box_size', boxSize);
      formData.append('fill_color', fillColor);
      formData.append('back_color', backColor);

      const res = await axios.post(`${API_BASE}/qr/generate`, formData, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      setQrBlobUrl(url);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al generar código QR.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleGenerate();
  }, []);

  const handleDownload = () => {
    if (!qrBlobUrl) return;
    const link = document.createElement('a');
    link.href = qrBlobUrl;
    link.setAttribute('download', 'codigo_qr.png');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div className="glass-card p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-main flex items-center gap-2">
            <QrCode className="w-7 h-7 text-cyan-500" />
            Estudio & Generador de Códigos QR
          </h2>
          <p className="text-sm text-muted mt-1">
            Genera códigos QR de alta resolución para enlaces, redes sociales o textos con colores personalizados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-4 border-t border-slate-800/20">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                Texto o Enlace URL:
              </label>
              <textarea
                rows="3"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ingresa la URL o texto aquí..."
                className="glass-input w-full resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Color del QR:
                </label>
                <div className="flex items-center gap-2 glass-input">
                  <input
                    type="color"
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                  />
                  <span className="text-xs text-main font-mono uppercase">{fillColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Color de Fondo:
                </label>
                <div className="flex items-center gap-2 glass-input">
                  <input
                    type="color"
                    value={backColor}
                    onChange={(e) => setBackColor(e.target.value)}
                    className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                  />
                  <span className="text-xs text-main font-mono uppercase">{backColor}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-muted uppercase tracking-wider">
                <span>Resolución / Tamaño:</span>
                <span className="text-cyan-500 font-bold">{boxSize * 35} x {boxSize * 35} px</span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                value={boxSize}
                onChange={(e) => setBoxSize(e.target.value)}
                className="w-full h-2 bg-slate-500/20 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={!text.trim() || loading}
              className="btn-primary w-full py-3.5"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-white" />}
              {loading ? 'Generando...' : 'Generar Código QR'}
            </button>
          </form>

          {/* Preview Panel */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl glass-card text-center space-y-4">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Previsualización</h3>
            
            <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-300 max-w-[260px]">
              {qrBlobUrl ? (
                <img src={qrBlobUrl} alt="Código QR Generado" className="w-full h-auto rounded-lg" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              )}
            </div>

            <button
              onClick={handleDownload}
              disabled={!qrBlobUrl}
              className="btn-primary w-full max-w-[260px] py-3 text-sm"
            >
              <Download className="w-4 h-4 text-white" /> Descargar PNG Alta Res.
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
