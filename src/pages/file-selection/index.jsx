import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ProcessStepIndicator from '../../components/ui/ProcessStepIndicator';
import FileImportControls from './components/FileImportControls';
import FileDropZone from './components/FileDropZone';
import FileListTable from './components/FileListTable';
import ImportSummary from './components/ImportSummary';
import { fileSystemUtils } from '../../utils/fileSystemUtils';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { extractMetadataWithAI } from '../../services/metadataService';
import { storeFiles, clearAllFiles, debugStore } from '../../utils/fileStore';

const FileSelection = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [retagAllFiles, setRetagAllFiles] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [destinationChoice, setDestinationChoice] = useState('default');

  // Add this block - Define acceptedFormats before using it
  const acceptedFormats = ['.mp3', '.m4a', '.wav', '.flac', '.mp4'];

  // Enhanced file processing with OpenAI metadata extraction
  const processFiles = async (files) => {
    setIsProcessing(true);
    console.log(`🔄 Processing ${files?.length} files with AI metadata extraction...`);
    
    const processedFiles = [];
    
    for (let i = 0; i < files?.length; i++) {
      const file = files?.[i];
      
      try {
        // Extract metadata using OpenAI
        const aiMetadata = await extractMetadataWithAI(file?.name, file?.size, file?.type);
        
        const fileData = {
          id: `file_${Date.now()}_${i}`,
          name: file?.name,
          size: file?.size,
          type: file?.type,
          lastModified: new Date(file.lastModified)?.toLocaleDateString(),
          fileObject: file, // Store the actual File object for processing
          // Use AI-extracted metadata instead of hardcoded values
          title: aiMetadata?.title,
          artist: aiMetadata?.artist,
          album: aiMetadata?.album,
          year: aiMetadata?.year,
          genre: aiMetadata?.genre,
          hasUGTag: false, // Will be determined by actual file analysis
          status: 'ready',
          selected: true,
          extractionMethod: aiMetadata?.extractedBy,
          confidence: aiMetadata?.confidence,
          extractedAt: aiMetadata?.timestamp
        };
        
        processedFiles?.push(fileData);
        console.log(`✅ Processed: ${file?.name} - ${aiMetadata?.title} by ${aiMetadata?.artist}`);
      } catch (error) {
        console.error(`❌ Error processing ${file?.name}:`, error);
        
        // Fallback processing without AI
        const fileData = {
          id: `file_${Date.now()}_${i}`,
          name: file?.name,
          size: file?.size,
          type: file?.type,
          lastModified: new Date(file.lastModified)?.toLocaleDateString(),
          fileObject: file, // Store the actual File object for processing
          title: file?.name?.replace(/\.[^/.]+$/, ''),
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          year: new Date()?.getFullYear()?.toString(),
          genre: 'Unknown',
          hasUGTag: false,
          status: 'error',
          selected: true,
          extractionMethod: 'fallback',
          error: error?.message
        };
        
        processedFiles?.push(fileData);
      }
    }
    
    // Fix: Return processedFiles array instead of setting selectedFiles to processedFiles directly
    setIsProcessing(false);
    console.log(`🎯 File processing completed: ${processedFiles?.length} files processed`);
    
    return processedFiles; // Return the processed files array
  };

  // Handle file selection from input - Updated to be async
  const handleFilesSelected = async (fileList) => {
    if (fileList?.length === 0) {
      // Handle clear all
      setFiles([]);
      setSelectedFiles([]);
      localStorage.removeItem('selectedFiles');
      localStorage.removeItem('retagAllFiles');
      localStorage.removeItem('ugMetadataManager_metadataDraft');
      return;
    }

    // Show loading state while processing
    setIsProcessing(true);
    
    try {
      const processedFiles = await processFiles(fileList);
      setFiles(prev => [...prev, ...processedFiles]);
      
      // Auto-select all new files - Fix: use file IDs, not the full file objects
      const newFileIds = processedFiles?.map(f => f?.id);
      setSelectedFiles(prev => [...prev, ...newFileIds]);
      
      // Store processed files in localStorage for persistence
      localStorage.setItem('selectedFiles', JSON.stringify([...files, ...processedFiles]));
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing some files. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle folder selection - Updated to be async
  const handleFolderSelected = async (fileList) => {
    // Filter for supported file types
    const supportedFiles = fileList?.filter(file => {
      const extension = '.' + file?.name?.split('.')?.pop()?.toLowerCase();
      return acceptedFormats?.includes(extension);
    });
    
    if (supportedFiles?.length > 0) {
      await handleFilesSelected(supportedFiles);
    }
  };

  // Handle drag and drop - Updated to be async
  const handleFilesDropped = async (fileList) => {
    await handleFilesSelected(fileList);
  };

  // Handle individual file selection
  const handleFileSelect = (fileId, isSelected) => {
    if (isSelected) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev?.filter(id => id !== fileId));
    }
  };

  // Handle select all
  const handleSelectAll = (selectAll) => {
    if (selectAll) {
      setSelectedFiles(files?.map(f => f?.id));
    } else {
      setSelectedFiles([]);
    }
  };

  // Handle file removal
  const handleFileRemove = (fileId) => {
    setFiles(prev => prev?.filter(f => f?.id !== fileId));
    setSelectedFiles(prev => prev?.filter(id => id !== fileId));
  };

  // Enhanced Process New Batch - Fixed state clearing
  const handleProcessNewBatch = () => {
    if (files?.length > 0) {
      const confirmNewBatch = window.confirm(
        `You currently have ${files?.length} files in memory.\n\n` +
        `Starting a new batch will:\n` +
        `• Clear all current files and metadata\n` +
        `• Reset all processing settings\n` +
        `• Allow you to select fresh files\n\n` +
        `Continue?`
      );
      
      if (confirmNewBatch) {
        // Comprehensive state clearing
        setFiles([]);
        setSelectedFiles([]);
        setRetagAllFiles(false);
        
        // Clear localStorage completely
        localStorage.removeItem('selectedFiles');
        localStorage.removeItem('retagAllFiles');
        localStorage.removeItem('ugMetadataManager_metadataConfig');
        localStorage.removeItem('ugMetadataManager_metadataDraft');
        localStorage.removeItem('fileProcessingQueue');
        localStorage.removeItem('processingResults');
        localStorage.removeItem('coverArtData');
        
        // Show success feedback
        setTimeout(() => {
          alert('✅ New batch started successfully!\n\nYou can now select new files for processing.');
        }, 100);
      }
    } else {
      // If no files, just show info
      alert('📂 Ready for New Batch\n\nSelect files using the buttons above or drag & drop them into the application.');
    }
  };

  // Handle clear all files - Enhanced with confirmation
  const handleClearAll = () => {
    if (files?.length === 0) return;
    
    const confirmClear = window.confirm(
      `Are you sure you want to clear all ${files?.length} files from the current batch?\n\n` +
      `This will remove all selected files from memory and allow you to start with a fresh batch.`
    );
    
    if (confirmClear) {
      setFiles([]);
      setSelectedFiles([]);
      
      // Clear localStorage to ensure clean state
      localStorage.removeItem('selectedFiles');
      localStorage.removeItem('retagAllFiles');
      localStorage.removeItem('ugMetadataManager_metadataDraft');
      
      // Show success message
      alert('✅ Batch cleared successfully!\n\nYou can now select new files for processing.');
    }
  };

  // Handle retag toggle
  const handleRetagToggle = (enabled) => {
    setRetagAllFiles(enabled);
  };

  // Calculate summary statistics
  const getFilesToProcess = () => {
    return selectedFiles?.filter(fileId => {
      const file = files?.find(f => f?.id === fileId);
      if (!file) return false;
      
      const hasUGTag = file?.artist && file?.artist?.toLowerCase()?.includes('ug production');
      return retagAllFiles || !hasUGTag;
    })?.length;
  };

  const getFilesToSkip = () => {
    if (retagAllFiles) return 0;
    
    return selectedFiles?.filter(fileId => {
      const file = files?.find(f => f?.id === fileId);
      if (!file) return false;
      
      const hasUGTag = file?.artist && file?.artist?.toLowerCase()?.includes('ug production');
      return hasUGTag;
    })?.length;
  };

  // Enhanced proceed to next step with proper state persistence
  const handleProceedToNext = () => {
    if (getFilesToProcess() > 0) {
      // Store selected files data
      const selectedFileData = files?.filter(f => selectedFiles?.includes(f?.id))?.map(file => ({
        ...file,
        // Ensure default title is set from filename if not already set
        title: file?.title || file?.name?.replace(/.[^/.]+$/, '') || 'Untitled'
      }));
      
      // Store File objects in global store (can't be serialized to localStorage)
      const filesForStore = selectedFileData.map(file => ({
        fileId: file.id,
        fileObject: file.fileObject, // The actual File object
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          title: file.title,
          artist: file.artist,
          album: file.album,
          year: file.year,
          genre: file.genre,
          selected: file.selected,
          status: file.status
        }
      }));
      
      storeFiles(filesForStore);
      console.log('📦 Stored File objects in global store');
      debugStore(); // Debug log
      
      // Store metadata in localStorage (without File objects)
      const metadataOnly = selectedFileData.map(({ fileObject, ...rest }) => rest);
      localStorage.setItem('selectedFiles', JSON.stringify(metadataOnly));
      localStorage.setItem('retagAllFiles', JSON.stringify(retagAllFiles));
      localStorage.setItem('destinationChoice', JSON.stringify(destinationChoice));
      
      navigate('/metadata-entry');
    }
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('selectedFiles');
    const savedRetagSetting = localStorage.getItem('retagAllFiles');
    const savedDestination = localStorage.getItem('destinationChoice');
    
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        // Ensure each file has a default title from filename
        const filesWithTitles = parsedFiles?.map(file => ({
          ...file,
          title: file?.title || file?.name?.replace(/\.[^/.]+$/, '') || 'Untitled'
        }));
        
        setFiles(filesWithTitles);
        setSelectedFiles(filesWithTitles?.map(f => f?.id));
      } catch (error) {
        console.error('Error loading saved files:', error);
      }
    }
    
    if (savedRetagSetting) {
      try {
        setRetagAllFiles(JSON.parse(savedRetagSetting));
      } catch (error) {
        console.error('Error loading retag setting:', error);
      }
    }
    
    if (savedDestination) {
      try {
        setDestinationChoice(JSON.parse(savedDestination));
      } catch (error) {
        console.error('Error loading destination choice:', error);
      }
    }
  }, []);

  const totalFiles = files?.length;
  const selectedCount = selectedFiles?.length;
  const filesToProcess = getFilesToProcess();
  const filesToSkip = getFilesToSkip();
  const canProceed = filesToProcess > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ProcessStepIndicator currentStep={1} onStepChange={() => {}} />
      {/* Enhanced User Guide Section with better visibility */}
      <div className="container mx-auto px-6 py-4">
        <div className="alert info">
          <Icon name="Info" size={20} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">
                📖 Quick Start Guide
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserGuide(true)}
                iconName="HelpCircle"
                iconPosition="left"
                iconSize={14}
              >
                Full Guide
              </Button>
            </div>
            <div className="text-xs space-y-1">
              <p><strong>1. Select Files:</strong> Click "Select Files" or drag & drop audio/video files</p>
              <p><strong>2. Review:</strong> Check current metadata and processing status</p>
              <p><strong>3. Configure:</strong> Choose destination and processing options</p>
              <p><strong>💡 Process New Batch:</strong> Clears current files and starts fresh</p>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Import Controls - Enhanced */}
            <FileImportControls
              onFilesSelected={handleFilesSelected}
              onFolderSelected={handleFolderSelected}
              onProcessNewBatch={handleProcessNewBatch}
              acceptedFormats={acceptedFormats}
              isProcessing={isProcessing}
            />

            {/* Drop Zone */}
            <FileDropZone
              onFilesDropped={handleFilesDropped}
              acceptedFormats={acceptedFormats}
              isProcessing={isProcessing}
            />

            {/* File List */}
            <FileListTable
              files={files}
              selectedFiles={selectedFiles}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onSelectAll={handleSelectAll}
              retagAllFiles={retagAllFiles}
            />
          </div>

          {/* Sidebar - Enhanced */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <ImportSummary
                totalFiles={totalFiles}
                filesToProcess={filesToProcess}
                filesToSkip={filesToSkip}
                selectedFiles={selectedCount}
                retagAllFiles={retagAllFiles}
                onRetagToggle={handleRetagToggle}
                onClearAll={handleClearAll}
                onProceedToNext={handleProceedToNext}
                canProceed={canProceed}
              />
              
              {/* Enhanced File Destination Guide with better colors */}
              <div className="card-container">
                <div className="p-6">
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center">
                    <Icon name="Folder" size={20} className="mr-2 text-primary" />
                    File Destination Options
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <input
                          type="radio"
                          name="destinationChoice"
                          value="default"
                          checked={destinationChoice === 'default'}
                          onChange={(e) => setDestinationChoice(e?.target?.value)}
                          className="mt-1 text-primary"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">Default Location</div>
                          <div className="text-xs text-muted-foreground font-mono mt-1">
                            {fileSystemUtils?.formatPathForDisplay(fileSystemUtils?.getDefaultProcessedDirectory())}
                          </div>
                        </div>
                      </label>
                      
                      <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <input
                          type="radio"
                          name="destinationChoice"
                          value="source"
                          checked={destinationChoice === 'source'}
                          onChange={(e) => setDestinationChoice(e?.target?.value)}
                          className="mt-1 text-primary"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">Same as Source Folder</div>
                          <div className="text-xs text-muted-foreground">
                            Save processed files in the same directory as original files
                          </div>
                        </div>
                      </label>
                      
                      <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                        <input
                          type="radio"
                          name="destinationChoice"
                          value="custom"
                          checked={destinationChoice === 'custom'}
                          onChange={(e) => setDestinationChoice(e?.target?.value)}
                          className="mt-1 text-primary"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">Ask During Processing</div>
                          <div className="text-xs text-muted-foreground">
                            Choose destination folder when processing starts
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileSystemUtils?.openFileLocation(fileSystemUtils?.getDefaultProcessedDirectory())}
                      iconName="ExternalLink"
                      iconPosition="left"
                      iconSize={14}
                      className="w-full text-primary"
                    >
                      Copy default path & show instructions
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* User Guide Modal - Enhanced with better contrast */}
      {showUserGuide && (
        <div className="modal-container">
          <div className="modal-content max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-xl font-heading font-bold text-foreground flex items-center">
                <Icon name="BookOpen" size={24} className="mr-2 text-primary" />
                UG Metadata Manager Guide
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUserGuide(false)}
                iconName="X"
                iconSize={20}
              />
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                    <Icon name="Target" size={18} className="mr-2 text-primary" />
                    How to Use This App
                  </h3>
                  <div className="space-y-3 text-sm">
                    {[1,2,3,4]?.map(step => (
                      <div key={step} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">{step}</div>
                        <div>
                          <strong className="text-foreground">
                            {step === 1 && 'Select Your Files'}
                            {step === 2 && 'Review Current Metadata'}
                            {step === 3 && 'Configure Processing'}
                            {step === 4 && 'Set Metadata'}
                          </strong>
                          <p className="text-muted-foreground text-xs mt-1">
                            {step === 1 && 'Use "Select Files" button or drag & drop audio/video files (.mp3, .m4a, .wav, .flac, .mp4)'}
                            {step === 2 && 'Default titles are automatically set from filenames. Click "View Details" to see all metadata'}
                            {step === 3 && 'Choose destination folder and select which files to process or skip'}
                            {step === 4 && 'Next step: Configure individual titles or use batch/incremental naming'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">🔧 Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Icon name="RotateCcw" size={16} className="text-primary" />
                        <strong className="text-foreground">Process New Batch</strong>
                      </div>
                      <p className="text-muted-foreground text-xs">Clears current files from memory and lets you start fresh with new files</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Icon name="List" size={16} className="text-primary" />
                        <strong className="text-foreground">Individual Titles</strong>
                      </div>
                      <p className="text-muted-foreground text-xs">Set unique titles for each file or use incremental naming (Track 1, Track 2, etc.)</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Icon name="FolderOpen" size={16} className="text-primary" />
                        <strong className="text-foreground">Destination Choice</strong>
                      </div>
                      <p className="text-muted-foreground text-xs">Save to default folder, same as source, or choose during processing</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Icon name="Eye" size={16} className="text-primary" />
                        <strong className="text-foreground">Metadata Preview</strong>
                      </div>
                      <p className="text-muted-foreground text-xs">View existing metadata before processing to avoid overwriting important data</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">❓ Common Issues</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-foreground">Process New Batch doesn't clear files?</strong>
                      <p className="text-muted-foreground text-xs">Click "OK" when prompted to confirm clearing. "Cancel" keeps current files and adds new ones.</p>
                    </div>
                    <div>
                      <strong className="text-foreground">Where are processed files saved?</strong>
                      <p className="text-muted-foreground text-xs">Check destination settings in sidebar. Default location is shown with copy button for easy access.</p>
                    </div>
                    <div>
                      <strong className="text-foreground">Can't see current metadata?</strong>
                      <p className="text-muted-foreground text-xs">Click "View Details" button next to file name to expand and see all metadata fields.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileSelection;
