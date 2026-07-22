import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import DocumentsView from './views/DocumentsView';
import MediaView from './views/MediaView';
import ImagesView from './views/ImagesView';
import QrView from './views/QrView';
import HistoryView from './views/HistoryView';
import SettingsView from './views/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const savedTheme = localStorage.getItem('omni_theme') || 'cyberpunk';
    const savedMode = localStorage.getItem('omni_mode') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-mode', savedMode);
  }, []);

  return (
    <div className="min-h-screen flex text-main font-sans transition-colors duration-300">
      {/* Expanded & Organized Responsive Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          
          {(activeTab === 'documents' || activeTab === 'tables') && (
            <DocumentsView initialSubTab={activeTab} />
          )}

          {(activeTab === 'video-downloader' || activeTab === 'audio-studio' || activeTab === 'media') && (
            <MediaView initialSubTab={activeTab} />
          )}

          {(activeTab === 'images' || activeTab === 'gif-studio' || activeTab === 'metadata') && (
            <ImagesView initialSubTab={activeTab} />
          )}

          {activeTab === 'qr' && <QrView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        <footer className="border-t border-slate-700/20 sidebar-glass py-6 text-center text-xs text-muted">
          <p>© {new Date().getFullYear()} OmniConverter Suite — Aplicación Web Ejecutada en Local.</p>
        </footer>
      </div>
    </div>
  );
}
