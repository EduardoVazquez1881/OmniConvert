import React, { useRef, useState } from 'react';
import { UploadCloud, File, X } from 'lucide-react';

export default function Dropzone({ onFilesSelected, accept, multiple = false, title = "Arrastra y suelta tu archivo aquí", subtitle = "O haz clic para explorar en tu equipo" }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles(filesArray);
      onFilesSelected(multiple ? filesArray : filesArray[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      onFilesSelected(multiple ? filesArray : filesArray[0]);
    }
  };

  const clearFiles = (e) => {
    e.stopPropagation();
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onFilesSelected(multiple ? [] : null);
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 glass-card ${
        isDragOver
          ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]'
          : 'border-slate-500/30 hover:border-cyan-500/50 hover:bg-slate-500/5'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />

      {selectedFiles.length > 0 ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center border border-cyan-500/30">
            <File className="w-7 h-7" />
          </div>
          <div>
            <p className="font-semibold text-main">
              {multiple ? `${selectedFiles.length} archivos seleccionados` : selectedFiles[0].name}
            </p>
            <p className="text-xs text-muted mt-1">
              {!multiple && `${(selectedFiles[0].size / (1024 * 1024)).toFixed(2)} MB`}
            </p>
          </div>
          <button
            onClick={clearFiles}
            className="mt-2 text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20"
          >
            <X className="w-3.5 h-3.5" /> Quitar selección
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-main text-lg">{title}</h3>
            <p className="text-sm text-muted mt-1">{subtitle}</p>
          </div>
        </div>
      )}
    </div>
  );
}
