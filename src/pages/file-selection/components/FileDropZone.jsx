import React, { useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';

const FileDropZone = ({ 
  onFilesDropped, 
  acceptedFormats = ['.mp3', '.m4a', '.wav', '.flac', '.mp4'],
  isProcessing = false 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFileType = (file) => {
    const fileExtension = '.' + file?.name?.split('.')?.pop()?.toLowerCase();
    const isValidExtension = acceptedFormats?.includes(fileExtension);
    
    // Also check MIME type for better mobile compatibility
    const validMimeTypes = [
      'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/flac',
      'video/mp4', 'video/quicktime', 'video/x-msvideo'
    ];
    const isValidMimeType = validMimeTypes?.includes(file?.type);
    
    return isValidExtension || isValidMimeType;
  };

  const handleDragOver = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!isProcessing) {
      setIsDragOver(true);
    }
  }, [isProcessing]);

  const handleDragLeave = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragEnter = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!isProcessing) {
      setIsDragOver(true);
    }
  }, [isProcessing]);

  const handleDrop = async (event) => {
    event?.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event?.dataTransfer?.files || []);
    const supportedFiles = files?.filter(file => {
      const extension = '.' + file?.name?.split('.')?.pop()?.toLowerCase();
      return acceptedFormats?.includes(extension);
    });
    
    if (supportedFiles?.length > 0) {
      await onFilesDropped(supportedFiles);
    } else if (files?.length > 0) {
      // Show message for unsupported files
      alert(`Please select supported file types: ${acceptedFormats?.join(', ')}`);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
        isDragOver
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-border hover:border-primary/50 hover:bg-muted/30'
      } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className={`p-4 rounded-full transition-smooth ${
          isDragOver ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          <Icon 
            name={isDragOver ? "Upload" : "FileText"} 
            size={32} 
          />
        </div>
        
        <div className="space-y-2">
          <h3 className={`text-lg font-heading font-medium transition-smooth ${
            isDragOver ? 'text-primary' : 'text-foreground'
          }`}>
            {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          
          <p className="text-sm text-muted-foreground max-w-md">
            {isProcessing 
              ? 'Processing in progress...' 
              : `Drop your audio and video files here or use the buttons above to browse. Supports ${acceptedFormats?.join(', ')?.toUpperCase()} formats.`
            }
          </p>
          
          {/* Add mobile-specific instruction */}
          {/iPad|iPhone|iPod/?.test(navigator?.userAgent) && !isProcessing && (
            <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-md max-w-md">
              <strong>iOS Note:</strong> Use "Select Files" button above to access your photo library and select videos.
            </p>
          )}
        </div>

        {!isProcessing && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Shield" size={14} />
            <span>Files are processed locally - no upload required</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDropZone;