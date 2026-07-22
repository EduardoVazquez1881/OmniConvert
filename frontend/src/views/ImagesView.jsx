import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dropzone from '../components/Dropzone';
import { Image as ImageIcon, Download, Loader2, Sliders, AlertCircle, Film, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';

const API_BASE = "http://localhost:8000/api/images";

export default function ImagesView({ initialSubTab }) {
  const [activeSubTab, setActiveSubTab] = useState('convert');
  const [file, setFile] = useState(null);
  const [multipleFiles, setMultipleFiles] = useState([]);
  
  const [targetFormat, setTargetFormat] = useState('png');
  const [quality, setQuality] = useState(90);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const [frameDuration, setFrameDuration] = useState(200);

  const [metadata, setMetadata] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialSubTab === 'gif-studio') {
      setActiveSubTab('gif-studio');
    } else if (initialSubTab === 'metadata') {
      setActiveSubTab('metadata');
    } else if (initialSubTab === 'images') {
      setActiveSubTab('convert');
    }
  }, [initialSubTab]);

  const triggerDownload = (data, filename) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_format', targetFormat);
      formData.append('quality', quality);
      if (width) formData.append('width', width);
      if (height) formData.append('height', height);

      const res = await axios.post(`${API_BASE}/convert`, formData, {
        responseType: 'blob'
      });
      triggerDownload(res.data, `${file.name.replace(/\.[^/.]+$/, "")}.${targetFormat}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al procesar la imagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGif = async () => {
    if (multipleFiles.length < 2) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      multipleFiles.forEach((f) => formData.append('files', f));
      formData.append('frame_duration_ms', frameDuration);

      const res = await axios.post(`${API_BASE}/create-gif`, formData, {
        responseType: 'blob'
      });
      triggerDownload(res.data, 'animacion.gif');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al crear la animación GIF.');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectMetadata = async (selectedFile) => {
    setFile(selectedFile);
    if (!selectedFile) {
      setMetadata(null);
      return;
    }
    setLoadingMeta(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await axios.post(`${API_BASE}/metadata`, formData);
      setMetadata(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'No se pudieron extraer metadatos.');
    } finally {
      setLoadingMeta(false);
    }
  };

  const handleCleanMetadata = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API_BASE}/clean-metadata`, formData, {
        responseType: 'blob'
      });
      triggerDownload(res.data, `${file.name.replace(/\.[^/.]+$/, "")}_sin_metadatos.${file.name.split('.').pop()}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al eliminar metadatos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Sub-tabs nav */}
      <div className="flex flex-wrap gap-2 p-1.5 glass-card">
        {[
          { id: 'convert', label: 'Conversión & Favicon', icon: ImageIcon },
          { id: 'gif-studio', label: 'Creador de GIFs', icon: Film },
          { id: 'metadata', label: 'Metadatos EXIF & Privacidad', icon: ShieldAlert },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveSubTab(t.id);
                setFile(null);
                setMultipleFiles([]);
                setMetadata(null);
                setErrorMsg('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                activeSubTab === t.id
                  ? 'sidebar-active-item'
                  : 'text-muted hover:text-main hover:bg-slate-500/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Main card */}
      <div className="glass-card p-8 space-y-6">
        {/* Format & Favicon */}
        {activeSubTab === 'convert' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-main flex items-center gap-2">
                Conversor de Imágenes & Favicons
              </h2>
              <p className="text-sm text-muted mt-1">
                Convierte imágenes entre formatos PNG, JPG, WEBP, ICO (favicons), ajusta calidad y redimensiona.
              </p>
            </div>

            <Dropzone onFilesSelected={setFile} accept="image/*" title="Arrastra tu imagen aquí" />

            {file && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/20">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider">Formato de Destino:</label>
                  <select
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value)}
                    className="glass-input w-full"
                  >
                    <option value="png">PNG (.png)</option>
                    <option value="jpg">JPG / JPEG (.jpg)</option>
                    <option value="webp">WEBP Web NextGen (.webp)</option>
                    <option value="ico">Favicon ICO Multi-tamaño (.ico)</option>
                    <option value="bmp">BMP (.bmp)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-muted uppercase tracking-wider">
                    <span>Calidad / Compresión:</span>
                    <span className="text-cyan-500 font-bold">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full h-2 bg-slate-500/20 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-cyan-500" /> Redimensionar (Opcional):
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Ancho (px)"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="glass-input w-full"
                    />
                    <input
                      type="number"
                      placeholder="Alto (px)"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="glass-input w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleConvert}
              disabled={!file || loading}
              className="btn-primary w-full py-4 text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 text-white" />}
              {loading ? 'Procesando Imagen...' : `Convertir a ${targetFormat.toUpperCase()}`}
            </button>
          </div>
        )}

        {/* GIF Studio */}
        {activeSubTab === 'gif-studio' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-main flex items-center gap-2">
                <Film className="w-6 h-6 text-purple-400" /> Creador de GIFs Animados desde Imágenes
              </h2>
              <p className="text-sm text-muted mt-1">
                Selecciona 2 o más fotos secuenciales para compilar una animación GIF personalizada.
              </p>
            </div>

            <Dropzone onFilesSelected={setMultipleFiles} accept="image/*" multiple title="Selecciona 2 o más imágenes" />

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-muted uppercase tracking-wider">
                <span>Duración por Fotograma:</span>
                <span className="text-purple-500 font-bold">{frameDuration} ms ({ (1000 / frameDuration).toFixed(1) } FPS)</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={frameDuration}
                onChange={(e) => setFrameDuration(e.target.value)}
                className="w-full h-2 bg-slate-500/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <button
              onClick={handleCreateGif}
              disabled={multipleFiles.length < 2 || loading}
              className="btn-primary w-full py-4 text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-white" />}
              {loading ? 'Compilando GIF...' : 'Crear y Descargar Animación GIF'}
            </button>
          </div>
        )}

        {/* Metadata Inspector & Cleaner */}
        {activeSubTab === 'metadata' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-main flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-rose-500" /> Inspector & Limpiador de Metadatos EXIF
              </h2>
              <p className="text-sm text-muted mt-1">
                Inspecciona la información oculta de tus fotografías (GPS, modelo de cámara, fecha) y elimínala para proteger tu privacidad.
              </p>
            </div>

            <Dropzone onFilesSelected={handleInspectMetadata} accept="image/*" title="Selecciona una fotografía" />

            {loadingMeta && (
              <div className="p-6 text-center text-muted flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-500" /> Analizando etiquetas EXIF de la imagen...
              </div>
            )}

            {metadata && (
              <div className="space-y-6 pt-4 border-t border-slate-800/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl glass-card text-center">
                    <span className="text-[10px] text-muted uppercase font-semibold">Formato</span>
                    <p className="text-sm font-bold text-main mt-1">{metadata.format}</p>
                  </div>
                  <div className="p-3 rounded-xl glass-card text-center">
                    <span className="text-[10px] text-muted uppercase font-semibold">Dimensiones</span>
                    <p className="text-sm font-bold text-main mt-1">{metadata.dimensions}</p>
                  </div>
                  <div className="p-3 rounded-xl glass-card text-center">
                    <span className="text-[10px] text-muted uppercase font-semibold">Modo de Color</span>
                    <p className="text-sm font-bold text-main mt-1">{metadata.mode}</p>
                  </div>
                  <div className="p-3 rounded-xl glass-card text-center">
                    <span className="text-[10px] text-muted uppercase font-semibold">Etiquetas EXIF</span>
                    <p className="text-sm font-bold text-cyan-500 mt-1">{metadata.exif_count} encontradas</p>
                  </div>
                </div>

                {/* EXIF Table */}
                {metadata.exif_count > 0 ? (
                  <div className="max-h-48 overflow-y-auto rounded-xl glass-card p-4 space-y-1 font-mono text-xs text-main">
                    {Object.entries(metadata.exif).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-slate-700/20 py-1">
                        <span className="text-muted">{k}:</span>
                        <span className="text-cyan-500 font-semibold truncate max-w-xs">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted italic">No se detectaron etiquetas de ubicación o cámara en esta imagen.</p>
                )}

                <button
                  onClick={handleCleanMetadata}
                  disabled={loading}
                  className="btn-primary w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-500/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5 text-white" />}
                  {loading ? 'Eliminando metadatos...' : 'Eliminar Metadatos y Descargar Copia Limpia'}
                </button>
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
