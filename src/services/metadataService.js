// OpenAI import commented out to prevent errors when API key is missing
// Uncomment the line below and add VITE_OPENAI_API_KEY to .env if you want AI features
// import openai from './openaiClient';

/**
 * Extracts actual file metadata with AI enhancement when available
 * @param {File} file - The audio/video file
 * @returns {Promise<Object>} File metadata with AI suggestions or defaults
 */
export async function extractFileMetadata(file) {
  try {
    // Extract filename without extension as default title
    const defaultTitle = file?.name?.replace(/\.[^/.]+$/, '') || 'Untitled';
    
    // Get current default configuration to use as fallback
    const defaults = getDefaultMetadataConfig();
    
    // AI metadata extraction is disabled - uncomment import and this section to enable
    // ENHANCED: Try AI-powered metadata extraction first if available
    // if (import.meta.env?.VITE_OPENAI_API_KEY && 
    //     import.meta.env?.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here' &&
    //     import.meta.env?.VITE_OPENAI_API_KEY !== 'your_vite_openai_api_key' &&
    //     import.meta.env?.VITE_OPENAI_API_KEY?.length > 10) {
    //   
    //   try {
    //     console.log('🤖 Using OpenAI for intelligent metadata extraction...');
    //     
    //     // Use OpenAI to analyze filename and extract metadata intelligently
    //     const response = await openai?.chat?.completions?.create({
    //       model: 'gpt-4o-mini', // Cost-effective model for metadata analysis
    //       messages: [
    //         {
    //           role: 'system',
    //           content: 'You are a metadata extraction expert. Analyze the filename and extract likely metadata. Return ONLY a JSON object with title, artist, album, year, and genre fields. If information cannot be determined from filename, leave fields empty strings. Focus on extracting information that might be encoded in common filename patterns like "Artist - Title", "Title (Year)", "[Genre] Artist - Title", etc.'
    //         },
    //         {
    //           role: 'user',
    //           content: `Extract metadata from this filename: "${file?.name}"`
    //         }
    //       ],
    //       response_format: {
    //         type: 'json_schema',
    //         json_schema: {
    //           name: 'metadata_extraction',
    //           schema: {
    //             type: 'object',
    //             properties: {
    //               title: { type: 'string' },
    //               artist: { type: 'string' },
    //               album: { type: 'string' },
    //               year: { type: 'string' },
    //               genre: { type: 'string' }
    //             },
    //             required: ['title', 'artist', 'album', 'year', 'genre'],
    //             additionalProperties: false
    //           }
    //         }
    //       }
    //     });
    //
    //     const aiSuggestions = JSON.parse(response?.choices?.[0]?.message?.content);
    //     
    //     console.log('✅ AI metadata extraction successful:', aiSuggestions);
    //     
    //     // FIXED: Merge AI suggestions with defaults properly
    //     return {
    //       title: aiSuggestions?.title || defaultTitle,
    //       artist: aiSuggestions?.artist || defaults?.artist || '',
    //       album: aiSuggestions?.album || defaults?.album || '',
    //       year: aiSuggestions?.year || defaults?.year || new Date()?.getFullYear()?.toString(),
    //       genre: aiSuggestions?.genre || defaults?.genre || '',
    //       extractedBy: 'ai',
    //       aiSuggestions: true
    //     };
    //
    //   } catch (aiError) {
    //     console.warn('🚫 AI metadata extraction failed:', aiError?.message);
    //     
    //     // Graceful fallback to basic extraction with defaults
    //     return {
    //       title: defaultTitle,
    //       artist: defaults?.artist || '',
    //       album: defaults?.album || '',
    //       year: defaults?.year || new Date()?.getFullYear()?.toString(),
    //       genre: defaults?.genre || '',
    //       extractedBy: 'fallback',
    //       aiSuggestions: false
    //     };
    //   }
    // }

    // Default: return basic file info with defaults applied
    console.log('🔧 Using basic metadata extraction with defaults');
    return {
      title: defaultTitle,
      artist: defaults?.artist || '',
      album: defaults?.album || '',
      year: defaults?.year || new Date()?.getFullYear()?.toString(),
      genre: defaults?.genre || '',
      extractedBy: 'basic',
      aiSuggestions: false
    };

  } catch (error) {
    console.error('Error extracting metadata:', error);
    
    // Absolute fallback
    const defaults = getDefaultMetadataConfig();
    return {
      title: file?.name?.replace(/\.[^/.]+$/, '') || 'Untitled',
      artist: defaults?.artist || '',
      album: defaults?.album || '',
      year: defaults?.year || new Date()?.getFullYear()?.toString(),
      genre: defaults?.genre || ''
    };
  }
}

/**
 * Gets default metadata configuration from localStorage or returns system defaults
 * @returns {Object} Default metadata settings
 */
export function getDefaultMetadataConfig() {
  try {
    const saved = localStorage.getItem('ugMetadataManager_defaultConfig');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading default metadata config:', error);
  }

  // System defaults - FIXED: Return consistent structure
  return {
    artist: '',
    album: '',
    year: new Date()?.getFullYear()?.toString(),
    genre: '',
    comments: 'Processed by UG Metadata Manager'
  };
}

/**
 * Saves default metadata configuration to localStorage
 * @param {Object} config - Default metadata configuration
 */
export function saveDefaultMetadataConfig(config) {
  try {
    localStorage.setItem('ugMetadataManager_defaultConfig', JSON.stringify(config));
    console.log('💾 Default metadata configuration saved');
  } catch (error) {
    console.error('Error saving default metadata config:', error);
  }
}

/**
 * Enhances metadata using OpenAI for better suggestions
 * @param {Object} currentMetadata - Current metadata object
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} Enhanced metadata suggestions
 */
export async function enhanceMetadataWithAI(currentMetadata, filename) {
  // AI features disabled - uncomment OpenAI import to enable
  console.log('AI metadata enhancement is disabled');
  return currentMetadata;
  
  // Uncomment below when OpenAI import is enabled
  // try {
  //   if (!import.meta.env?.VITE_OPENAI_API_KEY || 
  //       import.meta.env?.VITE_OPENAI_API_KEY === 'your_openai_api_key_here' ||
  //       import.meta.env?.VITE_OPENAI_API_KEY === 'your_vite_openai_api_key') {
  //     return currentMetadata; // Return unchanged if no API key
  //   }
  //
  //   const response = await openai?.chat?.completions?.create({
  //     model: 'gpt-4o-mini',
  //     messages: [
  //       {
  //         role: 'system',
  //         content: 'You are a music metadata expert. Given current metadata and filename, suggest improvements or fill in missing information. Return a JSON object with the enhanced metadata. Keep existing values unless you can improve them significantly.'
  //       },
  //       {
  //         role: 'user',
  //         content: `Enhance this metadata for file "${filename}": ${JSON.stringify(currentMetadata)}`
  //       }
  //     ],
  //     response_format: {
  //       type: 'json_schema',
  //       json_schema: {
  //         name: 'enhanced_metadata',
  //         schema: {
  //           type: 'object',
  //           properties: {
  //             title: { type: 'string' },
  //             artist: { type: 'string' },
  //             album: { type: 'string' },
  //             year: { type: 'string' },
  //             genre: { type: 'string' },
  //             suggestions: {
  //               type: 'array',
  //               items: { type: 'string' },
  //               description: 'Helpful suggestions for the user'
  //             }
  //           },
  //           required: ['title', 'artist', 'album', 'year', 'genre'],
  //           additionalProperties: false
  //         }
  //       }
  //     }
  //   });
  //
  //   return JSON.parse(response?.choices?.[0]?.message?.content);
  //
  // } catch (error) {
  //   console.error('Error enhancing metadata with AI:', error);
  //   return currentMetadata;
  // }
}

// FALLBACK METADATA EXTRACTION - No AI Required
export const extractBasicMetadata = (filename) => {
  console.log(`📝 Basic metadata extraction for: ${filename}`);
  
  try {
    // Extract filename without extension as title
    const title = filename?.replace(/\.[^/.]+$/, '') || 'Untitled';
    
    // Basic pattern matching for common filename formats
    let artist = '';
    let album = '';
    let year = '';
    let genre = '';
    
    // Common patterns: "Artist - Title", "Artist_Title", "Title by Artist"
    if (title?.includes(' - ')) {
      const parts = title?.split(' - ');
      if (parts?.length >= 2) {
        artist = parts?.[0]?.trim();
      }
    } else if (title?.includes('_')) {
      const parts = title?.split('_');
      if (parts?.length >= 2) {
        artist = parts?.[0]?.trim();
      }
    } else if (title?.toLowerCase()?.includes(' by ')) {
      const parts = title?.toLowerCase()?.split(' by ');
      if (parts?.length >= 2) {
        artist = parts?.[1]?.trim();
      }
    }
    
    // Look for year patterns (4 digits)
    const yearMatch = filename?.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      year = yearMatch?.[0];
    }
    
    const result = {
      title: title,
      artist: artist,
      album: album,
      year: year,
      genre: genre,
      extractedBy: 'basic',
      timestamp: new Date()?.toISOString()
    };
    
    console.log(`✅ Basic extraction result:`, result);
    return result;
    
  } catch (error) {
    console.error('❌ Basic metadata extraction failed:', error);
    
    // Absolute fallback
    return {
      title: filename?.replace(/\.[^/.]+$/, '') || 'Untitled',
      artist: '',
      album: '',
      year: '',
      genre: '',
      extractedBy: 'fallback',
      timestamp: new Date()?.toISOString(),
      error: error?.message
    };
  }
};

// Enhanced metadata extraction using OpenAI - DISABLED (uncomment OpenAI import to enable)
export const extractMetadataWithAI = async (filename, fileSize = null, fileType = null) => {
  console.log(`🔄 AI extraction disabled, using basic extraction for: ${filename}`);
  return extractBasicMetadata(filename);
  
  // Uncomment below when OpenAI import is enabled
  // console.log(`🤖 Extracting metadata for: ${filename}`);
  // 
  // try {
  //   const response = await openai?.chat?.completions?.create({
  //     model: 'gpt-4o-mini', // Use available model
  //     messages: [
  //       {
  //         role: 'system',
  //         content: `You are a metadata extraction specialist. Analyze filenames to extract music/audio metadata. 
  //                  Return structured information including title, artist, album, year, and genre.
  //                  Use intelligent parsing to separate artists, titles, and other metadata from filename patterns.
  //                  Consider common separators like "-", "_", "feat.", "ft.", "[", "]", "(", ")" and file extensions.`
  //       },
  //       {
  //         role: 'user',
  //         content: `Extract metadata from this filename: "${filename}"`
  //       }
  //     ],
  //     response_format: {
  //       type: 'json_schema',
  //       json_schema: {
  //         name: 'metadata_extraction',
  //         schema: {
  //           type: 'object',
  //           properties: {
  //             title: { type: 'string', description: 'Song/track title' },
  //             artist: { type: 'string', description: 'Primary artist name' },
  //             album: { type: 'string', description: 'Album name if identifiable' },
  //             year: { type: 'string', description: 'Year if identifiable' },
  //             genre: { type: 'string', description: 'Genre if identifiable' },
  //             confidence: { type: 'number', description: 'Confidence level 0-1' }
  //           },
  //           required: ['title', 'artist', 'confidence'],
  //           additionalProperties: false,
  //         },
  //       },
  //     },
  //   });
  //
  //   const result = JSON.parse(response?.choices?.[0]?.message?.content);
  //   
  //   console.log(`✅ AI extracted metadata:`, result);
  //   
  //   return {
  //     title: result?.title || filename?.replace(/\.[^/.]+$/, ''),
  //     artist: result?.artist || '',
  //     album: result?.album || '',
  //     year: result?.year || '',
  //     genre: result?.genre || '',
  //     confidence: result?.confidence || 0.8,
  //     extractedBy: 'openai',
  //     timestamp: new Date()?.toISOString()
  //   };
  // } catch (error) {
  //   console.error('❌ OpenAI metadata extraction failed:', error);
  //   
  //   // ENHANCED: Use basic extraction as fallback instead of mock data
  //   console.log('🔄 Falling back to basic metadata extraction...');
  //   return extractBasicMetadata(filename);
  // }
};
