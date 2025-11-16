import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConfigurationSummary = ({ 
  configuration = {},
  onModifyConfig,
  isProcessing = false,
  canModify = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    destinationFolder = '',
    renamingTemplate = 'Title – Artist',
    overwriteOriginal = false,
    clearExistingMetadata = false,
    skipExistingTags = true,
    selectedFiles = [],
    metadataSettings = {},
    coverArtSettings = {}
  } = configuration;

  const formatPath = (path) => {
    if (!path) return 'Not selected';
    return path?.length > 50 ? `...${path?.slice(-47)}` : path;
  };

  const getFileTypeCount = () => {
    const types = {};
    selectedFiles?.forEach(file => {
      const ext = file?.name?.split('.')?.pop()?.toUpperCase();
      types[ext] = (types?.[ext] || 0) + 1;
    });
    return types;
  };

  const fileTypes = getFileTypeCount();

  const configSections = [
    {
      title: 'File Selection',
      icon: 'FolderOpen',
      items: [
        { label: 'Total Files', value: selectedFiles?.length },
        { label: 'File Types', value: Object.keys(fileTypes)?.join(', ') || 'None' },
        { 
          label: 'Type Breakdown', 
          value: Object.entries(fileTypes)?.map(([type, count]) => `${type}: ${count}`)?.join(', ') || 'None'
        }
      ]
    },
    {
      title: 'Destination Settings',
      icon: 'Save',
      items: [
        { label: 'Destination', value: overwriteOriginal ? 'Overwrite original files' : formatPath(destinationFolder) },
        { label: 'Renaming Template', value: renamingTemplate },
        { label: 'File Organization', value: overwriteOriginal ? 'In-place modification' : 'Copy to destination' }
      ]
    },
    {
      title: 'Metadata Configuration',
      icon: 'Tag',
      items: [
        { label: 'Artist', value: metadataSettings?.artist || 'UG Production' },
        { label: 'Clear Existing', value: clearExistingMetadata ? 'Yes' : 'No' },
        { label: 'Skip Tagged Files', value: skipExistingTags ? 'Yes' : 'No' },
        { label: 'Custom Fields', value: Object.keys(metadataSettings)?.length > 1 ? 'Configured' : 'Default only' }
      ]
    },
    {
      title: 'Cover Art Settings',
      icon: 'Image',
      items: [
        { label: 'Cover Art Source', value: coverArtSettings?.source || 'Not configured' },
        { label: 'Apply to Audio', value: coverArtSettings?.applyToAudio ? 'Yes' : 'No' },
        { label: 'Apply to Video', value: coverArtSettings?.applyToVideo ? 'Yes' : 'No' },
        { label: 'Quality', value: coverArtSettings?.quality || 'High' }
      ]
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-subtle">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="Settings" size={20} className="text-primary" />
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Processing Configuration
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {canModify && !isProcessing && onModifyConfig && (
              <Button
                variant="outline"
                size="sm"
                onClick={onModifyConfig}
                iconName="Edit3"
                iconPosition="left"
                iconSize={14}
              >
                Modify
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
              iconSize={16}
            />
          </div>
        </div>
      </div>
      {/* Quick Summary */}
      <div className="p-4 bg-muted/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {selectedFiles?.length}
            </div>
            <div className="text-xs text-muted-foreground">Files</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">
              {Object.keys(fileTypes)?.length}
            </div>
            <div className="text-xs text-muted-foreground">Types</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-success">
              {metadataSettings?.artist || 'UG Production'}
            </div>
            <div className="text-xs text-muted-foreground">Artist</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-warning">
              {overwriteOriginal ? 'Overwrite' : 'Copy'}
            </div>
            <div className="text-xs text-muted-foreground">Mode</div>
          </div>
        </div>
      </div>
      {/* Detailed Configuration */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {configSections?.map((section, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center space-x-2">
                <Icon name={section?.icon} size={16} className="text-primary" />
                <h4 className="text-sm font-medium text-foreground">
                  {section?.title}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                {section?.items?.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between items-start">
                    <span className="text-xs text-muted-foreground">
                      {item?.label}:
                    </span>
                    <span className="text-xs text-foreground font-medium text-right ml-2 font-data">
                      {item?.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Processing Options */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">Processing Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`flex items-center space-x-2 p-2 rounded text-xs ${
                clearExistingMetadata ? 'bg-warning/10 text-warning' : 'bg-muted/50 text-muted-foreground'
              }`}>
                <Icon 
                  name={clearExistingMetadata ? "AlertTriangle" : "Info"} 
                  size={14} 
                />
                <span>Clear existing metadata: {clearExistingMetadata ? 'Enabled' : 'Disabled'}</span>
              </div>
              
              <div className={`flex items-center space-x-2 p-2 rounded text-xs ${
                skipExistingTags ? 'bg-success/10 text-success' : 'bg-muted/50 text-muted-foreground'
              }`}>
                <Icon 
                  name={skipExistingTags ? "CheckCircle" : "Info"} 
                  size={14} 
                />
                <span>Skip tagged files: {skipExistingTags ? 'Enabled' : 'Disabled'}</span>
              </div>
              
              <div className={`flex items-center space-x-2 p-2 rounded text-xs ${
                overwriteOriginal ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
              }`}>
                <Icon 
                  name={overwriteOriginal ? "AlertCircle" : "Copy"} 
                  size={14} 
                />
                <span>File safety: {overwriteOriginal ? 'Overwrite mode' : 'Copy mode'}</span>
              </div>
              
              <div className="flex items-center space-x-2 p-2 rounded text-xs bg-primary/10 text-primary">
                <Icon name="Shield" size={14} />
                <span>Backup creation: Automatic</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationSummary;