import React, { useRef, useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FileImportControls = ({
  onFilesSelected,
  onFolderSelected,
  onProcessNewBatch,
  acceptedFormats = [],
  isProcessing = false
}) => {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const [destinationPath, setDestinationPath] = useState('');
  const [destinationChoice, setDestinationChoice] = useState('default');
  const [isInIframe, setIsInIframe] = useState(false);
  const [apiSupport, setApiSupport] = useState({
    directoryPicker: false,
    webkitDirectory: false
  });

  // Check for environment and API support
  useEffect(() => {
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);

    const hasDirectoryPicker = 'showDirectoryPicker' in window && !inIframe;
    const hasWebkitDirectory = 'webkitdirectory' in document.createElement('input');
    
    setApiSupport({
      directoryPicker: hasDirectoryPicker,
      webkitDirectory: hasWebkitDirectory
    });

    // Load saved destination choice
    const savedChoice = localStorage.getItem('destinationChoice');
    const savedPath = localStorage.getItem('destinationPath');
    
    if (savedChoice) {
      try {
        const choice = JSON.parse(savedChoice);
        setDestinationChoice(choice);
        
        if (choice === 'custom' && savedPath) {
          try {
            const path = JSON.parse(savedPath);
            setDestinationPath(path);
          } catch (error) {
            console.error('Error loading saved path:', error);
          }
        } else if (choice === 'default') {
          setDestinationPath('C:\\Users\\EugenManole\\OneDrive - Hilton\\Documents 1\\UG_Metadata_Manager');
        } else if (choice === 'source') {
          setDestinationPath('Same as source files');
        }
      } catch (error) {
        console.error('Error loading destination choice:', error);
        setDestinationChoice('default');
        setDestinationPath('C:\\Users\\EugenManole\\OneDrive - Hilton\\Documents 1\\UG_Metadata_Manager');
      }
    } else {
      // Set default path from user's specific location
      setDestinationPath('C:\\Users\\EugenManole\\OneDrive - Hilton\\Documents 1\\UG_Metadata_Manager');
    }

    console.log('🔍 Environment check:', {
      inIframe,
      hasDirectoryPicker,
      hasWebkitDirectory,
      userAgent: navigator.userAgent
    });
  }, []);

  const handleFileSelect = async () => {
    if (fileInputRef?.current) {
      fileInputRef?.current?.click();
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event?.target?.files || []);
    if (files?.length > 0) {
      await onFilesSelected(files);
      event.target.value = '';
    }
  };

  const handleFolderSelect = async () => {
    if (folderInputRef?.current) {
      folderInputRef?.current?.click();
    }
  };

  const handleFolderChange = async (event) => {
    const files = Array.from(event?.target?.files || []);
    if (files?.length > 0) {
      await onFolderSelected(files);
      event.target.value = '';
    }
  };

  // FIXED: Enhanced destination folder selection with proper browser API handling
  const handleSelectDestinationFolder = async () => {
    try {
      console.log('🎯 Attempting to select destination folder...');
      
      if (isInIframe) {
        console.log('🚫 Running in iframe - limited functionality');
        alert('⚠️ Browser Limitation\n\nYou\'re running in iframe mode which limits folder selection.\n\nAvailable options:\n• Use "Default Location" (recommended)\n• Use "Same as Source" to process files in their original locations\n• Open this app in a new browser tab for full folder selection');
        return;
      }
      
      if (apiSupport?.directoryPicker) {
        console.log('✅ Using modern Directory Picker API');
        const directoryHandle = await window.showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents'
        });
        
        const path = directoryHandle?.name || 'Custom folder selected';
        setDestinationPath(path);
        setDestinationChoice('custom');
        
        // Save to localStorage
        localStorage.setItem('destinationChoice', JSON.stringify('custom'));
        localStorage.setItem('destinationPath', JSON.stringify(path));
        localStorage.setItem('destinationHandle', JSON.stringify({
          name: directoryHandle?.name,
          kind: directoryHandle?.kind
        }));
        
        console.log('✅ Destination folder selected:', path);
        alert(`✅ Folder Selected Successfully!\n\nDestination: ${path}\n\nProcessed files will be saved to this location.`);
        
      } else if (apiSupport?.webkitDirectory) {
        console.log('📁 Using webkit directory fallback');
        if (destinationInputRef?.current) {
          destinationInputRef?.current?.click();
        } else {
          throw new Error('Directory input not available');
        }
      } else {
        throw new Error('BROWSER_NOT_SUPPORTED');
      }
    } catch (error) {
      console.error('❌ Folder selection error:', error);
      
      if (error?.name === 'AbortError') {
        console.log('ℹ️ User cancelled folder selection');
        return;
      }
      
      let errorMessage = '❌ Folder Selection Failed\n\n';
      
      if (error?.message === 'BROWSER_NOT_SUPPORTED') {
        errorMessage += 'Your browser doesn\'t support advanced folder selection.\n\nRecommended solutions:\n• Use "Default Location" option\n• Use "Same as Source" to process files in place\n• Try using Chrome, Edge, or Firefox for better compatibility';
      } else if (isInIframe) {
        errorMessage += 'Folder selection is restricted in iframe mode.\n\nSolutions:\n• Use "Default Location"\n• Open this app in a new browser tab\n• Use "Same as Source" option';
      } else {
        errorMessage += 'Browser security restrictions prevent folder access.\n\nAlternatives:\n• Use the default destination folder\n• Select "Same as Source" to process files in their original locations';
      }
      
      alert(errorMessage);
      
      // Suggest switching to default
      const useDefault = confirm('Would you like to use the default location instead?\n\nC:\\Users\\EugenManole\\OneDrive - Hilton\\Documents 1\\UG_Metadata_Manager');
      if (useDefault) {
        handleDestinationChoiceChange('default');
      }
    }
  };

  // Handle fallback destination selection
  const handleDestinationFallback = (event) => {
    const files = Array.from(event?.target?.files || []);
    if (files?.length > 0) {
      const firstFile = files?.[0];
      const relativePath = firstFile?.webkitRelativePath || '';
      const folderName = relativePath?.split('/')?.[0] || 'Selected folder';
      
      setDestinationPath(folderName);
      setDestinationChoice('custom');
      
      localStorage.setItem('destinationChoice', JSON.stringify('custom'));
      localStorage.setItem('destinationPath', JSON.stringify(folderName));
      
      console.log('✅ Fallback destination selected:', folderName);
      alert(`✅ Destination Selected!\n\nFolder: ${folderName}\n\nFiles will be processed to this location.`);
      
      event.target.value = '';
    }
  };

  // Handle destination choice changes
  const handleDestinationChoiceChange = (choice) => {
    setDestinationChoice(choice);
    
    switch (choice) {
      case 'source': setDestinationPath('Same as source files');
        localStorage.setItem('destinationChoice', JSON.stringify('source'));
        localStorage.removeItem('destinationPath');
        break;
      case 'default': setDestinationPath('C:\\Users\\EugenManole\\OneDrive - Hilton\\Documents 1\\UG_Metadata_Manager');
        localStorage.setItem('destinationChoice', JSON.stringify('default'));
        localStorage.setItem('destinationPath', JSON.stringify('C:\\Users\\EugenManole\\OneDrive - Hilton\\Documents 1\\UG_Metadata_Manager'));
        break;
      case 'custom':
        if (!destinationPath || destinationPath === 'Same as source files') {
          setDestinationPath('');
        }
        localStorage.setItem('destinationChoice', JSON.stringify('custom'));
        break;
      default:
        break;
    }
  };

  const handleProcessNewBatch = () => {
    console.log('🔄 Process New Batch clicked');
    
    const result = window.confirm(
      '🔄 Start New Batch?\n\n' + 'This will:\n'+ '• Clear ALL currently loaded files from memory\n'+ '• Reset ALL processing settings and metadata\n'+ '• Clear data from ALL pages (File Selection, Metadata, Cover Art, Processing, Summary)\n'+ '• Allow you to select completely fresh files\n\n'+ 'Previous files will NOT be deleted from your device.\n\n'+ 'Continue?'
    );
    
    if (result && onProcessNewBatch) {
      console.log('✅ User confirmed new batch - clearing ALL app data');
      
      // Comprehensive clearing of all app data
      const keysToRemove = [
        'selectedFiles',
        'retagAllFiles', 
        'ugMetadataManager_metadataConfig',
        'ugMetadataManager_metadataDraft',
        'coverArtData',
        'fileProcessingQueue',
        'currentProcessingSession',
        'retryFiles',
        'processedFiles',
        'processingResults',
        'processingLogs',
        'fileMetadata',
        'batchSettings',
        'userPreferences'
      ];
      
      keysToRemove?.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Cleared localStorage key: ${key}`);
      });
      
      // Clear any additional app-specific keys
      Object.keys(localStorage)?.forEach(key => {
        if (key?.startsWith('ug') || key?.startsWith('metadata') || key?.startsWith('file') || key?.startsWith('processing')) {
          localStorage.removeItem(key);
          console.log(`🗑️ Cleared additional key: ${key}`);
        }
      });
      
      console.log('✅ All localStorage data cleared - calling parent onProcessNewBatch');
      onProcessNewBatch();
    } else {
      console.log('❌ User cancelled new batch or onProcessNewBatch not available');
    }
  };

  const acceptString = acceptedFormats?.join(',');

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Hidden File Input Elements */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptString}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Select audio and video files"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        webkitdirectory=""
        directory=""
        onChange={handleFolderChange}
        className="hidden"
        aria-label="Select folder containing audio and video files"
      />
      <input
        ref={destinationInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        onChange={handleDestinationFallback}
        className="hidden"
        aria-label="Select destination folder"
      />

      {/* Usage Instructions */}
      <div className="mb-6 p-4 bg-info/10 border border-info/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="Info" size={16} className="text-info" />
          <h4 className="text-sm font-medium text-info">File Import Instructions</h4>
        </div>
        <div className="text-xs text-info space-y-1">
          <p><strong>Select Files:</strong> Choose individual audio/video files to process</p>
          <p><strong>Select Folder:</strong> Import all supported files from a directory</p>
          <p><strong>Configure Destination:</strong> Choose where processed files will be saved</p>
          <p><strong>Process New Batch:</strong> Clear current files and start fresh</p>
        </div>
      </div>

      {/* Header with SINGLE set of buttons - FIXED */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon name="Upload" size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold text-foreground">
              Import Files
            </h2>
            <p className="text-sm text-muted-foreground">
              Select audio and video files to process
            </p>
          </div>
        </div>
        
        {/* FIXED: Single set of import buttons only */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleFileSelect}
            disabled={isProcessing}
            iconName="Upload"
            iconPosition="left"
            iconSize={18}
            className="flex-1 sm:flex-none"
          >
            {isProcessing ? 'Processing...' : 'Select Files'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleFolderSelect}
            disabled={isProcessing}
            iconName="Folder"
            iconPosition="left"
            iconSize={18}
            className="flex-1 sm:flex-none"
          >
            {isProcessing ? 'Processing...' : 'Select Folder'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleProcessNewBatch}
            disabled={isProcessing}
            iconName="RotateCcw"
            iconPosition="left"
            iconSize={18}
            className="flex-1 sm:flex-none"
          >
            Process New Batch
          </Button>
        </div>
      </div>

      {/* Processing Status Display */}
      {isProcessing && (
        <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg">
          <div className="flex items-center space-x-2 text-info">
            <div className="animate-spin w-4 h-4 border-2 border-info border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium">
              Extracting metadata from files using AI...
            </span>
          </div>
          <p className="text-xs text-info/80 mt-1">
            This may take a moment for multiple files
          </p>
        </div>
      )}

      {/* ENHANCED Destination Folder Configuration */}
      <div className="mt-6 bg-muted/30 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-heading font-semibold text-foreground flex items-center">
            <Icon name="FolderOpen" size={20} className="mr-2 text-primary" />
            Destination Folder Settings
          </h3>
          <div className="text-xs text-muted-foreground">
            Where processed files will be saved
          </div>
        </div>
        
        {/* Browser Compatibility Notice */}
        {(!apiSupport?.directoryPicker || isInIframe) && (
          <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center space-x-2 text-warning">
              <Icon name="AlertTriangle" size={14} />
              <span className="text-sm font-medium">
                {isInIframe 
                  ? "Limited functionality in iframe mode" 
                  : "Browser has limited folder selection support"}
              </span>
            </div>
            <p className="text-xs text-warning/80 mt-1">
              {isInIframe 
                ? "For full functionality, open this app in a new browser tab" :"Try using Chrome, Edge, or Firefox for better folder selection"}
            </p>
          </div>
        )}
        
        {/* Destination Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <label className="flex items-center space-x-2 cursor-pointer p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <input
              type="radio"
              name="destinationChoice"
              value="default"
              checked={destinationChoice === 'default'}
              onChange={(e) => handleDestinationChoiceChange(e?.target?.value)}
              className="text-primary"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Default Location</div>
              <div className="text-xs text-muted-foreground">Your Documents folder</div>
              <div className="text-xs text-success">✅ Always works</div>
            </div>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <input
              type="radio"
              name="destinationChoice"
              value="source"
              checked={destinationChoice === 'source'}
              onChange={(e) => handleDestinationChoiceChange(e?.target?.value)}
              className="text-primary"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Same as Source</div>
              <div className="text-xs text-muted-foreground">Original file locations</div>
              <div className="text-xs text-success">✅ No file moving</div>
            </div>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <input
              type="radio"
              name="destinationChoice"
              value="custom"
              checked={destinationChoice === 'custom'}
              onChange={(e) => handleDestinationChoiceChange(e?.target?.value)}
              className="text-primary"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Custom Folder</div>
              <div className="text-xs text-muted-foreground">Choose specific location</div>
              {(!apiSupport?.directoryPicker || isInIframe) && (
                <div className="text-xs text-warning">⚠️ Limited support</div>
              )}
            </div>
          </label>
        </div>

        {/* Custom Folder Selection - ENHANCED */}
        {destinationChoice === 'custom' && (
          <div className="border border-border rounded-lg p-3 bg-background">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                Custom Destination Path
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectDestinationFolder}
                disabled={isProcessing}
                iconName="FolderOpen"
                iconPosition="left"
                iconSize={14}
                className="text-xs"
              >
                {apiSupport?.directoryPicker && !isInIframe ? 'Browse Folder' : 'Try Select'}
              </Button>
            </div>
            
            {/* Show current selection or guidance */}
            {destinationPath && destinationChoice === 'custom' && destinationPath !== '' ? (
              <div className="flex items-center justify-between p-2 bg-success/10 border border-success/20 rounded text-success">
                <div className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={16} />
                  <span className="text-sm font-medium">📁 {destinationPath}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDestinationPath('');
                    localStorage.removeItem('destinationPath');
                  }}
                  iconName="X"
                  iconSize={14}
                  className="text-success hover:text-success-foreground"
                />
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic p-2 border border-dashed border-border rounded">
                {apiSupport?.directoryPicker && !isInIframe
                  ? 'Click "Browse Folder" to select your custom destination folder'
                  : isInIframe 
                    ? 'Folder selection limited in iframe mode - consider using Default Location'
                    : 'Limited browser support - try using Chrome, Edge, or Firefox'
                }
              </div>
            )}
          </div>
        )}

        {/* Current Setting Display */}
        <div className="mt-3 p-3 bg-info/10 border border-info/20 rounded text-info">
          <div className="flex items-center space-x-2">
            <Icon name="Info" size={14} />
            <span className="text-sm font-medium">Active Setting:</span>
          </div>
          <div className="text-sm mt-1 font-mono">
            {destinationChoice === 'default' && '📁 C:\\Users\\EugenManole\\OneDrive - Hilton\\Documents 1\\UG_Metadata_Manager'}
            {destinationChoice === 'source' && '📁 Files will be processed in their original locations'}
            {destinationChoice === 'custom' && destinationPath && `📁 ${destinationPath}`}
            {destinationChoice === 'custom' && !destinationPath && '📁 No custom folder selected yet'}
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="alert info mt-4">
        <Icon name="Info" size={20} />
        <div className="flex-1">
          <div className="text-sm font-medium mb-1">
            💡 File Processing Information
          </div>
          <div className="text-xs space-y-1">
            <p><strong>Select Files:</strong> Choose individual audio/video files to process</p>
            <p><strong>Select Folder:</strong> Import all supported files from a directory</p>
            <p><strong>Process New Batch:</strong> Clear current selection and start over</p>
            <p><strong>Destination:</strong> Configure where processed files will be saved</p>
            {(isInIframe || !apiSupport?.directoryPicker) && (
              <p className="text-warning"><strong>⚠️ Browser Limitation:</strong> Advanced folder selection may not work - use Default Location for best results</p>
            )}
          </div>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="border-t border-border pt-4 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="text-sm font-medium text-foreground">
            Supported formats:
          </div>
          <div className="flex flex-wrap gap-2">
            {acceptedFormats?.slice(0, 8)?.map((format) => (
              <span 
                key={format} 
                className="status-badge muted"
              >
                {format?.toUpperCase()}
              </span>
            ))}
            {acceptedFormats?.length > 8 && (
              <span className="status-badge info">
                +{acceptedFormats?.length - 8} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileImportControls;