import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ProcessStepIndicator from '../../components/ui/ProcessStepIndicator';
import ValidationGate from '../../components/ui/ValidationGate';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import MetadataForm from './components/MetadataForm';
import MetadataPreview from './components/MetadataPreview';
import { getDefaultMetadataConfig, saveDefaultMetadataConfig } from '../../services/metadataService';

const MetadataEntry = () => {
  const navigate = useNavigate();
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [individualMetadata, setIndividualMetadata] = useState({});
  const [batchMetadata, setBatchMetadata] = useState({
    title: '',
    artist: '',
    album: '',
    year: new Date()?.getFullYear()?.toString(),
    genre: '',
    comments: ''
  });
  const [processingMode, setProcessingMode] = useState('batch'); // 'batch' or 'individual'
  const [titleMode, setTitleMode] = useState('single'); // 'single', 'incremental', 'individual'
  const [baseTitle, setBaseTitle] = useState('');
  
  const [clearExistingMetadata, setClearExistingMetadata] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidationGate, setShowValidationGate] = useState(false);
  const [showDefaultsConfig, setShowDefaultsConfig] = useState(false);
  const [defaultsConfig, setDefaultsConfig] = useState(getDefaultMetadataConfig);

  // Load selected files from localStorage
  useEffect(() => {
    const savedFiles = localStorage.getItem('selectedFiles');
    
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        setSelectedFiles(parsedFiles);
        
        // Load default configuration
        const defaults = getDefaultMetadataConfig();
        
        // Initialize individual metadata for each file using defaults
        const initMetadata = {};
        parsedFiles?.forEach((file, index) => {
          initMetadata[file?.id] = {
            title: file?.title || '',
            artist: file?.artist || defaults?.artist || '',
            album: file?.album || defaults?.album || '',
            year: file?.year || defaults?.year || new Date()?.getFullYear()?.toString(),
            genre: file?.genre || defaults?.genre || '',
            comments: defaults?.comments || ''
          };
        });
        setIndividualMetadata(initMetadata);
        
        // Set batch metadata to defaults
        setBatchMetadata({
          title: '',
          artist: defaults?.artist || '',
          album: defaults?.album || '',
          year: defaults?.year || new Date()?.getFullYear()?.toString(),
          genre: defaults?.genre || '',
          comments: defaults?.comments || ''
        });
        
      } catch (error) {
        console.error('Error loading selected files:', error);
        navigate('/file-selection');
      }
    } else {
      navigate('/file-selection');
    }
  }, [navigate]);

  // Handle default configuration save
  const handleSaveDefaults = () => {
    saveDefaultMetadataConfig(defaultsConfig);
    
    // Apply defaults to current batch metadata
    setBatchMetadata(prev => ({
      ...prev,
      artist: defaultsConfig?.artist || '',
      album: defaultsConfig?.album || '',
      year: defaultsConfig?.year || new Date()?.getFullYear()?.toString(),
      genre: defaultsConfig?.genre || '',
      comments: defaultsConfig?.comments || ''
    }));
    
    setShowDefaultsConfig(false);
    alert('✅ Default metadata settings saved!\n\nThese settings will be applied to new files automatically.');
  };

  // Handle title mode changes
  const handleTitleModeChange = (mode) => {
    setTitleMode(mode);
    
    if (mode === 'incremental' && selectedFiles?.length > 0) {
      // Generate incremental titles
      const updatedMetadata = { ...individualMetadata };
      selectedFiles?.forEach((file, index) => {
        updatedMetadata[file?.id] = {
          ...updatedMetadata?.[file?.id],
          title: baseTitle ? `${baseTitle} ${index + 1}` : `Track ${index + 1}`
        };
      });
      setIndividualMetadata(updatedMetadata);
    }
  };

  // Handle base title change for incremental mode
  const handleBaseTitleChange = (title) => {
    setBaseTitle(title);
    
    if (titleMode === 'incremental') {
      const updatedMetadata = { ...individualMetadata };
      selectedFiles?.forEach((file, index) => {
        updatedMetadata[file?.id] = {
          ...updatedMetadata?.[file?.id],
          title: title ? `${title} ${index + 1}` : `Track ${index + 1}`
        };
      });
      setIndividualMetadata(updatedMetadata);
    }
  };

  // Handle individual file metadata change
  const handleIndividualMetadataChange = (fileId, field, value) => {
    setIndividualMetadata(prev => ({
      ...prev,
      [fileId]: {
        ...prev?.[fileId],
        [field]: value
      }
    }));
  };

  // Handle batch metadata change
  const handleBatchMetadataChange = (field, value) => {
    setBatchMetadata(prev => ({
      ...prev,
      [field]: value
    }));
    
    // If in batch mode, apply to all files
    if (processingMode === 'batch') {
      const updatedMetadata = { ...individualMetadata };
      selectedFiles?.forEach(file => {
        updatedMetadata[file?.id] = {
          ...updatedMetadata?.[file?.id],
          [field]: value
        };
      });
      setIndividualMetadata(updatedMetadata);
    }
  };

  // Apply batch settings to all files
  const handleApplyBatchToAll = () => {
    const updatedMetadata = { ...individualMetadata };
    selectedFiles?.forEach((file, index) => {
      let title = batchMetadata?.title;
      
      // Handle title based on mode
      if (titleMode === 'incremental') {
        title = baseTitle ? `${baseTitle} ${index + 1}` : `Track ${index + 1}`;
      } else if (titleMode === 'individual') {
        title = individualMetadata?.[file?.id]?.title || file?.title || '';
      }
      
      updatedMetadata[file?.id] = {
        title: title,
        artist: batchMetadata?.artist,
        album: batchMetadata?.album,
        year: batchMetadata?.year,
        comments: batchMetadata?.comments
      };
    });
    setIndividualMetadata(updatedMetadata);
  };

  const validateForm = () => {
    const errors = [];
    const warnings = [];

    // Check if all files have required metadata
    selectedFiles?.forEach(file => {
      const metadata = individualMetadata?.[file?.id];
      if (!metadata?.title?.trim()) {
        errors?.push({
          title: `Missing Title for ${file?.name}`,
          message: 'Each file must have a title',
          field: 'title'
        });
      }
      if (!metadata?.artist?.trim()) {
        errors?.push({
          title: `Missing Artist for ${file?.name}`,
          message: 'Each file must have an artist',
          field: 'artist'
        });
      }
    });

    if (clearExistingMetadata) {
      warnings?.push({
        title: 'Metadata Clearing Enabled',
        message: 'All existing metadata will be permanently removed before applying new values'
      });
    }

    return { errors, warnings };
  };

  const handleNext = () => {
    const validation = validateForm();
    
    if (validation?.errors?.length > 0 || validation?.warnings?.length > 0) {
      setShowValidationGate(true);
      return;
    }

    // Save metadata configuration
    const metadataConfig = {
      individualMetadata,
      batchMetadata,
      processingMode,
      titleMode,
      baseTitle,
      clearExistingMetadata,
      selectedFiles: selectedFiles?.length,
      timestamp: Date.now()
    };
    
    localStorage.setItem('ugMetadataManager_metadataConfig', JSON.stringify(metadataConfig));
    navigate('/cover-art-management');
  };

  const handleBack = () => {
    navigate('/file-selection');
  };

  const handleValidationContinue = () => {
    setShowValidationGate(false);
    
    const metadataConfig = {
      individualMetadata,
      batchMetadata,
      processingMode,
      titleMode,
      baseTitle,
      clearExistingMetadata,
      selectedFiles: selectedFiles?.length,
      timestamp: Date.now()
    };
    
    localStorage.setItem('ugMetadataManager_metadataConfig', JSON.stringify(metadataConfig));
    navigate('/cover-art-management');
  };

  const currentFile = selectedFiles?.[currentFileIndex];
  const currentMetadata = individualMetadata?.[currentFile?.id] || {};
  const validation = validateForm();

  if (selectedFiles?.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8 text-center">
          <div className="text-muted-foreground">Loading files...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ProcessStepIndicator 
        currentStep={2} 
        completedSteps={[1]} 
        onStepChange={() => {}} 
      />
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-primary">
                <Icon name="Edit3" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">
                  Metadata Entry
                </h1>
                <p className="text-lg text-muted-foreground">
                  Configure metadata fields for your audio and video files
                </p>
              </div>
            </div>
            
            {/* ENHANCED: More prominent Configure Defaults Button */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs text-muted-foreground">Need to set defaults?</div>
                <div className="text-xs text-primary">Click the settings button →</div>
              </div>
              <Button
                variant="default"
                onClick={() => setShowDefaultsConfig(true)}
                iconName="Settings"
                iconPosition="left"
                iconSize={16}
                className="bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground"
              >
                <span className="hidden sm:inline">Configure Defaults</span>
                <span className="sm:hidden">Defaults</span>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Icon name="Files" size={16} />
              <span>{selectedFiles?.length} files selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} />
              <span>Step 2 of 5</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Settings" size={16} className="text-primary" />
              <span className="text-primary">Click "Configure Defaults" to set default metadata values</span>
            </div>
          </div>
        </div>

        {/* ENHANCED: Default Values Quick Access Banner */}
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="Settings" size={20} className="text-primary" />
              <div>
                <h4 className="text-sm font-medium text-primary">Default Metadata Values</h4>
                <p className="text-xs text-muted-foreground">
                  Set default artist, album, year, and other metadata that will be applied to new files automatically
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  Current defaults: {defaultsConfig?.artist || 'Not set'}, {defaultsConfig?.album || 'Not set'}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDefaultsConfig(true)}
                iconName="Settings"
                iconPosition="left"
                iconSize={14}
              >
                Modify Defaults
              </Button>
            </div>
          </div>
        </div>

        {/* Title Configuration Section */}
        <div className="mb-8 bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
            🎵 Title Configuration for Multiple Files
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="titleMode"
                value="single"
                checked={titleMode === 'single'}
                onChange={(e) => handleTitleModeChange(e?.target?.value)}
                className="text-primary"
              />
              <span className="text-sm">Single Title for All</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="titleMode"
                value="incremental"
                checked={titleMode === 'incremental'}
                onChange={(e) => handleTitleModeChange(e?.target?.value)}
                className="text-primary"
              />
              <span className="text-sm">Incremental Naming</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="titleMode"
                value="individual"
                checked={titleMode === 'individual'}
                onChange={(e) => handleTitleModeChange(e?.target?.value)}
                className="text-primary"
              />
              <span className="text-sm">Individual Titles</span>
            </label>
          </div>
          
          {titleMode === 'incremental' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Base Title (will become "Base Title 1", "Base Title 2", etc.)
              </label>
              <input
                type="text"
                value={baseTitle}
                onChange={(e) => handleBaseTitleChange(e?.target?.value)}
                placeholder="Enter base title (e.g., 'TRACK' becomes 'TRACK 1', 'TRACK 2'...)"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            {titleMode === 'single' && "Same title will be applied to all files"}
            {titleMode === 'incremental' && `Will generate: "${baseTitle || 'Track'} 1", "${baseTitle || 'Track'} 2", etc.`}
            {titleMode === 'individual' && "Customize title for each file separately"}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Metadata Form */}
          <div className="xl:col-span-1">
            <MetadataForm
              metadata={processingMode === 'batch' ? batchMetadata : currentMetadata}
              onMetadataChange={processingMode === 'batch' ? handleBatchMetadataChange : 
                (field, value) => handleIndividualMetadataChange(currentFile?.id, field, value)}
              clearExistingMetadata={clearExistingMetadata}
              onClearMetadataChange={setClearExistingMetadata}
              isIndividualMode={processingMode === 'individual'}
              currentFile={currentFile}
              titleMode={titleMode}
            />
            
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={handleApplyBatchToAll}
                disabled={processingMode === 'individual'}
                iconName="Copy"
                iconPosition="left"
                iconSize={16}
                fullWidth
              >
                Apply Current Settings to All Files
              </Button>
            </div>
          </div>

          {/* Middle Column - Processing Mode */}
          <div className="xl:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                Processing Mode
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="processingMode"
                    value="batch"
                    checked={processingMode === 'batch'}
                    onChange={(e) => setProcessingMode(e?.target?.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">Batch Processing</div>
                    <div className="text-xs text-muted-foreground">Apply same metadata to all files</div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="processingMode"
                    value="individual"
                    checked={processingMode === 'individual'}
                    onChange={(e) => setProcessingMode(e?.target?.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">Individual Processing</div>
                    <div className="text-xs text-muted-foreground">Customize metadata for each file</div>
                  </div>
                </label>
              </div>
            </div>
            
            {processingMode === 'individual' && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                  File Navigation
                </h3>
                
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentFileIndex(Math.max(0, currentFileIndex - 1))}
                    disabled={currentFileIndex === 0}
                    iconName="ChevronLeft"
                    iconPosition="left"
                    iconSize={16}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    {currentFileIndex + 1} of {selectedFiles?.length}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentFileIndex(Math.min(selectedFiles?.length - 1, currentFileIndex + 1))}
                    disabled={currentFileIndex === selectedFiles?.length - 1}
                    iconName="ChevronRight"
                    iconPosition="right"
                    iconSize={16}
                  >
                    Next
                  </Button>
                </div>
                
                <div className="text-sm text-foreground font-medium truncate">
                  {currentFile?.name}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="xl:col-span-1">
            <MetadataPreview
              selectedFile={currentFile}
              currentMetadata={currentFile?.currentMetadata || {}}
              newMetadata={currentMetadata}
              showComparison={true}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            iconName="ArrowLeft"
            iconPosition="left"
            iconSize={16}
          >
            Back to File Selection
          </Button>
          
          <div className="flex items-center space-x-4">
            {/* Validation Status */}
            <div className="flex items-center space-x-2 text-sm">
              {validation?.errors?.length > 0 && (
                <div className="flex items-center space-x-1 text-error">
                  <Icon name="AlertCircle" size={16} />
                  <span>{validation?.errors?.length} errors</span>
                </div>
              )}
              {validation?.warnings?.length > 0 && (
                <div className="flex items-center space-x-1 text-warning">
                  <Icon name="AlertTriangle" size={16} />
                  <span>{validation?.warnings?.length} warnings</span>
                </div>
              )}
              {validation?.errors?.length === 0 && validation?.warnings?.length === 0 && (
                <div className="flex items-center space-x-1 text-success">
                  <Icon name="CheckCircle" size={16} />
                  <span>Ready to proceed</span>
                </div>
              )}
            </div>
            
            <Button
              variant="default"
              onClick={handleNext}
              iconName="ArrowRight"
              iconPosition="right"
              iconSize={16}
            >
              Continue to Cover Art
            </Button>
          </div>
        </div>
      </main>
      {/* Default Configuration Modal */}
      {showDefaultsConfig && (
        <div className="modal-container">
          <div className="modal-content max-w-md w-full animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-xl font-heading font-bold text-foreground flex items-center">
                <Icon name="Settings" size={24} className="mr-2 text-primary" />
                Default Metadata Settings
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDefaultsConfig(false)}
                iconName="X"
                iconSize={20}
              />
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Configure default values that will be applied to new files automatically.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Default Artist
                  </label>
                  <input
                    type="text"
                    value={defaultsConfig?.artist || ''}
                    onChange={(e) => setDefaultsConfig(prev => ({ ...prev, artist: e?.target?.value }))}
                    placeholder="Enter default artist"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Default Album
                  </label>
                  <input
                    type="text"
                    value={defaultsConfig?.album || ''}
                    onChange={(e) => setDefaultsConfig(prev => ({ ...prev, album: e?.target?.value }))}
                    placeholder="Enter default album"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Default Year
                  </label>
                  <input
                    type="text"
                    value={defaultsConfig?.year || ''}
                    onChange={(e) => setDefaultsConfig(prev => ({ ...prev, year: e?.target?.value }))}
                    placeholder="Enter default year"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Default Genre
                  </label>
                  <input
                    type="text"
                    value={defaultsConfig?.genre || ''}
                    onChange={(e) => setDefaultsConfig(prev => ({ ...prev, genre: e?.target?.value }))}
                    placeholder="Enter default genre"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Default Comments
                  </label>
                  <textarea
                    value={defaultsConfig?.comments || ''}
                    onChange={(e) => setDefaultsConfig(prev => ({ ...prev, comments: e?.target?.value }))}
                    placeholder="Enter default comments"
                    rows="3"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDefaultsConfig(false)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleSaveDefaults}
                  fullWidth
                  iconName="Save"
                  iconPosition="left"
                  iconSize={16}
                >
                  Save Defaults
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Validation Gate Modal */}
      <ValidationGate
        isVisible={showValidationGate}
        errors={validation?.errors}
        warnings={validation?.warnings}
        onContinue={handleValidationContinue}
        onRetry={() => setShowValidationGate(false)}
        onCancel={() => setShowValidationGate(false)}
        title="Metadata Validation"
        description="Please review the following issues before proceeding:"
        allowContinueWithWarnings={true}
      />
    </div>
  );
};

export default MetadataEntry;