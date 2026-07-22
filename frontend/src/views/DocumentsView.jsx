import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dropzone from '../components/Dropzone';
import { FileText, Download, Loader2, FileSpreadsheet, Layers, FileArchive } from 'lucide-react';

const API_BASE = "http://localhost:8000/api/documents";

export default function DocumentsView({ initialSubTab }) {
  const [activeSubTab, setActiveSubTab] = useState('pdf-docx');
  const [file, setFile] = useState(null);
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [targetDataFormat, setTargetDataFormat] = useState('csv');
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialSubTab === 'tables') {
      setActiveSubTab('data-table');
    } else if (initialSubTab === 'documents') {
      setActiveSubTab('pdf-docx');
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

  const handleConvertPdfToDocx = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API_BASE}/pdf-to-docx`, formData, {
        responseType: 'blob'
      });
      triggerDownload(res.data, `${file.name.replace(/\.[^/.]+$/, "")}.docx`);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al convertir PDF a DOCX.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompressPdf = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('compression_level', compressionLevel);
      const res = await axios.post(`${API_BASE}/compress-pdf`, formData, {
        responseType: 'blob'
      });
      triggerDownload(res.data, `${file.name.replace(/\.[^/.]+$/, "")}_comprimido.pdf`);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al comprimir el archivo PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handlePdfToImages = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API_BASE}/pdf-to-images`, formData, {
        responseType: 'blob'
      });
      const isZip = res.headers['content-type']?.includes('zip');
      const ext = isZip ? 'zip' : 'png';
      triggerDownload(res.data, `${file.name.replace(/\.[^/.]+$/, "")}_paginas.${ext}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al extraer imágenes.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagesToPdf = async () => {
    if (!multipleFiles.length) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      multipleFiles.forEach((f) => formData.append('files', f));
      const res = await axios.post(`${API_BASE}/images-to-pdf`, formData, {
        responseType: 'blob'
      });
      triggerDownload(res.data, 'documento_imagenes.pdf');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al crear PDF desde imágenes.');
    } finally {
      setLoading(false);
    }
  };

  const handleMergePdf = async () => {
    if (multipleFiles.length < 2) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      multipleFiles.forEach((f) => formData.append('files', f));
      const res = await axios.post(`${API_BASE}/merge-pdf`, formData, {
        responseType: 'blob'
      });
      triggerDownload(res.data, 'pdf_combinado.pdf');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al unir archivos PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertDataTable = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_format', targetDataFormat);
      const res = await axios.post(`${API_BASE}/convert-data`, formData, {
        responseType: 'blob'
      });
      const ext = targetDataFormat === 'excel' ? 'xlsx' : targetDataFormat;
      triggerDownload(res.data, `${file.name.replace(/\.[^/.]+$/, "")}.${ext}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al convertir la tabla de datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Sub-tabs header */}
      <div className="flex flex-wrap gap-2 p-1.5 glass-card">
        {[
          { id: 'pdf-docx', label: 'PDF a Word', icon: FileText },
          { id: 'compress-pdf', label: 'Compresor PDF', icon: FileArchive },
          { id: 'pdf-images', label: 'PDF a Imágenes', icon: FileText },
          { id: 'images-pdf', label: 'Imágenes a PDF', icon: Layers },
          { id: 'merge-pdf', label: 'Unir PDFs', icon: Layers },
          { id: 'data-table', label: 'CSV / Excel / JSON', icon: FileSpreadsheet },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveSubTab(t.id);
                setFile(null);
                setMultipleFiles([]);
                setErrorMsg('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
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

      {/* Dynamic Tool Interface */}
      <div className="glass-card p-8 space-y-6">
        {/* PDF -> Word */}
        {activeSubTab === 'pdf-docx' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-main">Convertir PDF a Word (.docx)</h2>
              <p className="text-sm text-muted mt-1">Extrae de manera limpia el texto y formato de tu PDF a un documento Word editable.</p>
            </div>
            <Dropzone onFilesSelected={setFile} accept=".pdf" title="Selecciona un archivo PDF" />
            <button
              onClick={handleConvertPdfToDocx}
              disabled={!file || loading}
              className="btn-primary w-full py-3.5"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {loading ? 'Convirtiendo PDF...' : 'Convertir a Word (.docx)'}
            </button>
          </div>
        )}

        {/* Compress PDF */}
        {activeSubTab === 'compress-pdf' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-main">Compresor & Optimizador de PDF</h2>
              <p className="text-sm text-muted mt-1">Reduce el tamaño de tu archivo PDF optimizando los flujos de datos y comprimiendo imágenes.</p>
            </div>
            <Dropzone onFilesSelected={setFile} accept=".pdf" title="Selecciona un archivo PDF para comprimir" />

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">Nivel de Compresión:</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'low', label: 'Baja (Alta Calidad)', desc: '150 DPI' },
                  { id: 'medium', label: 'Media (Recomendado)', desc: '100 DPI' },
                  { id: 'high', label: 'Alta (Máxima reducción)', desc: '75 DPI' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setCompressionLevel(lvl.id)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      compressionLevel === lvl.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-500 font-bold'
                        : 'glass-card text-muted'
                    }`}
                  >
                    <div>{lvl.label}</div>
                    <div className="text-[10px] text-muted mt-0.5">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCompressPdf}
              disabled={!file || loading}
              className="btn-primary w-full py-3.5"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {loading ? 'Comprimiendo PDF...' : 'Comprimir y Descargar PDF'}
            </button>
          </div>
        )}

        {/* PDF -> Images */}
        {activeSubTab === 'pdf-images' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-main">Convertir PDF a Imágenes PNG</h2>
              <p className="text-sm text-muted mt-1">Exporta cada página del documento como una imagen independiente en alta resolución.</p>
            </div>
            <Dropzone onFilesSelected={setFile} accept=".pdf" title="Selecciona un archivo PDF" />
            <button
              onClick={handlePdfToImages}
              disabled={!file || loading}
              className="btn-primary w-full py-3.5"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {loading ? 'Extrayendo páginas...' : 'Descargar Páginas PNG'}
            </button>
          </div>
        )}

        {/* Images -> PDF */}
        {activeSubTab === 'images-pdf' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-main">Crear PDF desde Imágenes</h2>
              <p className="text-sm text-muted mt-1">Selecciona una o varias imágenes (PNG, JPG, WEBP) para combinarlas en un solo PDF.</p>
            </div>
            <Dropzone onFilesSelected={setMultipleFiles} accept="image/*" multiple title="Selecciona múltiples imágenes" />
            <button
              onClick={handleImagesToPdf}
              disabled={!multipleFiles.length || loading}
              className="btn-primary w-full py-3.5"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {loading ? 'Generando PDF...' : 'Convertir a PDF'}
            </button>
          </div>
        )}

        {/* Merge PDFs */}
        {activeSubTab === 'merge-pdf' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-main">Unir Múltiples PDFs</h2>
              <p className="text-sm text-muted mt-1">Selecciona 2 o más archivos PDF para fusionarlos en un único documento de forma secuencial.</p>
            </div>
            <Dropzone onFilesSelected={setMultipleFiles} accept=".pdf" multiple title="Selecciona 2 o más archivos PDF" />
            <button
              onClick={handleMergePdf}
              disabled={multipleFiles.length < 2 || loading}
              className="btn-primary w-full py-3.5"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {loading ? 'Fusionando archivos...' : 'Fusionar PDFs'}
            </button>
          </div>
        )}

        {/* Data Tables */}
        {activeSubTab === 'data-table' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-main">Conversor de Tablas de Datos</h2>
              <p className="text-sm text-muted mt-1">Transforma al instante tablas CSV, Excel (.xlsx) o JSON al formato estructurado que desees.</p>
            </div>
            <Dropzone onFilesSelected={setFile} accept=".csv, .xlsx, .xls, .json" title="Selecciona CSV, Excel o JSON" />
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">Formato de Salida:</label>
              <select
                value={targetDataFormat}
                onChange={(e) => setTargetDataFormat(e.target.value)}
                className="glass-input w-full"
              >
                <option value="csv">CSV (.csv)</option>
                <option value="excel">Excel (.xlsx)</option>
                <option value="json">JSON (.json)</option>
                <option value="html">Tabla HTML (.html)</option>
                <option value="markdown">Tabla Markdown (.md)</option>
              </select>
            </div>

            <button
              onClick={handleConvertDataTable}
              disabled={!file || loading}
              className="btn-primary w-full py-3.5"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {loading ? 'Transformando datos...' : `Convertir a ${targetDataFormat.toUpperCase()}`}
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
