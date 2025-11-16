import React, { useState } from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FileListTable = ({
  files = [],
  selectedFiles = [],
  onFileSelect,
  onFileRemove,
  onSelectAll,
  retagAllFiles = false
}) => {
  const [expandedFiles, setExpandedFiles] = useState(new Set());

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i))?.toFixed(2)} ${sizes?.[i]}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp)?.toLocaleDateString();
  };

  const toggleFileExpansion = (fileId) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded?.has(fileId)) {
      newExpanded?.delete(fileId);
    } else {
      newExpanded?.add(fileId);
    }
    setExpandedFiles(newExpanded);
  };

  const isFileSelected = (fileId) => selectedFiles?.includes(fileId);
  const allSelected = files?.length > 0 && files?.every(file => isFileSelected(file?.id));
  const someSelected = files?.some(file => isFileSelected(file?.id));

  const getProcessingStatus = (file) => {
    const hasUGTag = file?.artist && file?.artist?.toLowerCase()?.includes('ug production');
    
    if (retagAllFiles) {
      return { status: 'will-process', label: 'Will Process', color: 'text-info' };
    } else if (hasUGTag) {
      return { status: 'will-skip', label: 'Will Skip', color: 'text-muted-foreground' };
    } else {
      return { status: 'will-process', label: 'Will Process', color: 'text-success' };
    }
  };

  if (files?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">
            <Icon name="FolderOpen" size={48} className="mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Files Selected</h3>
          <p className="text-muted-foreground mb-4">
            Select audio or video files to get started with metadata processing
          </p>
          <div className="text-sm text-muted-foreground">
            Drag & drop files here or use the "Select Files" button above
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="List" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-foreground">
                Selected Files ({files?.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Review and configure files for processing
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={(e) => onSelectAll(e?.target?.checked)}
              label="Select All"
            />
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Select</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">File</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Size</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Current Metadata</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files?.map((file, index) => {
              const isSelected = isFileSelected(file?.id);
              const isExpanded = expandedFiles?.has(file?.id);
              const processingStatus = getProcessingStatus(file);
              
              return (
                <React.Fragment key={file?.id}>
                  <tr className={`border-b border-border hover:bg-muted/20 transition-colors ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}>
                    {/* Select Checkbox */}
                    <td className="p-4">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => onFileSelect(file?.id, e?.target?.checked)}
                      />
                    </td>
                    
                    {/* File Info */}
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Icon 
                            name={file?.type?.startsWith('audio/') ? 'Music' : 'Video'} 
                            size={20} 
                            className="text-primary" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {file?.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {file?.type || 'Unknown type'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* File Size */}
                    <td className="p-4">
                      <div className="text-sm text-foreground">
                        {formatFileSize(file?.size)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(file?.lastModified)}
                      </div>
                    </td>
                    
                    {/* Current Metadata Preview */}
                    <td className="p-4">
                      <div className="space-y-1">
                        {file?.title && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Title:</span> {file?.title}
                          </div>
                        )}
                        {file?.artist && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Artist:</span> {file?.artist}
                          </div>
                        )}
                        {!file?.title && !file?.artist && (
                          <div className="text-sm text-muted-foreground italic">
                            No metadata available
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Processing Status */}
                    <td className="p-4">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        processingStatus?.status === 'will-process' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon 
                          name={processingStatus?.status === 'will-process' ? 'CheckCircle' : 'Clock'} 
                          size={12} 
                          className="mr-1" 
                        />
                        {processingStatus?.label}
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFileExpansion(file?.id)}
                          iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                          iconSize={16}
                        >
                          {isExpanded ? 'Hide' : 'View'} Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onFileRemove(file?.id)}
                          iconName="Trash2"
                          iconSize={16}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="border-b border-border bg-muted/10">
                      <td colSpan={6} className="p-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-foreground flex items-center">
                            <Icon name="Info" size={16} className="mr-2 text-info" />
                            Detailed File Information
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Basic Info */}
                            <div className="space-y-2">
                              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">File Details</h5>
                              <div className="text-sm space-y-1">
                                <div><span className="font-medium">Name:</span> {file?.name}</div>
                                <div><span className="font-medium">Size:</span> {formatFileSize(file?.size)}</div>
                                <div><span className="font-medium">Type:</span> {file?.type || 'Unknown'}</div>
                                <div><span className="font-medium">Modified:</span> {formatDate(file?.lastModified)}</div>
                              </div>
                            </div>
                            
                            {/* Current Metadata */}
                            <div className="space-y-2">
                              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Metadata</h5>
                              <div className="text-sm space-y-1">
                                <div><span className="font-medium">Title:</span> {file?.title || 'Not set'}</div>
                                <div><span className="font-medium">Artist:</span> {file?.artist || 'Not set'}</div>
                                <div><span className="font-medium">Album:</span> {file?.album || 'Not set'}</div>
                                <div><span className="font-medium">Year:</span> {file?.year || 'Not set'}</div>
                                <div><span className="font-medium">Genre:</span> {file?.genre || 'Not set'}</div>
                              </div>
                            </div>
                            
                            {/* Processing Info */}
                            <div className="space-y-2">
                              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Processing Status</h5>
                              <div className="text-sm space-y-1">
                                <div className={processingStatus?.color}>
                                  <span className="font-medium">Status:</span> {processingStatus?.label}
                                </div>
                                <div>
                                  <span className="font-medium">Selected:</span> {isSelected ? 'Yes' : 'No'}
                                </div>
                                <div>
                                  <span className="font-medium">Has UG Tag:</span> {
                                    file?.artist?.toLowerCase()?.includes('ug production') ? 'Yes' : 'No'
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Footer */}
      <div className="p-4 bg-muted/20 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {selectedFiles?.length} of {files?.length} files selected
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span>Will Process</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
              <span>Will Skip</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileListTable;