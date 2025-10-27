// js/search.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!window.supabase) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@supabase/supabase-js@2.39.3/dist/umd/supabase.js';
            script.onload = () => {
                window.supabaseClient = window.supabase.createClient(
                    'https://hctdzwmlkgnuxcuhjooe.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjE2NjAsImV4cCI6MjA3NTY5NzY2MH0.EzxFceWzutTtlJvKpzI5UbWug3B8o2e5hFWi0yaXHog'
                );
            };
            document.head.appendChild(script);
        } else {
            window.supabaseClient = window.supabase.createClient(
                'https://hctdzwmlkgnuxcuhjooe.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR6d21sa2dudXhjdWhqb29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjE2NjAsImV4cCI6MjA3NTY5NzY2MH0.EzxFceWzutTtlJvKpzI5UbWug3B8o2e5hFWi0yaXHog'
            );
        }
    } catch (error) {
        console.warn('Failed to initialize Supabase:', error);
    }
});

function searchCOA(event) {
    event.preventDefault();
    const coaNumber = document.getElementById('coa-number').value.trim();

    if (!coaNumber) {
        showNotification('Please enter a COA number', 'error');
        return;
    }

    const button = event.target.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.textContent = 'Searching...';
    button.disabled = true;

    setTimeout(async () => {
        try {
            const coa = await findCOAInDatabase(coaNumber);

            if (coa) {
                displayCOAResults(coa);
            } else {
                showNotification('COA not found. Please check the number and try again.', 'error');
            }
        } catch (error) {
            console.error('Search error:', error);
            showNotification('Error searching for COA. Please try again.', 'error');
        }

        button.textContent = originalText;
        button.disabled = false;
    }, 1000);
}

async function findCOAInDatabase(coaNumber) {
    try {
        let attempts = 0;
        while (typeof window.supabaseClient === 'undefined' && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient) {
            const { data, error } = await window.supabaseClient
                .from('coas')
                .select('*')
                .eq('id', coaNumber.toUpperCase())
                .single();

            if (error) {
                console.warn('Database query error:', error);
            } else if (data) {
                return data;
            }
        }
    } catch (error) {
        console.warn('Error loading from Supabase:', error);
    }

    const fallbackDatabase = {
        'ZT-2024-001': {
            id: 'ZT-2024-001',
            client: 'BioVenture Research',
            compound: 'BPC-157',
            date: 'October 1, 2024',
            purity: '99.8%',
            type: 'Peptide Analysis',
            status: 'Complete',
            file_url: './COAs/Zyntro BPC-157.pdf'
        }
    };

    return fallbackDatabase[coaNumber.toUpperCase()] || null;
}

function displayCOAResults(coa) {
    const resultsSection = document.getElementById('search-results');
    const coaContent = document.getElementById('coa-content');
    const pdfPreview = document.getElementById('pdf-preview-section');

    coaContent.innerHTML = generateCOAContent(coa);
    resultsSection.style.display = 'block';
    pdfPreview.style.display = 'block';

    if (window.pdfViewer) {
        window.pdfViewer.loadFromCOAData(coa);
    }

    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function generateCOAContent(coa) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        if (dateString.includes('/')) {
            return dateString;
        }

        if (dateString.includes('-') && dateString.length === 10) {
            try {
                const [year, month, day] = dateString.split('-');
                return `${month}/${day}/${year}`;
            } catch (error) {
                return dateString;
            }
        }

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    return `
        <div class="coa-data-display">
            <div class="data-grid">
                <div class="data-item">
                    <strong>COA ID:</strong>
                    <span>${coa.id || 'N/A'}</span>
                </div>
                <div class="data-item">
                    <strong>Client:</strong>
                    <span>${coa.client || 'N/A'}</span>
                </div>
                <div class="data-item">
                    <strong>Compound:</strong>
                    <span>${coa.compound || 'N/A'}</span>
                </div>
                <div class="data-item">
                    <strong>Type:</strong>
                    <span>${coa.analysis_type || 'N/A'}</span>
                </div>
                <div class="data-item">
                    <strong>Date:</strong>
                    <span>${formatDate(coa.test_date)}</span>
                </div>
                <div class="data-item">
                    <strong>Status:</strong>
                    <span class="status-badge">${coa.status || 'N/A'}</span>
                </div>
            </div>

            ${coa.purity ? `
                <div class="result-highlight">
                    <strong>Purity:</strong> ${coa.purity}%
                </div>
            ` : ''}

            ${coa.result ? `
                <div class="result-highlight">
                    <strong>Test Result:</strong> ${coa.result}
                </div>
            ` : ''}

            ${coa.notes ? `
                <div class="notes-section">
                    <strong>Notes:</strong>
                    <p>${coa.notes}</p>
                </div>
            ` : ''}
        </div>
    `;
}

function downloadCurrentPDF() {
    if (window.pdfViewer) {
        const pdfUrl = window.pdfViewer.getCurrentPDF();
        const filename = window.pdfViewer.getCurrentFilename();

        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
