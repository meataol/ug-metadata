import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProcessingControls = ({ 
  status = 'idle', // idle, processing, paused, completed, error
  onStart,
  onPause,
  onResume,
  onCancel,
  onReset,
  onClearAll,
  canStart = true,
  hasFiles = false,
  showEmergencyStop = false
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCancel = () => {
    if (status === 'processing') {
      setShowCancelConfirm(true);
    } else {
      onCancel?.();
    }
  };

  const confirmCancel = () => {
    onCancel?.();
    setShowCancelConfirm(false);
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    onReset?.();
    setShowResetConfirm(false);
  };

  const getMainActionButton = () => {
    switch (status) {
      case 'idle':
        return (
          <Button
            variant="default"
            size="lg"
            onClick={onStart}
            disabled={!canStart || !hasFiles}
            iconName="Play"
            iconPosition="left"
            iconSize={20}
            className="min-w-32"
          >
            Start Processing
          </Button>
        );
      
      case 'processing':
        return (
          <Button
            variant="warning"
            size="lg"
            onClick={onPause}
            iconName="Pause"
            iconPosition="left"
            iconSize={20}
            className="min-w-32"
          >
            Pause Processing
          </Button>
        );
      
      case 'paused':
        return (
          <Button
            variant="success"
            size="lg"
            onClick={onResume}
            iconName="Play"
            iconPosition="left"
            iconSize={20}
            className="min-w-32"
          >
            Resume Processing
          </Button>
        );
      
      case 'completed':
        return (
          <Button
            variant="outline"
            size="lg"
            onClick={handleReset}
            iconName="RotateCcw"
            iconPosition="left"
            iconSize={20}
            className="min-w-32"
          >
            Process Again
          </Button>
        );
      
      case 'error':
        return (
          <Button
            variant="destructive"
            size="lg"
            onClick={handleReset}
            iconName="RefreshCw"
            iconPosition="left"
            iconSize={20}
            className="min-w-32"
          >
            Retry Processing
          </Button>
        );
      
      default:
        return null;
    }
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    onClearAll?.();
    setShowClearConfirm(false);
  };

  const getSecondaryActions = () => {
    const actions = [];

    if (status === 'idle' && hasFiles) {
      actions?.push(
        <Button
          key="clear"
          variant="outline"
          onClick={handleClearAll}
          iconName="Trash2"
          iconPosition="left"
          iconSize={16}
        >
          Clear All & Start Over
        </Button>
      );
    }

    if (status === 'processing' || status === 'paused') {
      actions?.push(
        <Button
          key="cancel"
          variant="outline"
          onClick={handleCancel}
          iconName="X"
          iconPosition="left"
          iconSize={16}
        >
          Cancel
        </Button>
      );
    }

    if (status === 'completed' || status === 'error') {
      actions?.push(
        <Button
          key="reset"
          variant="ghost"
          onClick={handleReset}
          iconName="RotateCcw"
          iconPosition="left"
          iconSize={16}
        >
          Reset
        </Button>
      );
    }

    return actions;
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg shadow-subtle p-6">
        {/* Status Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className={`flex items-center space-x-3 px-4 py-2 rounded-full ${
            status === 'processing' ? 'bg-primary/10 text-primary' :
            status === 'paused' ? 'bg-warning/10 text-warning' :
            status === 'completed' ? 'bg-success/10 text-success' :
            status === 'error'? 'bg-error/10 text-error' : 'bg-muted text-muted-foreground'
          }`}>
            <Icon 
              name={
                status === 'processing' ? 'Play' :
                status === 'paused' ? 'Pause' :
                status === 'completed' ? 'CheckCircle' :
                status === 'error'? 'AlertCircle' : 'Clock'
              }
              size={16}
              className={status === 'processing' ? 'animate-pulse' : ''}
            />
            <span className="text-sm font-medium">
              {status === 'processing' ? 'Processing Active' :
               status === 'paused' ? 'Processing Paused' :
               status === 'completed' ? 'Processing Complete' :
               status === 'error'? 'Processing Error' : 'Ready to Process'}
            </span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          {getMainActionButton()}
          
          <div className="flex items-center space-x-2">
            {getSecondaryActions()}
          </div>
        </div>

        {/* Emergency Stop */}
        {showEmergencyStop && status === 'processing' && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmCancel}
                iconName="AlertTriangle"
                iconPosition="left"
                iconSize={16}
              >
                Emergency Stop
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Immediately halt all processing operations
            </p>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            {status === 'idle' && !hasFiles && 'Select files to begin processing'}
            {status === 'idle' && hasFiles && 'Click Start Processing to begin batch operations'}
            {status === 'processing' && 'Processing can be paused or cancelled at any time'}
            {status === 'paused' && 'Resume processing or cancel to return to file selection'}
            {status === 'completed' && 'Processing completed successfully. View summary or process more files'}
            {status === 'error' && 'An error occurred during processing. Check the logs and retry'}
          </p>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-elevated max-w-md w-full p-6">
            <div className="flex items-start space-x-3">
              <Icon name="AlertTriangle" size={24} className="text-warning mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Cancel Processing?
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This will stop all current processing operations. Any files currently being processed may be left in an incomplete state. Are you sure you want to continue?
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
              >
                Continue Processing
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancel}
                iconName="X"
                iconPosition="left"
                iconSize={16}
              >
                Cancel Processing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-elevated max-w-md w-full p-6">
            <div className="flex items-start space-x-3">
              <Icon name="Trash2" size={24} className="text-error mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Clear All Files & Start Over?
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This will remove all files from the queue and clear all metadata settings. You will need to select files again from the beginning. This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
              >
                Keep Files
              </Button>
              <Button
                variant="destructive"
                onClick={confirmClearAll}
                iconName="Trash2"
                iconPosition="left"
                iconSize={16}
              >
                Clear All & Start Over
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-elevated max-w-md w-full p-6">
            <div className="flex items-start space-x-3">
              <Icon name="RotateCcw" size={24} className="text-primary mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Reset Processing?
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This will reset the current processing session and return to the initial state. All progress will be cleared. You can then start a new processing session.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(false)}
              >
                Keep Current State
              </Button>
              <Button
                variant="default"
                onClick={confirmReset}
                iconName="RotateCcw"
                iconPosition="left"
                iconSize={16}
              >
                Reset Processing
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProcessingControls;