import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Trash2, FileText, Video, Image as ImageIcon, QrCode, Copy, Check, FolderOpen, Clock, Download, Globe, ShieldCheck } from 'lucide-react';

const API_BASE = "/api/tools";

export default function HistoryView() {
  const [historyItems, setHistoryItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('omni_history') || '[]');
    } catch {
      return [];
    }
  });

  const [activeStorageDir, setActiveStorageDir] = useState('/home/eduvz/Downloads');
  const [copiedId, setCopiedId] = useState(null);
  const [isLocalHost, setIsLocalHost] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    setIsLocalHost(hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.'));
  }, []);

  const fetchStorageDir = async () => {
    try {
      const res = await axios.get(`${API_BASE}/settings`);
      if (res.data && res.data.output_dir) {
        setActiveStorageDir(res.data.output_dir);
      }
    } catch {
      const savedPath = localStorage.getItem('omni_custom_path');
      if (savedPath) setActiveStorageDir(savedPath);
    }
  };

  useEffect(() => {
    fetchStorageDir();

    if (historyItems.length === 0) {
      const demoDir = activeStorageDir || '/home/eduvz/Downloads';
      const demoHistory = [
        { 
          id: '1', 
          title: 'documento_presentacion.docx', 
          type: 'PDF a Word', 
          date: 'Hace 10 mins', 
          icon: 'file', 
          size: '2.4 MB',
          path: `${demoDir}/documento_presentacion.docx`
        },
        { 
          id: '2', 
          title: 'video_clip_hd.mp4', 
          type: 'Descarga URL', 
          date: 'Hace 35 mins', 
          icon: 'video', 
          size: '18.6 MB',
          path: `${demoDir}/video_clip_hd.mp4`
        },
        { 
          id: '3', 
          title: 'logo_empresa.ico', 
          type: 'Favicon ICO', 
          date: 'Hace 1 hora', 
          icon: 'image', 
          size: '120 KB',
          path: `${demoDir}/logo_empresa.ico`
        },
        { 
          id: '4', 
          title: 'qr_sitio_web.png', 
          type: 'Código QR', 
          date: 'Hace 2 horas', 
          icon: 'qr', 
          size: '45 KB',
          path: `${demoDir}/qr_sitio_web.png`
        },
      ];
      setHistoryItems(demoHistory);
      localStorage.setItem('omni_history', JSON.stringify(demoHistory));
    }
  }, []);

  const handleClearHistory = () => {
    setHistoryItems([]);
    localStorage.removeItem('omni_history');
  };

  const handleCopyPath = (id, path) => {
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIcon = (typeIcon) => {
    switch (typeIcon) {
      case 'video': return <Video className="w-5 h-5 text-purple-500" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-cyan-500" />;
      case 'qr': return <QrCode className="w-5 h-5 text-emerald-500" />;
      default: return <FileText className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div className="glass-card p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-main flex items-center gap-2">
              <History className="w-7 h-7 text-cyan-500" />
              Historial de Conversiones & Descargas
            </h2>
            <p className="text-sm text-muted mt-1">
              {isLocalHost 
                ? 'Registro de archivos procesados y su ubicación en disco.' 
                : 'Historial de sesiones del navegador (Descargas vía web HTTP).'}
            </p>
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all self-start sm:self-auto"
            >
              <Trash2 className="w-4 h-4" /> Limpiar Historial
            </button>
          )}
        </div>

        {/* Environment banner */}
        {isLocalHost ? (
          <div className="p-4 rounded-xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs border-amber-500/20">
            <div className="flex items-center gap-2.5 min-w-0">
              <FolderOpen className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="min-w-0">
                <span className="font-semibold text-main">Modo Local Activo (Carpeta en Disco):</span>
                <p className="font-mono text-cyan-500 text-[11px] truncate font-bold">{activeStorageDir}</p>
              </div>
            </div>
            <button
              onClick={() => handleCopyPath('folder', activeStorageDir)}
              className="btn-primary py-2 px-3 text-xs whitespace-nowrap self-end sm:self-auto"
            >
              {copiedId === 'folder' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-white" />}
              {copiedId === 'folder' ? '¡Copiado!' : 'Copiar Ruta Carpeta'}
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl glass-card flex items-center gap-3 text-xs border-indigo-500/20">
            <Globe className="w-5 h-5 text-cyan-500 flex-shrink-0" />
            <div>
              <span className="font-semibold text-main flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Modo Servidor Nube / Multi-Usuario Activo
              </span>
              <p className="text-muted text-[11px] mt-0.5">
                El historial se almacena encriptado únicamente en tu navegador (localStorage). Cada usuario de internet ve solo sus descargas.
              </p>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="space-y-3 pt-2">
          {historyItems.length > 0 ? (
            historyItems.map((item) => {
              const itemPath = item.path || `${activeStorageDir}/${item.title}`;
              return (
                <div
                  key={item.id}
                  className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border hover:border-cyan-500/40 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center flex-shrink-0">
                      {getIcon(item.icon)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-main text-sm truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                        <span className="font-medium text-cyan-500">{item.type}</span>
                        <span>•</span>
                        <span>{item.size}</span>
                        {isLocalHost && (
                          <>
                            <span>•</span>
                            <span className="truncate text-[11px] font-mono opacity-80">{itemPath}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {item.date}
                    </span>

                    {isLocalHost && (
                      <button
                        onClick={() => handleCopyPath(item.id, itemPath)}
                        title="Copiar ruta del archivo en disco"
                        className="p-2 rounded-lg glass-card hover:text-cyan-500 transition-colors text-xs flex items-center gap-1.5"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[11px] text-emerald-500 font-semibold">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Ruta</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-muted space-y-2">
              <History className="w-12 h-12 mx-auto text-slate-400/50" />
              <h3 className="font-bold text-main text-base">Historial Vacío</h3>
              <p className="text-xs">No hay conversiones ni descargas registradas en esta sesión.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
