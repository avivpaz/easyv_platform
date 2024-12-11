import React from 'react';
import { X, Download } from 'lucide-react';

const PDFViewerModal = ({ isOpen, onClose, fileUrl }) => {
  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      // Fetch the file
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Extract filename from URL or use default
      const filename = fileUrl.split('/').pop() || 'cv.pdf';
      link.download = filename;
      
      // Append to body, click, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback to opening in new tab if download fails
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">CV Preview</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-4 bg-gray-50">
          <iframe
            src={fileUrl}
            className="w-full h-full rounded-lg border border-gray-200"
            title="PDF Viewer"
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewerModal;