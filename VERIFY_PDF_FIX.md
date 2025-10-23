# PDF Viewer Fix Verification

## Quick Verification Steps

### 1. Check File Integrity
Open browser console (F12) and verify these console messages appear:

#### On index.html:
```
✓ "INDEX: Page loaded, initializing PDF viewer..."
✓ "INDEX: Creating PDFViewer instance"
✓ "INDEX: COA data loaded: [COA_ID]"
✓ "PDFViewer: Loading PDF from COA data..."
✓ "PDFViewer.loadPDF called with: ..."
✓ "PDFViewer: Setting iframe src to: ..."
```

#### On search.html (after searching):
```
✓ "SEARCH: Displaying COA results with data: ..."
✓ "SEARCH: Creating new PDFViewer instance"
✓ "PDFViewer: Loading PDF from COA data..."
✓ "PDFViewer.loadPDF called with: ..."
```

### 2. Test PDF Loading

#### Test 1: Index Page Default PDF
1. Open `index.html` in browser
2. Scroll to "Sample Certificate of Analysis" section
3. **Expected**: PDF viewer displays sample COA
4. **Check console**: Should show "INDEX:" prefixed messages

#### Test 2: Index Page with Database COA
1. Ensure Supabase has at least one COA with file_url
2. Open `index.html` in browser
3. **Expected**: PDF viewer displays latest COA from database
4. **Check console**: Should show database connection and COA loading

#### Test 3: Search Page COA Display
1. Open `search.html` in browser
2. Enter COA number: `ZT-2024-001`
3. Click "Search"
4. **Expected**: 
   - COA details displayed
   - PDF viewer shows matching PDF
   - Console shows "SEARCH:" prefixed messages

#### Test 4: Multiple Searches
1. On search.html, search for first COA
2. Wait for PDF to load
3. Search for different COA
4. **Expected**: 
   - PDF clears and new PDF loads
   - No duplicate PDF viewers created
   - Console shows clear() then new loadPDF()

### 3. Console Verification Commands

Open browser console and run these commands:

```javascript
// Verify index page has global viewer
console.log('Index PDFViewer exists:', !!window.indexPDFViewer);

// Check current PDF on index page
if (window.indexPDFViewer) {
    console.log('Current PDF:', window.indexPDFViewer.getCurrentPDF());
    console.log('Current filename:', window.indexPDFViewer.getCurrentFilename());
}

// Verify PDFViewer class is available
console.log('PDFViewer class available:', typeof window.PDFViewer);

// Test loading a specific PDF (on index page)
window.indexPDFViewer.loadPDF('./COAs/Zyntro BPC-157.pdf', 'test.pdf');
```

### 4. Visual Checks

✓ **PDF displays in iframe** - Not blank or showing error
✓ **Download button works** - If enabled, clicking downloads correct file
✓ **No duplicate PDFs** - Only one PDF visible per page
✓ **Page navigation** - PDF persists when scrolling
✓ **Responsive design** - PDF scales properly on mobile

### 5. Error Scenario Testing

#### Test Missing PDF
```javascript
// Should show error message, not crash
window.indexPDFViewer.loadPDF('./nonexistent.pdf', 'missing.pdf');
```
**Expected**: Error message displayed with fallback options

#### Test Invalid COA Data
```javascript
// Should fallback to default PDF
window.indexPDFViewer.loadFromCOAData(null);
```
**Expected**: Default PDF loads with console warning

#### Test Missing Container
```javascript
// Should throw clear error
try {
    new window.PDFViewer('nonexistent-container');
} catch (e) {
    console.log('Caught expected error:', e.message);
}
```
**Expected**: Clear error message about missing container

## Common Issues and Solutions

### Issue: PDF Not Loading on Index
**Symptom**: Blank iframe or loading spinner forever
**Check**:
1. Console shows "INDEX: Creating PDFViewer instance"?
2. `window.indexPDFViewer` is defined?
3. File path `./COAs/Zyntro BPC-157.pdf` exists?

**Solution**: 
```javascript
// In console, try loading default directly:
window.indexPDFViewer.loadDefaultPDF();
```

### Issue: PDF Not Loading on Search
**Symptom**: Search finds COA but PDF doesn't display
**Check**:
1. COA has valid `file_url` property?
2. Console shows "SEARCH: Loading PDF from COA data"?
3. File URL is accessible?

**Solution**:
```javascript
// Check COA data structure
console.log('COA file_url:', coaData.file_url || coaData.fileUrl);

// Try loading directly
searchPDFViewer.loadPDF(coaData.file_url, 'test.pdf');
```

### Issue: Multiple PDFs Loading
**Symptom**: Multiple PDF viewers appearing on page
**Check**:
1. Only one PDFViewer instance created per page?
2. Console shows multiple "Creating PDFViewer instance"?

**Solution**: This should no longer occur with unified approach. Check:
```javascript
// Count PDFViewer instances (should be 1 on index, 1 on search)
console.log('Index viewer:', !!window.indexPDFViewer);
console.log('Search viewer:', typeof searchPDFViewer !== 'undefined' ? 'exists' : 'none');
```

### Issue: CMS Loader Not Working
**Symptom**: Index page doesn't load from database
**Check**:
1. `window.indexPDFViewer` exists before CMS Loader runs?
2. Console shows "CMS Loader: Using existing index PDFViewer instance"?

**Solution**:
```javascript
// Manually trigger CMS sample COA load
if (window.cmsLoader) {
    await window.cmsLoader.loadSampleCOA();
}
```

## Success Criteria

All these should be true after fix:

- [ ] Index page displays default PDF on first load
- [ ] Index page loads latest COA from database when available
- [ ] Search page displays correct PDF for searched COA
- [ ] Only one PDF viewer instance per page
- [ ] Console logs clearly identify which page is acting
- [ ] Error states display helpful messages
- [ ] PDF persists across page interactions
- [ ] Mobile devices can view PDFs (or get download option)
- [ ] No JavaScript errors in console
- [ ] Download buttons work correctly

## Rollback Plan

If issues occur, restore these files from backup:
1. `js/pdfViewer.js`
2. `index.html` (specifically the PDF loading script)
3. `search.html` (specifically the displayCOAResults function)
4. `js/cms-loader.js` (specifically the setupPDFPreview method)

## Performance Notes

- PDF loading is now asynchronous and non-blocking
- Single instance per page reduces memory usage
- Console logging can be disabled in production by removing log statements
- Each page maintains its own state independently

## Documentation

For developers working on this code:
- Read `PDF_VIEWER_FIX_SUMMARY.md` for implementation details
- Read `PDF_VIEWER_QUICK_REFERENCE.md` for API usage
- Check `js/pdfViewer.js` for class documentation
- Console log prefixes: INDEX:, SEARCH:, CMS Loader:, PDFViewer:
