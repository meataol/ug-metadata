import React from 'react';
import Icon from '../../../components/AppIcon';

const SummaryMetrics = ({ 
  totalFiles = 0,
  successfulFiles = 0,
  failedFiles = 0,
  skippedFiles = 0,
  processingTime = 0
}) => {
  const successRate = totalFiles > 0 ? Math.round((successfulFiles / totalFiles) * 100) : 0;
  
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const metrics = [
    {
      label: "Total Files",
      value: totalFiles,
      icon: "Files",
      color: "text-foreground",
      bgColor: "bg-muted"
    },
    {
      label: "Successful",
      value: successfulFiles,
      icon: "CheckCircle",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      label: "Failed",
      value: failedFiles,
      icon: "XCircle",
      color: "text-error",
      bgColor: "bg-error/10"
    },
    {
      label: "Skipped",
      value: skippedFiles,
      icon: "Clock",
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-heading font-semibold text-foreground">
          Processing Summary
        </h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Clock" size={16} />
          <span>Completed in {formatTime(processingTime)}</span>
        </div>
      </div>
      {/* Desktop Grid Layout */}
      <div className="hidden md:grid md:grid-cols-4 gap-4 mb-6">
        {metrics?.map((metric, index) => (
          <div 
            key={index}
            className={`${metric?.bgColor} rounded-lg p-4 border border-border`}
          >
            <div className="flex items-center justify-between">
              <div className={metric?.color}>
                <Icon name={metric?.icon} size={20} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-heading font-bold text-foreground">
                  {metric?.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metric?.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3 mb-6">
        {metrics?.map((metric, index) => (
          <div 
            key={index}
            className={`${metric?.bgColor} rounded-lg p-4 border border-border`}
          >
            <div className="flex items-center space-x-3">
              <div className={metric?.color}>
                <Icon name={metric?.icon} size={24} />
              </div>
              <div className="flex-1">
                <div className="text-xl font-heading font-bold text-foreground">
                  {metric?.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {metric?.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Success Rate Indicator */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Success Rate</span>
          <span className="text-sm font-bold text-foreground">{successRate}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-smooth ${
              successRate >= 90 ? 'bg-success' : 
              successRate >= 70 ? 'bg-warning' : 'bg-error'
            }`}
            style={{ width: `${successRate}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {successRate >= 90 ? 'Excellent processing results' :
           successRate >= 70 ? 'Good processing results with some issues': 'Processing completed with multiple issues'}
        </div>
      </div>
    </div>
  );
};

export default SummaryMetrics;