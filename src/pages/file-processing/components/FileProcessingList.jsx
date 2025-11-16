import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileProcessingList = ({ 
  files = [],
  onRetryFile,
  onViewDetails,
  showDetails = false
}) => {
  const [expandedFiles, setExpandedFiles] = useState(new Set());

  const getFileStatus = (file) => {
    if (file?.error) return 'error';
    if (file?.completed) return 'completed';
    if (file?.processing) return 'processing';
    return 'pending';
  };

  const getFileStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'processing':
        return 'Loader';
      case 'error':
        return 'AlertCircle';
      default:
        return 'Clock';
    }
  };

  const getFileStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'processing':
        return 'text-primary';
      case 'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStageText = (file) => {
    if (file?.error) return file?.error;
    if (file?.completed) return 'Processing completed';
    if (file?.processing) {
      return file?.stage || 'Processing...';
    }
    return 'Waiting to process';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
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

  const getProcessingStages = (file) => {
    const stages = [
      { key: 'validation', label: 'File Validation', icon: 'CheckSquare' },
      { key: 'backup', label: 'Backup Creation', icon: 'Copy' },
      { key: 'metadata', label: 'Metadata Embedding', icon: 'Tag' },
      { key: 'coverart', label: 'Cover Art Insertion', icon: 'Image' },
      { key: 'rename', label: 'File Renaming', icon: 'Edit3' },
      { key: 'finalize', label: 'Finalization', icon: 'Save' }
    ];

    return stages?.map(stage => ({
      ...stage,
      completed: file?.completedStages?.includes(stage?.key) || false,
      current: file?.currentStage === stage?.key,
      error: file?.stageErrors?.[stage?.key] || null
    }));
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-subtle">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-semibold text-foreground">
            File Processing Status
          </h3>
          <div className="text-sm text-muted-foreground">
            {files?.length} files
          </div>
        </div>
      </div>
      {/* File List */}
      <div className="max-h-96 overflow-y-auto">
        {files?.map((file, index) => {
          const status = getFileStatus(file);
          const isExpanded = expandedFiles?.has(file?.id);
          const stages = getProcessingStages(file);
          
          return (
            <div 
              key={file?.id || index}
              className="border-b border-border last:border-b-0"
            >
              {/* Main File Row */}
              <div className="flex items-center space-x-4 p-4 hover:bg-muted/30 transition-micro">
                <div className={`${getFileStatusColor(status)} flex-shrink-0`}>
                  <Icon 
                    name={getFileStatusIcon(status)} 
                    size={20}
                    className={status === 'processing' ? 'animate-spin' : ''}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground truncate font-data">
                        {file?.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(file?.size)} • {file?.type}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      {file?.progress !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          {Math.round(file?.progress)}%
                        </div>
                      )}
                      
                      {status === 'error' && onRetryFile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRetryFile(file?.id)}
                          iconName="RotateCcw"
                          iconSize={14}
                        >
                          Retry
                        </Button>
                      )}
                      
                      {showDetails && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFileExpansion(file?.id)}
                          iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
                          iconSize={16}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className={`text-xs ${
                      status === 'error' ? 'text-error' : 
                      status === 'completed'? 'text-success' : 'text-muted-foreground'
                    }`}>
                      {getStageText(file)}
                    </div>
                    
                    {file?.progress !== undefined && status === 'processing' && (
                      <div className="w-full bg-muted rounded-full h-1 mt-2">
                        <div 
                          className="bg-primary h-1 rounded-full transition-smooth"
                          style={{ width: `${file?.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 bg-muted/20">
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-foreground mb-2">
                      Processing Stages:
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {stages?.map((stage) => (
                        <div 
                          key={stage?.key}
                          className={`flex items-center space-x-2 p-2 rounded text-xs ${
                            stage?.error ? 'bg-error/10' : stage?.current ?'bg-primary/10' :
                            stage?.completed ? 'bg-success/10': 'bg-muted/50'
                          }`}
                        >
                          <Icon 
                            name={
                              stage?.error ? 'AlertCircle' :
                              stage?.completed ? 'CheckCircle': stage?.current ?'Loader' :
                              stage?.icon
                            }
                            size={14}
                            className={
                              stage?.error ? 'text-error' : stage?.current ?'text-primary animate-spin' :
                              stage?.completed ? 'text-success': 'text-muted-foreground'
                            }
                          />
                          <span className={
                            stage?.error ? 'text-error' : stage?.current ?'text-primary' :
                            stage?.completed ? 'text-success': 'text-muted-foreground'
                          }>
                            {stage?.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {file?.error && (
                      <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Icon name="AlertCircle" size={16} className="text-error mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-error">Error Details:</div>
                            <div className="text-xs text-error mt-1">{file?.error}</div>
                            {file?.errorSuggestion && (
                              <div className="text-xs text-muted-foreground mt-2">
                                <strong>Suggestion:</strong> {file?.errorSuggestion}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileProcessingList;