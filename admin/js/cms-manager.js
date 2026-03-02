// CMS Manager - Uses ApiClient instead of Supabase

let cmsManagerInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('CMS Manager: Starting initialization...');
        cmsManagerInstance = new CMSManager();
        cmsManagerInstance.init();
        window.cmsManager = cmsManagerInstance;
    } catch (error) {
        console.error('CMS Manager: Initialization failed:', error);
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; margin: 1rem; border-radius: 0.5rem;">
                <strong>API Connection Error</strong><br>
                Unable to connect to the API. Please check your connection and refresh the page.
                <br><br>
                <button onclick="window.location.reload()" style="background: #dc2626; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">Refresh Page</button>
            </div>
        `;
        const mainContent = document.querySelector('.main-content') || document.querySelector('.cms-container') || document.body;
        if (mainContent) mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }
});

class CMSManager {
    constructor() {
        this.currentTab = 'pages';
        this.editingItem = null;
    }

    init() {
        this.setupTabNavigation();
        this.loadStats();
        this.loadCurrentTabContent();
        this.setupPageSelector();
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(`${tabName}-tab`).classList.add('active');
                this.currentTab = tabName;
                this.loadCurrentTabContent();
            });
        });
    }

    setupPageSelector() {
        const pageSelector = document.getElementById('pageSelector');
        if (pageSelector) {
            pageSelector.addEventListener('change', () => this.loadPageContent(pageSelector.value));
        }
    }

    async loadStats() {
        try {
            const [services, blog, testimonials, pages] = await Promise.all([
                window.ApiClient.adminCount('services'),
                window.ApiClient.adminCount('blog_posts'),
                window.ApiClient.adminCount('testimonials'),
                window.ApiClient.adminCount('page_content')
            ]);
            document.getElementById('servicesCount').textContent = services.count || 0;
            document.getElementById('blogPostsCount').textContent = blog.count || 0;
            document.getElementById('testimonialsCount').textContent = testimonials.count || 0;
            document.getElementById('pagesCount').textContent = pages.count || 0;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadCurrentTabContent() {
        try {
            switch (this.currentTab) {
                case 'pages': await this.loadPageContent('index'); break;
                case 'services': await this.loadServices(); break;
                case 'blog': await this.loadBlogPosts(); break;
                case 'testimonials': await this.loadTestimonials(); break;
                case 'settings': await this.loadSiteSettings(); break;
                case 'payment': await this.loadPaymentSettings(); break;
            }
        } catch (error) {
            console.error('Error loading tab content:', error);
            this.showNotification('Error loading content: ' + error.message, 'error');
        }
    }

    async loadPageContent(pageName) {
        try {
            const result = await window.ApiClient.getPageContent(pageName);
            const contentMap = result.data.content || {};
            const heroSection = result.data.hero;

            document.getElementById('pageTitle').value = contentMap.page_title || '';
            document.getElementById('metaDescription').value = contentMap.meta_description || '';
            document.getElementById('heroTitle').value = heroSection?.title || contentMap.hero_title || '';
            document.getElementById('heroSubtitle').value = heroSection?.subtitle || '';
            document.getElementById('heroDescription').value = heroSection?.description || '';
            const heroImageUrl = heroSection?.image_url || '';
            document.getElementById('heroImageUrl').value = heroImageUrl;
            if (heroImageUrl) this.updateHeroImagePreview(heroImageUrl);

            if (heroSection?.stats && Array.isArray(heroSection.stats)) {
                heroSection.stats.forEach((stat, index) => {
                    const labelEl = document.getElementById(`heroStatLabel${index + 1}`);
                    const valueEl = document.getElementById(`heroStatValue${index + 1}`);
                    if (labelEl) labelEl.value = stat.label || '';
                    if (valueEl) valueEl.value = stat.number || '';
                });
            }
        } catch (error) {
            console.error('Error loading page content:', error);
            this.showNotification('Error loading page content: ' + error.message, 'error');
        }
    }

    async loadServices() {
        try {
            const result = await window.ApiClient.adminList('services');
            const services = result.data || [];
            const servicesList = document.getElementById('servicesList');
            if (services.length === 0) {
                servicesList.innerHTML = '<p>No services found. <a href="#" onclick="cmsManager.showAddServiceModal()">Add your first service</a>.</p>';
                return;
            }
            servicesList.innerHTML = services.map(service => `
                <div class="content-item">
                    <div class="content-item-info">
                        <h4>${service.title}</h4>
                        <p>${service.subtitle || 'No subtitle'}</p>
                        <p><strong>Price:</strong> ${service.base_price || 'Not set'}</p>
                        <span class="status-badge ${service.status}">${service.status}</span>
                    </div>
                    <div class="content-item-actions">
                        <button class="btn-secondary btn-small" onclick="cmsManager.editService('${service.id}')">Edit</button>
                        <button class="btn-danger btn-small" onclick="cmsManager.deleteService('${service.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            this.showNotification('Error loading services: ' + error.message, 'error');
        }
    }

    async loadBlogPosts() {
        try {
            const result = await window.ApiClient.adminList('blog_posts');
            const posts = result.data || [];
            const blogList = document.getElementById('blogList');
            if (posts.length === 0) {
                blogList.innerHTML = '<p>No blog posts found. <a href="#" onclick="cmsManager.showAddBlogModal()">Create your first post</a>.</p>';
                return;
            }
            blogList.innerHTML = posts.map(post => `
                <div class="content-item">
                    <div class="content-item-info">
                        <h4>${post.title}</h4>
                        <p>${post.excerpt || 'No excerpt'}</p>
                        <p><strong>Author:</strong> ${post.author} | <strong>Status:</strong>
                        <span class="status-badge ${post.status}">${post.status}</span>
                        ${post.published_date ? ` | <strong>Published:</strong> ${new Date(post.published_date).toLocaleDateString()}` : ''}
                        </p>
                    </div>
                    <div class="content-item-actions">
                        <button class="btn-secondary btn-small" onclick="cmsManager.editBlogPost('${post.id}')">Edit</button>
                        <button class="btn-danger btn-small" onclick="cmsManager.deleteBlogPost('${post.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            this.showNotification('Error loading blog posts: ' + error.message, 'error');
        }
    }

    async loadTestimonials() {
        try {
            const result = await window.ApiClient.adminList('testimonials');
            const testimonials = result.data || [];
            const testimonialsList = document.getElementById('testimonialsList');
            if (testimonials.length === 0) {
                testimonialsList.innerHTML = '<p>No testimonials found. <a href="#" onclick="cmsManager.showAddTestimonialModal()">Add your first testimonial</a>.</p>';
                return;
            }
            testimonialsList.innerHTML = testimonials.map(t => `
                <div class="content-item">
                    <div class="content-item-info">
                        <h4>${t.author_name}</h4>
                        <p><strong>Company:</strong> ${t.company || 'Not specified'}</p>
                        <p><strong>Rating:</strong> ${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</p>
                        <p>${t.content.substring(0, 100)}${t.content.length > 100 ? '...' : ''}</p>
                        <span class="status-badge ${t.active ? 'active' : 'inactive'}">${t.active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div class="content-item-actions">
                        <button class="btn-secondary btn-small" onclick="cmsManager.editTestimonial('${t.id}')">Edit</button>
                        <button class="btn-danger btn-small" onclick="cmsManager.deleteTestimonial('${t.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            this.showNotification('Error loading testimonials: ' + error.message, 'error');
        }
    }

    async loadSiteSettings() {
        try {
            const result = await window.ApiClient.getSiteSettings();
            const settings = result.data || {};
            document.getElementById('siteName').value = settings.site_name || '';
            document.getElementById('siteTagline').value = settings.site_tagline || '';
            document.getElementById('contactEmail').value = settings.contact_email || '';
            document.getElementById('contactPhone').value = settings.contact_phone || '';
            document.getElementById('contactAddress').value = settings.contact_address || '';
            document.getElementById('logoUrl').value = settings.logo_url || '';
            document.getElementById('footerText').value = settings.footer_text || '';
        } catch (error) {
            this.showNotification('Error loading site settings: ' + error.message, 'error');
        }
    }

    async loadPaymentSettings() {
        try {
            const result = await window.ApiClient.getPaymentSettings();
            const settings = result.data || {};
            const status = result.status || {};

            document.getElementById('authnetApiLoginId').value = settings.authnet_api_login_id || '';
            document.getElementById('authnetTransactionKey').value = '';
            document.getElementById('authnetTransactionKey').placeholder = settings.authnet_transaction_key
                ? settings.authnet_transaction_key + ' (saved - leave blank to keep)'
                : 'Enter transaction key';
            document.getElementById('authnetClientKey').value = settings.authnet_client_key || '';
            document.getElementById('authnetEnvironment').value = settings.authnet_environment || 'sandbox';

            this.updatePaymentStatus(status);
        } catch (error) {
            this.showNotification('Error loading payment settings: ' + error.message, 'error');
        }
    }

    async savePaymentSettings() {
        const apiLoginId = document.getElementById('authnetApiLoginId').value.trim();
        const transactionKey = document.getElementById('authnetTransactionKey').value.trim();
        const clientKey = document.getElementById('authnetClientKey').value.trim();
        const environment = document.getElementById('authnetEnvironment').value;

        if (apiLoginId && apiLoginId.length < 5) {
            this.showNotification('API Login ID appears too short. Please check the value.', 'error');
            return;
        }
        if (transactionKey && transactionKey.length < 10) {
            this.showNotification('Transaction Key appears too short. Please check the value.', 'error');
            return;
        }
        if (clientKey && clientKey.length < 10) {
            this.showNotification('Client Key appears too short. Please check the value.', 'error');
            return;
        }

        const settingsData = [
            { key: 'authnet_api_login_id', value: apiLoginId, category: 'payment' },
            { key: 'authnet_client_key', value: clientKey, category: 'payment' },
            { key: 'authnet_environment', value: environment, category: 'payment' }
        ];

        if (transactionKey) {
            settingsData.push({ key: 'authnet_transaction_key', value: transactionKey, category: 'payment' });
        }

        const loading = document.getElementById('paymentLoading');
        loading.style.display = 'inline-block';
        try {
            await window.ApiClient.adminUpsert('site_settings', settingsData);
            this.showNotification('Payment settings saved successfully!', 'success');
            await this.loadPaymentSettings();
        } catch (error) {
            this.showNotification('Error saving payment settings: ' + error.message, 'error');
        } finally {
            loading.style.display = 'none';
        }
    }

    async testPaymentConnection() {
        const testBtn = document.getElementById('testConnectionBtn');
        const resultDiv = document.getElementById('paymentTestResult');
        testBtn.disabled = true;
        testBtn.textContent = 'Testing...';
        resultDiv.style.display = 'block';
        resultDiv.style.background = '#f8fafc';
        resultDiv.style.color = '#475569';
        resultDiv.style.border = '1px solid #e2e8f0';
        resultDiv.textContent = 'Connecting to Authorize.net...';

        try {
            const result = await window.ApiClient.testPaymentConnection();
            if (result.success) {
                resultDiv.style.background = '#f0fdf4';
                resultDiv.style.color = '#166534';
                resultDiv.style.border = '1px solid #bbf7d0';
                resultDiv.textContent = '\u2713 ' + result.message + ' (Environment: ' + result.environment + ')';
            } else {
                resultDiv.style.background = '#fef2f2';
                resultDiv.style.color = '#991b1b';
                resultDiv.style.border = '1px solid #fecaca';
                resultDiv.textContent = '\u2717 ' + (result.error || 'Connection test failed.');
            }
        } catch (error) {
            resultDiv.style.background = '#fef2f2';
            resultDiv.style.color = '#991b1b';
            resultDiv.style.border = '1px solid #fecaca';
            resultDiv.textContent = '\u2717 Error: ' + error.message;
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = 'Test Connection';
        }
    }

    updatePaymentStatus(status) {
        const statusDiv = document.getElementById('paymentStatusIndicator');
        if (!statusDiv) return;

        if (status.configured) {
            statusDiv.style.background = '#f0fdf4';
            statusDiv.style.border = '1px solid #bbf7d0';
            statusDiv.style.color = '#166534';
            statusDiv.innerHTML = '<strong>\u2713 Payment Gateway Configured</strong> &mdash; ' +
                (status.environment === 'production' ? 'LIVE (Production)' : 'Sandbox (Testing)') +
                '<br><small style="color: #15803d;">API Login ID, Transaction Key, and Client Key are all set.</small>';
        } else {
            const missing = [];
            if (!status.hasLoginId) missing.push('API Login ID');
            if (!status.hasTransactionKey) missing.push('Transaction Key');
            if (!status.hasClientKey) missing.push('Client Key');
            statusDiv.style.background = '#fef3c7';
            statusDiv.style.border = '1px solid #fde68a';
            statusDiv.style.color = '#92400e';
            statusDiv.innerHTML = '<strong>\u26A0 Payment Gateway Not Fully Configured</strong>' +
                '<br><small>Missing: ' + missing.join(', ') + '</small>';
        }
        statusDiv.style.display = 'block';
    }

    async savePageContent() {
        const pageName = document.getElementById('pageSelector').value;
        const heroTitle = document.getElementById('heroTitle').value;
        const heroSubtitle = document.getElementById('heroSubtitle').value;
        const heroDescription = document.getElementById('heroDescription').value;
        const heroImageUrl = document.getElementById('heroImageUrl').value;
        const loading = document.getElementById('pageLoading');
        loading.style.display = 'inline-block';

        try {
            // Save page content via upsert
            await window.ApiClient.adminUpsert('page_content', [
                { page: pageName, section_key: 'page_title', content_type: 'text', content_value: document.getElementById('pageTitle').value },
                { page: pageName, section_key: 'meta_description', content_type: 'text', content_value: document.getElementById('metaDescription').value },
                { page: pageName, section_key: 'hero_title', content_type: 'text', content_value: heroTitle }
            ]);

            // Collect hero stats
            const heroStats = [];
            for (let i = 1; i <= 3; i++) {
                const labelEl = document.getElementById(`heroStatLabel${i}`);
                const valueEl = document.getElementById(`heroStatValue${i}`);
                if (labelEl && valueEl && labelEl.value && valueEl.value) {
                    heroStats.push({ label: labelEl.value, number: valueEl.value });
                }
            }

            // Save hero section via upsert
            await window.ApiClient.adminUpsert('hero_sections', {
                page: pageName,
                title: heroTitle,
                subtitle: heroSubtitle,
                description: heroDescription,
                image_url: heroImageUrl,
                stats: JSON.stringify(heroStats)
            });

            this.showNotification('Page content saved successfully!', 'success');
            this.loadStats();

            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: 'cms-content-updated', page: pageName }, '*');
            }
        } catch (error) {
            this.showNotification('Error saving page content: ' + error.message, 'error');
        } finally {
            loading.style.display = 'none';
        }
    }

    async saveSiteSettings() {
        const settingsData = [
            { key: 'site_name', value: document.getElementById('siteName').value },
            { key: 'site_tagline', value: document.getElementById('siteTagline').value },
            { key: 'contact_email', value: document.getElementById('contactEmail').value },
            { key: 'contact_phone', value: document.getElementById('contactPhone').value },
            { key: 'contact_address', value: document.getElementById('contactAddress').value },
            { key: 'logo_url', value: document.getElementById('logoUrl').value },
            { key: 'footer_text', value: document.getElementById('footerText').value }
        ];
        const loading = document.getElementById('settingsLoading');
        loading.style.display = 'inline-block';
        try {
            await window.ApiClient.adminUpsert('site_settings', settingsData);
            this.showNotification('Site settings saved successfully!', 'success');
        } catch (error) {
            this.showNotification('Error saving site settings: ' + error.message, 'error');
        } finally {
            loading.style.display = 'none';
        }
    }

    showAddServiceModal() {
        this.createModal('Add New Service', this.getServiceFormHTML(), async (formData) => {
            await window.ApiClient.adminInsert('services', {
                slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                title: formData.title,
                subtitle: formData.subtitle,
                description: formData.description,
                base_price: formData.base_price,
                features: JSON.stringify(formData.features ? formData.features.split('\n').filter(f => f.trim()) : []),
                add_ons: '[]',
                display_order: 999,
                status: 'active'
            });
            this.showNotification('Service added successfully!', 'success');
            this.loadServices();
            this.loadStats();
        });
    }

    editService(serviceId) { this.showNotification('Service editing coming soon!', 'info'); }

    async deleteService(serviceId) {
        if (!confirm('Are you sure you want to delete this service?')) return;
        try {
            await window.ApiClient.adminDelete('services', serviceId);
            this.showNotification('Service deleted successfully!', 'success');
            this.loadServices();
            this.loadStats();
        } catch (error) {
            this.showNotification('Error deleting service: ' + error.message, 'error');
        }
    }

    showAddBlogModal() {
        this.createModal('Add New Blog Post', this.getBlogFormHTML(), async (formData) => {
            const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            await window.ApiClient.adminInsert('blog_posts', {
                title: formData.title, slug,
                excerpt: formData.excerpt, content: formData.content,
                featured_image: formData.featured_image, author: formData.author,
                published_date: formData.status === 'published' ? new Date().toISOString().split('T')[0] : null,
                status: formData.status
            });
            this.showNotification('Blog post added successfully!', 'success');
            this.loadBlogPosts();
            this.loadStats();
        });
    }

    editBlogPost(postId) { this.showNotification('Blog post editing coming soon!', 'info'); }

    async deleteBlogPost(postId) {
        if (!confirm('Are you sure you want to delete this blog post?')) return;
        try {
            await window.ApiClient.adminDelete('blog_posts', postId);
            this.showNotification('Blog post deleted successfully!', 'success');
            this.loadBlogPosts();
            this.loadStats();
        } catch (error) {
            this.showNotification('Error deleting blog post: ' + error.message, 'error');
        }
    }

    showAddTestimonialModal() {
        this.createModal('Add New Testimonial', this.getTestimonialFormHTML(), async (formData) => {
            await window.ApiClient.adminInsert('testimonials', {
                author_name: formData.author_name, company: formData.company,
                content: formData.content, rating: parseInt(formData.rating),
                display_order: 999, active: true
            });
            this.showNotification('Testimonial added successfully!', 'success');
            this.loadTestimonials();
            this.loadStats();
        });
    }

    editTestimonial(testimonialId) { this.showNotification('Testimonial editing coming soon!', 'info'); }

    async deleteTestimonial(testimonialId) {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            await window.ApiClient.adminDelete('testimonials', testimonialId);
            this.showNotification('Testimonial deleted successfully!', 'success');
            this.loadTestimonials();
            this.loadStats();
        } catch (error) {
            this.showNotification('Error deleting testimonial: ' + error.message, 'error');
        }
    }

    createModal(title, content, onSubmit) {
        const modalHTML = `
            <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
                <div class="modal-content" style="background: white; border-radius: 8px; padding: 2rem; max-width: 600px; width: 90%; max-height: 80%; overflow-y: auto;">
                    <h3 style="margin-top: 0;">${title}</h3>
                    ${content}
                    <div style="margin-top: 2rem; text-align: right;">
                        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button class="btn-primary" onclick="cmsManager.submitModal(this.closest('.modal-content'))">Save</button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modalsContainer').innerHTML = modalHTML;
        this.currentModalSubmit = onSubmit;
    }

    submitModal(modalContent) {
        const form = modalContent.querySelector('form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        this.currentModalSubmit(data).catch(error => {
            this.showNotification('Error: ' + error.message, 'error');
        }).finally(() => { modalContent.closest('.modal-overlay').remove(); });
    }

    getServiceFormHTML() {
        return `<form>
            <div class="form-group"><label class="form-label">Service Title</label><input type="text" name="title" class="form-input" required></div>
            <div class="form-group"><label class="form-label">Subtitle</label><input type="text" name="subtitle" class="form-input"></div>
            <div class="form-group"><label class="form-label">Description</label><textarea name="description" class="form-textarea" rows="4"></textarea></div>
            <div class="form-group"><label class="form-label">Base Price</label><input type="text" name="base_price" class="form-input" placeholder="e.g., $200 per sample"></div>
            <div class="form-group"><label class="form-label">Features (one per line)</label><textarea name="features" class="form-textarea" rows="4"></textarea></div>
        </form>`;
    }

    getBlogFormHTML() {
        return `<form>
            <div class="form-group"><label class="form-label">Title</label><input type="text" name="title" class="form-input" required></div>
            <div class="form-group"><label class="form-label">Excerpt</label><textarea name="excerpt" class="form-textarea" rows="2"></textarea></div>
            <div class="form-group"><label class="form-label">Content</label><textarea name="content" class="form-textarea" rows="6"></textarea></div>
            <div class="form-group"><label class="form-label">Featured Image URL</label><input type="text" name="featured_image" class="form-input"></div>
            <div class="form-group"><label class="form-label">Author</label><input type="text" name="author" class="form-input" value="Zyntro Team"></div>
            <div class="form-group"><label class="form-label">Status</label><select name="status" class="form-select"><option value="draft">Draft</option><option value="published">Published</option></select></div>
        </form>`;
    }

    getTestimonialFormHTML() {
        return `<form>
            <div class="form-group"><label class="form-label">Author Name</label><input type="text" name="author_name" class="form-input" required></div>
            <div class="form-group"><label class="form-label">Company</label><input type="text" name="company" class="form-input"></div>
            <div class="form-group"><label class="form-label">Rating</label><select name="rating" class="form-select"><option value="5">5 Stars</option><option value="4">4 Stars</option><option value="3">3 Stars</option><option value="2">2 Stars</option><option value="1">1 Star</option></select></div>
            <div class="form-group"><label class="form-label">Testimonial Content</label><textarea name="content" class="form-textarea" rows="4" required></textarea></div>
        </form>`;
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        setTimeout(() => { notification.classList.remove('show'); }, 4000);
    }

    async updateHeroImagePreview(imageValue) {
        const preview = document.getElementById('heroImagePreview');
        const thumbnail = document.getElementById('heroImageThumbnail');
        const imageName = document.getElementById('heroImageName');
        if (!imageValue) { preview.style.display = 'none'; return; }
        const isMediaId = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(imageValue);
        if (isMediaId) {
            try {
                const result = await window.ApiClient.getMediaById(imageValue);
                if (result.data) {
                    thumbnail.src = result.data.file_url;
                    thumbnail.alt = result.data.alt_text || result.data.original_name;
                    imageName.textContent = result.data.original_name;
                    preview.style.display = 'block';
                }
            } catch (error) { this.showNotification('Error loading image from media library', 'error'); }
        } else {
            thumbnail.src = imageValue;
            thumbnail.alt = 'Hero Image';
            imageName.textContent = 'Direct URL: ' + imageValue.substring(0, 50) + '...';
            preview.style.display = 'block';
        }
    }

    selectHeroImage() {
        this.showMediaSelector('Select Hero Image', (selectedMedia) => {
            document.getElementById('heroImageUrl').value = selectedMedia.id;
            this.updateHeroImagePreview(selectedMedia.id);
        });
    }

    clearHeroImage() {
        document.getElementById('heroImageUrl').value = '';
        document.getElementById('heroImagePreview').style.display = 'none';
    }

    async showMediaSelector(title, onSelect) {
        try {
            const result = await window.ApiClient.getMedia();
            const mediaItems = result.data || [];
            const mediaHTML = mediaItems.map(media => `
                <div class="media-item" style="display: inline-block; margin: 0.5rem; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; text-align: center;" data-media-id="${media.id}">
                    <img src="${media.file_url}" alt="${media.alt_text || media.original_name}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px;">
                    <p style="margin: 0.25rem 0 0; font-size: 0.75rem; color: #64748b;">${media.original_name}</p>
                </div>
            `).join('');

            const modalHTML = `
                <div class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;" onclick="if(event.target === this) this.remove()">
                    <div class="modal-content" style="background: white; border-radius: 8px; padding: 2rem; max-width: 800px; width: 90%; max-height: 80%; overflow-y: auto;">
                        <h3 style="margin-top: 0;">${title}</h3>
                        <div style="max-height: 400px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px; padding: 1rem;">
                            ${mediaItems.length > 0 ? mediaHTML : '<p style="text-align: center; color: #64748b;">No media files found.</p>'}
                        </div>
                        <div style="margin-top: 2rem; text-align: right;">
                            <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Click handlers for media items
            document.querySelectorAll('.modal-overlay .media-item').forEach(item => {
                item.addEventListener('click', () => {
                    const mediaId = item.dataset.mediaId;
                    const media = mediaItems.find(m => m.id === mediaId);
                    if (media) {
                        onSelect(media);
                        item.closest('.modal-overlay').remove();
                    }
                });
            });
        } catch (error) {
            this.showNotification('Error loading media library', 'error');
        }
    }
}

const cmsManager = new CMSManager();
window.cmsManager = cmsManager;
window.showAddServiceModal = () => cmsManager.showAddServiceModal();
window.showAddBlogModal = () => cmsManager.showAddBlogModal();
window.showAddTestimonialModal = () => cmsManager.showAddTestimonialModal();
window.savePageContent = () => cmsManager.savePageContent();
window.saveSiteSettings = () => cmsManager.saveSiteSettings();
window.savePaymentSettings = () => cmsManager.savePaymentSettings();
window.testPaymentConnection = () => cmsManager.testPaymentConnection();
window.selectHeroImage = () => cmsManager.selectHeroImage();
window.clearHeroImage = () => cmsManager.clearHeroImage();

window.logout = () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('admin_authenticated');
        window.location.href = 'index.html';
    }
};
