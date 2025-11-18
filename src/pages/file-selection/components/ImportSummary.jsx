import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ImportSummary = ({ 
  totalFiles = 0,
  filesToProcess = 0,
  filesToSkip = 0,
  selectedFiles = 0,
  retagAllFiles = false,
  onRetagToggle,
  onClearAll,
  onProceedToNext,
  canProceed = false
}) => {
  const summaryStats = [
    {
      label: 'Total Files',
      value: totalFiles,
      icon: 'FileText',
      color: 'text-foreground'
    },
    {
      label: 'Selected',
      value: selectedFiles,
      icon: 'CheckCircle',
      color: 'text-primary'
    },
    {
      label: 'To Process',
      value: filesToProcess,
      icon: 'Play',
      color: 'text-success'
    },
    {
      label: 'To Skip',
      value: filesToSkip,
      icon: 'SkipForward',
      color: 'text-warning'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
          Import Summary
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {summaryStats?.map((stat) => (
            <div 
              key={stat?.label}
              className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg"
            >
              <div className={stat?.color}>
                <Icon name={stat?.icon} size={20} />
              </div>
              <div>
                <div className="text-lg font-heading font-semibold text-foreground">
                  {stat?.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat?.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Processing Options */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
          Processing Options
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <Checkbox
              label="Re-tag all files"
              description="Override existing 'UG Production' tags and process all selected files"
              checked={retagAllFiles}
              onChange={(e) => onRetagToggle(e?.target?.checked)}
            />
          </div>
          
          {filesToSkip > 0 && !retagAllFiles && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                <div className="text-sm text-warning">
                  <strong>Note:</strong> {filesToSkip} files already have 'UG Production' tags and will be skipped. 
                  Enable "Re-tag all files" to process them anyway.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Format Support */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
          Supported Formats
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
              <Icon name="Music" size={16} />
              <span>Audio Files</span>
            </div>
            <div className="space-y-1">
              {['MP3']?.map((format) => (
                <div key={format} className="text-xs text-muted-foreground font-data">
                  {format}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center space-x-2">
              <Icon name="Info" size={16} />
              <span className="text-xs">Other formats (M4A, WAV, FLAC, MP4) are read-only</span>
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={onClearAll}
            disabled={totalFiles === 0}
            iconName="Trash2"
            iconPosition="left"
            iconSize={16}
          >
            Clear All Files
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="text-sm text-muted-foreground">
              {canProceed ? 'Ready to proceed' : 'Select files to continue'}
            </div>
            
            <Button
              variant="default"
              onClick={onProceedToNext}
              disabled={!canProceed}
              iconName="ArrowRight"
              iconPosition="right"
              iconSize={16}
            >
              Next: Metadata Entry
            </Button>
          </div>
        </div>
      </div>
      {/* Offline Processing Notice */}
      <div className="bg-success/10 border border-success/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={16} className="text-success mt-0.5" />
          <div className="text-sm text-success">
            <strong>Secure Offline Processing:</strong> All files are processed locally on your device. 
            No data is transmitted or uploaded to external servers.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportSummary;