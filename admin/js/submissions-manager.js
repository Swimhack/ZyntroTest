// Form Submissions Manager for ZyntroTest Admin
// Manages contact forms, sample submissions, and newsletter subscriptions

const SubmissionsManager = {
    supabase: null,
    
    async init() {
        console.log('Initializing Submissions Manager...');
        
        // Get Supabase client from SupabaseUtils if available
        if (typeof SupabaseUtils !== 'undefined' && SupabaseUtils.getClient) {
            this.supabase = SupabaseUtils.getClient();
        }
        
        // Load initial data for active tab
        await this.loadSubmissions('contact');
    },
    
    async loadSubmissions(type) {
        console.log(`Loading ${type} submissions...`);
        
        const loadingEl = document.getElementById(`${type}-loading`);
        const tableEl = document.getElementById(`${type}-table`);
        const emptyEl = document.getElementById(`${type}-empty`);
        
        // Show loading
        if (loadingEl) loadingEl.style.display = 'flex';
        if (tableEl) tableEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'none';
        
        try {
            let data = [];
            
            // Try to load from Supabase if available
            if (this.supabase) {
                const tableName = this.getTableName(type);
                const { data: submissions, error } = await this.supabase
                    .from(tableName)
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (!error && submissions) {
                    data = submissions;
                }
            }
            
            // Hide loading
            if (loadingEl) loadingEl.style.display = 'none';
            
            // Show appropriate view
            if (data.length > 0) {
                this.renderSubmissions(type, data);
                if (tableEl) tableEl.style.display = 'block';
            } else {
                if (emptyEl) emptyEl.style.display = 'block';
            }
        } catch (error) {
            console.error(`Error loading ${type} submissions:`, error);
            
            // Hide loading and show empty state
            if (loadingEl) loadingEl.style.display = 'none';
            if (emptyEl) emptyEl.style.display = 'block';
        }
    },
    
    getTableName(type) {
        const tableMap = {
            'contact': 'contact_submissions',
            'sample': 'sample_submissions',
            'newsletter': 'newsletter_subscriptions'
        };
        return tableMap[type] || type;
    },
    
    renderSubmissions(type, data) {
        const tbody = document.getElementById(`${type}-tbody`);
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        data.forEach(item => {
            const row = document.createElement('tr');
            
            if (type === 'contact') {
                row.innerHTML = `
                    <td>${this.formatDate(item.created_at)}</td>
                    <td>${this.escapeHtml(item.name || 'N/A')}</td>
                    <td>${this.escapeHtml(item.email || 'N/A')}</td>
                    <td>${this.escapeHtml(item.company || 'N/A')}</td>
                    <td>${this.escapeHtml(item.service_type || 'N/A')}</td>
                    <td><span class="status-badge status-${item.status || 'unread'}">${item.status || 'Unread'}</span></td>
                    <td class="action-buttons">
                        <button class="btn btn-outline btn-sm" onclick="SubmissionsManager.viewDetails('${type}', '${item.id}')">View</button>
                    </td>
                `;
            } else if (type === 'sample') {
                row.innerHTML = `
                    <td>${this.formatDate(item.created_at)}</td>
                    <td>${this.escapeHtml(item.client_name || 'N/A')}</td>
                    <td>${this.escapeHtml(item.email || 'N/A')}</td>
                    <td>${this.escapeHtml(item.sample_type || 'N/A')}</td>
                    <td>${item.rush_service ? 'Yes' : 'No'}</td>
                    <td><span class="status-badge status-${item.status || 'unread'}">${item.status || 'Unread'}</span></td>
                    <td class="action-buttons">
                        <button class="btn btn-outline btn-sm" onclick="SubmissionsManager.viewDetails('${type}', '${item.id}')">View</button>
                    </td>
                `;
            } else if (type === 'newsletter') {
                row.innerHTML = `
                    <td>${this.formatDate(item.created_at)}</td>
                    <td>${this.escapeHtml(item.email || 'N/A')}</td>
                    <td>${this.escapeHtml(item.source || 'Website')}</td>
                    <td><span class="status-badge status-${item.status || 'active'}">${item.status || 'Active'}</span></td>
                    <td class="action-buttons">
                        <button class="btn btn-outline btn-sm" onclick="SubmissionsManager.unsubscribe('${item.id}')">Unsubscribe</button>
                    </td>
                `;
            }
            
            tbody.appendChild(row);
        });
    },
    
    async viewDetails(type, id) {
        console.log(`Viewing details for ${type} submission ${id}`);
        
        try {
            let submission = null;
            
            // Fetch submission details from Supabase
            if (this.supabase) {
                const tableName = this.getTableName(type);
                const { data, error } = await this.supabase
                    .from(tableName)
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                submission = data;
            }
            
            if (!submission) {
                alert('Submission not found');
                return;
            }
            
            // Populate modal with submission details
            this.showDetailsModal(type, submission);
            
        } catch (error) {
            console.error('Error loading submission details:', error);
            alert('Error loading submission details');
        }
    },
    
    showDetailsModal(type, submission) {
        const modal = document.getElementById('detail-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) return;
        
        // Set title
        modalTitle.textContent = `${this.getTypeName(type)} Details`;
        
        // Build details HTML based on type
        let detailsHTML = '';
        
        if (type === 'contact') {
            detailsHTML = `
                <div class="detail-row">
                    <div class="detail-label">Name</div>
                    <div class="detail-value">${this.escapeHtml(submission.name || 'N/A')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email</div>
                    <div class="detail-value"><a href="mailto:${submission.email}">${this.escapeHtml(submission.email)}</a></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${this.escapeHtml(submission.phone || 'Not provided')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Company</div>
                    <div class="detail-value">${this.escapeHtml(submission.company || 'Not provided')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Service Type</div>
                    <div class="detail-value">${this.escapeHtml(submission.service_type || 'Not specified')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Sample Type</div>
                    <div class="detail-value">${this.escapeHtml(submission.sample_type || 'Not specified')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Message</div>
                    <div class="detail-value" style="white-space: pre-wrap;">${this.escapeHtml(submission.message || 'No message')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status</div>
                    <div class="detail-value"><span class="status-badge status-${submission.status}">${submission.status || 'Unread'}</span></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Submitted</div>
                    <div class="detail-value">${this.formatDate(submission.created_at)}</div>
                </div>
            `;
        } else if (type === 'sample') {
            detailsHTML = `
                <div class="detail-row">
                    <div class="detail-label">Client Name</div>
                    <div class="detail-value">${this.escapeHtml(submission.client_name || 'N/A')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email</div>
                    <div class="detail-value"><a href="mailto:${submission.email}">${this.escapeHtml(submission.email)}</a></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${this.escapeHtml(submission.phone || 'Not provided')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Company</div>
                    <div class="detail-value">${this.escapeHtml(submission.company || 'Not provided')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Sample Type</div>
                    <div class="detail-value">${this.escapeHtml(submission.sample_type || 'Not specified')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Sample Count</div>
                    <div class="detail-value">${submission.sample_count || 0}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Analysis Requested</div>
                    <div class="detail-value">${this.escapeHtml(submission.analysis_requested || 'Not specified')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Rush Service</div>
                    <div class="detail-value">${submission.rush_service ? '✓ Yes' : '✗ No'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Shipping Method</div>
                    <div class="detail-value">${this.escapeHtml(submission.shipping_method || 'Not specified')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Message</div>
                    <div class="detail-value" style="white-space: pre-wrap;">${this.escapeHtml(submission.message || 'No message')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status</div>
                    <div class="detail-value"><span class="status-badge status-${submission.status}">${submission.status || 'Unread'}</span></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Submitted</div>
                    <div class="detail-value">${this.formatDate(submission.created_at)}</div>
                </div>
            `;
        } else if (type === 'newsletter') {
            detailsHTML = `
                <div class="detail-row">
                    <div class="detail-label">Email</div>
                    <div class="detail-value"><a href="mailto:${submission.email}">${this.escapeHtml(submission.email)}</a></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Source</div>
                    <div class="detail-value">${this.escapeHtml(submission.source || 'Website')}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status</div>
                    <div class="detail-value"><span class="status-badge status-${submission.status}">${submission.status || 'Active'}</span></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Subscribed</div>
                    <div class="detail-value">${this.formatDate(submission.subscribed_at || submission.created_at)}</div>
                </div>
            `;
        }
        
        // Add action buttons
        detailsHTML += `
            <div class="detail-row" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--gray-200);">
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn-outline btn-sm" onclick="SubmissionsManager.updateStatus('${type}', '${submission.id}', 'read')">Mark as Read</button>
                    <button class="btn btn-primary btn-sm" onclick="SubmissionsManager.updateStatus('${type}', '${submission.id}', 'responded')">Mark as Responded</button>
                    ${type !== 'newsletter' ? `<button class="btn btn-success btn-sm" onclick="SubmissionsManager.updateStatus('${type}', '${submission.id}', 'completed')">Mark as Completed</button>` : ''}
                    <button class="btn btn-danger btn-sm" onclick="if(confirm('Delete this submission?')) SubmissionsManager.deleteSubmission('${type}', '${submission.id}')">Delete</button>
                </div>
            </div>
        `;
        
        modalBody.innerHTML = detailsHTML;
        modal.classList.add('active');
    },
    
    getTypeName(type) {
        const names = {
            'contact': 'Contact Form Submission',
            'sample': 'Sample Submission Request',
            'newsletter': 'Newsletter Subscription'
        };
        return names[type] || type;
    },
    
    async updateStatus(type, id, status) {
        try {
            if (!this.supabase) {
                alert('Database not connected');
                return;
            }
            
            const tableName = this.getTableName(type);
            const { error } = await this.supabase
                .from(tableName)
                .update({ status: status, updated_at: new Date().toISOString() })
                .eq('id', id);
            
            if (error) throw error;
            
            // Close modal and refresh list
            document.getElementById('detail-modal').classList.remove('active');
            await this.loadSubmissions(type);
            
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status');
        }
    },
    
    async deleteSubmission(type, id) {
        try {
            if (!this.supabase) {
                alert('Database not connected');
                return;
            }
            
            const tableName = this.getTableName(type);
            const { error } = await this.supabase
                .from(tableName)
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            // Close modal and refresh list
            document.getElementById('detail-modal').classList.remove('active');
            await this.loadSubmissions(type);
            
        } catch (error) {
            console.error('Error deleting submission:', error);
            alert('Error deleting submission');
        }
    },
    
    async unsubscribe(id) {
        if (!confirm('Are you sure you want to unsubscribe this email?')) {
            return;
        }
        
        try {
            if (this.supabase) {
                await this.supabase
                    .from('newsletter_subscriptions')
                    .update({ status: 'unsubscribed' })
                    .eq('id', id);
                
                await this.loadSubmissions('newsletter');
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
            alert('Error unsubscribing email');
        }
    },
    
    exportToCSV(type) {
        console.log(`Exporting ${type} to CSV`);
        alert('CSV export coming soon!');
    },
    
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
