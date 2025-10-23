# PDF Viewer Quick Reference

## Overview
All PDF loading now goes through the unified `PDFViewer` class located in `js/pdfViewer.js`.

## Instance Names by Page

| Page | Instance Variable | Scope |
|------|------------------|-------|
| index.html | `window.indexPDFViewer` | Global |
| search.html | `searchPDFViewer` | Local |
| Other pages using cms-loader | Uses `window.indexPDFViewer` | Global |

## Common Operations

### 1. Load Default PDF
```javascript
// On index page
window.indexPDFViewer.loadDefaultPDF();

// On search page
searchPDFViewer.loadDefaultPDF();
```

### 2. Load PDF from COA Data Object
```javascript
// Recommended method - handles all COA data formats
const coaData = {
    id: 'ZT-2024-001',
    file_url: './COAs/sample.pdf',
    client: 'Sample Client'
};

window.indexPDFViewer.loadFromCOAData(coaData);
```

### 3. Load PDF from Direct URL
```javascript
window.indexPDFViewer.loadPDF('./COAs/my-file.pdf', 'my-file.pdf');
```

### 4. Clear Current PDF
```javascript
window.indexPDFViewer.clear();
```

### 5. Get Current PDF Info
```javascript
const currentUrl = window.indexPDFViewer.getCurrentPDF();
const currentFilename = window.indexPDFViewer.getCurrentFilename();
```

## Console Log Prefixes

To easily debug which page is loading PDFs, look for these prefixes:

- `INDEX:` - index.html page
- `SEARCH:` - search.html page  
- `CMS Loader:` - cms-loader.js operations
- `PDFViewer:` - PDFViewer class internal operations

Example:
```
INDEX: Creating PDFViewer instance
PDFViewer.loadPDF called with: {pdfUrl: "./COAs/sample.pdf", filename: "sample.pdf"}
PDFViewer: Normalized URL: ./COAs/sample.pdf
PDFViewer: Setting iframe src to: ./COAs/sample.pdf
```

## Troubleshooting

### PDF Not Loading on Index Page
1. Check console for "INDEX:" prefixed logs
2. Verify `window.indexPDFViewer` is created
3. Check if `loadIndexCOA()` function was called
4. Verify Supabase connection or fallback to default PDF

### PDF Not Loading on Search Page
1. Check console for "SEARCH:" prefixed logs
2. Verify `searchPDFViewer` instance exists
3. Check COA data has valid `file_url` property
4. Verify `getProperFileUrl()` function returns valid URL

### PDF Displays Error Message
1. Check if file path is correct (relative vs absolute)
2. Verify file exists at specified location
3. Check browser console for CORS or security errors
4. Try opening PDF URL directly in browser

### Multiple PDFs Loading
- This should no longer happen with unified approach
- Each page maintains its own single instance
- Check console logs to verify only one load operation per user action

## File Structure

```
ZyntroTest.com/
├── js/
│   ├── pdfViewer.js        # Unified PDF viewer class
│   ├── cms-loader.js       # CMS integration (uses indexPDFViewer)
│   └── script.js           # Shared utilities (getProperFileUrl)
├── index.html              # Home page (creates window.indexPDFViewer)
├── search.html             # Search page (creates searchPDFViewer)
└── COAs/                   # Default PDF location
    └── Zyntro BPC-157.pdf  # Default sample PDF
```

## Key Design Decisions

1. **One Instance Per Page**: Prevents conflicts and ensures consistent state
2. **Global Index Instance**: Allows cms-loader integration without creating duplicate viewers
3. **Local Search Instance**: Each search result gets fresh load without affecting other pages
4. **Consistent API**: All methods work the same way regardless of page
5. **Clear Logging**: Easy to identify which component is having issues

## Adding PDF Viewer to New Page

```javascript
// 1. Include PDFViewer script
<script src="js/pdfViewer.js"></script>

// 2. Create container in HTML
<div id="my-pdf-container">
    <iframe id="pdf-viewer" class="pdf-iframe"></iframe>
</div>

// 3. Initialize viewer in JavaScript
let myPDFViewer = new window.PDFViewer('my-pdf-container', {
    defaultPDF: './COAs/Zyntro BPC-157.pdf',
    showDownloadButton: true,
    showStatusIndicator: false
});

// 4. Load a PDF
myPDFViewer.loadFromCOAData(coaObject);
```

## Configuration Options

```javascript
new PDFViewer(containerId, {
    showDownloadButton: true,      // Show/hide download button
    showStatusIndicator: false,    // Show/hide loading status
    defaultPDF: './path/to/pdf',   // Path to default PDF
    onLoadSuccess: (url, filename) => {},  // Success callback
    onLoadError: (url) => {}       // Error callback
});
```
