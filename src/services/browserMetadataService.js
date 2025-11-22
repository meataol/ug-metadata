/**
 * Browser-Based Metadata Service
 * 
 * Uses client-side JavaScript libraries to read and write audio metadata
 * - music-metadata-browser: Read metadata from various formats
 * - browser-id3-writer: Write ID3v2 tags to MP3 files
 */

import * as mm from 'music-metadata-browser';
import { ID3Writer } from 'browser-id3-writer';

/**
 * Read metadata from an audio file
 * @param {File} file - The audio file to read
 * @returns {Promise<Object>} Metadata object
 */
export async function readMetadata(file) {
  try {
    const metadata = await mm.parseBlob(file);
    
    const common = metadata.common || {};
    const format = metadata.format || {};
    
    // Extract cover art if available
    let coverArt = null;
    if (common.picture && common.picture.length > 0) {
      const picture = common.picture[0];
      const blob = new Blob([picture.data], { type: picture.format });
      coverArt = {
        data: picture.data,
        format: picture.format,
        description: picture.description,
        type: picture.type,
        url: URL.createObjectURL(blob)
      };
    }
    
    return {
      title: common.title || '',
      artist: common.artist || '',
      album: common.album || '',
      year: common.year || '',
      genre: common.genre ? common.genre.join(', ') : '',
      comment: common.comment ? common.comment.join(', ') : '',
      track: common.track?.no || '',
      albumArtist: common.albumartist || '',
      composer: common.composer ? common.composer.join(', ') : '',
      coverArt: coverArt,
      duration: format.duration || 0,
      bitrate: format.bitrate || 0,
      sampleRate: format.sampleRate || 0,
      codec: format.codec || '',
      container: format.container || ''
    };
  } catch (error) {
    console.error('Error reading metadata:', error);
    throw new Error(`Failed to read metadata: ${error.message}`);
  }
}

/**
 * Manually strip ALL ID3v2 tags and extract pure MP3 audio data
 * This ensures old cover art and metadata are completely removed
 */
function stripAllID3Tags(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  let offset = 0;
  
  // Keep stripping ID3v2 tags until we find the audio data
  while (offset < data.length - 10) {
    // Check for ID3v2 header ("ID3")
    if (data[offset] === 0x49 && data[offset + 1] === 0x44 && data[offset + 2] === 0x33) {
      // ID3v2 tag found
      const version = data[offset + 3];
      if (version < 2 || version > 4) break; // Invalid version
      
      // Calculate tag size (synchsafe integer)
      const size = ((data[offset + 6] & 0x7F) << 21) |
                   ((data[offset + 7] & 0x7F) << 14) |
                   ((data[offset + 8] & 0x7F) << 7) |
                   (data[offset + 9] & 0x7F);
      
      // Skip the tag (header + size)
      offset += 10 + size;
      console.log(`🗑️ Stripped ID3v2.${version} tag (${size} bytes)`);
    } else {
      // No more ID3 tags, this is the audio data
      break;
    }
  }
  
  // Return pure audio data
  const audioData = data.subarray(offset);
  console.log(`✅ Extracted pure audio data: ${audioData.length} bytes (stripped ${offset} bytes of ID3 tags)`);
  return audioData.buffer;
}

/**
 * Write metadata to MP3 file using browser-id3-writer
 * @param {File} file - The MP3 file to process
 * @param {Object} metadata - Metadata to write
 * @param {Object} options - Additional options (e.g., coverArt)
 * @returns {Promise<Blob>} - The processed MP3 file as a Blob
 */
export async function writeMP3Metadata(file, metadata, options = {}) {
  try {
    // Read the original file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Manually strip ALL ID3 tags to get pure audio data
    const pureAudioData = stripAllID3Tags(arrayBuffer);
    
    // Create ID3 writer with PURE audio data (no old tags)
    const writer = new ID3Writer(pureAudioData);
    console.log('✅ Created ID3Writer with pure audio data (all old tags removed)');
    
    // Set text frames
    if (metadata.title) {
      writer.setFrame('TIT2', metadata.title);
    }
    if (metadata.artist) {
      writer.setFrame('TPE1', [metadata.artist]);
    }
    if (metadata.album) {
      writer.setFrame('TALB', metadata.album);
    }
    if (metadata.year) {
      writer.setFrame('TYER', parseInt(metadata.year));
    }
    if (metadata.genre) {
      writer.setFrame('TCON', [metadata.genre]);
    }
    if (metadata.comment) {
      writer.setFrame('COMM', {
        description: '',
        text: metadata.comment
      });
    }
    if (metadata.track) {
      writer.setFrame('TRCK', metadata.track.toString());
    }
    if (metadata.albumArtist) {
      writer.setFrame('TPE2', metadata.albumArtist);
    }
    if (metadata.composer) {
      writer.setFrame('TCOM', [metadata.composer]);
    }
    
    // Set cover art if provided
    if (options.coverArt) {
      console.log('🇮🇩 writeMP3Metadata: Cover art provided, processing...');
      const coverData = await getCoverArtData(options.coverArt);
      if (coverData) {
        console.log('✅ Cover data obtained, setting APIC frame...');
        console.log('🇮🇩 Cover data size:', coverData.data.length, 'bytes');
        console.log('🇮🇩 Cover type:', coverData.type);
        writer.setFrame('APIC', {
          type: 3, // Front cover
          data: coverData.data,
          description: coverData.description || 'Cover'
        });
        console.log('✅ APIC frame set successfully!');
      } else {
        console.warn('⚠️ Cover data is null, APIC frame not set');
      }
    } else {
      console.log('🗑️ No cover art provided, APIC frame will not be set');
    }
    
    // Add padding for future edits
    writer.addTag();
    
    // Get the modified file as ArrayBuffer
    const taggedBuffer = writer.arrayBuffer;
    
    // Create a Blob from the ArrayBuffer
    const blob = new Blob([taggedBuffer], { type: 'audio/mpeg' });
    
    return blob;
  } catch (error) {
    console.error('Error writing metadata:', error);
    throw new Error(`Failed to write metadata: ${error.message}`);
  }
}

/**
 * Get cover art data from various sources
 * @param {File|Blob|Object|String} coverArt - Cover art source
 * @returns {Promise<Object>} Cover art data
 */
async function getCoverArtData(coverArt) {
  try {
    console.log('🇮🇩 getCoverArtData: Processing cover art...');
    console.log('🇮🇩 Cover art type:', typeof coverArt);
    
    // If it's already an object with data property
    if (coverArt.data && coverArt.data instanceof Uint8Array) {
      console.log('✅ Cover art is already Uint8Array object');
      return coverArt;
    }
    
    // If it's a File or Blob
    if (coverArt instanceof File || coverArt instanceof Blob) {
      console.log('✅ Cover art is File or Blob');
      const arrayBuffer = await coverArt.arrayBuffer();
      return {
        data: new Uint8Array(arrayBuffer),
        description: coverArt.name || 'Cover',
        type: coverArt.type
      };
    }
    
    // If it's a base64 string
    if (typeof coverArt === 'string' && coverArt.startsWith('data:')) {
      console.log('✅ Cover art is Data URL (base64)');
      console.log('🇮🇩 Data URL prefix:', coverArt.substring(0, 50));
      const base64Data = coverArt.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log('✅ Converted to Uint8Array, size:', bytes.length, 'bytes');
      return {
        data: bytes,
        description: 'Cover',
        type: coverArt.match(/data:([^;]+);/)[1]
      };
    }
    
    // If it's a URL
    if (typeof coverArt === 'string' && (coverArt.startsWith('http') || coverArt.startsWith('blob:'))) {
      const response = await fetch(coverArt);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      return {
        data: new Uint8Array(arrayBuffer),
        description: 'Cover',
        type: blob.type
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error processing cover art:', error);
    return null;
  }
}

/**
 * Download a file to the user's device
 * @param {Blob} blob - The file blob to download
 * @param {String} filename - The filename for the download
 */
export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate a filename based on metadata
 * @param {Object} metadata - Metadata object
 * @param {String} originalFilename - Original filename
 * @param {String} template - Filename template
 * @returns {String} Generated filename
 */
export function generateFilename(metadata, originalFilename, template = 'title-artist') {
  const ext = originalFilename.split('.').pop();
  
  switch (template) {
    case 'title-artist':
      return `${metadata.title || 'Untitled'} - ${metadata.artist || 'Unknown'}.${ext}`;
    case 'artist-title':
      return `${metadata.artist || 'Unknown'} - ${metadata.title || 'Untitled'}.${ext}`;
    case 'title':
      return `${metadata.title || 'Untitled'}.${ext}`;
    case 'original':
    default:
      return originalFilename;
  }
}

/**
 * Check if a file format is supported for writing
 * @param {String} filename - The filename to check
 * @returns {Object} Support information
 */
export function checkFormatSupport(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  const support = {
    mp3: { read: true, write: true, name: 'MP3' },
    m4a: { read: true, write: false, name: 'M4A' },
    mp4: { read: true, write: false, name: 'MP4' },
    flac: { read: true, write: false, name: 'FLAC' },
    wav: { read: true, write: false, name: 'WAV' },
    ogg: { read: true, write: false, name: 'OGG' }
  };
  
  return support[ext] || { read: false, write: false, name: ext.toUpperCase() };
}

/**
 * Batch process multiple files
 * @param {Array<File>} files - Array of files to process
 * @param {Object} metadata - Metadata to apply
 * @param {Object} options - Processing options
 * @param {Function} progressCallback - Progress callback function
 * @returns {Promise<Array>} Array of processed file results
 */
export async function batchProcessFiles(files, metadata, options = {}, progressCallback = null) {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progress = {
      current: i + 1,
      total: files.length,
      filename: file.name,
      status: 'processing'
    };
    
    try {
      if (progressCallback) {
        progressCallback({ ...progress, status: 'reading' });
      }
      
      // Check format support
      const support = checkFormatSupport(file.name);
      
      if (!support.write) {
        results.push({
          file: file,
          success: false,
          error: `${support.name} format is read-only in browser. Only MP3 files can be modified.`,
          originalMetadata: support.read ? await readMetadata(file) : null
        });
        
        if (progressCallback) {
          progressCallback({ ...progress, status: 'skipped' });
        }
        continue;
      }
      
      // Read original metadata
      const originalMetadata = await readMetadata(file);
      
      if (progressCallback) {
        progressCallback({ ...progress, status: 'writing' });
      }
      
      // Merge metadata (use individual file metadata if provided)
      const fileMetadata = options.individualMetadata?.[file.name] || metadata;
      const mergedMetadata = {
        ...originalMetadata,
        ...fileMetadata
      };
      
      // Write new metadata
      const modifiedBlob = await writeMP3Metadata(file, mergedMetadata, options);
      
      // Generate filename
      const newFilename = generateFilename(
        mergedMetadata,
        file.name,
        options.filenameTemplate || 'original'
      );
      
      results.push({
        file: file,
        success: true,
        originalMetadata: originalMetadata,
        newMetadata: mergedMetadata,
        modifiedBlob: modifiedBlob,
        newFilename: newFilename
      });
      
      if (progressCallback) {
        progressCallback({ ...progress, status: 'completed' });
      }
      
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      results.push({
        file: file,
        success: false,
        error: error.message
      });
      
      if (progressCallback) {
        progressCallback({ ...progress, status: 'error', error: error.message });
      }
    }
  }
  
  return results;
}

/**
 * Download all processed files as a ZIP archive
 * @param {Array} results - Array of processing results
 * @param {String} zipFilename - Name for the ZIP file
 */
export async function downloadAsZip(results, zipFilename = 'processed-files.zip') {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Add successful files to ZIP
    const successfulResults = results.filter(r => r.success && r.modifiedBlob);
    
    for (const result of successfulResults) {
      zip.file(result.newFilename, result.modifiedBlob);
    }
    
    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Download ZIP
    downloadFile(zipBlob, zipFilename);
    
    return true;
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    throw new Error(`Failed to create ZIP: ${error.message}`);
  }
}
