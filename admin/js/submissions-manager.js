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
        // TODO: Implement details modal
        alert('Details view coming soon!');
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
