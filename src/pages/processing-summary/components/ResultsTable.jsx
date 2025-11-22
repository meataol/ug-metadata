import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import fileSystemUtils from '../../../utils/fileSystemUtils';

const ResultsTable = ({ files = [] }) => {
  const [sortField, setSortField] = useState('originalName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set());

  const statusOptions = [
    { value: 'all', label: 'All Files' },
    { value: 'success', label: 'Successful' },
    { value: 'failed', label: 'Failed' },
    { value: 'skipped', label: 'Skipped' }
  ];

  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files;
    
    if (filterStatus !== 'all') {
      filtered = files?.filter(file => file?.status === filterStatus);
    }

    return filtered?.sort((a, b) => {
      let aValue = a?.[sortField];
      let bValue = b?.[sortField];
      
      if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [files, sortField, sortDirection, filterStatus]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRowExpansion = (fileId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded?.has(fileId)) {
      newExpanded?.delete(fileId);
    } else {
      newExpanded?.add(fileId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return { icon: 'CheckCircle', color: 'text-success' };
      case 'failed':
        return { icon: 'XCircle', color: 'text-error' };
      case 'skipped':
        return { icon: 'Clock', color: 'text-warning' };
      default:
        return { icon: 'Circle', color: 'text-muted-foreground' };
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      success: 'bg-success/10 text-success border-success/20',
      failed: 'bg-error/10 text-error border-error/20',
      skipped: 'bg-warning/10 text-warning border-warning/20'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium border ${config?.[status] || 'bg-muted text-muted-foreground'}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const openFileLocation = (filePath) => {
    if (!filePath) {
      alert('File location information is not available');
      return;
    }

    // Use the utility function for proper file location handling
    fileSystemUtils?.openFileLocation(filePath);
  };

  const showFileInExplorer = (filePath) => {
    if (!filePath) {
      alert('File path information is not available');
      return;
    }

    // Show specific file with detailed instructions
    fileSystemUtils?.showFileInDirectory(filePath);
  };

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left hover:text-primary transition-micro"
    >
      <span>{children}</span>
      {sortField === field && (
        <Icon 
          name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
          size={14} 
        />
      )}
    </button>
  );

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Detailed Results
          </h3>
          
          {/* Filter Controls */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Icon name="Filter" size={16} className="text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e?.target?.value)}
                className="text-sm border border-border rounded-md px-3 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statusOptions?.map(option => (
                  <option key={option?.value} value={option?.value}>
                    {option?.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredAndSortedFiles?.length} of {files?.length} files
            </div>
          </div>
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <SortButton field="originalName">Original Name</SortButton>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <SortButton field="newName">New Name</SortButton>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <SortButton field="status">Status</SortButton>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <SortButton field="size">Size</SortButton>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Location
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedFiles?.map((file, index) => {
              const statusConfig = getStatusIcon(file?.status);
              const isExpanded = expandedRows?.has(file?.id);
              const displayPath = fileSystemUtils?.formatPathForDisplay(file?.location);
              
              return (
                <React.Fragment key={file?.id}>
                  <tr className="border-b border-border hover:bg-muted/30 transition-micro">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Icon name="FileText" size={16} className="text-muted-foreground" />
                        <span className="text-sm font-data text-foreground truncate max-w-48">
                          {file?.originalName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-data text-foreground truncate max-w-48">
                        {file?.newName || '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Icon name={statusConfig?.icon} size={16} className={statusConfig?.color} />
                        <span className={getStatusBadge(file?.status)}>
                          {file?.status?.charAt(0)?.toUpperCase() + file?.status?.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(file?.size)}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => openFileLocation(file?.location)}
                        className="text-sm text-primary hover:underline truncate max-w-32 text-left"
                        title={`Click to copy path: ${file?.location}`}
                      >
                        <Icon name="Folder" size={12} className="inline mr-1" />
                        {displayPath}
                      </button>
                    </td>
                  </tr>
                  {/* Error Details Row */}
                  {isExpanded && file?.error && (
                    <tr className="bg-error/5">
                      <td colSpan="5" className="p-4">
                        <div className="flex items-start space-x-3">
                          <Icon name="AlertCircle" size={16} className="text-error mt-0.5" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-error mb-1">
                              Error Details
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {file?.error}
                            </div>
                            {file?.suggestion && (
                              <div className="text-sm text-muted-foreground mt-2">
                                <strong>Suggestion:</strong> {file?.suggestion}
                              </div>
                            )}
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
      {/* Mobile List */}
      <div className="lg:hidden">
        {filteredAndSortedFiles?.map((file, index) => {
          const statusConfig = getStatusIcon(file?.status);
          const isExpanded = expandedRows?.has(file?.id);
          const displayPath = fileSystemUtils?.formatPathForDisplay(file?.location);
          
          return (
            <div key={file?.id} className="border-b border-border last:border-b-0">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="FileText" size={16} className="text-muted-foreground" />
                      <span className="text-sm font-data text-foreground truncate">
                        {file?.originalName}
                      </span>
                    </div>
                    
                    {file?.newName && (
                      <div className="text-xs text-muted-foreground mb-2">
                        Renamed to: {file?.newName}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-1">
                        <Icon name={statusConfig?.icon} size={14} className={statusConfig?.color} />
                        <span className={getStatusBadge(file?.status)}>
                          {file?.status?.charAt(0)?.toUpperCase() + file?.status?.slice(1)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file?.size)}
                      </span>
                    </div>

                    {/* File Location - Mobile */}
                    <button
                      onClick={() => openFileLocation(file?.location)}
                      className="text-xs text-primary hover:underline truncate block w-full text-left"
                      title={`Click to copy path: ${file?.location}`}
                    >
                      <Icon name="Folder" size={12} className="inline mr-1" />
                      Location: {displayPath}
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showFileInExplorer(file?.location)}
                      iconName="ExternalLink"
                      iconSize={16}
                      title="Show file location"
                    />
                    {file?.error && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(file?.id)}
                        iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
                        iconSize={16}
                      />
                    )}
                  </div>
                </div>
                
                {/* Error Details */}
                {isExpanded && file?.error && (
                  <div className="mt-3 p-3 bg-error/5 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Icon name="AlertCircle" size={14} className="text-error mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-error mb-1">
                          Error Details
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {file?.error}
                        </div>
                        {file?.suggestion && (
                          <div className="text-xs text-muted-foreground mt-2">
                            <strong>Suggestion:</strong> {file?.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Empty State */}
      {filteredAndSortedFiles?.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-heading font-medium text-foreground mb-2">
            No files found
          </h3>
          <p className="text-sm text-muted-foreground">
            {filterStatus === 'all' ?'No files have been processed yet.'
              : `No files match the "${filterStatus}" status filter.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;