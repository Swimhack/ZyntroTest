/**
 * Unified PDF Loader - Initialization for all pages
 * Ensures consistent PDF loading across index and search pages
 */

// Initialize PDF viewer based on page context
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log('📄 PDF Loader initializing for page:', currentPage);
    
    // Check if we're on a page that needs PDF functionality
    const pdfContainer = document.getElementById('pdf-preview-section');
    
    if (!pdfContainer) {
        console.log('No PDF viewer elements found on this page');
        return;
    }
    
    // Initialize the PDFViewer
    window.pdfViewer = new PDFViewer('pdf-preview-section');

    // Initialize based on page type
    if (currentPage === 'index.html' || currentPage === '') {
        initializeIndexPDF(window.pdfViewer);
    } else if (currentPage === 'search.html') {
        initializeSearchPDF(window.pdfViewer);
    }
});

/**
 * Initialize PDF viewer on index page - shows default/latest COA
 */
async function initializeIndexPDF(pdfViewer) {
    console.log('🏠 Initializing INDEX page PDF viewer');
    pdfViewer.loadDefaultPDF();
}

/**
 * Initialize PDF viewer on search page - provides helper function for PDF loading
 */
function initializeSearchPDF(pdfViewer) {
    console.log('🔍 Initializing SEARCH page PDF viewer - ready for user search');
    // Make the pdfViewer instance globally available for the search function
    window.pdfViewer = pdfViewer;
    const pdfSection = document.getElementById('pdf-preview-section');
    if (pdfSection) {
        pdfSection.style.display = 'block';
    }
}

/**
 * Load Supabase library dynamically
 */
async function loadSupabase() {
    return new Promise((resolve, reject) => {
        if (window.supabase) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@supabase/supabase-js@2.39.3/dist/umd/supabase.js';
        script.onload = () => {
            console.log('✅ Supabase loaded');
            window.supabaseClient = window.supabase.createClient(
                'https://hctdzwmlkgnuxcuhjooe.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjE2NjAsImV4cCI6MjA3NTY5NzY2MH0.EzxFceWzutTtlJvKpzI5UbWug3B8o2e5hFWi0yaXHog'
            );
            resolve();
        };
        script.onerror = () => {
            console.error('❌ Failed to load Supabase');
            reject(new Error('Failed to load Supabase library'));
        };
        document.head.appendChild(script);
    });
}
