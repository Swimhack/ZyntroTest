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
    const pdfViewer = document.getElementById('pdf-viewer');
    
    if (!pdfContainer || !pdfViewer) {
        console.log('No PDF viewer elements found on this page');
        return;
    }
    
    // Initialize based on page type
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
    console.log('🏠 Initializing INDEX page PDF viewer');
    
    const statusEl = document.getElementById('cms-status');
    const pdfSection = document.getElementById('pdf-preview-section');
    const pdfViewer = document.getElementById('pdf-viewer');
    
    // Show PDF section
    if (pdfSection) {
        pdfSection.style.display = 'block';
    }
    
    try {
        if (statusEl) statusEl.innerHTML = '🔄 Loading COA data...';
        
        // Load Supabase if needed
        if (!window.supabase) {
            await loadSupabase();
        }
        
        if (statusEl) statusEl.innerHTML = '📊 Fetching latest COA...';
        
        const client = supabase.createClient(
            'https://hctdzwmlkgnuxcuhjooe.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjE2NjAsImV4cCI6MjA3NTY5NzY2MH0.EzxFceWzutTtlJvKpzI5UbWug3B8o2e5hFWi0yaXHog'
        );
        
        // Get latest COA with valid file_url
        const { data: coas, error } = await client
            .from('coas')
            .select('*')
            .not('file_url', 'is', null)
            .neq('file_url', '')
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (error) throw error;
        
        let pdfUrl = './COAs/Zyntro BPC-157.pdf'; // Default fallback
        
        if (coas && coas.length > 0) {
            const coa = coas[0];
            pdfUrl = coa.file_url;
            console.log('✅ Loading COA from database:', coa.id);
        } else {
            console.log('📋 Using default sample PDF');
        }
        
        // Load the PDF
        if (pdfViewer) {
            pdfViewer.src = pdfUrl;
            console.log('📄 PDF loaded:', pdfUrl);
        }
        
        // Setup download button
        const downloadBtn = document.querySelector('.pdf-download-btn');
        if (downloadBtn) {
            downloadBtn.onclick = () => window.open(pdfUrl, '_blank');
        }
        
        if (statusEl) {
            statusEl.innerHTML = '✅ COA loaded successfully';
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 2000);
        }
        
    } catch (error) {
        console.error('❌ Error loading index PDF:', error);
        if (statusEl) {
            statusEl.innerHTML = '⚠️ Error loading COA';
            statusEl.style.background = '#fecaca';
        }
        
        // Load default PDF as fallback
        if (pdfViewer) {
            pdfViewer.src = './COAs/Zyntro BPC-157.pdf';
        }
    }
}

/**
 * Initialize PDF viewer on search page - provides helper function for PDF loading
 */
function initializeSearchPDF() {
    console.log('🔍 Initializing SEARCH page PDF viewer - ready for user search');
    // Don't override existing search functionality
    // Just provide helper methods for PDF loading
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
            resolve();
        };
        script.onerror = () => {
            console.error('❌ Failed to load Supabase');
            reject(new Error('Failed to load Supabase library'));
        };
        document.head.appendChild(script);
    });
}

/**
 * Load COA PDF in search results
 * Called by search.html after COA is found
 */
function loadCOA(coa) {
    console.log('📄 Unified loader: Loading COA PDF', coa);
    
    const pdfSection = document.getElementById('pdf-preview-section');
    const pdfViewer = document.getElementById('pdf-viewer');
    
    if (pdfSection) {
        pdfSection.style.display = 'block';
    }
    
    if (pdfViewer && coa.file_url) {
        pdfViewer.src = coa.file_url;
        console.log('✅ PDF viewer src set to:', coa.file_url);
        
        // Setup download button
        const downloadBtn = document.getElementById('pdf-download-btn');
        if (downloadBtn) {
            downloadBtn.href = coa.file_url;
            downloadBtn.download = `${coa.id}_COA.pdf`;
            downloadBtn.style.display = 'inline-flex';
        }
    } else {
        console.error('❌ PDF viewer element or COA file_url not found');
    }
}

// Make functions globally available
window.unifiedPDFLoader = {
    initializeIndexPDF,
    initializeSearchPDF,
    loadSupabase,
    loadCOA,
    viewer: document.getElementById('pdf-viewer') // Expose viewer element
};
