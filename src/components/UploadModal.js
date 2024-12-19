import React, { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { jobService } from '../services/jobService';

const UploadModal = ({ isOpen, onClose, jobId, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).filter(file => {
      const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(files => files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    try {
      setUploadStatus({ status: 'uploading', message: 'Uploading CVs...' });
      const response = await jobService.uploadCVs(jobId, files);
      
      if (response.failed?.length > 0) {
        const duplicateFiles = response.failed.filter(f => f.error === 'cv_duplication');
        const invalidFiles = response.failed.filter(f => f.error === 'invalid_file');
        
        if (duplicateFiles.length > 0) {
          setUploadStatus({
            status: 'error',
            message: `${duplicateFiles.map(f => f.fileName).join(', ')} ${duplicateFiles.length === 1 ? 'is' : 'are'} already in the system.`
          });
          return;
        }
      
        if (invalidFiles.length > 0) {
          setUploadStatus({
            status: 'error',
            message: `${invalidFiles.map(f => f.fileName).join(', ')} ${invalidFiles.length === 1 ? 'is' : 'are'} invalid.`
          });
          return;
        }
      }
      if (response.successful?.length > 0) {
        setUploadStatus({ status: 'success', message: 'CVs uploaded successfully!' });
        onSuccess();
        setTimeout(() => {
          onClose();
          setFiles([]);
          setUploadStatus(null);
        }, 1500);
      }
    } catch (error) {
      setUploadStatus({ 
        status: 'error', 
        message: error.message || 'Failed to upload CVs' 
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload CVs</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop CV files here, or
            <label className="mx-2 text-primary hover:text-primary-light cursor-pointer transition-colors">
              browse
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Support for PDF, DOC, DOCX (Max 5MB per file)
          </p>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div className={`mt-4 p-4 rounded-md ${
            uploadStatus.status === 'error' ? 'bg-red-50 text-red-700' :
            uploadStatus.status === 'success' ? 'bg-green-50 text-green-700' :
            'bg-primary/5 text-primary'
          }`}>
            {uploadStatus.message}
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Selected Files ({files.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm text-gray-600">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light disabled:opacity-50 transition-colors"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;