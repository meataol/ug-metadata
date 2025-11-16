import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const FileList = ({ 
  files = [], 
  onFileSelect, 
  onSkipToggle, 
  onBulkSkipToggle,
  selectedFiles = [],
  skippedFiles = [],
  onIndividualArtwork
}) => {
  const [selectAll, setSelectAll] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('audio/')) return 'Music';
    if (type?.startsWith('video/')) return 'Video';
    return 'FileText';
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    onBulkSkipToggle(checked ? files?.map(f => f?.id) : []);
  };

  const audioFiles = files?.filter(file => file?.type?.startsWith('audio/'));
  const videoFiles = files?.filter(file => file?.type?.startsWith('video/'));
  const skippedCount = skippedFiles?.length;
  const totalFiles = files?.length;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Files Requiring Cover Art
            </h3>
            <p className="text-sm text-muted-foreground">
              {totalFiles} files • {skippedCount} skipped
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              label="Skip all"
              checked={selectAll}
              onChange={(e) => handleSelectAll(e?.target?.checked)}
              size="sm"
            />
          </div>
        </div>
      </div>
      {/* File List */}
      <div className="max-h-96 overflow-y-auto">
        {files?.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <Icon name="FileX" size={48} />
            </div>
            <h4 className="text-lg font-medium text-foreground mb-2">
              No files available
            </h4>
            <p className="text-sm text-muted-foreground">
              Please select files from the previous step to manage cover art.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Audio Files Section */}
            {audioFiles?.length > 0 && (
              <div>
                <div className="px-4 py-3 bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Icon name="Music" size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Audio Files ({audioFiles?.length})
                    </span>
                  </div>
                </div>
                {audioFiles?.map((file) => {
                  const isSkipped = skippedFiles?.includes(file?.id);
                  const isSelected = selectedFiles?.includes(file?.id);
                  
                  return (
                    <div 
                      key={file?.id}
                      className={`p-4 hover:bg-muted/30 transition-micro ${
                        isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            {file?.coverArt ? (
                              <Image
                                src={file?.coverArt}
                                alt={`${file?.name} cover`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon name="Music" size={20} className="text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-foreground truncate font-data">
                              {file?.name}
                            </h4>
                            {file?.metadata?.title && (
                              <span className="text-xs text-muted-foreground">
                                • {file?.metadata?.title}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(file?.size)} • {file?.type}
                          </div>
                          {file?.metadata?.artist && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Artist: {file?.metadata?.artist}
                            </div>
                          )}
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center space-x-3">
                          {file?.coverArt && (
                            <div className="flex items-center space-x-1 text-success">
                              <Icon name="CheckCircle" size={14} />
                              <span className="text-xs">Has artwork</span>
                            </div>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onIndividualArtwork(file)}
                            iconName="Edit"
                            iconSize={14}
                          >
                            Edit
                          </Button>
                          
                          <Checkbox
                            label="Skip"
                            checked={isSkipped}
                            onChange={(e) => onSkipToggle(file?.id, e?.target?.checked)}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Video Files Section */}
            {videoFiles?.length > 0 && (
              <div>
                <div className="px-4 py-3 bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Icon name="Video" size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Video Files ({videoFiles?.length})
                    </span>
                  </div>
                </div>
                {videoFiles?.map((file) => {
                  const isSkipped = skippedFiles?.includes(file?.id);
                  const isSelected = selectedFiles?.includes(file?.id);
                  
                  return (
                    <div 
                      key={file?.id}
                      className={`p-4 hover:bg-muted/30 transition-micro ${
                        isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            {file?.thumbnail ? (
                              <Image
                                src={file?.thumbnail}
                                alt={`${file?.name} thumbnail`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon name="Video" size={20} className="text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-foreground truncate font-data">
                              {file?.name}
                            </h4>
                            {file?.metadata?.title && (
                              <span className="text-xs text-muted-foreground">
                                • {file?.metadata?.title}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(file?.size)} • {file?.type}
                          </div>
                          {file?.duration && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Duration: {file?.duration}
                            </div>
                          )}
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center space-x-3">
                          {file?.thumbnail && (
                            <div className="flex items-center space-x-1 text-success">
                              <Icon name="CheckCircle" size={14} />
                              <span className="text-xs">Has thumbnail</span>
                            </div>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onIndividualArtwork(file)}
                            iconName="Edit"
                            iconSize={14}
                          >
                            Edit
                          </Button>
                          
                          <Checkbox
                            label="Skip"
                            checked={isSkipped}
                            onChange={(e) => onSkipToggle(file?.id, e?.target?.checked)}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Footer Stats */}
      {files?.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              {totalFiles - skippedCount} files will receive cover art
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">
                Audio: {audioFiles?.length}
              </span>
              <span className="text-muted-foreground">
                Video: {videoFiles?.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;