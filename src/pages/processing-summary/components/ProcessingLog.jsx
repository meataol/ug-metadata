import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProcessingLog = ({ logs = [], isVisible = false, onToggle }) => {
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const logLevels = [
    { value: 'all', label: 'All Logs', count: logs?.length },
    { value: 'info', label: 'Info', count: logs?.filter(log => log?.level === 'info')?.length },
    { value: 'warning', label: 'Warnings', count: logs?.filter(log => log?.level === 'warning')?.length },
    { value: 'error', label: 'Errors', count: logs?.filter(log => log?.level === 'error')?.length }
  ];

  const filteredLogs = logs?.filter(log => {
    const matchesLevel = filterLevel === 'all' || log?.level === filterLevel;
    const matchesSearch = searchTerm === '' || 
      log?.message?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      log?.file?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getLogIcon = (level) => {
    switch (level) {
      case 'error':
        return { icon: 'XCircle', color: 'text-error' };
      case 'warning':
        return { icon: 'AlertTriangle', color: 'text-warning' };
      case 'success':
        return { icon: 'CheckCircle', color: 'text-success' };
      default:
        return { icon: 'Info', color: 'text-primary' };
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportLogs = () => {
    const logData = filteredLogs?.map(log => ({
      timestamp: new Date(log.timestamp)?.toISOString(),
      level: log?.level,
      message: log?.message,
      file: log?.file || '',
      details: log?.details || ''
    }));
    
    const csvContent = [
      'Timestamp,Level,Message,File,Details',
      ...logData?.map(log => 
        `"${log?.timestamp}","${log?.level}","${log?.message}","${log?.file}","${log?.details}"`
      )
    ]?.join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processing-logs-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <Button
          variant="outline"
          onClick={onToggle}
          iconName="FileText"
          iconPosition="left"
          iconSize={16}
          fullWidth
        >
          View Processing Logs ({logs?.length} entries)
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Processing Logs
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              iconName="Download"
              iconSize={16}
            >
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              iconName="X"
              iconSize={16}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={16} className="text-muted-foreground" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e?.target?.value)}
              className="text-sm border border-border rounded-md px-3 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {logLevels?.map(level => (
                <option key={level?.value} value={level?.value}>
                  {level?.label} ({level?.count})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Icon 
                name="Search" 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Log Entries */}
      <div className="max-h-96 overflow-y-auto">
        {filteredLogs?.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredLogs?.map((log, index) => {
              const logConfig = getLogIcon(log?.level);
              
              return (
                <div key={index} className="p-4 hover:bg-muted/30 transition-micro">
                  <div className="flex items-start space-x-3">
                    <div className={`${logConfig?.color} mt-0.5`}>
                      <Icon name={logConfig?.icon} size={16} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-data text-muted-foreground">
                          {formatTimestamp(log?.timestamp)}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          log?.level === 'error' ? 'bg-error/10 text-error' :
                          log?.level === 'warning' ? 'bg-warning/10 text-warning' :
                          log?.level === 'success'? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                        }`}>
                          {log?.level?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="text-sm text-foreground mb-1">
                        {log?.message}
                      </div>
                      
                      {log?.file && (
                        <div className="text-xs text-muted-foreground font-data mb-1">
                          File: {log?.file}
                        </div>
                      )}
                      
                      {log?.details && (
                        <div className="text-xs text-muted-foreground">
                          {log?.details}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-heading font-medium text-foreground mb-2">
              No logs found
            </h4>
            <p className="text-sm text-muted-foreground">
              {searchTerm || filterLevel !== 'all' ?'No logs match your current filters.' :'No processing logs available.'
              }
            </p>
          </div>
        )}
      </div>
      {/* Footer */}
      {filteredLogs?.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredLogs?.length} of {logs?.length} log entries
            </span>
            <span>
              Generated on {new Date()?.toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingLog;