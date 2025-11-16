import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProcessingProgress = ({ 
  overallProgress = 0,
  currentFile = null,
  estimatedTimeRemaining = null,
  status = 'idle', // idle, processing, paused, completed, error
  onPause,
  onResume,
  onCancel,
  filesProcessed = 0,
  totalFiles = 0
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
        return 'Processing completed successfully';
      case 'error':
        return 'Processing error occurred';
      default:
        return 'Ready to start processing';
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return 'Calculating...';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-subtle">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`${getStatusColor()}`}>
              <Icon 
                name={getStatusIcon()} 
                size={32} 
                className={status === 'processing' ? 'animate-pulse' : ''}
              />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground">
                {getStatusText()}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {filesProcessed} of {totalFiles} files processed
              </p>
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center space-x-3">
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
                  variant="destructive"
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
              <>
                <Button
                  variant="default"
                  onClick={onResume}
                  iconName="Play"
                  iconPosition="left"
                  iconSize={16}
                >
                  Resume
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
          </div>
        </div>
      </div>
      {/* Progress Section */}
      <div className="p-6 space-y-6">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm font-medium text-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-smooth relative overflow-hidden"
              style={{ width: `${overallProgress}%` }}
            >
              {status === 'processing' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Current File & Time Estimate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current File */}
          {currentFile && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="FileText" size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Currently Processing</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium text-foreground truncate font-data">
                  {currentFile?.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {currentFile?.stage || 'Preparing file...'}
                </div>
              </div>
            </div>
          )}

          {/* Time Estimate */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Time Remaining</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium text-foreground">
                {formatTime(estimatedTimeRemaining)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Estimated completion time
              </div>
            </div>
          </div>
        </div>

        {/* Processing Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <div className="text-lg font-semibold text-success">
              {filesProcessed}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-lg font-semibold text-primary">
              {status === 'processing' ? 1 : 0}
            </div>
            <div className="text-xs text-muted-foreground">Processing</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-lg font-semibold text-foreground">
              {totalFiles - filesProcessed - (status === 'processing' ? 1 : 0)}
            </div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </div>
          <div className="text-center p-3 bg-error/10 rounded-lg">
            <div className="text-lg font-semibold text-error">0</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingProgress;