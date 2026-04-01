import React from 'react';
import { FileText, Download, ExternalLink, AlertTriangle } from 'lucide-react';

const PDFViewer = ({ pdfPath, title }) => {
  const fullUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${pdfPath}`;

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[500px]">
      <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-white font-medium truncate max-w-[200px]">{title || 'Certificate Document'}</span>
        </div>
        <div className="flex items-center gap-2">
          <a 
            href={fullUrl} 
            download 
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </a>
          <a 
            href={fullUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
      
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center p-4">
        <iframe
          src={`${fullUrl}#toolbar=0`}
          className="w-full h-full rounded-lg border-0"
          title="PDF Preview"
        />
        
        {/* Overlay for small screens or if iframe fails */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-sm pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-white/10 p-6 rounded-2xl text-center max-w-xs border border-white/20">
                <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <p className="text-white text-sm">Having trouble viewing the PDF?</p>
                <a 
                    href={fullUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium pointer-events-auto hover:bg-indigo-700 transition"
                >
                    Open Externally
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
