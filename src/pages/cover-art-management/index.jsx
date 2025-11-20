import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ProcessStepIndicator from '../../components/ui/ProcessStepIndicator';
import ValidationGate from '../../components/ui/ValidationGate';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ImagePreview from './components/ImagePreview';
import FileList from './components/FileList';
import QualitySettings from './components/QualitySettings';
import BatchActions from './components/BatchActions';

const CoverArtManagement = () => {
  const navigate = useNavigate();
  
  // State management
  const [selectedImage, setSelectedImage] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [skippedFiles, setSkippedFiles] = useState([]);
  const [qualitySettings, setQualitySettings] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });

  // Load actual files from localStorage instead of hardcoded mock data
  useEffect(() => {
    // Clear any old cover art image from localStorage when component mounts
    // This ensures we start fresh for each batch
    const oldCoverArt = localStorage.getItem('coverArtImage');
    if (oldCoverArt) {
      console.log('🗑️ Clearing old cover art from previous batch');
      localStorage.removeItem('coverArtImage');
    }
    
    const loadFilesFromStorage = () => {
      // Try to get files from multiple localStorage sources
      const savedFiles = localStorage.getItem('selectedFiles');
      const coverArtData = localStorage.getItem('coverArtData');
      
      let filesToLoad = null;
      
      // Priority: selectedFiles first, then coverArtData
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
      
      if (filesToLoad && Array.isArray(filesToLoad) && filesToLoad?.length > 0) {
        // Convert to cover art format if needed
        const coverArtFiles = filesToLoad?.map(file => ({
          ...file,
          id: file?.id || Date.now() + Math.random(),
          hasCoverArt: Math.random() > 0.5, // Simulate existing cover art detection
          coverArtSource: Math.random() > 0.7 ? 'embedded' : null,
          quality: Math.random() > 0.5 ? 'High (300x300)' : 'Medium (200x200)'
        }));
        
        setFiles(coverArtFiles);
        console.log('Loaded files for cover art management:', coverArtFiles?.length);
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

  // Save files when they change
  useEffect(() => {
    if (files?.length > 0) {
      localStorage.setItem('coverArtData', JSON.stringify(files));
    }
  }, [files]);

  // Handlers
  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setZoomLevel(1);
    setCropPosition({ x: 0, y: 0 });
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setZoomLevel(1);
    setCropPosition({ x: 0, y: 0 });
  };

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => 
      prev?.includes(fileId) 
        ? prev?.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSkipToggle = (fileId, skip) => {
    setSkippedFiles(prev => 
      skip 
        ? [...prev, fileId]
        : prev?.filter(id => id !== fileId)
    );
  };

  const handleBulkSkipToggle = (fileIds) => {
    setSkippedFiles(fileIds);
  };

  const handleIndividualArtwork = (file) => {
    setSelectedFiles([file?.id]);
    // Could open a modal or navigate to individual editing
    console.log('Edit individual artwork for:', file?.name);
  };

  const handleApplyToAll = () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      const activeFiles = files?.filter(file => !skippedFiles?.includes(file?.id));
      console.log(`Applied cover art to ${activeFiles?.length} files`);
      setIsProcessing(false);
      
      // Show success and potentially navigate
      validateAndProceed();
    }, 2000);
  };

  const handleApplyToSelected = (fileIds) => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      console.log(`Applied cover art to ${fileIds?.length} selected files`);
      setIsProcessing(false);
    }, 1500);
  };

  const handleSkipAll = () => {
    setSkippedFiles(files?.map(f => f?.id));
  };

  const handleClearAll = () => {
    const updatedFiles = files?.map(file => ({
      ...file,
      coverArt: null,
      thumbnail: null
    }));
    setFiles(updatedFiles);
    
    // Also clear the selected image and localStorage
    setSelectedImage(null);
    localStorage.removeItem('coverArtImage');
    console.log('🗑️ Cleared all cover art including selected image and localStorage');
  };

  const handlePreview = () => {
    console.log('Preview changes for files with cover art');
  };

  const handleQualitySettingsChange = (newSettings) => {
    setQualitySettings(newSettings);
  };

  const handleQualityReset = () => {
    setQualitySettings({});
  };

  const validateAndProceed = () => {
    const errors = [];
    const warnings = [];
    
    const activeFiles = files?.filter(file => !skippedFiles?.includes(file?.id));
    const filesWithoutArt = activeFiles?.filter(file => 
      !file?.coverArt && !file?.thumbnail && !selectedImage
    );
    
    if (filesWithoutArt?.length > 0) {
      warnings?.push({
        title: 'Files without cover art',
        message: `${filesWithoutArt?.length} files will not have cover art applied. Consider adding artwork or skipping these files.`,
        field: 'coverArt'
      });
    }
    
    if (selectedImage && selectedImage?.size > 10 * 1024 * 1024) {
      warnings?.push({
        title: 'Large image file',
        message: 'The selected image is quite large and may increase processing time and file sizes.',
        field: 'imageSize'
      });
    }
    
    if (errors?.length > 0 || warnings?.length > 0) {
      setValidationErrors(errors);
      setValidationWarnings(warnings);
      setShowValidation(true);
    } else {
      handleContinue();
    }
  };

  const handleContinue = () => {
    // Save selected cover art image to localStorage for processing page
    if (selectedImage && selectedImage?.url) {
      localStorage.setItem('coverArtImage', selectedImage?.url);
      console.log('✅ Cover art image saved to localStorage');
    } else {
      // Clear any existing cover art if none selected
      localStorage.removeItem('coverArtImage');
      console.log('🗑️ No cover art selected, cleared localStorage');
    }
    navigate('/file-processing');
  };

  const handleBack = () => {
    navigate('/metadata-entry');
  };

  const activeFiles = files?.filter(file => !skippedFiles?.includes(file?.id));
  const completionRate = files?.length > 0 ? ((files?.length - activeFiles?.length) / files?.length) * 100 : 0;

  // Show message if no files
  if (files?.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <ProcessStepIndicator 
          currentStep={3} 
          completedSteps={[1, 2]} 
          onStepChange={() => {}} 
        />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <Icon name="FileX" size={64} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No Files Found</h2>
            <p className="text-muted-foreground mb-6">
              No files were found from the previous step. Please go back to File Selection and choose files to process.
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
                onClick={() => navigate('/metadata-entry')}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Back to Metadata Entry
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
        currentStep={3} 
        completedSteps={[1, 2]} 
        onStepChange={() => {}} 
      />
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                Cover Art Management
              </h1>
              <p className="text-muted-foreground">
                Add visual elements to your audio files and video thumbnails
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">
                {activeFiles?.length} files to process
              </div>
              {completionRate > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full transition-smooth"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-success font-medium">
                    {Math.round(completionRate)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Preview & Controls */}
          <div className="lg:col-span-2 space-y-6">
            <ImagePreview
              selectedImage={selectedImage}
              onImageSelect={handleImageSelect}
              onClearImage={handleClearImage}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
              cropPosition={cropPosition}
              onCropChange={setCropPosition}
              isProcessing={isProcessing}
            />
            
            <QualitySettings
              settings={qualitySettings}
              onSettingsChange={handleQualitySettingsChange}
              onReset={handleQualityReset}
              isProcessing={isProcessing}
            />
          </div>

          {/* Right Column - File List & Actions */}
          <div className="space-y-6">
            <FileList
              files={files}
              onFileSelect={handleFileSelect}
              onSkipToggle={handleSkipToggle}
              onBulkSkipToggle={handleBulkSkipToggle}
              selectedFiles={selectedFiles}
              skippedFiles={skippedFiles}
              onIndividualArtwork={handleIndividualArtwork}
            />
            
            <BatchActions
              selectedImage={selectedImage}
              files={files}
              skippedFiles={skippedFiles}
              onApplyToAll={handleApplyToAll}
              onApplyToSelected={handleApplyToSelected}
              onSkipAll={handleSkipAll}
              onClearAll={handleClearAll}
              isProcessing={isProcessing}
              onPreview={handlePreview}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            iconName="ArrowLeft"
            iconPosition="left"
            iconSize={16}
            disabled={isProcessing}
          >
            Back to Metadata
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Step 3 of 5 • Cover Art Management
            </div>
            <Button
              variant="default"
              onClick={validateAndProceed}
              iconName="ArrowRight"
              iconPosition="right"
              iconSize={16}
              disabled={isProcessing}
              loading={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Continue to Processing'}
            </Button>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="fixed bottom-6 right-6 bg-card border border-border rounded-lg shadow-elevated p-4 max-w-sm">
            <div className="flex items-center space-x-3">
              <Icon name="Loader" size={20} className="animate-spin text-primary" />
              <div>
                <div className="text-sm font-medium text-foreground">
                  Processing Cover Art
                </div>
                <div className="text-xs text-muted-foreground">
                  Applying artwork to files...
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Validation Gate */}
      <ValidationGate
        isVisible={showValidation}
        errors={validationErrors}
        warnings={validationWarnings}
        onRetry={() => setShowValidation(false)}
        onContinue={() => {
          setShowValidation(false);
          handleContinue();
        }}
        onCancel={() => setShowValidation(false)}
        title="Cover Art Validation"
        description="Please review the following items before proceeding:"
        allowContinueWithWarnings={true}
      />
    </div>
  );
};

export default CoverArtManagement;