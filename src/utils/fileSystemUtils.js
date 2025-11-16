// File system utilities for handling file paths and directory operations
export const fileSystemUtils = {
  // Get user's home directory based on OS (browser-compatible)
  getUserHomeDirectory: () => {
    const platform = navigator?.userAgentData?.platform || navigator?.platform;
    const userAgent = navigator?.userAgent;
    
    // Detect OS and provide appropriate home directory suggestions
    if (platform?.toLowerCase()?.includes('win') || userAgent?.includes('Windows')) {
      return 'C:\\Users\\User';
    } else if (platform?.toLowerCase()?.includes('mac') || userAgent?.includes('Mac')) {
      return '/Users/user';
    } else {
      return '/home/user';
    }
  },

  // Get default processed files directory (browser-compatible)
  getDefaultProcessedDirectory: () => {
    const homeDir = fileSystemUtils?.getUserHomeDirectory();
    const platform = navigator?.userAgentData?.platform || navigator?.platform;
    
    if (platform?.toLowerCase()?.includes('win') || navigator?.userAgent?.includes('Windows')) {
      return `${homeDir}\\Documents\\UG_Metadata_Manager`;
    } else {
      return `${homeDir}/Documents/UG_Metadata_Manager`;
    }
  },

  // Enhanced folder creation instructions
  createDefaultFolderInstructions: () => {
    const defaultPath = fileSystemUtils?.getDefaultProcessedDirectory();
    const platform = navigator?.userAgentData?.platform || navigator?.platform;
    
    let instructions = '';
    
    if (platform?.toLowerCase()?.includes('win') || navigator?.userAgent?.includes('Windows')) {
      instructions = `📁 Creating UG Metadata Manager Folder\n\n` +
        `WINDOWS INSTRUCTIONS:\n` +
        `1. Open File Explorer (Windows + E)\n` +
        `2. Navigate to: ${fileSystemUtils?.getUserHomeDirectory()}\\Documents\n` +
        `3. Right-click in empty space → New → Folder\n` +
        `4. Name the folder: UG_Metadata_Manager\n` +
        `5. Press Enter to create\n\n` +
        `Full path will be: ${defaultPath}\n\n` +
        `This folder will store your processed audio files.`;
    } else {
      instructions = `📁 Creating UG Metadata Manager Folder\n\n` +
        `MAC/LINUX INSTRUCTIONS:\n` +
        `1. Open Finder/File Manager\n` +
        `2. Navigate to: ${fileSystemUtils?.getUserHomeDirectory()}/Documents\n` +
        `3. Right-click → New Folder\n` +
        `4. Name the folder: UG_Metadata_Manager\n` +
        `5. Press Enter to create\n\n` +
        `Full path will be: ${defaultPath}\n\n` +
        `This folder will store your processed audio files.`;
    }
    
    return instructions;
  },

  // Format file path for display
  formatPathForDisplay: (filePath) => {
    if (!filePath) return 'Not specified';
    
    // Truncate long paths for display
    if (filePath?.length > 50) {
      const parts = filePath?.split(/[/\\]/);
      if (parts?.length > 3) {
        return `.../${parts?.slice(-3)?.join('/')}`;
      }
    }
    return filePath;
  },

  // Get directory from file path
  getDirectoryFromPath: (filePath) => {
    if (!filePath) return '';
    
    const lastSlash = Math.max(filePath?.lastIndexOf('/'), filePath?.lastIndexOf('\\'));
    return lastSlash > 0 ? filePath?.substring(0, lastSlash) : filePath;
  },

  // Get filename from file path
  getFilenameFromPath: (filePath) => {
    if (!filePath) return '';
    
    const lastSlash = Math.max(filePath?.lastIndexOf('/'), filePath?.lastIndexOf('\\'));
    return lastSlash >= 0 ? filePath?.substring(lastSlash + 1) : filePath;
  },

  // Check if path exists (browser limitation - returns promise for UI feedback)
  checkPathExists: async (filePath) => {
    // In browser environment, we can't actually check file system
    // This is a UI helper that simulates the check
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate path checking - in real app this would be handled by Electron or native layer
        const isLikelyValid = filePath && filePath?.length > 0 && !filePath?.includes('undefined');
        resolve(isLikelyValid);
      }, 100);
    });
  },

  // Open file location (browser-safe implementation)
  openFileLocation: (filePath) => {
    if (!filePath) {
      // If no path provided, show folder creation instructions
      alert(fileSystemUtils?.createDefaultFolderInstructions());
      return;
    }

    // In browser environment, we can't directly open file system locations
    // Provide user feedback and instructions
    const directory = fileSystemUtils?.getDirectoryFromPath(filePath);
    
    // Copy path to clipboard if possible
    if (navigator?.clipboard) {
      navigator?.clipboard?.writeText(directory)?.then(() => {
        alert(`📁 Folder Navigation Instructions\n\n` + 
          `Path copied to clipboard: ${directory}\n\n` +
          `TO NAVIGATE:\n` +
          `1. Open your file manager (File Explorer/Finder)\n` +
          `2. Paste the path in the address bar (Ctrl+V or Cmd+V)\n` +
          `3. Press Enter to navigate to the folder\n\n` +
          `If the folder doesn't exist, you'll need to create it first.\n` +
          `See the folder creation instructions above.`);
      })?.catch(() => {
        alert(`📁 Folder Navigation Instructions\n\n` +
          `Path: ${directory}\n\n` +
          `TO NAVIGATE:\n` +
          `1. Open your file manager\n` +
          `2. Copy and paste this path in the address bar\n` +
          `3. Press Enter to navigate to the folder\n\n` +
          `If the folder doesn't exist, create it in Documents folder.`);
      });
    } else {
      // Fallback for older browsers
      alert(`📁 Folder Navigation Instructions\n\n` +
        `Path: ${directory}\n\n` +
        `TO NAVIGATE:\n` +
        `1. Open your file manager\n` +
        `2. Copy and paste this path in the address bar\n` +
        `3. Press Enter to navigate to the folder\n\n` +
        `If the folder doesn't exist, create it in Documents folder.`);
    }
  },

  // Show file in directory with instructions
  showFileInDirectory: (filePath) => {
    if (!filePath) {
      alert('File path is not available');
      return;
    }

    const filename = fileSystemUtils?.getFilenameFromPath(filePath);
    const directory = fileSystemUtils?.getDirectoryFromPath(filePath);
    
    if (navigator?.clipboard) {
      navigator?.clipboard?.writeText(filePath)?.then(() => {
        alert(`File path copied to clipboard:\n${filePath}\n\nTo locate "${filename}":\n1. Open your file manager\n2. Paste the path in the address bar\n3. Press Enter to navigate to the file`);
      })?.catch(() => {
        alert(`File location:\n${filePath}\n\nTo locate "${filename}":\n1. Open your file manager\n2. Navigate to: ${directory}\n3. Look for the file: ${filename}`);
      });
    } else {
      alert(`File location:\n${filePath}\n\nTo locate "${filename}":\n1. Open your file manager\n2. Navigate to: ${directory}\n3. Look for the file: ${filename}`);
    }
  },

  // Generate safe file paths
  generateSafeFilePath: (originalPath, filename) => {
    const baseDir = fileSystemUtils?.getDefaultProcessedDirectory();
    const safeFilename = filename?.replace(/[<>:"/\\|?*]/g, '_'); // Remove invalid characters
    
    const platform = navigator?.userAgentData?.platform || navigator?.platform;
    const separator = (platform?.toLowerCase()?.includes('win') || navigator?.userAgent?.includes('Windows')) ? '\\' : '/';
    
    return `${baseDir}${separator}${safeFilename}`;
  },

  // Validate file path format
  isValidPath: (filePath) => {
    if (!filePath || typeof filePath !== 'string') return false;
    
    // Basic validation - check for invalid characters and structure
    const invalidChars = /[<>"|?*]/;
    const hasInvalidChars = invalidChars?.test(filePath);
    const hasValidStructure = filePath?.length > 0 && filePath?.includes('/') || filePath?.includes('\\');
    
    return !hasInvalidChars && hasValidStructure;
  }
};

export default fileSystemUtils;