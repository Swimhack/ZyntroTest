/**
 * Unified PDF Loader - Initialization for all pages
 * Ensures consistent PDF loading across index and search pages
 */

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log('PDF Loader initializing for page:', currentPage);

    const pdfContainer = document.getElementById('pdf-preview-section');
    const pdfViewer = document.getElementById('pdf-viewer');

    if (!pdfContainer || !pdfViewer) {
        console.log('No PDF viewer elements found on this page');
        return;
    }

    if (currentPage === 'index.html' || currentPage === '') {
        initializeIndexPDF();
    } else if (currentPage === 'search.html') {
        initializeSearchPDF();
    }
});

/**
 * Initialize PDF viewer on index page - shows default/latest COA
 */
async function initializeIndexPDF() {
    console.log('Initializing INDEX page PDF viewer');

    const statusEl = document.getElementById('cms-status');
    const pdfSection = document.getElementById('pdf-preview-section');
    const pdfViewer = document.getElementById('pdf-viewer');

    if (pdfSection) pdfSection.style.display = 'block';

    try {
        if (statusEl) statusEl.innerHTML = 'Loading COA data...';

        const result = await window.ApiClient.getCOAs();
        const coas = result.data;

        let pdfUrl = './COAs/Zyntro BPC-157.pdf'; // Default fallback

        if (coas && coas.length > 0) {
            const coaWithFile = coas.find(c => c.file_url && c.file_url.trim() !== '');
            if (coaWithFile) {
                pdfUrl = coaWithFile.file_url;
                console.log('Loading COA from database:', coaWithFile.id);
            }
        }

        // Load the PDF using Google Docs viewer for remote URLs, direct for local
        if (pdfViewer) {
            if (pdfUrl.startsWith('/') || pdfUrl.startsWith('./')) {
                // Local file - use Google Docs viewer with full URL
                const fullUrl = window.location.origin + (pdfUrl.startsWith('.') ? pdfUrl.substring(1) : pdfUrl);
                const googleUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`;
                pdfViewer.src = googleUrl;
            } else {
                const googleUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
                pdfViewer.src = googleUrl;
            }
        }

        const downloadBtn = document.querySelector('.pdf-download-btn');
        if (downloadBtn) {
            downloadBtn.onclick = () => window.open(pdfUrl, '_blank');
        }

        if (statusEl) {
            statusEl.innerHTML = 'COA loaded successfully';
            setTimeout(() => { statusEl.style.display = 'none'; }, 2000);
        }

    } catch (error) {
        console.error('Error loading index PDF:', error);
        if (statusEl) {
            statusEl.innerHTML = 'Error loading COA';
            statusEl.style.background = '#fecaca';
        }
        if (pdfViewer) {
            const fallbackUrl = `https://docs.google.com/gview?url=${encodeURIComponent(window.location.origin + '/COAs/Zyntro BPC-157.pdf')}&embedded=true`;
            pdfViewer.src = fallbackUrl;
        }
    }
}

/**
 * Initialize PDF viewer on search page
 */
function initializeSearchPDF() {
    console.log('Initializing SEARCH page PDF viewer - ready for user search');
}

/**
 * Load COA PDF in search results
 */
function loadCOA(coa) {
    console.log('Unified loader: Loading COA PDF', coa);

    const pdfSection = document.getElementById('pdf-preview-section');
    const pdfViewer = document.getElementById('pdf-viewer');

    if (pdfSection) pdfSection.style.display = 'block';

    if (pdfViewer && coa.file_url) {
        let viewerUrl;
        if (coa.file_url.startsWith('/') || coa.file_url.startsWith('./')) {
            const fullUrl = window.location.origin + (coa.file_url.startsWith('.') ? coa.file_url.substring(1) : coa.file_url);
            viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`;
        } else {
            viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(coa.file_url)}&embedded=true`;
        }
        pdfViewer.src = viewerUrl;

        const downloadBtn = document.getElementById('pdf-download-btn');
        if (downloadBtn) {
            downloadBtn.href = coa.file_url;
            downloadBtn.download = `${coa.id}_COA.pdf`;
            downloadBtn.style.display = 'inline-flex';
        }
    }
}

window.unifiedPDFLoader = {
    initializeIndexPDF,
    initializeSearchPDF,
    loadCOA,
    viewer: document.getElementById('pdf-viewer')
};
