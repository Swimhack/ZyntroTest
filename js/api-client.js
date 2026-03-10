// API Client - Drop-in replacement for Supabase client
// All database operations go through the Express API server

const ApiClient = {
    // Base URL (empty = same origin)
    baseUrl: '',

    // Admin token storage key
    ADMIN_TOKEN_KEY: 'zyntro_admin_token',

    async _fetch(url, options = {}) {
        const defaults = {
            headers: { 'Content-Type': 'application/json' }
        };
        const response = await fetch(this.baseUrl + url, { ...defaults, ...options });
        const json = await response.json();
        if (!response.ok) {
            const error = new Error(json.error || 'API request failed');
            error.code = json.code;
            error.status = response.status;
            throw error;
        }
        return json;
    },

    // Fetch with admin token header included
    async _adminFetch(url, options = {}) {
        const token = this.getAdminToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['x-admin-token'] = token;
        if (options.headers) Object.assign(headers, options.headers);
        return this._fetch(url, { ...options, headers });
    },

    // Login to get admin token from server
    async adminLogin(username, password) {
        const result = await this._fetch('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (result.success && result.token) {
            localStorage.setItem(this.ADMIN_TOKEN_KEY, result.token);
        }
        return result;
    },

    // Get stored admin token
    getAdminToken() {
        try {
            return localStorage.getItem(this.ADMIN_TOKEN_KEY);
        } catch (e) {
            return null;
        }
    },

    // Clear admin token on logout
    clearAdminToken() {
        localStorage.removeItem(this.ADMIN_TOKEN_KEY);
    },

    // ===========================
    // Public form submissions
    // ===========================

    async saveContactSubmission(data) {
        return this._fetch('/api/contact', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async saveSampleSubmission(data) {
        return this._fetch('/api/sample', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async saveNewsletterSubscription(email) {
        return this._fetch('/api/newsletter', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    },

    // ===========================
    // Public COA operations
    // ===========================

    async getCOAs(filters = {}) {
        const params = new URLSearchParams();
        if (filters.q) params.set('q', filters.q);
        if (filters.type) params.set('type', filters.type);
        if (filters.status) params.set('status', filters.status);
        const qs = params.toString();
        return this._fetch('/api/coas' + (qs ? '?' + qs : ''));
    },

    async getCOAById(id) {
        return this._fetch('/api/coas/' + encodeURIComponent(id));
    },

    // ===========================
    // Public CMS content
    // ===========================

    async getSiteSettings() {
        return this._fetch('/api/cms/settings');
    },

    async getPageContent(page) {
        return this._fetch('/api/cms/page/' + encodeURIComponent(page));
    },

    async getServices() {
        return this._fetch('/api/cms/services');
    },

    async getTestimonials() {
        return this._fetch('/api/cms/testimonials');
    },

    async getBlogPosts() {
        return this._fetch('/api/cms/blog');
    },

    async getMedia() {
        return this._fetch('/api/cms/media');
    },

    async getMediaById(id) {
        return this._fetch('/api/cms/media/' + encodeURIComponent(id));
    },

    // ===========================
    // Admin operations (generic CRUD)
    // ===========================

    async adminList(table) {
        return this._adminFetch('/api/admin/' + table);
    },

    async adminGet(table, id) {
        return this._adminFetch('/api/admin/' + table + '/' + encodeURIComponent(id));
    },

    async adminInsert(table, data) {
        return this._adminFetch('/api/admin/' + table, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async adminUpdate(table, id, data) {
        return this._adminFetch('/api/admin/' + table + '/' + encodeURIComponent(id), {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },

    async adminDelete(table, id) {
        return this._adminFetch('/api/admin/' + table + '/' + encodeURIComponent(id), {
            method: 'DELETE'
        });
    },

    async adminUpsert(table, data) {
        return this._adminFetch('/api/admin/' + table + '/upsert', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async adminCount(table) {
        return this._adminFetch('/api/admin/' + table + '/count');
    },

    // ===========================
    // File uploads
    // ===========================

    async uploadCOAFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        const headers = {};
        const token = this.getAdminToken();
        if (token) headers['x-admin-token'] = token;
        const response = await fetch(this.baseUrl + '/api/admin/upload/coa', {
            method: 'POST',
            headers,
            body: formData
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Upload failed');
        return json;
    },

    // ===========================
    // Payment admin operations
    // ===========================

    async getPaymentSettings() {
        return this._adminFetch('/api/admin/payment/settings');
    },

    async testPaymentConnection() {
        return this._adminFetch('/api/admin/payment/test', {
            method: 'POST'
        });
    },

    async uploadMedia(file, title, altText) {
        const formData = new FormData();
        formData.append('file', file);
        if (title) formData.append('title', title);
        if (altText) formData.append('alt_text', altText);
        const headers = {};
        const token = this.getAdminToken();
        if (token) headers['x-admin-token'] = token;
        const response = await fetch(this.baseUrl + '/api/admin/upload/media', {
            method: 'POST',
            headers,
            body: formData
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Upload failed');
        return json;
    }
};

// Make globally available
window.ApiClient = ApiClient;
