import React, { useState, useEffect } from 'react';
import { batchProcessFiles, downloadFile, downloadAsZip } from '../../services/browserMetadataService';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ProcessStepIndicator from '../../components/ui/ProcessStepIndicator';
import ProcessingProgress from './components/ProcessingProgress';
import FileProcessingList from './components/FileProcessingList';
import ConfigurationSummary from './components/ConfigurationSummary';
import ProcessingControls from './components/ProcessingControls';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { getAllFiles, getFile, debugStore } from '../../utils/fileStore';


const FileProcessing = () => {
  const navigate = useNavigate();
  
  // Processing state
  const [processingStatus, setProcessingStatus] = useState('idle'); // idle, processing, paused, completed, error
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);
  const [filesProcessed, setFilesProcessed] = useState(0);
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [files, setFiles] = useState([]);
  const [destinationPath, setDestinationPath] = useState('');

  // Load actual files from localStorage instead of mock data
  useEffect(() => {
    const loadFilesFromStorage = () => {
      const savedFiles = localStorage.getItem('selectedFiles');
      const savedDestination = localStorage.getItem('destinationChoice');
      const savedDestinationPath = localStorage.getItem('destinationPath');
      const coverArtData = localStorage.getItem('coverArtData');
      
      // Try to get files from either source, prioritizing selectedFiles
      let filesToLoad = null;
      
      if (savedFiles) {
        try {
          filesToLoad = JSON.parse(savedFiles);
        } catch (error) {
          console.error('Error loading selected files:', error);
        }
      }
      
      if (!filesToLoad && coverArtData) {
        try {
          filesToLoad = JSON.parse(coverArtData);
        } catch (error) {
          console.error('Error loading cover art data:', error);
        }
      }
      
      // ENHANCED: Enhanced destination path handling with user's actual path and better display
      let finalDestinationPath = 'Browser Downloads folder';
      
      if (savedDestination) {
        try {
          const destChoice = JSON.parse(savedDestination);
          
          switch (destChoice) {
            case 'source':
              finalDestinationPath = 'Same as source folder (files will be processed in their original locations)';
              break;
            case 'custom':
              if (savedDestinationPath) {
                try {
                  const customPath = JSON.parse(savedDestinationPath);
                  if (customPath && customPath?.trim() !== '') {
                    finalDestinationPath = customPath;
                  } else {
                    finalDestinationPath = 'Custom folder (selection pending - please go back to File Selection to choose)';
                  }
                } catch (error) {
                  finalDestinationPath = 'Custom folder (invalid selection - please reselect in File Selection)';
                }
              } else {
                finalDestinationPath = 'Custom folder (not selected - please go back to File Selection to choose)';
              }
              break;
            case 'default':
            default:
              finalDestinationPath = 'Browser Downloads folder';
              break;
          }
        } catch (error) {
          console.error('Error loading destination choice:', error);
          finalDestinationPath = 'Browser Downloads folder (default due to error)';
        }
      }
      
      setDestinationPath(finalDestinationPath);
      
      if (filesToLoad && Array.isArray(filesToLoad) && filesToLoad?.length > 0) {
        // Convert to processing format and PRESERVE metadata from previous steps
        const metadataConfig = JSON.parse(localStorage.getItem('ugMetadataManager_metadataConfig') || '{}');
        const individualMetadata = metadataConfig?.individualMetadata || {};
        
        const processingFiles = filesToLoad?.map(file => {
          // FIXED: Load metadata from metadata entry step if available
          const fileMetadata = individualMetadata?.[file?.id] || {};
          
          return {
            id: file?.id,
            name: file?.name,
            size: file?.size || 0,
            type: (file?.type || 'audio/mpeg')?.toUpperCase()?.split('/')?.[1],
            processing: false,
            completed: false,
            error: null,
            progress: 0,
            stage: null,
            completedStages: [],
            currentStage: null,
            stageErrors: {},
            originalMetadata: {
              title: file?.title || fileMetadata?.title,
              artist: file?.artist || fileMetadata?.artist,
              album: file?.album || fileMetadata?.album,
              year: file?.year || fileMetadata?.year,
              genre: file?.genre || file?.genre
            },
            // FIXED: Store the configured metadata for processing
            configuredMetadata: {
              title: fileMetadata?.title || file?.title || file?.name?.replace(/\.[^/.]+$/, ''),
              artist: fileMetadata?.artist || file?.artist || 'UG Production',
              album: fileMetadata?.album || file?.album || 'UG Collection 2025', 
              year: fileMetadata?.year || file?.year || '2025',
              genre: fileMetadata?.genre || file?.genre || 'Electronic',
              comments: fileMetadata?.comments || 'Processed by UG Metadata Manager'
            }
          };
        });
        
        setFiles(processingFiles);
        console.log('Loaded files for processing with metadata:', processingFiles?.length);
      } else {
        console.log('No files found from previous steps');
        setFiles([]);
      }
    };
    
    loadFilesFromStorage();
    
    // Listen for storage changes to update when new batch starts
    const handleStorageChange = (e) => {
      if (e?.key === 'selectedFiles' || e?.key === null) { // null means localStorage.clear()
        loadFilesFromStorage();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // FIXED: Updated configuration with proper destination path display
  const mockConfiguration = {
    destinationFolder: destinationPath,
    renamingTemplate: "Title – Artist",
    overwriteOriginal: false,
    clearExistingMetadata: false,
    skipExistingTags: true,
    selectedFiles: files, // Use actual files instead of mock
    metadataSettings: files?.length > 0 ? {
      // FIXED: Use configured metadata instead of original
      artist: files?.[0]?.configuredMetadata?.artist || "UG Production",
      album: files?.[0]?.configuredMetadata?.album || "UG Collection 2025", 
      year: files?.[0]?.configuredMetadata?.year || new Date()?.getFullYear()?.toString(),
      comments: files?.[0]?.configuredMetadata?.comments || "Processed by UG Metadata Manager",
      aiExtracted: files?.some(f => f?.configuredMetadata?.title) || false
    } : {
      artist: "UG Production",
      album: "UG Collection 2025",
      year: new Date()?.getFullYear()?.toString(), 
      comments: "Processed by UG Metadata Manager"
    },
    coverArtSettings: {
      source: "Selected cover art image",
      applyToAudio: true,
      applyToVideo: false,
      quality: "High"
    }
  };

  // Real browser-based file processing
  const handleStartProcessing = async () => {
    setProcessingStatus('processing');
    setProcessingStartTime(Date.now());
    setOverallProgress(0);
    setFilesProcessed(0);
    
    // Clear previous processing results
    localStorage.removeItem('processingResults');
    localStorage.removeItem('processedFiles');
    localStorage.removeItem('processingLogs');
    
    try {
      // Get cover art from localStorage if available
      const coverArtBase64 = localStorage.getItem('coverArtImage');
      console.log('📋 Processing: Retrieved cover art from localStorage');
      console.log('📋 Cover art exists:', !!coverArtBase64);
      if (coverArtBase64) {
        console.log('📋 Cover art URL type:', coverArtBase64?.substring(0, 50));
        console.log('📋 Cover art length:', coverArtBase64?.length, 'characters');
      }
      
      // Prepare metadata from configured metadata
      const metadata = {
        artist: files[0]?.configuredMetadata?.artist || 'UG Production',
        album: files[0]?.configuredMetadata?.album || 'UG Collection 2025',
        year: files[0]?.configuredMetadata?.year || new Date().getFullYear().toString(),
        comment: files[0]?.configuredMetadata?.comments || 'Processed by UG Metadata Manager',
        genre: files[0]?.configuredMetadata?.genre || ''
      };
      
      // Prepare options
      const options = {
        coverArt: coverArtBase64 || null,
        filenameTemplate: 'title-artist',
        individualMetadata: {}
      };
      
      // Build individual metadata for each file
      files.forEach(file => {
        if (file.configuredMetadata) {
          options.individualMetadata[file.name] = file.configuredMetadata;
        }
      });
      
      // Get actual File objects from global file store
      console.log('📂 Retrieving File objects from global store...');
      debugStore(); // Debug log
      
      const storedFiles = getAllFiles();
      console.log(`📋 Found ${storedFiles.length} files in store`);
      
      if (storedFiles.length === 0) {
        // Fallback: try to get from files array (legacy)
        const fileObjects = files.map(f => f.fileObject).filter(Boolean);
        if (fileObjects.length === 0) {
          throw new Error('No file objects available. Please select files again.');
        }
        console.log('⚠️ Using legacy file objects from state');
      }
      
      // Map stored files to file objects, matching by file ID
      const fileObjects = files.map(file => {
        const stored = storedFiles.find(sf => sf.fileId === file.id);
        if (stored && stored.fileObject) {
          console.log(`✅ Found File object for: ${file.name}`);
          return stored.fileObject;
        }
        console.warn(`⚠️ No File object found for: ${file.name}`);
        return null;
      }).filter(Boolean);
      
      if (fileObjects.length === 0) {
        throw new Error('No file objects available. Please go back to File Selection and select files again.');
      }
      
      console.log(`🎯 Ready to process ${fileObjects.length} files`);
      fileObjects.forEach((f, i) => console.log(`  ${i + 1}. ${f.name} (${(f.size / 1024).toFixed(1)} KB)`));
      
      // Process files with progress callback
      const results = await batchProcessFiles(fileObjects, metadata, options, (progress) => {
        setCurrentFile({ name: progress.filename });
        setFilesProcessed(progress.current - 1);
        setOverallProgress((progress.current / progress.total) * 100);
      });
      
      // Store results
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const processingTime = Math.floor((Date.now() - processingStartTime) / 1000);
      
      // Save only the summary results (not the full file blobs)
      const resultsSummary = results.map(r => ({
        originalName: r.filename,
        newName: r.newFilename || r.filename,
        success: r.success,
        status: r.success ? 'success' : 'failed',
        error: r.error,
        processedAt: new Date().toISOString()
        // Don't save modifiedBlob - it's too large for localStorage
      }));
      
      const finalResults = {
        totalFiles: results.length,
        successfulFiles: successful,
        failedFiles: failed,
        skippedFiles: 0,
        processingTime: processingTime,
        startTime: new Date(processingStartTime).toISOString(),
        endTime: new Date().toISOString(),
        results: resultsSummary  // Use summary instead of full results
      };
      
      localStorage.setItem('processingResults', JSON.stringify(finalResults));
      localStorage.setItem('processedFiles', JSON.stringify(resultsSummary));
      
      // Update files state with results
      setFiles(prevFiles => prevFiles.map((file, index) => ({
        ...file,
        completed: results[index]?.success || false,
        error: results[index]?.error || null,
        progress: 100,
        newMetadata: results[index]?.newMetadata || null,
        modifiedBlob: results[index]?.modifiedBlob || null,
        newFilename: results[index]?.newFilename || null
      })));
      
      // Automatically download all successfully processed files
      console.log('🔽 Auto-downloading processed files...');
      for (const result of results) {
        if (result.success && result.modifiedBlob) {
          try {
            downloadFile(result.modifiedBlob, result.newFilename);
            console.log(`✅ Downloaded: ${result.newFilename}`);
          } catch (downloadError) {
            console.error(`❌ Failed to download ${result.newFilename}:`, downloadError);
          }
        }
      }
      
      setProcessingStatus('completed');
      setOverallProgress(100);
      setFilesProcessed(results.length);
      setCurrentFile(null);
      
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingStatus('error');
      alert(`Processing failed: ${error.message}`);
    }
  };

  // Note: Real processing is now handled by handleStartProcessing with browser-based metadata libraries

  const handlePauseProcessing = () => {
    setProcessingStatus('paused');
    setCurrentFile(null);
  };

  const handleResumeProcessing = () => {
    setProcessingStatus('processing');
    setProcessingStartTime(Date.now() - (processingStartTime ? Date.now() - processingStartTime : 0));
  };

  const handleCancelProcessing = () => {
    setProcessingStatus('idle');
    setOverallProgress(0);
    setCurrentFile(null);
    setEstimatedTimeRemaining(null);
    setFilesProcessed(0);
    setProcessingStartTime(null);
    
    // Reset all files
    setFiles([]);
  };

  const handleResetProcessing = () => {
    handleCancelProcessing();
  };

  const handleRetryFile = (fileId) => {
    setFiles(prevFiles => prevFiles?.map(file => 
      file?.id === fileId 
        ? { ...file, error: null, progress: 0, completed: false, processing: false }
        : file
    ));
  };

  const handleModifyConfig = () => {
    navigate('/metadata-entry');
  };

  const handleNavigateToSummary = () => {
    navigate('/processing-summary');
  };

  const handleNavigateBack = () => {
    navigate('/cover-art-management');
  };

  const handleClearAll = () => {
    // Clear all files and localStorage
    setFiles([]);
    setProcessingStatus('idle');
    setOverallProgress(0);
    setCurrentFile(null);
    setFilesProcessed(0);
    
    // Clear all localStorage
    localStorage.removeItem('selectedFiles');
    localStorage.removeItem('ugMetadataManager_metadataConfig');
    localStorage.removeItem('coverArtData');
    localStorage.removeItem('processingResults');
    localStorage.removeItem('processedFiles');
    localStorage.removeItem('fileProcessingQueue');
    
    // Navigate back to file selection
    navigate('/file-selection');
  };

  // Show message if no files
  if (files?.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <ProcessStepIndicator 
          currentStep={4} 
          completedSteps={[1, 2, 3]} 
          onStepChange={() => {}} 
        />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <Icon name="FileX" size={64} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No Files Found</h2>
            <p className="text-muted-foreground mb-6">
              No files were found from the previous steps. Please go back and select files to process.
            </p>
            <div className="space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/file-selection')}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Back to File Selection
              </Button>
              <Button
                variant="default"
                onClick={() => navigate('/cover-art-management')}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Back to Cover Art
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
        currentStep={4} 
        completedSteps={[1, 2, 3]} 
        onStepChange={() => {}} 
      />
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              File Processing
            </h1>
            <p className="text-muted-foreground mt-2">
              Execute metadata embedding and file operations with real-time progress tracking
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleNavigateBack}
              iconName="ArrowLeft"
              iconPosition="left"
              iconSize={16}
            >
              Back to Cover Art
            </Button>
            
            {processingStatus === 'completed' && (
              <Button
                variant="default"
                onClick={handleNavigateToSummary}
                iconName="ArrowRight"
                iconPosition="right"
                iconSize={16}
              >
                View Summary
              </Button>
            )}
          </div>
        </div>

        {/* Processing Controls */}
        <ProcessingControls
          status={processingStatus}
          onStart={handleStartProcessing}
          onPause={handlePauseProcessing}
          onResume={handleResumeProcessing}
          onCancel={handleCancelProcessing}
          onReset={handleResetProcessing}
          onClearAll={handleClearAll}
          canStart={files?.length > 0}
          hasFiles={files?.length > 0}
          showEmergencyStop={processingStatus === 'processing'}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Progress and File List */}
          <div className="xl:col-span-2 space-y-6">
            {/* Processing Progress */}
            <ProcessingProgress
              overallProgress={overallProgress}
              currentFile={currentFile}
              estimatedTimeRemaining={estimatedTimeRemaining}
              status={processingStatus}
              onPause={handlePauseProcessing}
              onResume={handleResumeProcessing}
              onCancel={handleCancelProcessing}
              filesProcessed={filesProcessed}
              totalFiles={files?.length}
            />

            {/* File Processing List */}
            <FileProcessingList
              files={files}
              onRetryFile={handleRetryFile}
              onViewDetails={() => {}}
              showDetails={true}
            />
          </div>

          {/* Right Column - Configuration Summary */}
          <div className="space-y-6">
            <ConfigurationSummary
              configuration={mockConfiguration}
              onModifyConfig={handleModifyConfig}
              isProcessing={processingStatus === 'processing'}
              canModify={processingStatus === 'idle' || processingStatus === 'paused'}
            />

            {/* Processing Tips */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="Lightbulb" size={20} className="text-warning" />
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  Processing Tips
                </h3>
              </div>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start space-x-2">
                  <Icon name="CheckCircle" size={14} className="text-success mt-0.5" />
                  <span>Processing can be paused and resumed at any time</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Icon name="Shield" size={14} className="text-primary mt-0.5" />
                  <span>Automatic backups are created before modification</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Icon name="RotateCcw" size={14} className="text-warning mt-0.5" />
                  <span>Failed files can be retried individually</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Icon name="AlertTriangle" size={14} className="text-error mt-0.5" />
                  <span>Emergency stop is available during processing</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Icon name="Folder" size={14} className="text-primary mt-0.5" />
                  <span>Click file location links to copy paths to clipboard</span>
                </div>
              </div>
            </div>


            {/* Output Directory - Browser Downloads */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="text-sm font-medium text-foreground">Output Directory</h4>
              </div>
              <div className="text-xs text-muted-foreground">Browser Downloads folder</div>
              <div className="mt-2 p-2 bg-info/10 border border-info/20 rounded text-xs text-info">
                <Icon name="Info" size={12} className="inline mr-1" />
                Processed files will be saved to the specified directory
              </div>
            </div>















































            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-foreground">System Status</h4>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-xs text-success">Offline Mode</span>
                </div>
              </div>
              
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>CPU Usage:</span>
                  <span className="font-data">
                    {processingStatus === 'processing' ? '45%' : '12%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <span className="font-data">
                    {processingStatus === 'processing' ? '2.1 GB' : '1.2 GB'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Disk Space:</span>
                  <span className="font-data">847 GB available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-specific bottom navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateBack}
              iconName="ArrowLeft"
              iconSize={16}
            />
            
            <div className="text-center">
              <div className="text-sm font-medium text-foreground">
                {Math.round(overallProgress)}% Complete
              </div>
              <div className="text-xs text-muted-foreground">
                {filesProcessed} of {files?.length} files
              </div>
            </div>
            
            {processingStatus === 'completed' && (
              <Button
                variant="default"
                size="sm"
                onClick={handleNavigateToSummary}
                iconName="ArrowRight"
                iconSize={16}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileProcessing;
