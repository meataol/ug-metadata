import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BatchActions = ({ 
  selectedImage,
  files = [],
  skippedFiles = [],
  onApplyToAll,
  onApplyToSelected,
  onSkipAll,
  onClearAll,
  isProcessing = false,
  onPreview
}) => {
  const [showConfirmation, setShowConfirmation] = useState(null);

  const activeFiles = files?.filter(file => !skippedFiles?.includes(file?.id));
  const audioFiles = activeFiles?.filter(file => file?.type?.startsWith('audio/'));
  const videoFiles = activeFiles?.filter(file => file?.type?.startsWith('video/'));

  const handleAction = (action) => {
    if (action?.requiresConfirmation) {
      setShowConfirmation(action);
    } else {
      action?.handler();
    }
  };

  const confirmAction = () => {
    if (showConfirmation) {
      showConfirmation?.handler();
      setShowConfirmation(null);
    }
  };

  const cancelAction = () => {
    setShowConfirmation(null);
  };

  const actions = [
    {
      id: 'apply-all',
      label: 'Apply to All Files',
      description: `Apply cover art to ${activeFiles?.length} files`,
      icon: 'CheckCircle',
      variant: 'default',
      disabled: !selectedImage || activeFiles?.length === 0 || isProcessing,
      handler: onApplyToAll,
      requiresConfirmation: true,
      confirmTitle: 'Apply Cover Art to All Files?',
      confirmMessage: `This will apply the selected cover art to ${activeFiles?.length} files. This action cannot be undone.`
    }
  ];

  const utilityActions = [
    {
      id: 'preview',
      label: 'Preview Changes',
      description: 'Preview how files will look',
      icon: 'Eye',
      variant: 'outline',
      disabled: !selectedImage || activeFiles?.length === 0,
      handler: onPreview
    },
    {
      id: 'skip-all',
      label: 'Skip All Files',
      description: 'Skip cover art for all files',
      icon: 'SkipForward',
      variant: 'outline',
      disabled: isProcessing,
      handler: onSkipAll,
      requiresConfirmation: true,
      confirmTitle: 'Skip All Files?',
      confirmMessage: 'This will skip cover art processing for all files. You can proceed to the next step without adding any artwork.'
    },
    {
      id: 'clear-all',
      label: 'Clear Existing Art',
      description: 'Remove existing cover art',
      icon: 'Trash2',
      variant: 'outline',
      disabled: isProcessing,
      handler: onClearAll,
      requiresConfirmation: true,
      confirmTitle: 'Clear All Existing Cover Art?',
      confirmMessage: 'This will remove existing cover art from all files. This action cannot be undone.'
    }
  ];

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Icon name="Layers" size={20} className="text-primary" />
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Batch Actions
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Apply cover art to multiple files at once
          </p>
        </div>

        {/* Main Actions */}
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Apply Cover Art</h4>
            {actions?.map((action) => (
              <Button
                key={action?.id}
                variant={action?.variant}
                onClick={() => handleAction(action)}
                disabled={action?.disabled}
                iconName={action?.icon}
                iconPosition="left"
                iconSize={16}
                fullWidth
                className="justify-start"
              >
                <div className="flex flex-col items-start">
                  <span>{action?.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {action?.description}
                  </span>
                </div>
              </Button>
            ))}
          </div>

          {/* Utility Actions */}
          <div className="space-y-2 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground">Utilities</h4>
            {utilityActions?.map((action) => (
              <Button
                key={action?.id}
                variant={action?.variant}
                onClick={() => handleAction(action)}
                disabled={action?.disabled}
                iconName={action?.icon}
                iconPosition="left"
                iconSize={16}
                fullWidth
                className="justify-start"
              >
                <div className="flex flex-col items-start">
                  <span>{action?.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {action?.description}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Status Summary */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-foreground">
                {activeFiles?.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Files to Process
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">
                {skippedFiles?.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Files Skipped
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-elevated max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <div className="text-warning">
                  <Icon name="AlertTriangle" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-heading font-semibold text-foreground">
                    {showConfirmation?.confirmTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {showConfirmation?.confirmMessage}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={cancelAction}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={confirmAction}
                  iconName={showConfirmation?.icon}
                  iconPosition="left"
                  iconSize={16}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BatchActions;