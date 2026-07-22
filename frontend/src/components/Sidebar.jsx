import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  FileText, 
  FileSpreadsheet,
  Video, 
  Music,
  Film,
  Image as ImageIcon, 
  ShieldAlert,
  QrCode, 
  History,
  Settings, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('omni_mode') !== 'light';
  });

  const sections = [
    {
      title: 'INICIO',
      items: [
        { id: 'dashboard', label: 'Dashboard Principal', icon: Layers },
      ]
    },
    {
      title: 'DOCUMENTOS & TABLAS',
      items: [
        { id: 'documents', label: 'PDF & Documentos Word', icon: FileText },
        { id: 'tables', label: 'Tablas (CSV, Excel, JSON)', icon: FileSpreadsheet },
      ]
    },
    {
      title: 'AUDIO, VIDEO & GIFS',
      items: [
        { id: 'video-downloader', label: 'Descargador de Videos', icon: Video },
        { id: 'audio-studio', label: 'Extractor de Audio (MP3)', icon: Music },
        { id: 'gif-studio', label: 'Creador de GIFs Animados', icon: Film },
      ]
    },
    {
      title: 'IMÁGENES & PRIVACIDAD',
      items: [
        { id: 'images', label: 'Conversor & Favicon ICO', icon: ImageIcon },
        { id: 'metadata', label: 'Limpiador de Metadatos EXIF', icon: ShieldAlert },
      ]
    },
    {
      title: 'HERRAMIENTAS & REGISTRO',
      items: [
        { id: 'qr', label: 'Estudio de Códigos QR', icon: QrCode },
        { id: 'history', label: 'Historial de Conversiones', icon: History },
      ]
    }
  ];

  const toggleDarkMode = () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('omni_mode', newMode);
    document.documentElement.setAttribute('data-mode', newMode);
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('omni_mode') || 'dark';
    document.documentElement.setAttribute('data-mode', savedMode);
  }, []);

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-50 backdrop-blur-md sidebar-glass border-b border-slate-700/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[2px] border border-cyan-400/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <span className="font-bold text-main text-base">OmniConverter</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl glass-card text-amber-500 hover:scale-105 transition-transform"
            title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
          </button>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl glass-card text-main"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen sidebar-glass backdrop-blur-xl border-r border-slate-700/20 flex flex-col justify-between transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Top & Main Navigation Sections */}
        <div className="flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-700/20">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[2px] shadow-lg shadow-cyan-500/10 flex-shrink-0 border border-slate-700/30">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="transition-opacity duration-300">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent leading-none">
                    OmniConverter
                  </h1>
                  <span className="text-[10px] text-muted tracking-wider uppercase font-semibold">Suite Local v1.1</span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg glass-card text-muted hover:text-main"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Main Navigation Sections */}
          <div className="p-3 space-y-5">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {(!isCollapsed || isMobileOpen) && (
                  <h3 className="px-3 text-[10px] font-bold text-muted tracking-wider uppercase mb-1.5">
                    {section.title}
                  </h3>
                )}
                {isCollapsed && !isMobileOpen && sIdx > 0 && (
                  <div className="my-2 border-t border-slate-700/20 mx-2" />
                )}

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all duration-200 group relative border ${
                        isActive
                          ? 'sidebar-active-item'
                          : 'sidebar-hover-item text-muted border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 transition-colors" />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Configurations & Light/Dark Mode Switcher */}
        <div className="p-3 border-t border-slate-700/20 space-y-2">
          {/* Settings Nav Button (above the theme line) */}
          <button
            onClick={() => handleTabClick('settings')}
            title={isCollapsed ? "Configuraciones & Temas" : undefined}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group relative border ${
              activeTab === 'settings'
                ? 'sidebar-active-item'
                : 'sidebar-hover-item text-muted border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 flex-shrink-0 transition-colors" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="truncate">Configuraciones & Temas</span>
            )}
          </button>

          {/* Divider line for Theme Toggle */}
          <div className="border-t border-slate-700/30 my-1" />

          {/* Quick Dark/Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            className="w-full flex items-center justify-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-700/30 glass-card text-main hover:scale-[1.02] sidebar-hover-item transition-all"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            )}

            {(!isCollapsed || isMobileOpen) && (
              <span className="text-xs font-semibold truncate">
                {isDarkMode ? "Modo Oscuro" : "Modo Claro"}
              </span>
            )}
          </button>

          {/* Local Processing badge */}
          {(!isCollapsed || isMobileOpen) ? (
            <div className="glass-card p-2 text-xs text-muted space-y-0.5 border-slate-700/20">
              <div className="flex items-center gap-1.5 text-cyan-500 font-medium text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Procesamiento Local
              </div>
            </div>
          ) : (
            <div className="flex justify-center text-cyan-500 py-1" title="100% Procesamiento Local">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
