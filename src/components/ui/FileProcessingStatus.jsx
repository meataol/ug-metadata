import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const FileProcessingStatus = ({ 
  files = [],
  currentFile = null,
  progress = 0,
  status = 'idle', // idle, processing, paused, completed, error
  onPause,
  onResume,
  onCancel,
  showControls = true,
  compact = false
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return 'Play';
      case 'paused':
        return 'Pause';
      case 'completed':
        return 'CheckCircle';
      case 'error':
        return 'AlertCircle';
      default:
        return 'Clock';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-primary';
      case 'paused':
        return 'text-warning';
      case 'completed':
        return 'text-success';
      case 'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'processing':
        return 'Processing files...';
      case 'paused':
        return 'Processing paused';
      case 'completed':
        return 'Processing completed';
      case 'error':
        return 'Processing error occurred';
      default:
        return 'Ready to process';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getFileStatus = (file) => {
    if (file?.error) return 'error';
    if (file?.completed) return 'completed';
    if (file?.processing) return 'processing';
    return 'pending';
  };

  const getFileStatusIcon = (fileStatus) => {
    switch (fileStatus) {
      case 'completed':
        return 'CheckCircle';
      case 'processing':
        return 'Loader';
      case 'error':
        return 'AlertCircle';
      default:
        return 'Clock';
    }
  };

  const getFileStatusColor = (fileStatus) => {
    switch (fileStatus) {
      case 'completed':
        return 'text-success';
      case 'processing':
        return 'text-primary';
      case 'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  if (compact) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${getStatusColor()}`}>
              <Icon name={getStatusIcon()} size={20} />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {getStatusText()}
              </div>
              <div className="text-xs text-muted-foreground">
                {files?.length} files • {Math.round(progress)}% complete
              </div>
            </div>
          </div>
          
          {showControls && status === 'processing' && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPause}
                iconName="Pause"
                iconSize={16}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                iconName="X"
                iconSize={16}
              />
            </div>
          )}
        </div>
        {progress > 0 && (
          <div className="mt-3">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-smooth"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${getStatusColor()}`}>
              <Icon name={getStatusIcon()} size={24} />
            </div>
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">
                {getStatusText()}
              </h3>
              <p className="text-sm text-muted-foreground">
                Processing {files?.length} files
              </p>
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              {status === 'processing' && (
                <>
                  <Button
                    variant="outline"
                    onClick={onPause}
                    iconName="Pause"
                    iconPosition="left"
                    iconSize={16}
                  >
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    iconName="X"
                    iconPosition="left"
                    iconSize={16}
                  >
                    Cancel
                  </Button>
                </>
              )}
              
              {status === 'paused' && (
                <Button
                  variant="default"
                  onClick={onResume}
                  iconName="Play"
                  iconPosition="left"
                  iconSize={16}
                >
                  Resume
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-smooth"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {/* Current File */}
      {currentFile && (
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-3">
            <div className="text-primary">
              <Icon name="FileText" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                Currently processing: {currentFile?.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatFileSize(currentFile?.size)} • {currentFile?.type}
              </div>
            </div>
            <div className="text-primary animate-spin">
              <Icon name="Loader" size={16} />
            </div>
          </div>
        </div>
      )}
      {/* File List */}
      <div className="max-h-96 overflow-y-auto">
        {files?.map((file, index) => {
          const fileStatus = getFileStatus(file);
          
          return (
            <div 
              key={file?.id || index}
              className="flex items-center space-x-3 p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-micro"
            >
              <div className={getFileStatusColor(fileStatus)}>
                <Icon 
                  name={getFileStatusIcon(fileStatus)} 
                  size={16}
                  className={fileStatus === 'processing' ? 'animate-spin' : ''}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate font-data">
                  {file?.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(file?.size)} • {file?.type}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {file?.progress && (
                  <span>{Math.round(file?.progress)}%</span>
                )}
                {file?.error && (
                  <span className="text-error">Error</span>
                )}
                {fileStatus === 'completed' && (
                  <span className="text-success">Done</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileProcessingStatus;