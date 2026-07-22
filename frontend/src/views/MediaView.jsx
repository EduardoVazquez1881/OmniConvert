import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Video, Download, Loader2, Music, AlertCircle, Play } from 'lucide-react';

const API_BASE = "/api/media";

export default function MediaView({ initialSubTab }) {
  const [url, setUrl] = useState('');
  const [info, setInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState('video'); // 'video' or 'audio'
  const [selectedFormat, setSelectedFormat] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialSubTab === 'audio-studio') {
      setDownloadType('audio');
    } else if (initialSubTab === 'video-downloader') {
      setDownloadType('video');
    }
  }, [initialSubTab]);

  const fetchMediaInfo = async () => {
    if (!url.trim()) return;
    setLoadingInfo(true);
    setErrorMsg('');
    setInfo(null);
    try {
      const res = await axios.get(`${API_BASE}/info`, { params: { url: url.trim() } });
      setInfo(res.data);
      if (res.data.formats && res.data.formats.length > 0) {
        setSelectedFormat(res.data.formats[0].format_id);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'No se pudo obtener información del enlace.');
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) return;
    setDownloading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('url', url.trim());
      formData.append('download_type', downloadType);
      if (downloadType === 'video' && selectedFormat) {
        formData.append('format_id', selectedFormat);
      }

      const res = await axios.post(`${API_BASE}/download`, formData, {
        responseType: 'blob'
      });

      let filename = downloadType === 'audio' ? 'audio.mp3' : 'video.mp4';
      const contentDisposition = res.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error durante la descarga del archivo.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Header Banner */}
      <div className="glass-card p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-main flex items-center gap-2">
            {downloadType === 'audio' ? (
              <Music className="w-7 h-7 text-violet-500" />
            ) : (
              <Video className="w-7 h-7 text-purple-500" />
            )}
            {downloadType === 'audio' ? 'Extractor de Audio (MP3 / WAV)' : 'Descargador de Videos (4K, 1080p, MP4)'}
          </h2>
          <p className="text-sm text-muted mt-1">
            Pega el enlace de un video de YouTube, Vimeo, TikTok, Twitter o cualquier plataforma compatible.
          </p>
        </div>

        {/* Input box */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Pega aquí el enlace del video (ej. https://www.youtube.com/watch?v=...)"
            className="glass-input flex-1 w-full"
            onKeyDown={(e) => e.key === 'Enter' && fetchMediaInfo()}
          />
          <button
            onClick={fetchMediaInfo}
            disabled={!url.trim() || loadingInfo}
            className="btn-primary whitespace-nowrap px-6 py-3"
          >
            {loadingInfo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 text-white" />}
            {loadingInfo ? 'Analizando...' : 'Analizar Enlace'}
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {errorMsg}
          </div>
        )}
      </div>

      {/* Video Details & Options Card */}
      {info && (
        <div className="glass-card p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {info.thumbnail && (
              <img
                src={info.thumbnail}
                alt={info.title}
                className="w-full md:w-64 rounded-xl object-cover shadow-lg border border-slate-700/50"
              />
            )}

            <div className="space-y-3 flex-1">
              <h3 className="text-xl font-bold text-main leading-snug">{info.title}</h3>
              <p className="text-xs text-muted">Canal / Autor: <span className="text-main font-medium">{info.uploader}</span></p>
              {info.duration > 0 && (
                <p className="text-xs text-muted">
                  Duración: <span className="text-cyan-500 font-medium">{Math.floor(info.duration / 60)}m {info.duration % 60}s</span>
                </p>
              )}

              {/* Type Selection */}
              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => setDownloadType('video')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    downloadType === 'video'
                      ? 'sidebar-active-item'
                      : 'glass-card text-muted hover:text-main'
                  }`}
                >
                  <Video className="w-4 h-4" /> Download Video (MP4)
                </button>
                <button
                  onClick={() => setDownloadType('audio')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    downloadType === 'audio'
                      ? 'sidebar-active-item'
                      : 'glass-card text-muted hover:text-main'
                  }`}
                >
                  <Music className="w-4 h-4" /> Extract Audio Only (MP3)
                </button>
              </div>

              {/* Resolution Picker */}
              {downloadType === 'video' && info.formats && info.formats.length > 0 && (
                <div className="pt-2 space-y-2">
                  <label className="text-xs text-muted font-semibold uppercase">Calidad de Video:</label>
                  <div className="flex flex-wrap gap-2">
                    {info.formats.map((fmt) => (
                      <button
                        key={fmt.format_id}
                        onClick={() => setSelectedFormat(fmt.format_id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          selectedFormat === fmt.format_id
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500 font-bold'
                            : 'glass-card text-muted'
                        }`}
                      >
                        {fmt.resolution} ({fmt.ext})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary w-full py-4 text-base"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Descargando y procesando archivo...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-white" /> Iniciar Descarga ({downloadType === 'audio' ? 'MP3 Audio' : 'Video MP4'})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
