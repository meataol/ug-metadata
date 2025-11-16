import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const BatchProcessingPanel = ({ 
  selectedFiles = [],
  batchMode,
  onBatchModeChange,
  onApplyToAll,
  onCustomizeIndividual,
  processingStats = {}
}) => {
  const [showFileList, setShowFileList] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getFileTypeIcon = (type) => {
    if (type?.startsWith('audio/')) return 'Music';
    if (type?.startsWith('video/')) return 'Video';
    return 'FileText';
  };

  const totalSize = selectedFiles?.reduce((sum, file) => sum + (file?.size || 0), 0);
  const audioFiles = selectedFiles?.filter(file => file?.type?.startsWith('audio/'));
  const videoFiles = selectedFiles?.filter(file => file?.type?.startsWith('video/'));

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-primary">
              <Icon name="Layers" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-foreground">
                Batch Processing
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure how metadata is applied to your files
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFileList(!showFileList)}
            iconName={showFileList ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            iconSize={16}
          >
            {showFileList ? "Hide" : "Show"} Files
          </Button>
        </div>
      </div>
      {/* File Statistics */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {selectedFiles?.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {audioFiles?.length}
            </div>
            <div className="text-sm text-muted-foreground">Audio Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">
              {videoFiles?.length}
            </div>
            <div className="text-sm text-muted-foreground">Video Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {formatFileSize(totalSize)}
            </div>
            <div className="text-sm text-muted-foreground">Total Size</div>
          </div>
        </div>
      </div>
      {/* Processing Mode Selection */}
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Processing Mode</h3>
          
          <div className="space-y-3">
            <Checkbox
              checked={batchMode === 'apply-all'}
              onChange={(e) => e?.target?.checked && onBatchModeChange('apply-all')}
              label="Apply to All Files"
              description="Use the same metadata configuration for all selected files"
            />
            
            <Checkbox
              checked={batchMode === 'customize'}
              onChange={(e) => e?.target?.checked && onBatchModeChange('customize')}
              label="Customize Individual Files"
              description="Configure metadata separately for each file"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-4 border-t border-border">
          <Button
            variant={batchMode === 'apply-all' ? "default" : "outline"}
            onClick={onApplyToAll}
            disabled={selectedFiles?.length === 0}
            iconName="Layers"
            iconPosition="left"
            iconSize={16}
          >
            Apply to All ({selectedFiles?.length})
          </Button>
          
          <Button
            variant={batchMode === 'customize' ? "default" : "outline"}
            onClick={onCustomizeIndividual}
            disabled={selectedFiles?.length === 0}
            iconName="Settings"
            iconPosition="left"
            iconSize={16}
          >
            Customize Individual
          </Button>
        </div>

        {/* Processing Stats */}
        {Object.keys(processingStats)?.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">Processing Status</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <div className="text-lg font-bold text-success">
                  {processingStats?.completed || 0}
                </div>
                <div className="text-xs text-success">Completed</div>
              </div>
              <div className="text-center p-3 bg-warning/10 rounded-lg">
                <div className="text-lg font-bold text-warning">
                  {processingStats?.pending || 0}
                </div>
                <div className="text-xs text-warning">Pending</div>
              </div>
              <div className="text-center p-3 bg-error/10 rounded-lg">
                <div className="text-lg font-bold text-error">
                  {processingStats?.errors || 0}
                </div>
                <div className="text-xs text-error">Errors</div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* File List */}
      {showFileList && (
        <div className="border-t border-border">
          <div className="p-4 bg-muted/30">
            <h4 className="text-sm font-medium text-foreground mb-3">Selected Files</h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {selectedFiles?.map((file, index) => (
              <div 
                key={file?.id || index}
                className="flex items-center space-x-3 p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-micro"
              >
                <div className="text-muted-foreground">
                  <Icon name={getFileTypeIcon(file?.type)} size={16} />
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
                  {file?.hasMetadata && (
                    <div className="flex items-center space-x-1">
                      <Icon name="Tag" size={12} />
                      <span>Tagged</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchProcessingPanel;