/**
 * Global File Store
 * 
 * Browser File objects cannot be serialized to localStorage/sessionStorage.
 * This utility stores File objects in memory using the window object,
 * making them accessible across different pages/components.
 */

// Initialize global store on window object
if (typeof window !== 'undefined' && !window.__UG_FILE_STORE__) {
  window.__UG_FILE_STORE__ = {
    files: new Map(), // Map of fileId -> File object
    metadata: new Map(), // Map of fileId -> metadata object
    coverArt: null, // Cover art data
    initialized: Date.now()
  };
  console.log('✅ Global file store initialized');
}

/**
 * Store a file with its metadata
 * @param {string} fileId - Unique file identifier
 * @param {File} fileObject - The actual File object
 * @param {Object} metadata - File metadata
 */
export function storeFile(fileId, fileObject, metadata = {}) {
  if (typeof window === 'undefined') return;
  
  try {
    window.__UG_FILE_STORE__.files.set(fileId, fileObject);
    window.__UG_FILE_STORE__.metadata.set(fileId, {
      ...metadata,
      id: fileId,
      storedAt: Date.now()
    });
    
    console.log(`📦 Stored file: ${fileId} (${fileObject.name})`);
    return true;
  } catch (error) {
    console.error('Error storing file:', error);
    return false;
  }
}

/**
 * Store multiple files at once
 * @param {Array} filesData - Array of {fileId, fileObject, metadata}
 */
export function storeFiles(filesData) {
  if (typeof window === 'undefined') return;
  
  let successCount = 0;
  filesData.forEach(({ fileId, fileObject, metadata }) => {
    if (storeFile(fileId, fileObject, metadata)) {
      successCount++;
    }
  });
  
  console.log(`📦 Stored ${successCount}/${filesData.length} files`);
  return successCount;
}

/**
 * Get a file by ID
 * @param {string} fileId - File identifier
 * @returns {File|null} The File object or null
 */
export function getFile(fileId) {
  if (typeof window === 'undefined') return null;
  
  const file = window.__UG_FILE_STORE__.files.get(fileId);
  if (!file) {
    console.warn(`⚠️ File not found in store: ${fileId}`);
  }
  return file || null;
}

/**
 * Get file metadata by ID
 * @param {string} fileId - File identifier
 * @returns {Object|null} The metadata object or null
 */
export function getFileMetadata(fileId) {
  if (typeof window === 'undefined') return null;
  
  return window.__UG_FILE_STORE__.metadata.get(fileId) || null;
}

/**
 * Get all files
 * @returns {Array} Array of {fileId, fileObject, metadata}
 */
export function getAllFiles() {
  if (typeof window === 'undefined') return [];
  
  const result = [];
  window.__UG_FILE_STORE__.files.forEach((fileObject, fileId) => {
    const metadata = window.__UG_FILE_STORE__.metadata.get(fileId);
    result.push({
      fileId,
      fileObject,
      metadata
    });
  });
  
  console.log(`📋 Retrieved ${result.length} files from store`);
  return result;
}

/**
 * Get all file IDs
 * @returns {Array} Array of file IDs
 */
export function getAllFileIds() {
  if (typeof window === 'undefined') return [];
  
  return Array.from(window.__UG_FILE_STORE__.files.keys());
}

/**
 * Check if a file exists in store
 * @param {string} fileId - File identifier
 * @returns {boolean}
 */
export function hasFile(fileId) {
  if (typeof window === 'undefined') return false;
  
  return window.__UG_FILE_STORE__.files.has(fileId);
}

/**
 * Remove a file from store
 * @param {string} fileId - File identifier
 */
export function removeFile(fileId) {
  if (typeof window === 'undefined') return;
  
  window.__UG_FILE_STORE__.files.delete(fileId);
  window.__UG_FILE_STORE__.metadata.delete(fileId);
  console.log(`🗑️ Removed file: ${fileId}`);
}

/**
 * Clear all files from store
 */
export function clearAllFiles() {
  if (typeof window === 'undefined') return;
  
  const count = window.__UG_FILE_STORE__.files.size;
  window.__UG_FILE_STORE__.files.clear();
  window.__UG_FILE_STORE__.metadata.clear();
  window.__UG_FILE_STORE__.coverArt = null;
  
  console.log(`🗑️ Cleared ${count} files from store`);
}

/**
 * Store cover art data
 * @param {Object} coverArtData - Cover art data (base64, blob, etc.)
 */
export function storeCoverArt(coverArtData) {
  if (typeof window === 'undefined') return;
  
  window.__UG_FILE_STORE__.coverArt = coverArtData;
  console.log('🖼️ Stored cover art data');
}

/**
 * Get cover art data
 * @returns {Object|null}
 */
export function getCoverArt() {
  if (typeof window === 'undefined') return null;
  
  return window.__UG_FILE_STORE__.coverArt;
}

/**
 * Get store statistics
 * @returns {Object} Store stats
 */
export function getStoreStats() {
  if (typeof window === 'undefined') {
    return { fileCount: 0, metadataCount: 0, hasCoverArt: false };
  }
  
  return {
    fileCount: window.__UG_FILE_STORE__.files.size,
    metadataCount: window.__UG_FILE_STORE__.metadata.size,
    hasCoverArt: !!window.__UG_FILE_STORE__.coverArt,
    initialized: window.__UG_FILE_STORE__.initialized
  };
}

/**
 * Debug: Log store contents
 */
export function debugStore() {
  if (typeof window === 'undefined') {
    console.log('Store not available (not in browser)');
    return;
  }
  
  const stats = getStoreStats();
  console.log('📊 File Store Debug:', stats);
  console.log('Files:', Array.from(window.__UG_FILE_STORE__.files.keys()));
  console.log('Metadata:', Array.from(window.__UG_FILE_STORE__.metadata.entries()));
  console.log('Cover Art:', window.__UG_FILE_STORE__.coverArt ? 'Present' : 'None');
}

// Export default object with all functions
export default {
  storeFile,
  storeFiles,
  getFile,
  getFileMetadata,
  getAllFiles,
  getAllFileIds,
  hasFile,
  removeFile,
  clearAllFiles,
  storeCoverArt,
  getCoverArt,
  getStoreStats,
  debugStore
};
