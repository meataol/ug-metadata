import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const QualitySettings = ({ 
  settings = {},
  onSettingsChange,
  onReset,
  isProcessing = false
}) => {
  const qualityOptions = [
    { value: 'high', label: 'High Quality (1200x1200)', description: 'Best quality, larger file size' },
    { value: 'medium', label: 'Medium Quality (800x800)', description: 'Balanced quality and size' },
    { value: 'low', label: 'Low Quality (500x500)', description: 'Smaller size, reduced quality' },
    { value: 'original', label: 'Keep Original Size', description: 'No resizing applied' }
  ];

  const formatOptions = [
    { value: 'auto', label: 'Auto (Recommended)', description: 'Best format for each file type' },
    { value: 'jpeg', label: 'JPEG', description: 'Smaller size, good for photos' },
    { value: 'png', label: 'PNG', description: 'Lossless, larger size' }
  ];

  const compressionOptions = [
    { value: 95, label: 'Maximum (95%)', description: 'Highest quality' },
    { value: 85, label: 'High (85%)', description: 'Recommended for most files' },
    { value: 75, label: 'Medium (75%)', description: 'Good balance' },
    { value: 60, label: 'Low (60%)', description: 'Smaller file size' }
  ];

  const handleSettingChange = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const defaultSettings = {
    quality: 'medium',
    format: 'auto',
    compression: 85,
    autoResize: true,
    maintainAspectRatio: true,
    embedInFile: true,
    createBackup: false
  };

  const currentSettings = { ...defaultSettings, ...settings };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Settings" size={20} className="text-primary" />
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Quality Settings
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={isProcessing}
            iconName="RotateCcw"
            iconSize={14}
          >
            Reset
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Configure image quality and processing options for cover art embedding
        </p>
      </div>
      {/* Settings Form */}
      <div className="p-4 space-y-6">
        {/* Image Quality */}
        <div className="space-y-3">
          <Select
            label="Image Resolution"
            description="Choose the target resolution for embedded artwork"
            options={qualityOptions}
            value={currentSettings?.quality}
            onChange={(value) => handleSettingChange('quality', value)}
            disabled={isProcessing}
          />
        </div>

        {/* Format Selection */}
        <div className="space-y-3">
          <Select
            label="Image Format"
            description="Select the format for embedded images"
            options={formatOptions}
            value={currentSettings?.format}
            onChange={(value) => handleSettingChange('format', value)}
            disabled={isProcessing}
          />
        </div>

        {/* Compression Level */}
        <div className="space-y-3">
          <Select
            label="Compression Level"
            description="Balance between quality and file size"
            options={compressionOptions}
            value={currentSettings?.compression}
            onChange={(value) => handleSettingChange('compression', value)}
            disabled={isProcessing}
          />
        </div>

        {/* Processing Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Processing Options</h4>
          
          <div className="space-y-3">
            <Checkbox
              label="Auto-resize images"
              description="Automatically resize images to match quality setting"
              checked={currentSettings?.autoResize}
              onChange={(e) => handleSettingChange('autoResize', e?.target?.checked)}
              disabled={isProcessing}
            />

            <Checkbox
              label="Maintain aspect ratio"
              description="Keep original proportions when resizing"
              checked={currentSettings?.maintainAspectRatio}
              onChange={(e) => handleSettingChange('maintainAspectRatio', e?.target?.checked)}
              disabled={isProcessing || !currentSettings?.autoResize}
            />

            <Checkbox
              label="Embed in file metadata"
              description="Add cover art directly to file metadata"
              checked={currentSettings?.embedInFile}
              onChange={(e) => handleSettingChange('embedInFile', e?.target?.checked)}
              disabled={isProcessing}
            />

            <Checkbox
              label="Create backup files"
              description="Keep original files before applying changes"
              checked={currentSettings?.createBackup}
              onChange={(e) => handleSettingChange('createBackup', e?.target?.checked)}
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Preview Info */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <div className="font-medium text-foreground mb-1">Current Settings Preview:</div>
              <ul className="space-y-1 text-xs">
                <li>• Resolution: {qualityOptions?.find(q => q?.value === currentSettings?.quality)?.label}</li>
                <li>• Format: {formatOptions?.find(f => f?.value === currentSettings?.format)?.label}</li>
                <li>• Compression: {currentSettings?.compression}%</li>
                <li>• Auto-resize: {currentSettings?.autoResize ? 'Enabled' : 'Disabled'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Estimated Impact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <div className="text-success mb-1">
              <Icon name="Zap" size={16} />
            </div>
            <div className="text-xs font-medium text-success">Processing Speed</div>
            <div className="text-xs text-muted-foreground">
              {currentSettings?.quality === 'low' ? 'Fast' : 
               currentSettings?.quality === 'high' ? 'Slower' : 'Medium'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-warning/10 rounded-lg">
            <div className="text-warning mb-1">
              <Icon name="HardDrive" size={16} />
            </div>
            <div className="text-xs font-medium text-warning">File Size Impact</div>
            <div className="text-xs text-muted-foreground">
              {currentSettings?.quality === 'high' ? '+Large' : 
               currentSettings?.quality === 'low' ? '+Small' : '+Medium'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-primary mb-1">
              <Icon name="Eye" size={16} />
            </div>
            <div className="text-xs font-medium text-primary">Visual Quality</div>
            <div className="text-xs text-muted-foreground">
              {currentSettings?.quality === 'high' ? 'Excellent' : 
               currentSettings?.quality === 'low' ? 'Good' : 'Very Good'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualitySettings;