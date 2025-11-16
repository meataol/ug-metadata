import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ImagePreview = ({ 
  selectedImage, 
  onImageSelect, 
  onClearImage,
  zoomLevel = 1,
  onZoomChange,
  cropPosition = { x: 0, y: 0 },
  onCropChange,
  isProcessing = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event?.target?.files?.[0];
    if (file && file?.type?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelect({
          file,
          url: e?.target?.result,
          name: file?.name,
          size: file?.size,
          type: file?.type
        });
      };
      reader?.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e?.dataTransfer?.files);
    const imageFile = files?.find(file => file?.type?.startsWith('image/'));
    
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageSelect({
          file: imageFile,
          url: event?.target?.result,
          name: imageFile?.name,
          size: imageFile?.size,
          type: imageFile?.type
        });
      };
      reader?.readAsDataURL(imageFile);
    }
  };

  const handleMouseDown = (e) => {
    if (!selectedImage) return;
    setIsDragging(true);
    setDragStart({
      x: e?.clientX - cropPosition?.x,
      y: e?.clientY - cropPosition?.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedImage) return;
    
    const newX = e?.clientX - dragStart?.x;
    const newY = e?.clientY - dragStart?.y;
    
    onCropChange({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Cover Art Preview
          </h3>
          {selectedImage && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearImage}
                iconName="X"
                iconSize={16}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Preview Area */}
      <div className="relative bg-muted/30">
        {selectedImage ? (
          <div className="relative h-80 lg:h-96 overflow-hidden">
            <div
              ref={previewRef}
              className="relative w-full h-full cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                className="absolute inset-0 transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel}) translate(${cropPosition?.x}px, ${cropPosition?.y}px)`
                }}
              >
                <Image
                  src={selectedImage?.url}
                  alt="Cover art preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-card rounded-lg p-4 flex items-center space-x-3">
                  <Icon name="Loader" size={20} className="animate-spin text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Processing image...
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`h-80 lg:h-96 border-2 border-dashed transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/10' :'border-border bg-muted/30'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className={`mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon name="Image" size={48} />
              </div>
              <h4 className="text-lg font-medium text-foreground mb-2">
                {isDragging ? 'Drop image here' : 'No cover art selected'}
              </h4>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                {isDragging 
                  ? 'Release to upload the image file' :'Drag and drop an image file here, or click browse to select one'
                }
              </p>
              {!isDragging && (
                <Button
                  variant="outline"
                  onClick={() => fileInputRef?.current?.click()}
                  iconName="Upload"
                  iconPosition="left"
                  iconSize={16}
                >
                  Browse Images
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Image Info & Controls */}
      {selectedImage && (
        <div className="p-4 border-t border-border space-y-4">
          {/* Image Details */}
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate font-data">
                {selectedImage?.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatFileSize(selectedImage?.size)} • {selectedImage?.type}
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Zoom</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onZoomChange(Math.max(0.5, zoomLevel - 0.1))}
                disabled={zoomLevel <= 0.5}
                iconName="ZoomOut"
                iconSize={14}
              />
              <span className="text-sm text-muted-foreground font-data min-w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onZoomChange(Math.min(3, zoomLevel + 0.1))}
                disabled={zoomLevel >= 3}
                iconName="ZoomIn"
                iconSize={14}
              />
            </div>
          </div>

          {/* Reset Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onZoomChange(1);
                onCropChange({ x: 0, y: 0 });
              }}
              iconName="RotateCcw"
              iconSize={14}
            >
              Reset View
            </Button>
          </div>
        </div>
      )}
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImagePreview;