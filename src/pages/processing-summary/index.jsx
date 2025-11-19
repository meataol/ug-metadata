import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ProcessStepIndicator from '../../components/ui/ProcessStepIndicator';
import SummaryMetrics from './components/SummaryMetrics';
import ResultsTable from './components/ResultsTable';
import ActionPanel from './components/ActionPanel';
import ProcessingLog from './components/ProcessingLog';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ProcessingSummary = () => {
  const navigate = useNavigate();
  const [showLogs, setShowLogs] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [processingResults, setProcessingResults] = useState(null);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [processingLogs, setProcessingLogs] = useState([]);
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [showClearOptions, setShowClearOptions] = useState(false);

  // Load actual processing results from localStorage
  useEffect(() => {
    const loadProcessingData = () => {
      console.log('🔍 ProcessingSummary: Loading data from localStorage');
      
      // Try to load from multiple sources, prioritizing actual processing results
      const results = localStorage.getItem('processingResults');
      const sessionResults = localStorage.getItem('currentProcessingSession');
      const logs = localStorage.getItem('processingLogs');
      const selectedFiles = localStorage.getItem('selectedFiles');
      
      console.log('📦 Available storage keys:', {
        results: !!results,
        sessionResults: !!sessionResults, 
        logs: !!logs,
        selectedFiles: !!selectedFiles
      });
      
      let loadedResults = null;
      let loadedFiles = [];
      let loadedLogs = [];

      // Load processing results (from actual processing)
      if (results) {
        try {
          loadedResults = JSON.parse(results);
          console.log('✅ Loaded processing results:', loadedResults);
        } catch (error) {
          console.error('❌ Error loading processing results:', error);
        }
      }

      // Load session results if main results not found
      if (!loadedResults && sessionResults) {
        try {
          const session = JSON.parse(sessionResults);
          loadedResults = {
            totalFiles: session?.totalFiles || 0,
            successfulFiles: session?.successfulFiles || 0,
            failedFiles: session?.failedFiles || 0,
            skippedFiles: session?.skippedFiles || 0,
            processingTime: session?.processingTime || 0,
            startTime: session?.startTime ? new Date(session?.startTime) : new Date(),
            endTime: session?.endTime ? new Date(session?.endTime) : new Date()
          };
          console.log('✅ Loaded session results:', loadedResults);
        } catch (error) {
          console.error('❌ Error loading session results:', error);
        }
      }

      // Load processed files (from actual processing) - PRIORITIZE ACTUAL DATA
      const processedFilesData = localStorage.getItem('processedFiles');
      if (processedFilesData) {
        try {
          loadedFiles = JSON.parse(processedFilesData);
          console.log('✅ Loaded processed files:', loadedFiles?.length);
        } catch (error) {
          console.error('❌ Error loading processed files:', error);
        }
      }

      // Create preview data ONLY if no actual processing has occurred AND we have selected files
      if (loadedFiles?.length === 0 && selectedFiles && !results && !sessionResults) {
        console.log('📋 Creating preview data from selected files');
        try {
          const selected = JSON.parse(selectedFiles);
          
          // Only create preview if we have actual selected files
          if (selected?.length > 0) {
            // Create preview files that clearly indicate they're not processed
            loadedFiles = selected?.map((file, index) => ({
              id: file?.id || `preview_${index}`,
              originalName: file?.name || `File ${index + 1}`,
              newName: `${file?.title || file?.name?.replace(/\.[^/.]+$/, '') || 'Unknown'} – UG Production.${file?.name?.split('.')?.pop() || 'mp3'}`,
              status: 'preview', // Clear indicator this is preview
              size: file?.size || 4567890,
              location: `Preview: Will be processed when workflow completes`,
              processedAt: null,
              error: null,
              suggestion: 'Complete processing workflow to see actual results',
              isPreview: true
            }));

            // Create preview results
            loadedResults = {
              totalFiles: loadedFiles?.length,
              successfulFiles: 0,
              failedFiles: 0,
              skippedFiles: loadedFiles?.length,
              processingTime: 0,
              startTime: new Date(),
              endTime: new Date(),
              isPreview: true
            };
            
            console.log('📋 Created preview data:', { files: loadedFiles?.length, results: loadedResults });
          }
        } catch (error) {
          console.error('❌ Error creating preview from selected files:', error);
        }
      }

      // Load processing logs
      if (logs) {
        try {
          loadedLogs = JSON.parse(logs);
          console.log('✅ Loaded processing logs:', loadedLogs?.length);
        } catch (error) {
          console.error('❌ Error loading processing logs:', error);
        }
      }

      // Generate preview logs only if we have preview files
      if (loadedLogs?.length === 0 && loadedFiles?.length > 0 && loadedResults?.isPreview) {
        console.log('📝 Generating preview logs');
        loadedLogs = [
          {
            timestamp: new Date(),
            level: "info",
            message: "Preview mode - showing expected processing results",
            details: `${loadedFiles?.length} files ready for processing`
          },
          {
            timestamp: new Date(),
            level: "info", 
            message: "Complete the processing workflow to see actual results",
            details: "This is a preview based on your selected files and metadata configuration"
          }
        ];
      }

      // Update state
      setProcessingResults(loadedResults);
      setProcessedFiles(loadedFiles);
      setProcessingLogs(loadedLogs);

      console.log('📊 Final processing summary state:', {
        resultsLoaded: !!loadedResults,
        filesCount: loadedFiles?.length,
        logsCount: loadedLogs?.length,
        isPreview: loadedResults?.isPreview || false
      });
    };

    loadProcessingData();
    
    // Listen for storage changes to update when new processing completes
    const handleStorageChange = (e) => {
      if (e?.key === 'processingResults' || e?.key === 'processedFiles' || e?.key === null) {
        console.log('🔄 Storage change detected, reloading data');
        loadProcessingData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter files by date
  const getFilteredFiles = () => {
    if (dateFilter === 'all') return processedFiles;
    
    const now = new Date();
    const filtered = processedFiles?.filter(file => {
      const fileDate = new Date(file?.processedAt);
      
      switch (dateFilter) {
        case 'today':
          return fileDate?.toDateString() === now?.toDateString();
        case 'week':
          const weekAgo = new Date(now?.getTime() - 7 * 24 * 60 * 60 * 1000);
          return fileDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now?.getTime() - 30 * 24 * 60 * 60 * 1000);
          return fileDate >= monthAgo;
        default:
          return true;
      }
    });

    return filtered;
  };

  const filteredFiles = getFilteredFiles();
  const failedFiles = filteredFiles?.filter(file => file?.status === 'failed');

  // Clear processing summary options
  const handleClearSummary = (option) => {
    switch (option) {
      case 'all': localStorage.removeItem('processingResults');
        localStorage.removeItem('processedFiles');
        localStorage.removeItem('processingLogs');
        localStorage.removeItem('currentProcessingSession');
        setProcessingResults(null);
        setProcessedFiles([]);
        setProcessingLogs([]);
        break;
      case 'current':
        // Clear only current date
        const today = new Date()?.toDateString();
        const remainingFiles = processedFiles?.filter(file => 
          new Date(file?.processedAt)?.toDateString() !== today
        );
        setProcessedFiles(remainingFiles);
        localStorage.setItem('processedFiles', JSON.stringify(remainingFiles));
        break;
      case 'week':
        // Clear last week
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const remainingWeekFiles = processedFiles?.filter(file =>
          new Date(file?.processedAt) < weekAgo
        );
        setProcessedFiles(remainingWeekFiles);
        localStorage.setItem('processedFiles', JSON.stringify(remainingWeekFiles));
        break;
    }
    setShowClearOptions(false);
  };

  const handleProcessFailed = () => {
    console.log('Processing failed files again...');
    // Store failed files for retry
    localStorage.setItem('retryFiles', JSON.stringify(failedFiles));
    navigate('/file-processing', { 
      state: { 
        retryFiles: failedFiles,
        isRetry: true 
      } 
    });
  };

  const handleExportReport = (format, filename, useCustomLocation) => {
    setIsExporting(true);
    
    // Mock export delay
    setTimeout(() => {
      console.log(`Exporting report: ${filename} (${format})`);
      
      // Create enhanced report data with actual data
      const reportData = {
        summary: processingResults,
        files: filteredFiles,
        logs: processingLogs,
        exportedAt: new Date()?.toISOString(),
        exportFormat: format,
        dateFilter: dateFilter,
        totalFilesInSummary: filteredFiles?.length
      };
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body?.appendChild(a);
        a?.click();
        document.body?.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const csvContent = [
          'Original Name,New Name,Status,Size,Location,Processed At,Error',
          ...filteredFiles?.map(file => {
            const processedTime = file?.processedAt ? new Date(file?.processedAt)?.toLocaleString() : 'Not processed';
            const actualStatus = file?.status === 'preview' ? 'PENDING' : file?.status?.toUpperCase();
            return `"${file?.originalName}","${file?.newName || ''}","${actualStatus}","${file?.size}","${file?.location}","${processedTime}","${file?.error || ''}"`;
          })
        ]?.join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body?.appendChild(a);
        a?.click();
        document.body?.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'txt') {
        const txtContent = `Processing Summary Report
Generated: ${new Date()?.toLocaleString()}
Filter: ${dateFilter}

SUMMARY:
Total Files: ${processingResults?.totalFiles || 0}
Successful: ${processingResults?.successfulFiles || 0}
Failed: ${processingResults?.failedFiles || 0}
Skipped: ${processingResults?.skippedFiles || 0}

DETAILED RESULTS:
${filteredFiles?.map(file => {
  const processedTime = file?.processedAt ? new Date(file?.processedAt)?.toLocaleString() : 'Not processed yet';
  const actualStatus = file?.status === 'preview' ? 'PENDING' : (file?.success ? 'SUCCESS' : (file?.error ? 'FAILED' : file?.status?.toUpperCase()));
  return `
${file?.originalName} -> ${file?.newName || 'N/A'}
Status: ${actualStatus}
Processed: ${processedTime}
${file?.error ? `Error: ${file?.error}` : ''}
`;
})?.join('')}`;

        const blob = new Blob([txtContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body?.appendChild(a);
        a?.click();
        document.body?.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      setIsExporting(false);
    }, 1500);
  };

  const handleStartNewBatch = () => {
    // Clear current processing state but keep history
    localStorage.removeItem('selectedFiles');
    localStorage.removeItem('currentProcessingSession');
    localStorage.removeItem('retryFiles');
    localStorage.removeItem('coverArtImage'); // Clear cover art image
    localStorage.removeItem('coverArtData'); // Clear cover art data
    navigate('/file-selection');
  };

  const handleUndoBatch = () => {
    console.log('Undoing batch operation...');
    // Mock undo operation
    setTimeout(() => {
      // Remove current session but keep historical data
      localStorage.removeItem('currentProcessingSession');
      navigate('/file-selection', { 
        state: { 
          message: 'Current batch operation has been undone. Historical data preserved.' 
        } 
      });
    }, 2000);
  };

  const handleStepChange = (stepId) => {
    const routes = [
      '/file-selection',
      '/metadata-entry', 
      '/cover-art-management',
      '/file-processing',
      '/processing-summary'
    ];
    
    if (stepId <= 5) {
      navigate(routes?.[stepId - 1]);
    }
  };

  // Show empty state if no processing results
  if (!processingResults && processedFiles?.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <ProcessStepIndicator 
          currentStep={5}
          completedSteps={[1, 2, 3, 4]}
          onStepChange={handleStepChange}
        />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <Icon name="FileText" size={64} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No Processing History</h2>
            <p className="text-muted-foreground mb-6">
              No files have been processed yet. Start by selecting files and running the processing workflow.
            </p>
            <div className="space-x-4">
              <Button
                variant="default"
                onClick={() => navigate('/file-selection')}
                iconName="Plus"
                iconPosition="left"
              >
                Start New Batch
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/file-processing')}
                iconName="Play"
                iconPosition="left"
              >
                Go to Processing
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ProcessStepIndicator 
        currentStep={5}
        completedSteps={[1, 2, 3, 4, 5]}
        onStepChange={handleStepChange}
      />
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Header with Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              Processing Summary
            </h1>
            <p className="text-muted-foreground">
              Review processing results and manage your file processing history
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e?.target?.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            
            {/* Clear Options */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowClearOptions(!showClearOptions)}
                iconName="Trash2"
                iconPosition="left"
                iconSize={16}
              >
                Clear History
              </Button>
              
              {showClearOptions && (
                <div className="absolute top-full mt-2 right-0 bg-card border border-border rounded-lg shadow-lg z-10 min-w-48">
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Clear Processing History</div>
                    <button
                      onClick={() => handleClearSummary('current')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md text-foreground"
                    >
                      <Icon name="Calendar" size={14} className="inline mr-2" />
                      Today's Results Only
                    </button>
                    <button
                      onClick={() => handleClearSummary('week')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md text-foreground"
                    >
                      <Icon name="Clock" size={14} className="inline mr-2" />
                      Last Week's Results
                    </button>
                    <hr className="my-2 border-border" />
                    <button
                      onClick={() => handleClearSummary('all')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-error/10 rounded-md text-error"
                    >
                      <Icon name="Trash2" size={14} className="inline mr-2" />
                      All Processing History
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <SummaryMetrics
          totalFiles={processingResults?.totalFiles || 0}
          successfulFiles={processingResults?.successfulFiles || 0}
          failedFiles={processingResults?.failedFiles || 0}
          skippedFiles={processingResults?.skippedFiles || 0}
          processingTime={processingResults?.processingTime || 0}
        />

        {/* Filter Summary */}
        {dateFilter !== 'all' && (
          <div className="bg-info/10 border border-info/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Filter" size={16} className="text-info" />
                <span className="text-sm font-medium text-info">
                  Showing {filteredFiles?.length} files from {dateFilter === 'today' ? 'today' : dateFilter === 'week' ? 'last 7 days' : 'last 30 days'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateFilter('all')}
                iconName="X"
                iconSize={14}
              >
                Show All
              </Button>
            </div>
          </div>
        )}

        {/* Results Table */}
        <ResultsTable files={filteredFiles} />

        {/* Action Panel */}
        <ActionPanel
          failedFiles={failedFiles}
          onProcessFailed={handleProcessFailed}
          onExportReport={handleExportReport}
          onStartNewBatch={handleStartNewBatch}
          onUndoBatch={handleUndoBatch}
          canUndo={true}
          isProcessing={isExporting}
        />

        {/* Processing Logs */}
        <ProcessingLog
          logs={processingLogs}
          isVisible={showLogs}
          onToggle={() => setShowLogs(!showLogs)}
        />

        {/* Completion Message */}
        {processingResults && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-6 text-center">
            <div className="text-success mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-semibold text-success mb-2">
              Processing Results Available
            </h3>
            <p className="text-sm text-success/80">
              {processingResults?.successfulFiles} of {processingResults?.totalFiles} files were processed successfully. 
              {failedFiles?.length > 0 && ` ${failedFiles?.length} files require attention.`}
            </p>
            <div className="text-xs text-success/60 mt-2">
              {processingResults?.endTime && (
                <>
                  Completed at {new Date(processingResults?.endTime)?.toLocaleString()} • 
                  Processing time: {Math.floor((processingResults?.processingTime || 0) / 60)}m {(processingResults?.processingTime || 0) % 60}s
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProcessingSummary;