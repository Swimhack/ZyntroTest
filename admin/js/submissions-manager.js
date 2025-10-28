// Form Submissions Manager
// Handles fetching, displaying, and managing form submissions

let contactSubmissions = [];
let sampleSubmissions = [];
let newsletterSubscriptions = [];

// Initialize when DOM is loaded
let supabaseReady = false;

async function ensureSupabase() {
    if (supabaseReady && window.supabaseAdmin) {
        return window.supabaseAdmin;
    }
    
    // Wait for Supabase to be initialized
    let attempts = 0;
    while (!window.supabaseAdmin && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!window.supabaseAdmin) {
        throw new Error('Supabase admin client not available');
    }
    
    supabaseReady = true;
    return window.supabaseAdmin;
}

// Load contact submissions
async function loadContactSubmissions() {
    console.log('=== Loading Contact Submissions ===');
    try {
        const container = document.getElementById('contact-submissions-container');
        if (!container) {
            console.error('Container element not found: contact-submissions-container');
            return;
        }
        
        container.innerHTML = '<div class="loading">Loading contact submissions...</div>';
        console.log('Container found, loading data...');
        
        const supabaseAdmin = await ensureSupabase();
        console.log('Supabase admin client ready:', !!supabaseAdmin);
        
        const { data, error } = await supabaseAdmin
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false });
        
        console.log('Query result:', { dataCount: data?.length, error });
        
        if (error) {
            console.error('Supabase query error:', error);
            throw error;
        }
        
        contactSubmissions = data || [];
        console.log('Successfully loaded contact submissions:', contactSubmissions.length);
        console.log('Sample data:', contactSubmissions[0]);
        
        renderContactSubmissions(contactSubmissions);
    } catch (error) {
        console.error('CATCH ERROR in loadContactSubmissions:', error);
        console.error('Error stack:', error.stack);
        const container = document.getElementById('contact-submissions-container');
        if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <p>Error loading contact submissions.</p>
                    <p style="color: var(--gray-500); font-size: 0.875rem;">Error: ${error.message}</p>
                    <p style="color: var(--gray-500); font-size: 0.75rem;">Check browser console for details</p>
                    <button class="btn btn-primary" onclick="loadContactSubmissions()">Retry</button>
                </div>
            `;
        }
    }
}

// Render contact submissions table
function renderContactSubmissions(submissions) {
    const container = document.getElementById('contact-submissions-container');
    
    if (!submissions || submissions.length === 0) {
        container.innerHTML = '<div class="no-data">No contact submissions found.</div>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'submissions-table';
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Service Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${submissions.map(submission => `
                <tr>
                    <td>${submission.name}</td>
                    <td>${submission.email}</td>
                    <td>${submission.company || '-'}</td>
                    <td>${submission.service_type || '-'}</td>
                    <td><span class="status-badge status-${submission.status}">${submission.status}</span></td>
                    <td>${new Date(submission.created_at).toLocaleDateString()}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="viewSubmission('contact', '${submission.id}')">View</button>
                            <button class="btn btn-sm btn-outline" onclick="updateStatus('contact', '${submission.id}', '${submission.status}')">Update</button>
                        </div>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    container.innerHTML = '';
    container.appendChild(table);
}

// Load sample submissions
async function loadSampleSubmissions() {
    try {
        const container = document.getElementById('sample-submissions-container');
        container.innerHTML = '<div class="loading">Loading sample submissions...</div>';
        
        const supabaseAdmin = await ensureSupabase();
        
        const { data, error } = await supabaseAdmin
            .from('sample_submissions')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        
        sampleSubmissions = data || [];
        console.log('Loaded sample submissions:', sampleSubmissions.length);
        renderSampleSubmissions(sampleSubmissions);
    } catch (error) {
        console.error('Error loading sample submissions:', error);
        const container = document.getElementById('sample-submissions-container');
        container.innerHTML = `
            <div class="no-data">
                <p>Error loading sample submissions.</p>
                <p style="color: var(--gray-500); font-size: 0.875rem;">${error.message}</p>
                <button class="btn btn-primary" onclick="loadSampleSubmissions()">Retry</button>
            </div>
        `;
    }
}

// Render sample submissions table
function renderSampleSubmissions(submissions) {
    const container = document.getElementById('sample-submissions-container');
    
    if (!submissions || submissions.length === 0) {
        container.innerHTML = '<div class="no-data">No sample submissions found.</div>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'submissions-table';
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>Client Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Sample Type</th>
                <th>Count</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${submissions.map(submission => `
                <tr>
                    <td>${submission.client_name}</td>
                    <td>${submission.email}</td>
                    <td>${submission.company || '-'}</td>
                    <td>${submission.sample_type || '-'}</td>
                    <td>${submission.sample_count || 0}</td>
                    <td><span class="status-badge status-${submission.status}">${submission.status}</span></td>
                    <td>${new Date(submission.created_at).toLocaleDateString()}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="viewSubmission('sample', '${submission.id}')">View</button>
                            <button class="btn btn-sm btn-outline" onclick="updateStatus('sample', '${submission.id}', '${submission.status}')">Update</button>
                        </div>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    container.innerHTML = '';
    container.appendChild(table);
}

// Load newsletter subscriptions
async function loadNewsletterSubscriptions() {
    try {
        const container = document.getElementById('newsletter-container');
        container.innerHTML = '<div class="loading">Loading newsletter subscriptions...</div>';
        
        const supabaseAdmin = await ensureSupabase();
        
        const { data, error } = await supabaseAdmin
            .from('newsletter_subscriptions')
            .select('*')
            .order('subscribed_at', { ascending: false });
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        
        newsletterSubscriptions = data || [];
        console.log('Loaded newsletter subscriptions:', newsletterSubscriptions.length);
        renderNewsletterSubscriptions(newsletterSubscriptions);
    } catch (error) {
        console.error('Error loading newsletter subscriptions:', error);
        const container = document.getElementById('newsletter-container');
        container.innerHTML = `
            <div class="no-data">
                <p>Error loading newsletter subscriptions.</p>
                <p style="color: var(--gray-500); font-size: 0.875rem;">${error.message}</p>
                <button class="btn btn-primary" onclick="loadNewsletterSubscriptions()">Retry</button>
            </div>
        `;
    }
}

// Render newsletter subscriptions table
function renderNewsletterSubscriptions(subscriptions) {
    const container = document.getElementById('newsletter-container');
    
    if (!subscriptions || subscriptions.length === 0) {
        container.innerHTML = '<div class="no-data">No newsletter subscriptions found.</div>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'submissions-table';
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Subscribed</th>
                <th>Source</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${subscriptions.map(subscription => `
                <tr>
                    <td>${subscription.email}</td>
                    <td><span class="status-badge status-${subscription.status}">${subscription.status}</span></td>
                    <td>${new Date(subscription.subscribed_at).toLocaleDateString()}</td>
                    <td>${subscription.source || 'website'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline" onclick="toggleNewsletterStatus('${subscription.id}', '${subscription.status}')">
                                ${subscription.status === 'active' ? 'Unsubscribe' : 'Resubscribe'}
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    container.innerHTML = '';
    container.appendChild(table);
}

// View submission details
function viewSubmission(type, id) {
    let submission;
    let title;
    
    if (type === 'contact') {
        submission = contactSubmissions.find(s => s.id === id);
        title = 'Contact Form Submission';
    } else if (type === 'sample') {
        submission = sampleSubmissions.find(s => s.id === id);
        title = 'Sample Submission';
    }
    
    if (!submission) return;
    
    // Mark as read
    updateSubmissionStatus(id, 'read', type === 'contact' ? 'contact_submissions' : 'sample_submissions');
    
    const modal = document.getElementById('submission-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = title;
    
    // Create details HTML based on submission type
    let detailsHTML = '';
    
    if (type === 'contact') {
        detailsHTML = `
            <div class="submission-details">
                <div class="detail-row">
                    <div class="detail-label">Name:</div>
                    <div class="detail-value">${submission.name}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">${submission.email}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Phone:</div>
                    <div class="detail-value">${submission.phone || 'Not provided'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Company:</div>
                    <div class="detail-value">${submission.company || 'Not provided'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Service Type:</div>
                    <div class="detail-value">${submission.service_type || 'Not specified'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Sample Type:</div>
                    <div class="detail-value">${submission.sample_type || 'Not specified'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Message:</div>
                    <div class="detail-value">${submission.message || 'No message'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">
                        <span class="status-badge status-${submission.status}">${submission.status}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Submitted:</div>
                    <div class="detail-value">${new Date(submission.created_at).toLocaleString()}</div>
                </div>
            </div>
        `;
    } else if (type === 'sample') {
        detailsHTML = `
            <div class="submission-details">
                <div class="detail-row">
                    <div class="detail-label">Client Name:</div>
                    <div class="detail-value">${submission.client_name}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">${submission.email}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Phone:</div>
                    <div class="detail-value">${submission.phone || 'Not provided'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Company:</div>
                    <div class="detail-value">${submission.company || 'Not provided'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Sample Type:</div>
                    <div class="detail-value">${submission.sample_type || 'Not specified'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Sample Count:</div>
                    <div class="detail-value">${submission.sample_count || 0}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Analysis Requested:</div>
                    <div class="detail-value">${submission.analysis_requested || 'Not specified'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Rush Service:</div>
                    <div class="detail-value">${submission.rush_service ? 'Yes' : 'No'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Shipping Method:</div>
                    <div class="detail-value">${submission.shipping_method || 'Not specified'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Message:</div>
                    <div class="detail-value">${submission.message || 'No message'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">
                        <span class="status-badge status-${submission.status}">${submission.status}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Submitted:</div>
                    <div class="detail-value">${new Date(submission.created_at).toLocaleString()}</div>
                </div>
            </div>
        `;
    }
    
    modalBody.innerHTML = detailsHTML;
    modal.classList.add('active');
}

// Update submission status
async function updateSubmissionStatus(id, status, table) {
    try {
        const supabaseAdmin = await ensureSupabase();
        
        const { error } = await supabaseAdmin
            .from(table)
            .update({ status, updated_at: new Date() })
            .eq('id', id);
        
        if (error) throw error;
        
        // Refresh the appropriate table
        if (table === 'contact_submissions') {
            loadContactSubmissions();
        } else if (table === 'sample_submissions') {
            loadSampleSubmissions();
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status. Please try again.');
    }
}

// Update status with dropdown
function updateStatus(type, id, currentStatus) {
    const statuses = type === 'contact' 
        ? ['unread', 'read', 'responded', 'completed']
        : ['unread', 'read', 'in_progress', 'completed'];
    
    const newStatus = prompt(`Update status for this ${type} submission:`, currentStatus);
    
    if (newStatus && statuses.includes(newStatus)) {
        const table = type === 'contact' ? 'contact_submissions' : 'sample_submissions';
        updateSubmissionStatus(id, newStatus, table);
    }
}

// Toggle newsletter subscription status
async function toggleNewsletterStatus(id, currentStatus) {
    try {
        const supabaseAdmin = await ensureSupabase();
        const newStatus = currentStatus === 'active' ? 'unsubscribed' : 'active';
        const unsubscribedAt = newStatus === 'unsubscribed' ? new Date() : null;
        
        const { error } = await supabaseAdmin
            .from('newsletter_subscriptions')
            .update({ 
                status: newStatus, 
                unsubscribed_at: unsubscribedAt 
            })
            .eq('id', id);
        
        if (error) throw error;
        
        loadNewsletterSubscriptions();
    } catch (error) {
        console.error('Error updating newsletter status:', error);
        alert('Error updating subscription status. Please try again.');
    }
}

// Export functions
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value;
            }).join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function exportContactSubmissions() {
    exportToCSV(contactSubmissions, `contact-submissions-${new Date().toISOString().split('T')[0]}.csv`);
}

function exportSampleSubmissions() {
    exportToCSV(sampleSubmissions, `sample-submissions-${new Date().toISOString().split('T')[0]}.csv`);
}

function exportNewsletterSubscriptions() {
    exportToCSV(newsletterSubscriptions, `newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv`);
}

// Refresh functions
function refreshContactSubmissions() {
    loadContactSubmissions();
}

function refreshSampleSubmissions() {
    loadSampleSubmissions();
}

function refreshNewsletterSubscriptions() {
    loadNewsletterSubscriptions();
}

// Make functions globally available
window.loadContactSubmissions = loadContactSubmissions;
window.loadSampleSubmissions = loadSampleSubmissions;
window.loadNewsletterSubscriptions = loadNewsletterSubscriptions;
window.viewSubmission = viewSubmission;
window.updateStatus = updateStatus;
window.toggleNewsletterStatus = toggleNewsletterStatus;
window.exportContactSubmissions = exportContactSubmissions;
window.exportSampleSubmissions = exportSampleSubmissions;
window.exportNewsletterSubscriptions = exportNewsletterSubscriptions;
window.refreshContactSubmissions = refreshContactSubmissions;
window.refreshSampleSubmissions = refreshSampleSubmissions;
window.refreshNewsletterSubscriptions = refreshNewsletterSubscriptions;
