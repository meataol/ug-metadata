# UG Metadata Manager

A web-based tool for embedding metadata in audio and video files for YouTube uploads. This application allows you to upload your files, edit their metadata (title, artist, album, etc.), add cover art, and download the processed files with the new metadata embedded.

## 🚀 Features

-   **File Upload:** Upload audio and video files from your computer.
-   **Metadata Editing:** Edit common metadata fields such as title, artist, album, year, and comments.
-   **Cover Art:** Upload and embed cover art into your files.
-   **Batch Processing:** Apply the same metadata to multiple files at once.
-   **Individual Processing:** Customize metadata for each file individually.
-   **Automatic Download:** Processed files are automatically downloaded to your browser's Downloads folder.
-   **Processing Summary:** View a summary of the processing results, including successful and failed files.

## 📋 How to Use

1.  **Upload Files:** Drag and drop your audio/video files into the application, or click "Browse Files" to select them from your computer.
2.  **Edit Metadata:**
    *   **Batch Mode:** Enter the metadata you want to apply to all files in the batch.
    *   **Individual Mode:** Navigate through each file and enter its specific metadata.
3.  **Add Cover Art:** Upload a cover art image to be embedded in your files.
4.  **Process Files:** Click "Start Processing" to begin embedding the metadata and cover art.
5.  **Download Files:** The processed files will be automatically downloaded to your browser's Downloads folder.
6.  **View Summary:** After processing is complete, you can view a summary of the results.
7.  **Clear and Restart:** Click "Clear All & Start Over" to reset the application and start a new batch.

## 🛠️ Key Technologies

-   **React 18:** A JavaScript library for building user interfaces.
-   **Vite:** A fast build tool and development server.
-   **TailwindCSS:** A utility-first CSS framework.
-   **music-metadata-browser:** A library for reading and writing audio metadata in the browser.
-   **browser-id3-writer:** A library for writing ID3 tags to MP3 files in the browser.

## 📦 Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm start
    ```

## 🚀 Deployment

Build the application for production:

```bash
npm run build
```

## 🙏 Acknowledgments

-   Built with [Rocket.new](https://rocket.new)
-   Powered by React and Vite
-   Styled with Tailwind CSS
