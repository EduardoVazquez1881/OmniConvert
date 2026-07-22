import React, { useState } from 'react';
import { 
  FileText, 
  Video, 
  Music,
  Film,
  Image as ImageIcon, 
  QrCode, 
  FileSpreadsheet, 
  ShieldAlert, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  HardDrive,
  Cpu,
  ArrowRight
} from 'lucide-react';

export default function DashboardView({ setActiveTab }) {
  const [filter, setFilter] = useState('all');

  const tools = [
    {
      id: 'documents',
      title: 'PDF & Documentos Word',
      desc: 'Convierte PDFs a Word editables, une múltiples PDFs o comprime el peso sin perder calidad.',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-indigo-500/20',
      category: 'documents',
    },
    {
      id: 'tables',
      title: 'Tablas (CSV, Excel, JSON)',
      desc: 'Transforma tablas CSV o Excel a formatos JSON estructurado, HTML o listas Markdown.',
      icon: FileSpreadsheet,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      category: 'documents',
    },
    {
      id: 'video-downloader',
      title: 'Descargador de Videos (URL)',
      desc: 'Descarga videos en 4K, 1080p o 720p desde YouTube, TikTok, Vimeo o X por enlace directo.',
      icon: Video,
      color: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/20',
      category: 'media',
    },
    {
      id: 'audio-studio',
      title: 'Extractor de Audio (MP3)',
      desc: 'Convierte cualquier video o enlace web en archivos de audio MP3 / WAV de alta fidelidad.',
      icon: Music,
      color: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/20',
      category: 'media',
    },
    {
      id: 'gif-studio',
      title: 'Creador de GIFs Animados',
      desc: 'Compila secuencias de imágenes en animaciones GIF personalizables con velocidad FPS.',
      icon: Film,
      color: 'from-pink-500 to-rose-600',
      shadow: 'shadow-pink-500/20',
      category: 'media',
    },
    {
      id: 'images',
      title: 'Conversor & Favicon ICO',
      desc: 'Convierte fotos entre PNG, JPG, WEBP y BMP o crea archivos de favicon multi-resolución.',
      icon: ImageIcon,
      color: 'from-cyan-500 to-blue-600',
      shadow: 'shadow-cyan-500/20',
      category: 'images',
    },
    {
      id: 'metadata',
      title: 'Limpiador de Metadatos EXIF',
      desc: 'Protege tu privacidad eliminando datos ocultos de GPS, cámara y fecha de tus imágenes.',
      icon: ShieldAlert,
      color: 'from-rose-500 to-red-600',
      shadow: 'shadow-rose-500/20',
      category: 'images',
    },
    {
      id: 'qr',
      title: 'Estudio de Códigos QR',
      desc: 'Genera códigos QR HD con opciones de personalización de colores, tamaños y enlaces.',
      icon: QrCode,
      color: 'from-teal-500 to-emerald-600',
      shadow: 'shadow-teal-500/20',
      category: 'tools',
    },
  ];

  const filteredTools = filter === 'all' ? tools : tools.filter(t => t.category === filter);

  return (
    <div className="space-y-8 sm:space-y-10 py-2 sm:py-4">
      {/* Hero Section */}
      <div className="glass-card p-6 sm:p-8 md:p-10 relative overflow-hidden space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" /> Procesamiento Local Ultra Rápido v1.1
        </div>

        <div className="space-y-3 max-w-3xl">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-main leading-tight">
            Suite Multimedia & Conversor Universal
          </h1>
          <p className="text-muted text-xs sm:text-sm md:text-base leading-relaxed">
            Convierte documentos, edita imágenes, crea GIFs, extrae audios y descarga videos por URL directamente en tu equipo con privacidad absoluta.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-700/20">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs text-muted font-semibold uppercase block">Motor</span>
              <p className="text-xs sm:text-sm font-bold text-main truncate">FastAPI + Python</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs text-muted font-semibold uppercase block">Formatos</span>
              <p className="text-xs sm:text-sm font-bold text-main truncate">+25 Formatos</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs text-muted font-semibold uppercase block">Privacidad</span>
              <p className="text-xs sm:text-sm font-bold text-emerald-500 truncate">100% Local</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs text-muted font-semibold uppercase block">Almacenamiento</span>
              <p className="text-xs sm:text-sm font-bold text-main truncate">Descargas PC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-main">Herramientas Disponibles</h2>
        
        <div className="flex flex-wrap gap-1 p-1 glass-card overflow-x-auto">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'documents', label: 'Documentos & Tablas' },
            { id: 'media', label: 'Audio, Video & GIFs' },
            { id: 'images', label: 'Imágenes & EXIF' },
            { id: 'tools', label: 'Herramientas' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === cat.id
                  ? 'sidebar-active-item'
                  : 'text-muted hover:text-main'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className="glass-card p-5 sm:p-6 cursor-pointer group flex flex-col justify-between hover:scale-[1.02] transition-all"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr ${tool.color} flex items-center justify-center text-white ${tool.shadow} shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-main group-hover:text-cyan-500 transition-colors leading-snug">
                  {tool.title}
                </h3>
                <p className="text-muted text-xs leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-5 sm:mt-6 flex items-center gap-1.5 text-xs font-semibold text-cyan-500 group-hover:translate-x-1 transition-transform">
                Abrir herramienta <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
