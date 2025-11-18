import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showGuide, setShowGuide] = useState(false);

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleShowGuide = () => {
    setShowGuide(true);
  };

  const getPageTitle = () => {
    switch (location?.pathname) {
      case '/': case'/file-selection':
        return 'File Selection';
      case '/metadata-entry':
        return 'Metadata Entry';
      case '/cover-art-management':
        return 'Cover Art Management';
      case '/file-processing':
        return 'File Processing';
      case '/processing-summary':
        return 'Processing Summary';
      default:
        return 'UG Metadata Manager';
    }
  };

  return (
    <>
      {/* Non-sticky header to fix scrolling issues */}
      <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleHomeClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="text-primary">
                <Icon name="Music" size={32} />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-foreground">
                  UG Metadata Manager
                </h1>
                <div className="text-xs text-muted-foreground">
                  {getPageTitle()}
                </div>
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Guide Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowGuide}
              iconName="HelpCircle"
              iconPosition="left"
              iconSize={16}
            >
              Quick Guide
            </Button>

            {/* Home Button (when not on home) */}
            {location?.pathname !== '/' && location?.pathname !== '/file-selection' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleHomeClick}
                iconName="Home"
                iconPosition="left"
                iconSize={16}
              >
                Home
              </Button>
            )}
          </div>
        </div>
      </header>
      {/* Quick Guide Modal - Enhanced */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-elevated max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-primary">
                  <Icon name="BookOpen" size={24} />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  UG Metadata Manager - User Guide
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGuide(false)}
                iconName="X"
                iconSize={16}
              />
            </div>
            
            <div className="space-y-6">
              {/* Overview */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                  <Icon name="Info" size={16} className="mr-2 text-primary" />
                  What This App Does
                </h4>
                <p className="text-sm text-muted-foreground">
                  UG Metadata Manager helps you batch process audio and video files by updating their metadata tags. 
                  All processing happens locally on your device - no files are uploaded to external servers.
                </p>
              </div>

              {/* Step by Step */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="List" size={16} className="mr-2 text-primary" />
                  Step-by-Step Process
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <div className="font-medium text-foreground">File Selection</div>
                      <div className="text-xs text-muted-foreground">Select audio/video files or drag & drop them. View current metadata for each file.</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <div className="font-medium text-foreground">Metadata Entry</div>
                      <div className="text-xs text-muted-foreground">Configure titles (single, incremental, or individual), artist, album, and other metadata fields.</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <div className="font-medium text-foreground">Cover Art</div>
                      <div className="text-xs text-muted-foreground">Add or update cover art images for your files.</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <div className="font-medium text-foreground">Processing</div>
                      <div className="text-xs text-muted-foreground">Choose save location and process all files with new metadata.</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">5</div>
                    <div>
                      <div className="font-medium text-foreground">Summary</div>
                      <div className="text-xs text-muted-foreground">Review results, export reports, or start a new batch.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="Star" size={16} className="mr-2 text-primary" />
                  Key Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <div className="text-xs text-muted-foreground">Multiple title options: single, incremental (TRACK 1, TRACK 2), or individual</div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <div className="text-xs text-muted-foreground">View current metadata before processing</div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <div className="text-xs text-muted-foreground">Choose save location: same folder or custom location</div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <div className="text-xs text-muted-foreground">"Process New Batch" to clear and start fresh</div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <div className="text-xs text-muted-foreground">Batch or individual file processing</div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <div className="text-xs text-muted-foreground">Undo functionality (when applicable)</div>
                  </div>
                </div>
              </div>

              {/* File Locations */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="Folder" size={16} className="mr-2 text-primary" />
                  File Locations
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium text-foreground mb-1">Default Processed Files Location:</div>
                    <div className="text-xs font-mono text-muted-foreground">Browser Downloads folder</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> During processing, you can choose to save files to the same folder as originals or select a custom location.
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="AlertCircle" size={16} className="mr-2 text-warning" />
                  Common Issues & Solutions
                </h4>
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="font-medium text-foreground">Process New Batch not working?</span>
                    <div className="text-muted-foreground">Use "Process New Batch" button to clear current files and start fresh, or "Clear All Files" in the sidebar.</div>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium text-foreground">Can't find processed files?</span>
                    <div className="text-muted-foreground">Check the processing summary page for exact file locations, or use the "Copy path" buttons to get folder locations.</div>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium text-foreground">UI elements not fitting properly?</span>
                    <div className="text-muted-foreground">Try refreshing the page or using full-screen mode. The app works best on desktop/tablet screens.</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border">
              <Button
                variant="default"
                onClick={() => setShowGuide(false)}
                iconName="X"
                iconPosition="left"
                iconSize={16}
                fullWidth
              >
                Close Guide
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;