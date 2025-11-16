import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const MetadataPreview = ({ 
  selectedFile = null,
  currentMetadata = {},
  newMetadata = {},
  showComparison = true
}) => {
  const [activeTab, setActiveTab] = useState('current');

  if (!selectedFile) {
    return (
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 text-center">
          <div className="text-muted-foreground mb-4">
            <Icon name="FileText" size={48} />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
            No File Selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Select files to preview their metadata information
          </p>
        </div>
      </div>
    );
  }

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

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const MetadataDisplay = ({ metadata, title, isEmpty = false }) => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      
      {isEmpty ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-2">
            <Icon name="FileX" size={32} />
          </div>
          <p className="text-sm text-muted-foreground">No metadata available</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Title:</span>
              <span className="text-sm font-medium text-foreground font-data">
                {metadata?.title !== undefined && metadata?.title !== null ? metadata?.title : 'Not set'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Artist:</span>
              <span className="text-sm font-medium text-foreground font-data">
                {metadata?.artist !== undefined && metadata?.artist !== null ? metadata?.artist : 'Not set'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Album:</span>
              <span className="text-sm font-medium text-foreground font-data">
                {metadata?.album !== undefined && metadata?.album !== null ? metadata?.album : 'Not set'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Year:</span>
              <span className="text-sm font-medium text-foreground font-data">
                {metadata?.year !== undefined && metadata?.year !== null ? metadata?.year : 'Not set'}
              </span>
            </div>
            
            {metadata?.comments && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Comments:</div>
                <div className="text-sm text-foreground font-data">
                  {metadata?.comments}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="text-primary">
            <Icon name={getFileTypeIcon(selectedFile?.type)} size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-heading font-semibold text-foreground truncate">
              Metadata Preview
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {selectedFile?.name}
            </p>
          </div>
        </div>
      </div>
      {/* File Information */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">File Size</div>
            <div className="text-sm font-medium text-foreground">
              {formatFileSize(selectedFile?.size)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">File Type</div>
            <div className="text-sm font-medium text-foreground">
              {selectedFile?.type || 'Unknown'}
            </div>
          </div>
          {selectedFile?.duration && (
            <div>
              <div className="text-xs text-muted-foreground">Duration</div>
              <div className="text-sm font-medium text-foreground">
                {formatDuration(selectedFile?.duration)}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs text-muted-foreground">Last Modified</div>
            <div className="text-sm font-medium text-foreground">
              {selectedFile?.lastModified ? 
                new Date(selectedFile.lastModified)?.toLocaleDateString() : 
                'Unknown'
              }
            </div>
          </div>
        </div>
      </div>
      {/* Metadata Tabs */}
      {showComparison && (
        <div className="border-b border-border">
          <div className="flex">
            <Button
              variant={activeTab === 'current' ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab('current')}
              className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary"
              data-active={activeTab === 'current'}
            >
              Current Metadata
            </Button>
            <Button
              variant={activeTab === 'new' ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab('new')}
              className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary"
              data-active={activeTab === 'new'}
            >
              New Metadata
            </Button>
          </div>
        </div>
      )}
      {/* Metadata Content */}
      <div className="p-6">
        {showComparison ? (
          <>
            {activeTab === 'current' && (
              <MetadataDisplay 
                metadata={currentMetadata} 
                title="Current File Metadata"
                isEmpty={!currentMetadata || Object.keys(currentMetadata)?.length === 0}
              />
            )}
            {activeTab === 'new' && (
              <MetadataDisplay 
                metadata={newMetadata} 
                title="New Metadata to Apply"
                isEmpty={!newMetadata || Object.keys(newMetadata)?.length === 0}
              />
            )}
          </>
        ) : (
          <MetadataDisplay 
            metadata={currentMetadata} 
            title="File Metadata"
            isEmpty={!currentMetadata || Object.keys(currentMetadata)?.length === 0}
          />
        )}

        {/* Cover Art Preview */}
        {(currentMetadata?.coverArt || selectedFile?.coverArt) && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">Cover Art</h4>
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden">
                <Image
                  src={currentMetadata?.coverArt || selectedFile?.coverArt}
                  alt="Cover art preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* ENHANCED: Changes Summary - Fixed to show default values */}
        {showComparison && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">Changes Summary</h4>
            
            {/* FIXED: Always show configured metadata, even if it matches defaults */}
            {Object.keys(newMetadata)?.length > 0 ? (
              <div className="space-y-2">
                {Object.entries(newMetadata)?.map(([key, value]) => {
                  const currentValue = currentMetadata?.[key];
                  const isChanged = currentValue !== value;
                  const hasValue = value && value?.toString()?.trim() !== '';
                  
                  // FIXED: Show all configured metadata, highlighting changes
                  return (
                    <div 
                      key={key}
                      className={`flex items-center justify-between p-2 rounded ${
                        isChanged ? 'bg-primary/10' : hasValue ? 'bg-success/5' : 'bg-muted/30'
                      }`}
                    >
                      <span className="text-sm text-muted-foreground capitalize">
                        {key}:
                      </span>
                      <div className="flex items-center space-x-2">
                        {isChanged && (
                          <Icon name="ArrowRight" size={12} className="text-primary" />
                        )}
                        {hasValue && !isChanged && (
                          <Icon name="Check" size={12} className="text-success" />
                        )}
                        <span className={`text-sm font-medium ${
                          isChanged ? 'text-primary' : hasValue ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {value || 'Not set'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {/* ENHANCED: Show summary information */}
                <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg">
                  <div className="text-xs text-info">
                    <Icon name="Info" size={12} className="inline mr-1" />
                    {Object.values(newMetadata)?.filter(v => v && v?.toString()?.trim())?.length} fields configured, 
                    {Object.entries(newMetadata)?.filter(([key, value]) => currentMetadata?.[key] !== value)?.length} changes from current
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-muted-foreground mb-2">
                  <Icon name="AlertCircle" size={24} />
                </div>
                <p className="text-sm text-muted-foreground">
                  No metadata configured yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure metadata in the form to see changes here
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataPreview;