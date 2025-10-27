/**
 * Unified PDF Viewer Module
 * Handles all PDF loading and display functionality across the site
 */

class PDFViewer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element with id "${containerId}" not found`);
        }

        // Configuration
        this.options = {
            showDownloadButton: options.showDownloadButton !== false,
            showStatusIndicator: options.showStatusIndicator !== false,
            defaultPDF: options.defaultPDF || './COAs/Zyntro BPC-157.pdf',
            onLoadSuccess: options.onLoadSuccess || null,
            onLoadError: options.onLoadError || null,
            ...options
        };

        // State
        this.currentPDF = null;
        this.currentFilename = null;

        // Initialize elements
        this.initializeElements();
    }

    initializeElements() {
        // Find or create viewer elements
        this.iframe = this.container.querySelector('iframe#pdf-viewer') ||
                      this.container.querySelector('iframe.pdf-iframe');
        this.downloadBtn = document.getElementById('pdf-download-btn');
        this.statusIndicator = document.getElementById('pdf-status');
        this.errorMessage = this.container.querySelector('.error-message');

        if (!this.iframe) {
            console.error('PDF viewer iframe not found in container');
        }
    }

    /**
     * Load a PDF from a URL or file path
     * @param {string} pdfUrl - URL or path to the PDF file
     * @param {string} filename - Optional filename for download
     */
    async loadPDF(pdfUrl, filename = null) {
        if (!pdfUrl) {
            this.showError('No PDF file specified');
            return false;
        }

        this.currentPDF = this.normalizeURL(pdfUrl);
        this.currentFilename = filename || this.extractFilename(this.currentPDF);
        this.showStatus('Loading PDF...', 'loading');

        // Primary method: Google Docs viewer
        this.renderWithGoogleViewer();
        return true;
    }

    renderWithGoogleViewer() {
        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(this.currentPDF)}&embedded=true`;
        this.renderPDF(viewerUrl, 'google');
    }

    renderWithDirectIframe() {
        this.renderPDF(this.currentPDF, 'direct');
    }

    renderPDF(url, method) {
        if (!this.iframe) {
            console.error('PDFViewer: No iframe element found!');
            return;
        }

        this.iframe.onload = () => this.handleIframeLoad(method);
        this.iframe.onerror = () => this.handleIframeError(method);
        this.iframe.src = url;

        if (this.downloadBtn && this.options.showDownloadButton) {
            this.downloadBtn.href = this.currentPDF;
            this.downloadBtn.download = this.currentFilename;
            this.downloadBtn.style.display = 'inline-flex';
        }
    }

    /**
     * Handle successful iframe load
     */
    handleIframeLoad(method) {
        // With Google Viewer, a successful load still might show an error inside the iframe
        if (method === 'google') {
            // A slight delay to let the viewer render
            setTimeout(() => {
                this.showStatus('PDF loaded', 'success');
                this.hideError();
            }, 1000);
        } else {
            this.showStatus('PDF loaded successfully', 'success');
            this.hideError();
        }
    }

    handleIframeError(method) {
        if (method === 'google') {
            console.warn('Google Viewer failed, falling back to direct iframe');
            this.renderWithDirectIframe();
        } else {
            this.showError(`Unable to display PDF. <a href="${this.currentPDF}" target="_blank">Open in new tab</a>.`);
            this.showStatus('Failed to load PDF', 'error');
        }
    }

    /**
     * Load the default PDF
     */
    loadDefaultPDF() {
        return this.loadPDF(this.options.defaultPDF, 'Sample COA.pdf');
    }

    /**
     * Load PDF from COA data object
     * @param {Object} coaData - COA data with file_url or fileUrl property
     */
    loadFromCOAData(coaData) {
        if (!coaData) {
            console.error('PDFViewer: No COA data provided');
            return this.loadDefaultPDF();
        }

        // Get file URL - try multiple properties and use getProperFileUrl if available
        let fileUrl = coaData.fileUrl || coaData.file_url || coaData.fileName;
        
        // Use shared getProperFileUrl function if available
        if (window.getProperFileUrl && typeof window.getProperFileUrl === 'function') {
            fileUrl = window.getProperFileUrl(coaData);
        }

        if (!fileUrl) {
            console.warn('PDFViewer: COA data has no file URL, loading default PDF');
            return this.loadDefaultPDF();
        }

        // Extract filename from COA data
        const filename = coaData.id
            ? `${coaData.id}_COA.pdf`
            : (coaData.coaNumber ? `COA-${coaData.coaNumber}.pdf` : this.extractFilename(fileUrl));

        console.log('PDFViewer: Loading PDF from COA data:', { id: coaData.id, fileUrl, filename });
        return this.loadPDF(fileUrl, filename);
    }

    /**
     * Normalize URL to handle both local paths and remote URLs
     * @param {string} url - Original URL or path
     * @returns {string} Normalized URL
     */
    normalizeURL(url) {
        if (!url) return '';

        // Already a full URL (http:// or https://)
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // Ensure local paths start with ./
        if (url.startsWith('COAs/')) {
            return './' + url;
        }

        return url;
    }

    /**
     * Extract filename from URL or path
     * @param {string} url - URL or path
     * @returns {string} Extracted filename
     */
    extractFilename(url) {
        if (!url) return 'document.pdf';

        // Remove query string and hash
        const cleanUrl = url.split('?')[0].split('#')[0];

        // Extract filename
        const parts = cleanUrl.split('/');
        const filename = parts[parts.length - 1];

        return filename || 'document.pdf';
    }

    /**
     * Show status message
     * @param {string} message - Status message
     * @param {string} type - Status type: loading, success, error
     */
    showStatus(message, type = 'loading') {
        if (!this.statusIndicator || !this.options.showStatusIndicator) return;

        this.statusIndicator.textContent = message;
        this.statusIndicator.style.display = 'block';

        // Remove all status classes
        this.statusIndicator.classList.remove('bg-yellow-100', 'text-yellow-800', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');

        // Add appropriate class based on type
        switch (type) {
            case 'loading':
                this.statusIndicator.classList.add('bg-yellow-100', 'text-yellow-800');
                break;
            case 'success':
                this.statusIndicator.classList.add('bg-green-100', 'text-green-800');
                // Auto-hide success message after 3 seconds
                setTimeout(() => {
                    if (this.statusIndicator) {
                        this.statusIndicator.style.display = 'none';
                    }
                }, 3000);
                break;
            case 'error':
                this.statusIndicator.classList.add('bg-red-100', 'text-red-800');
                break;
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message (can include HTML)
     */
    showError(message) {
        if (!this.errorMessage) {
            // Create error message element if it doesn't exist
            this.errorMessage = document.createElement('div');
            this.errorMessage.className = 'error-message bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative mt-4';
            this.container.appendChild(this.errorMessage);
        }

        this.errorMessage.innerHTML = message;
        this.errorMessage.style.display = 'block';

        // Hide iframe if there's an error
        if (this.iframe) {
            this.iframe.style.display = 'none';
        }
    }

    /**
     * Hide error message
     */
    hideError() {
        if (this.errorMessage) {
            this.errorMessage.style.display = 'none';
        }

        // Show iframe
        if (this.iframe) {
            this.iframe.style.display = 'block';
        }
    }

    /**
     * Clear the current PDF
     */
    clear() {
        if (this.iframe) {
            this.iframe.src = '';
        }
        this.currentPDF = null;
        this.currentFilename = null;
        this.hideError();
        if (this.statusIndicator) {
            this.statusIndicator.style.display = 'none';
        }
    }

    /**
     * Get the currently loaded PDF URL
     * @returns {string|null} Current PDF URL
     */
    getCurrentPDF() {
        return this.currentPDF;
    }

    /**
     * Get the current filename
     * @returns {string|null} Current filename
     */
    getCurrentFilename() {
        return this.currentFilename;
    }
}

// Make PDFViewer available globally
window.PDFViewer = PDFViewer;
