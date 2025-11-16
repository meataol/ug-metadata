import React, { useState, useEffect } from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const MetadataForm = ({ 
  metadata = {}, 
  onMetadataChange, 
  clearExistingMetadata, 
  onClearMetadataChange,
  isIndividualMode = false,
  currentFile = null,
  titleMode = 'single'
}) => {
  // Get default filename title (no extension)
  const getDefaultTitle = () => {
    if (metadata?.title && metadata?.title !== 'Not set') {
      return metadata?.title;
    }
    if (currentFile?.name) {
      const nameWithoutExt = currentFile?.name?.replace(/\.[^/.]+$/, '');
      return nameWithoutExt || 'Untitled';
    }
    return '';
  };

  const [formData, setFormData] = useState({
    title: getDefaultTitle(),
    artist: 'UG Production',
    album: '',
    year: new Date()?.getFullYear()?.toString(),
    comments: '',
    ...metadata
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Enhanced effect to properly sync with props and default to filename
  useEffect(() => {
    console.log('🔄 MetadataForm: Syncing with props', {
      metadata,
      currentFile: currentFile?.name,
      titleMode
    });

    const defaultTitle = getDefaultTitle();
    const syncedData = {
      title: metadata?.title && metadata?.title !== 'Not set' ? metadata?.title : defaultTitle,
      artist: metadata?.artist && metadata?.artist !== 'Not set' ? metadata?.artist : 'UG Production',
      album: metadata?.album && metadata?.album !== 'Not set' ? metadata?.album : '',
      year: metadata?.year && metadata?.year !== 'Not set' ? metadata?.year : new Date()?.getFullYear()?.toString(),
      comments: metadata?.comments || ''
    };

    console.log('📝 MetadataForm: Setting form data', syncedData);
    setFormData(syncedData);

    // Automatically propagate default title to parent if title is empty
    if (!syncedData?.title && defaultTitle && onMetadataChange) {
      console.log('🎯 Auto-setting default title:', defaultTitle);
      onMetadataChange('title', defaultTitle);
    }
  }, [metadata, currentFile, titleMode]);

  const validateField = (name, value) => {
    const newErrors = { ...validationErrors };

    switch (name) {
      case 'title':
        if (!value?.trim()) {
          newErrors.title = 'Title is required';
        } else if (value?.length > 100) {
          newErrors.title = 'Title must be less than 100 characters';
        } else {
          delete newErrors?.title;
        }
        break;
      case 'artist':
        if (!value?.trim()) {
          newErrors.artist = 'Artist is required';
        } else if (value?.length > 100) {
          newErrors.artist = 'Artist must be less than 100 characters';
        } else {
          delete newErrors?.artist;
        }
        break;
      case 'album':
        if (value && value?.length > 100) {
          newErrors.album = 'Album must be less than 100 characters';
        } else {
          delete newErrors?.album;
        }
        break;
      case 'year':
        if (value && (isNaN(value) || value < 1900 || value > new Date()?.getFullYear() + 10)) {
          newErrors.year = `Year must be between 1900 and ${new Date()?.getFullYear() + 10}`;
        } else {
          delete newErrors?.year;
        }
        break;
      case 'comments':
        if (value && value?.length > 500) {
          newErrors.comments = 'Comments must be less than 500 characters';
        } else {
          delete newErrors?.comments;
        }
        break;
      default:
        break;
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (name, value) => {
    console.log('📝 MetadataForm: Input change', { name, value });
    
    // Update local state immediately for UI responsiveness
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    validateField(name, value);
    
    // Propagate change to parent component
    if (onMetadataChange) {
      console.log('⬆️ Propagating to parent:', { name, value });
      onMetadataChange(name, value);
    }
  };

  const handleUseFilename = () => {
    if (currentFile?.name) {
      const filenameTitle = currentFile?.name?.replace(/\.[^/.]+$/, '') || 'Untitled';
      console.log('📁 Using filename as title:', filenameTitle);
      handleInputChange('title', filenameTitle);
    }
  };

  const handleResetToDefaults = () => {
    const defaultData = {
      title: getDefaultTitle(),
      artist: 'UG Production',
      album: '',
      year: new Date()?.getFullYear()?.toString(),
      comments: ''
    };
    
    console.log('🔄 Resetting to defaults:', defaultData);
    setFormData(defaultData);
    setValidationErrors({});
    
    // Propagate all defaults to parent
    if (onMetadataChange) {
      Object.keys(defaultData)?.forEach(key => {
        onMetadataChange(key, defaultData?.[key]);
      });
    }
  };

  const handleAutoFillSample = () => {
    const sampleData = {
      title: isIndividualMode && currentFile ? 
        `${currentFile?.name?.split('.')?.slice(0, -1)?.join('.')} - UG Version` : 
        'Sample Track Title',
      artist: 'UG Production',
      album: 'UG Collection 2024',
      year: '2024',
      comments: 'Processed with UG Metadata Manager'
    };
    
    console.log('🎭 Auto-filling sample data:', sampleData);
    setFormData(sampleData);
    
    if (onMetadataChange) {
      Object.keys(sampleData)?.forEach(key => {
        onMetadataChange(key, sampleData?.[key]);
      });
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-border gradient-primary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="Edit3" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-foreground">
                Metadata Configuration
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure metadata fields for your audio and video files
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoFillSample}
              iconName="Wand2"
              iconPosition="left"
              iconSize={16}
            >
              Sample Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefaults}
              iconName="RotateCcw"
              iconPosition="left"
              iconSize={16}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Clear Metadata Option */}
      <div className="p-6 border-b border-border bg-warning/5">
        <Checkbox
          checked={clearExistingMetadata}
          onChange={(e) => onClearMetadataChange && onClearMetadataChange(e?.target?.checked)}
          label="Clear all existing metadata before applying new values"
          description="This action will permanently remove all current metadata from selected files"
          className="mb-2"
        />
        
        {clearExistingMetadata && (
          <div className="mt-3 p-3 alert warning">
            <Icon name="AlertTriangle" size={16} />
            <div className="text-sm">
              <strong>Warning:</strong> This action is irreversible. All existing metadata including tags, artwork, and custom fields will be permanently removed before applying new metadata.
            </div>
          </div>
        )}
      </div>

      {/* Current File Info for Individual Mode */}
      {isIndividualMode && currentFile && (
        <div className="p-6 border-b border-border alert info">
          <Icon name="File" size={20} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">{currentFile?.name}</div>
            <div className="text-sm text-muted-foreground">
              {currentFile?.size ? `${(currentFile?.size / 1024 / 1024)?.toFixed(2)} MB` : ''} • {currentFile?.type || 'Unknown type'}
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title Field - Enhanced with filename button and better defaults */}
          <div className="md:col-span-2">
            <label className="form-label">
              {titleMode === 'individual' ? `Title for ${currentFile?.name || 'Current File'}` : 'Title'}
              <span className="text-error ml-1">*</span>
              {currentFile?.name && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUseFilename}
                  iconName="FileText"
                  iconPosition="left"
                  iconSize={14}
                  className="ml-2 text-xs h-6 px-2"
                  title="Use the filename (without extension) as the title"
                >
                  Use Filename
                </Button>
              )}
            </label>
            <input
              type="text"
              placeholder={
                currentFile?.name ? `Default: ${currentFile?.name?.replace(/\.[^/.]+$/, '')}` :
                titleMode === 'incremental' ? 'Base title (will become Title 1, Title 2, etc.)' :
                titleMode === 'individual' ? 'Individual title for this file' :
                'Enter track or video title'
              }
              value={formData?.title || ''}
              onChange={(e) => handleInputChange('title', e?.target?.value)}
              className={`form-input ${validationErrors?.title ? 'border-error focus:ring-error' : ''}`}
              required
              maxLength={100}
            />
            {validationErrors?.title && (
              <div className="form-error">{validationErrors?.title}</div>
            )}
            <div className="form-description">
              {titleMode === 'incremental' ? 'This will be used as base for incremental naming' :
              titleMode === 'individual' ? 'Unique title for this specific file' :
              'The main title of your audio or video file (defaults to filename without extension)'}
            </div>
          </div>

          {/* Artist Field */}
          <div>
            <label className="form-label">
              Artist <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="Artist name"
              value={formData?.artist || ''}
              onChange={(e) => handleInputChange('artist', e?.target?.value)}
              className={`form-input ${validationErrors?.artist ? 'border-error focus:ring-error' : ''}`}
              required
              maxLength={100}
            />
            {validationErrors?.artist && (
              <div className="form-error">{validationErrors?.artist}</div>
            )}
            <div className="form-description">Primary artist or creator (defaults to UG Production)</div>
          </div>

          {/* Album Field - Enhanced to prevent "Not set" */}
          <div>
            <label className="form-label">Album</label>
            <input
              type="text"
              placeholder="Album or collection name (optional)"
              value={formData?.album === 'Not set' ? '' : (formData?.album || '')}
              onChange={(e) => handleInputChange('album', e?.target?.value)}
              className={`form-input ${validationErrors?.album ? 'border-error focus:ring-error' : ''}`}
              maxLength={100}
            />
            {validationErrors?.album && (
              <div className="form-error">{validationErrors?.album}</div>
            )}
            <div className="form-description">Album, EP, or collection name (leave empty if not applicable)</div>
          </div>

          {/* Year Field */}
          <div>
            <label className="form-label">Year</label>
            <input
              type="number"
              placeholder="Release year"
              value={formData?.year || ''}
              onChange={(e) => handleInputChange('year', e?.target?.value)}
              className={`form-input ${validationErrors?.year ? 'border-error focus:ring-error' : ''}`}
              min={1900}
              max={new Date()?.getFullYear() + 10}
            />
            {validationErrors?.year && (
              <div className="form-error">{validationErrors?.year}</div>
            )}
            <div className="form-description">Year of creation or release (defaults to current year)</div>
          </div>

          {/* Comments Field */}
          <div className="md:col-span-2">
            <label className="form-label">Comments</label>
            <input
              type="text"
              placeholder="Additional notes or comments (optional)"
              value={formData?.comments || ''}
              onChange={(e) => handleInputChange('comments', e?.target?.value)}
              className={`form-input ${validationErrors?.comments ? 'border-error focus:ring-error' : ''}`}
              maxLength={500}
            />
            {validationErrors?.comments && (
              <div className="form-error">{validationErrors?.comments}</div>
            )}
            <div className="form-description">Optional comments or additional information</div>
          </div>
        </div>

        {/* Character Counts and Validation Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Title</div>
            <div className={`text-sm font-medium ${
              (formData?.title?.length || 0) > 80 ? 'text-warning' : 'text-muted-foreground'
            }`}>
              {formData?.title?.length || 0}/100
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Artist</div>
            <div className={`text-sm font-medium ${
              (formData?.artist?.length || 0) > 80 ? 'text-warning' : 'text-muted-foreground'
            }`}>
              {formData?.artist?.length || 0}/100
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Album</div>
            <div className={`text-sm font-medium ${
              (formData?.album?.length || 0) > 80 ? 'text-warning' : 'text-muted-foreground'
            }`}>
              {formData?.album?.length || 0}/100
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Comments</div>
            <div className={`text-sm font-medium ${
              (formData?.comments?.length || 0) > 400 ? 'text-warning' : 'text-muted-foreground'
            }`}>
              {formData?.comments?.length || 0}/500
            </div>
          </div>
        </div>

        {/* Enhanced metadata persistence notice */}
        <div className="p-3 bg-info/5 border border-info/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-info mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-info mb-1">💾 Metadata Persistence</div>
              <div className="text-info/80 text-xs">
                • Changes are automatically saved to localStorage<br/>
                • Album field will not show "Not set" when properly filled<br/>
                • Title defaults to filename without extension<br/>
                • Use "Reset" to restore defaults or "Sample Data" for examples
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataForm;