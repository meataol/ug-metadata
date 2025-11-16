# UG Metadata Manager - Web Version

> **Audio metadata editor for YouTube uploads - Works on any device, no installation required!**

## 🌐 Live Demo

Visit the live app at: `https://YOUR_USERNAME.github.io/ug-metadata/`

## ✨ Features

### Core Functionality
- ✅ **Edit MP3 Metadata** - Title, artist, album, year, genre, comments
- ✅ **Embed Cover Art** - Add album artwork to MP3 files
- ✅ **Batch Processing** - Process multiple files at once
- ✅ **AI Metadata Extraction** - Automatically extract metadata from filenames
- ✅ **Mobile-Friendly** - Works on phones and tablets
- ✅ **No Installation** - Just visit the URL
- ✅ **Privacy-First** - All processing happens in your browser
- ✅ **Offline Capable** - Works without internet (after first load)

### Supported Formats

| Format | Read Metadata | Write Metadata | Cover Art |
|--------|--------------|----------------|-----------|
| MP3    | ✅ Yes        | ✅ Yes          | ✅ Yes     |
| M4A    | ✅ Yes        | ❌ No           | ❌ No      |
| MP4    | ✅ Yes        | ❌ No           | ❌ No      |
| FLAC   | ✅ Yes        | ❌ No           | ❌ No      |
| WAV    | ✅ Yes        | ❌ No           | ❌ No      |

**Note**: Browser limitations restrict writing to MP3 only. For other formats, use the desktop version.

## 🚀 Quick Start

### For Users

1. Visit: `https://YOUR_USERNAME.github.io/ug-metadata/`
2. Select your MP3 files
3. Edit metadata
4. Add cover art (optional)
5. Process files
6. Download modified files

That's it! No installation needed.

### For Developers

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ug-metadata.git
cd ug-metadata

# Install dependencies
pnpm install

# Start development server
pnpm start

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📱 Device Compatibility

### Desktop
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu, Fedora, etc.)

### Mobile
- ✅ iOS 14+ (Safari)
- ✅ Android 10+ (Chrome)

### Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🔧 How It Works

### Architecture

```
┌─────────────────────────────────────┐
│      React UI (Your Browser)        │
│  - File selection                   │
│  - Metadata editing                 │
│  - Progress tracking                │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   Browser Metadata Service          │
│  - music-metadata-browser (read)    │
│  - browser-id3-writer (write)       │
│  - File API                         │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│      Modified File Download         │
│  - Blob creation                    │
│  - Download trigger                 │
└─────────────────────────────────────┘
```

### Technology Stack

**Frontend**:
- React 18
- Vite 5
- React Router
- Tailwind CSS

**Metadata Processing**:
- music-metadata-browser (reading)
- browser-id3-writer (writing MP3)
- JSZip (batch downloads)

**Deployment**:
- GitHub Pages
- GitHub Actions (CI/CD)

## 📖 Usage Guide

### Step 1: Select Files

1. Click "Select Files" or drag & drop
2. Choose MP3 files from your device
3. Files are loaded into browser memory (not uploaded anywhere)

### Step 2: Enter Metadata

1. Edit title, artist, album, year, genre
2. AI automatically extracts metadata from filenames
3. You can edit individual files or apply to all

### Step 3: Add Cover Art (Optional)

1. Upload an image (JPEG or PNG)
2. Preview the cover art
3. Apply to all files or individual files

### Step 4: Process Files

1. Click "Start Processing"
2. Wait for processing to complete
3. Files are processed in your browser

### Step 5: Download Files

1. Download individual files or all as ZIP
2. Save to your device
3. Upload to YouTube or use as needed

## 🔐 Privacy & Security

### What We DO
- ✅ Process files entirely in your browser
- ✅ Use HTTPS for secure connections
- ✅ Store preferences in browser LocalStorage

### What We DON'T Do
- ❌ Upload files to any server
- ❌ Collect or store your data
- ❌ Track your usage
- ❌ Require account creation
- ❌ Access your files without permission

**Your files never leave your device!**

## 🎯 Use Cases

### YouTube Creators
- Add metadata before uploading to YouTube
- Embed channel branding in cover art
- Batch process episode series

### Podcasters
- Add episode information
- Embed podcast artwork
- Organize audio files

### Musicians
- Tag demo recordings
- Add album art to releases
- Organize music library

### Audio Professionals
- Standardize metadata across projects
- Add copyright information
- Prepare files for distribution

## 🆚 Web vs Desktop Version

| Feature | Web Version | Desktop Version |
|---------|------------|-----------------|
| **Installation** | None required | Required |
| **Platform** | Any device | Desktop only |
| **File Access** | File API | Full file system |
| **Processing** | In-browser | Native |
| **Format Support** | MP3 (write) | All formats |
| **Performance** | Good | Excellent |
| **Offline** | Yes (PWA) | Yes |
| **Updates** | Automatic | Manual |

**Recommendation**: 
- Use **web version** for convenience and mobile access
- Use **desktop version** for advanced features and all formats

## 🛠️ Development

### Project Structure

```
ug_metadata_web/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions deployment
├── public/                       # Static assets
├── src/
│   ├── pages/
│   │   ├── file-selection/      # Step 1: File selection
│   │   ├── metadata-entry/      # Step 2: Metadata editing
│   │   ├── cover-art-management/ # Step 3: Cover art
│   │   ├── file-processing/     # Step 4: Processing
│   │   └── processing-summary/  # Step 5: Results
│   ├── services/
│   │   └── browserMetadataService.js  # Core processing logic
│   ├── components/              # Reusable UI components
│   └── utils/                   # Utility functions
├── vite.config.mjs              # Vite configuration
├── package.json
└── README.md
```

### Available Scripts

```bash
# Development
pnpm start          # Start dev server (port 4028)
pnpm build          # Build for production
pnpm preview        # Preview production build

# Deployment
git push origin main  # Auto-deploys via GitHub Actions
```

### Environment Variables

Create `.env` file:

```env
VITE_APP_TITLE=UG Metadata Manager
VITE_OPENAI_API_KEY=your_api_key_here  # For AI metadata extraction
```

## 📦 Deployment

### GitHub Pages (Recommended)

See [GITHUB_PAGES_DEPLOYMENT.md](./GITHUB_PAGES_DEPLOYMENT.md) for detailed instructions.

**Quick Deploy**:

```bash
# Push to GitHub
git push origin main

# GitHub Actions automatically builds and deploys
# Visit: https://YOUR_USERNAME.github.io/ug-metadata/
```

### Other Platforms

**Netlify**:
```bash
# Build command: pnpm build
# Publish directory: build
```

**Vercel**:
```bash
# Framework: Vite
# Build command: pnpm build
# Output directory: build
```

## 🐛 Troubleshooting

### Files Not Processing

**Issue**: Processing fails or produces errors

**Solutions**:
1. Ensure files are MP3 format
2. Check file size (< 50MB recommended)
3. Try processing one file at a time
4. Check browser console for errors

### Cover Art Not Embedding

**Issue**: Cover art doesn't appear in processed files

**Solutions**:
1. Use JPEG format (PNG may be larger)
2. Resize image to < 1MB
3. Ensure image is square (recommended)

### Downloads Not Working

**Issue**: Modified files don't download

**Solutions**:
1. Check browser download settings
2. Allow pop-ups for the site
3. Try a different browser
4. Check available disk space

### Mobile Issues

**Issue**: App doesn't work well on mobile

**Solutions**:
1. Use latest browser version
2. Close other apps to free memory
3. Process fewer files at once
4. Use desktop for large batches

## 📊 Performance Tips

### For Best Performance

1. **File Size**: Keep files < 10MB each
2. **Batch Size**: Process < 20 files at once
3. **Browser**: Use Chrome or Edge for best performance
4. **Memory**: Close other tabs/apps
5. **Mobile**: Process 1-5 files at a time

### Optimization

The app is optimized for:
- Fast loading (code splitting)
- Efficient processing (Web Workers - coming soon)
- Small bundle size (tree shaking)
- Mobile performance (responsive design)

## 🔮 Roadmap

### Planned Features

- [ ] PWA support for offline use
- [ ] Web Workers for faster processing
- [ ] Cloud storage integration (Dropbox, Google Drive)
- [ ] More file format support (as browser APIs improve)
- [ ] Bulk metadata templates
- [ ] Metadata presets
- [ ] Dark mode
- [ ] Keyboard shortcuts

### Contributions Welcome!

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

### Libraries Used

- **music-metadata-browser** - Metadata reading
- **browser-id3-writer** - ID3 tag writing
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling

### Inspiration

Built to solve the problem of adding metadata to audio files for YouTube uploads, without requiring desktop software installation.

## 📞 Support

### Documentation

- [GitHub Pages Deployment Guide](./GITHUB_PAGES_DEPLOYMENT.md)
- [User Guide](./USER_GUIDE.md)
- [Technical Documentation](./TECHNICAL.md)

### Community

- **Issues**: https://github.com/YOUR_USERNAME/ug-metadata/issues
- **Discussions**: https://github.com/YOUR_USERNAME/ug-metadata/discussions

### FAQ

**Q: Why only MP3 for writing?**
A: Browser security limitations. Desktop apps have full file system access, browsers don't.

**Q: Is my data safe?**
A: Yes! All processing happens in your browser. Files never leave your device.

**Q: Can I use this offline?**
A: Yes, after the first visit. PWA support coming soon for better offline experience.

**Q: Why do I need to download files?**
A: Browsers can't modify files in place. You must download the modified version.

**Q: Can I process large batches?**
A: Yes, but performance depends on your device. Desktop handles larger batches better.

## 🎉 Getting Started

Ready to use the app?

1. Visit: `https://YOUR_USERNAME.github.io/ug-metadata/`
2. Select your MP3 files
3. Edit metadata
4. Download modified files
5. Upload to YouTube!

**No installation, no signup, no hassle!**

---

Made with ❤️ for content creators everywhere
