import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Palette, Check, HardDrive, FolderOpen, Save, RotateCcw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const API_BASE = "http://localhost:8000/api/tools";

export default function SettingsView() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('omni_theme') || 'cyberpunk';
  });

  const [outputDir, setOutputDir] = useState('');
  const [defaultDir, setDefaultDir] = useState('');
  const [savingDir, setSavingDir] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const themes = [
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Neon',
      desc: 'Azul cian, índigo y violeta neón (Por defecto)',
      preview: 'from-indigo-600 via-purple-600 to-cyan-400',
      accent: '#38bdf8'
    },
    {
      id: 'violet',
      name: 'Deep Violet',
      desc: 'Púrpura profundo, violeta y rosado eléctrico',
      preview: 'from-purple-600 via-violet-600 to-pink-500',
      accent: '#c084fc'
    },
    {
      id: 'emerald',
      name: 'Emerald Matrix',
      desc: 'Verde esmeralda y cian fosforescente',
      preview: 'from-emerald-600 via-teal-600 to-cyan-400',
      accent: '#34d399'
    },
    {
      id: 'crimson',
      name: 'Crimson Dark',
      desc: 'Rojo carmesí, rosa neón y borgoña oscuro',
      preview: 'from-rose-600 via-red-600 to-pink-500',
      accent: '#f43f5e'
    }
  ];

  // Fetch current storage directory settings
  const fetchStorageSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/settings`);
      setOutputDir(res.data.output_dir);
      setDefaultDir(res.data.default_dir);
    } catch {
      setOutputDir('/home/eduvz/Downloads');
      setDefaultDir('/home/eduvz/Downloads');
    }
  };

  useEffect(() => {
    fetchStorageSettings();
  }, []);

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('omni_theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const handleSaveStorageDir = async (dirToSave) => {
    const targetPath = dirToSave || outputDir;
    if (!targetPath.trim()) return;
    setSavingDir(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const formData = new FormData();
      formData.append('output_dir', targetPath.trim());
      const res = await axios.post(`${API_BASE}/settings`, formData);
      setOutputDir(res.data.output_dir);
      localStorage.setItem('omni_custom_path', res.data.output_dir);
      setStatusMsg({ type: 'success', text: `Ruta guardada: ${res.data.output_dir}` });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.detail || 'Error al guardar la carpeta.' });
    } finally {
      setSavingDir(false);
    }
  };

  const handleResetDefaultDir = () => {
    if (defaultDir) {
      setOutputDir(defaultDir);
      handleSaveStorageDir(defaultDir);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div className="glass-card p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-main flex items-center gap-2">
            <Settings className="w-7 h-7 text-cyan-500" />
            Configuración del Sistema & Almacenamiento
          </h2>
          <p className="text-sm text-muted mt-1">
            Configura la carpeta de destino para tus descargas y personaliza la apariencia de la interfaz.
          </p>
        </div>

        {/* Storage Path Configuration Section */}
        <div className="space-y-4 pt-4 border-t border-slate-800/20">
          <h3 className="text-base font-bold text-main flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-500" />
            Carpeta de Almacenamiento de Archivos Procesados
          </h3>
          <p className="text-xs text-muted">
            Los archivos generados y descargas se guardarán en esta carpeta y se registrarán en tu Historial. Si no seleccionas una ruta, se guardarán automáticamente en la carpeta <strong className="text-main">Descargas / Downloads</strong>.
          </p>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
              Ruta Absoluta de la Carpeta:
            </label>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={outputDir}
                onChange={(e) => setOutputDir(e.target.value)}
                placeholder="/home/eduvz/Downloads"
                className="glass-input flex-1 font-mono text-xs"
              />
              
              <button
                onClick={() => handleSaveStorageDir()}
                disabled={savingDir || !outputDir.trim()}
                className="btn-primary whitespace-nowrap px-5 py-3 text-xs"
              >
                {savingDir ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-white" />}
                {savingDir ? 'Guardando...' : 'Guardar Ruta'}
              </button>

              <button
                onClick={handleResetDefaultDir}
                title="Restablecer a la carpeta de Descargas por defecto"
                className="glass-card px-4 py-3 text-xs font-semibold text-muted hover:text-main flex items-center gap-1.5 whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4 text-cyan-500" /> Descargas por Defecto
              </button>
            </div>

            {statusMsg.text && (
              <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 font-semibold'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
              }`}>
                {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {statusMsg.text}
              </div>
            )}
          </div>
        </div>

        {/* Theme Selection Section */}
        <div className="space-y-4 pt-4 border-t border-slate-800/20">
          <h3 className="text-base font-bold text-main flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-500" />
            Tema de Interfaz (Paleta de Colores Neón)
          </h3>
          <p className="text-xs text-muted">
            Selecciona la variante cromática que prefieras para la interfaz Glassmorphism.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {themes.map((t) => {
              const isSelected = currentTheme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`glass-card p-5 cursor-pointer transition-all border flex items-center gap-4 ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                      : 'hover:border-slate-500/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${t.preview} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    {isSelected && <Check className="w-6 h-6 text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-main text-sm flex items-center gap-2">
                      {t.name}
                      {isSelected && (
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-500 px-2 py-0.5 rounded-full font-semibold border border-cyan-500/30">
                          Activo
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-muted truncate mt-0.5">{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Info */}
        <div className="space-y-4 pt-4 border-t border-slate-800/20">
          <h3 className="text-base font-bold text-main flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-cyan-500" />
            Estado del Servidor
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl glass-card space-y-1">
              <span className="text-xs text-muted font-semibold uppercase">Modo de Ejecución</span>
              <p className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Servidor Local FastAPI Activo
              </p>
            </div>
            <div className="p-4 rounded-xl glass-card space-y-1">
              <span className="text-xs text-muted font-semibold uppercase">Destino Activo</span>
              <p className="text-xs font-mono text-main truncate font-bold mt-1">
                {outputDir || '/home/eduvz/Downloads'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
