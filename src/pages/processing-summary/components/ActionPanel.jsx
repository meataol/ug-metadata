import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import fileSystemUtils from '../../../utils/fileSystemUtils';

const ActionPanel = ({ 
  failedFiles = [],
  onProcessFailed,
  onExportReport,
  onStartNewBatch,
  onUndoBatch,
  canUndo = true,
  isProcessing = false
}) => {
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const handleExportReport = () => {
    setShowLocationSelector(true);
  };

  const handleExportConfirm = (useCustomLocation) => {
    const timestamp = new Date()?.toISOString()?.replace(/[:.]/g, '-');
    const filename = `processing-summary-${timestamp}.${exportFormat}`;
    
    if (useCustomLocation) {
      // Show user instructions for custom location
      alert(`📁 Custom Export Location\n\nPlease choose where to save your report:\n\n1. The browser will ask you to choose a download location\n2. Select your preferred folder\n3. The report "${filename}" will be saved there\n\nClick OK to start the download.`);
    } else {
      // Use default location with user guidance
      const defaultPath = fileSystemUtils?.generateSafeFilePath('', filename);
      
      if (navigator?.clipboard) {
        navigator?.clipboard?.writeText(defaultPath)?.then(() => {
          alert(`📁 Report Export\n\nReport will be saved to default location:\n${defaultPath}\n\n📋 Path copied to clipboard!\n\nIf the file doesn't appear automatically, check your browser's download folder or paste the path in your file manager.`);
        })?.catch(() => {
          alert(`📁 Report Export\n\nReport will be saved to:\n${defaultPath}\n\nIf the file doesn't appear automatically, check your browser's download folder.`);
        });
      } else {
        alert(`📁 Report Export\n\nReport will be saved to:\n${defaultPath}\n\nIf the file doesn't appear automatically, check your browser's download folder.`);
      }
    }
    
    if (onExportReport) {
      onExportReport(exportFormat, filename, useCustomLocation);
    }
    
    setShowLocationSelector(false);
  };

  const handleStartNewBatch = () => {
    const confirmNewBatch = window.confirm(
      'Starting a new batch will:\n\n' + '• Keep your current processing history\n'+ '• Clear selected files and settings\n'+ '• Take you to file selection\n\n'+ 'Your processing summary will remain available. Continue?'
    );
    
    if (confirmNewBatch) {
      // Clear only current session data, preserve history
      localStorage.removeItem('selectedFiles');
      localStorage.removeItem('currentProcessingSession');
      localStorage.removeItem('retryFiles');
      localStorage.removeItem('ugMetadataManager_metadataConfig');
      localStorage.removeItem('ugMetadataManager_metadataDraft');
      
      if (onStartNewBatch) {
        onStartNewBatch();
      }
    }
  };

  const handleUndoBatch = () => {
    const confirmUndo = window.confirm(
      'This will:\n\n' + '• Remove the most recent processing results from history\n'+ '• Keep older processing results intact\n'+ '• Clear current session data\n\n'+ 'This action cannot be undone. Continue?'
    );
    
    if (confirmUndo && onUndoBatch) {
      // Remove only current session results
      localStorage.removeItem('currentProcessingSession');
      
      // Get existing processed files and remove today's entries
      const existingFiles = JSON.parse(localStorage.getItem('processedFiles') || '[]');
      const today = new Date()?.toDateString();
      const filteredFiles = existingFiles?.filter(file => 
        new Date(file?.processedAt)?.toDateString() !== today
      );
      
      if (filteredFiles?.length !== existingFiles?.length) {
        localStorage.setItem('processedFiles', JSON.stringify(filteredFiles));
      }
      
      onUndoBatch();
    }
  };

  const actions = [
    {
      id: 'process-failed',
      title: 'Process Failed Files Again',
      description: `Retry processing for ${failedFiles?.length} failed files`,
      icon: 'RotateCcw',
      variant: 'default',
      disabled: failedFiles?.length === 0 || isProcessing,
      onClick: onProcessFailed,
      show: failedFiles?.length > 0
    },
    {
      id: 'export-report',
      title: 'Export Results Report',
      description: 'Download detailed processing report with file locations',
      icon: 'Download',
      variant: 'outline',
      disabled: isProcessing,
      onClick: handleExportReport,
      show: true
    },
    {
      id: 'start-new',
      title: 'Start New Batch',
      description: 'Clear current files and begin processing new ones',
      icon: 'Plus',
      variant: 'outline',
      disabled: isProcessing,
      onClick: handleStartNewBatch,
      show: true
    },
    {
      id: 'undo-batch',
      title: 'Undo Batch Operation',
      description: 'Revert all changes made in this batch',
      icon: 'Undo',
      variant: 'destructive',
      disabled: !canUndo || isProcessing,
      onClick: () => setShowUndoConfirm(true),
      show: canUndo
    }
  ];

  const visibleActions = actions?.filter(action => action?.show);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Next Actions
        </h3>
        <div className="text-sm text-muted-foreground">
          Choose your next step
        </div>
      </div>
      {/* Action Cards - Desktop */}
      <div className="hidden md:grid md:grid-cols-2 gap-4 mb-6">
        {visibleActions?.map((action) => (
          <div 
            key={action?.id}
            className="border border-border rounded-lg p-4 hover:border-primary/50 transition-micro"
          >
            <div className="flex items-start space-x-3">
              <div className="text-muted-foreground mt-1">
                <Icon name={action?.icon} size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {action?.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {action?.description}
                </p>
                <Button
                  variant={action?.variant}
                  size="sm"
                  disabled={action?.disabled}
                  onClick={action?.onClick}
                  iconName={action?.icon}
                  iconPosition="left"
                  iconSize={16}
                  fullWidth
                >
                  {action?.title}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Action List - Mobile */}
      <div className="md:hidden space-y-3 mb-6">
        {visibleActions?.map((action) => (
          <div 
            key={action?.id}
            className="border border-border rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Icon name={action?.icon} size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {action?.title}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {action?.description}
            </p>
            <Button
              variant={action?.variant}
              size="sm"
              disabled={action?.disabled}
              onClick={action?.onClick}
              iconName={action?.icon}
              iconPosition="left"
              iconSize={16}
              fullWidth
            >
              {action?.title}
            </Button>
          </div>
        ))}
      </div>
      {/* Export Settings */}
      <div className="border-t border-border pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <Icon name="FileText" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Export format:</span>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e?.target?.value)}
              className="text-sm border border-border rounded-md px-3 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="csv">CSV Report</option>
              <option value="json">JSON Data</option>
              <option value="txt">Text Summary</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Info" size={14} />
            <span>Includes file paths and processing details</span>
          </div>
        </div>
        
        {/* Default Export Location Info */}
        <div className="mt-3 p-3 bg-info/10 border border-info/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="FolderOpen" size={14} className="text-info mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-medium text-info mb-1">
                📁 Export Location
              </div>
              <div className="text-xs text-muted-foreground">
                Reports saved to: Browser Downloads folder
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Export Location Selector Modal */}
      {showLocationSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-elevated max-w-md w-full p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="text-primary">
                <Icon name="FolderOpen" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Choose Export Location
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Where would you like to save your processing report?
                </p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleExportConfirm(false)}
                className="w-full p-4 border border-border rounded-lg hover:border-primary/50 text-left transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <Icon name="Home" size={20} className="text-muted-foreground mt-1" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Default Location</div>
                    <div className="text-xs text-muted-foreground">
                      Save to: {fileSystemUtils?.formatPathForDisplay(fileSystemUtils?.getDefaultProcessedDirectory())}
                    </div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleExportConfirm(true)}
                className="w-full p-4 border border-border rounded-lg hover:border-primary/50 text-left transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <Icon name="FolderOpen" size={20} className="text-muted-foreground mt-1" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Choose Custom Location</div>
                    <div className="text-xs text-muted-foreground">
                      Select a different folder for this report
                    </div>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowLocationSelector(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Undo Confirmation Modal */}
      {showUndoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-elevated max-w-md w-full p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="text-error">
                <Icon name="AlertTriangle" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Confirm Undo Operation
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This will revert all metadata changes and file modifications made in this batch. This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="bg-error/10 border border-error/20 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-error" />
                <span className="text-sm font-medium text-error">
                  Warning: This will permanently revert all changes
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowUndoConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleUndoBatch}
                iconName="Undo"
                iconPosition="left"
                iconSize={16}
              >
                Undo Batch
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPanel;