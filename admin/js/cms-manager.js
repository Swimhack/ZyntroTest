// Wait for Supabase to be initialized
let supabase = null;
let cmsManagerInstance = null;

// Initialize Supabase when the script loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('CMS Manager: Starting initialization...');
        
        // Wait for Supabase to be initialized
        await new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait
            
            const checkSupabase = () => {
                attempts++;
                
                if (window.supabaseClient) {
                    supabase = window.supabaseClient;
                    console.log('CMS Manager: Supabase client found');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.error('CMS Manager: Supabase client not found after maximum attempts');
                    reject(new Error('Supabase client not initialized'));
                } else {
                    console.log(`CMS Manager: Waiting for Supabase client... (attempt ${attempts})`);
                    setTimeout(checkSupabase, 100);
                }
            };
            checkSupabase();
        });
        
        console.log('CMS Manager: Supabase client initialized successfully');
        
        // Create and initialize CMS Manager after Supabase is ready
        cmsManagerInstance = new CMSManager();
        cmsManagerInstance.init(); // Initialize the CMS manager
        window.cmsManager = cmsManagerInstance;
        
    } catch (error) {
        console.error('CMS Manager: Initialization failed:', error);
        
        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; margin: 1rem; border-radius: 0.5rem;">
                <strong>Database Connection Error</strong><br>
                Unable to connect to the database. Please check your internet connection and refresh the page.
                <br><br>
                <button onclick="window.location.reload()" style="background: #dc2626; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">
                    Refresh Page
                </button>
            </div>
        `;
        
        // Insert error message at the top of the page
        const mainContent = document.querySelector('.main-content') || document.querySelector('.cms-container') || document.body;
        if (mainContent) {
            mainContent.insertBefore(errorDiv, mainContent.firstChild);
        }
    }
});

class CMSManager {
    constructor() {
        this.currentTab = 'pages';
        this.editingItem = null;
        console.log('CMS Manager: Constructor called');
    }
    
    init() {
        console.log('CMS Manager: Initializing...');
        if (!supabase) {
            console.error('CMS Manager: Supabase client not available during init');
            return;
        }
        
        this.setupTabNavigation();
        this.loadStats();
        this.loadCurrentTabContent();
        this.setupPageSelector();
        console.log('CMS Manager: Initialization complete');
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update active tab content
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
            pageSelector.addEventListener('change', () => {
                this.loadPageContent(pageSelector.value);
            });
        }
    }

    async loadStats() {
        try {
            const [servicesResult, blogResult, testimonialsResult, pagesResult] = await Promise.all([
                supabase.from('services').select('*', { count: 'exact', head: true }),
                supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
                supabase.from('testimonials').select('*', { count: 'exact', head: true }),
                supabase.from('page_content').select('*', { count: 'exact', head: true })
            ]);

            document.getElementById('servicesCount').textContent = servicesResult.count || 0;
            document.getElementById('blogPostsCount').textContent = blogResult.count || 0;
            document.getElementById('testimonialsCount').textContent = testimonialsResult.count || 0;
            document.getElementById('pagesCount').textContent = pagesResult.count || 0;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadCurrentTabContent() {
        try {
            console.log('Loading content for tab:', this.currentTab);
            
            if (!supabase) {
                console.error('Supabase client not initialized');
                this.showNotification('Database connection not ready. Please refresh the page.', 'error');
                return;
            }
            
            switch (this.currentTab) {
                case 'pages':
                    await this.loadPageContent('index');
                    break;
                case 'services':
                    await this.loadServices();
                    break;
                case 'blog':
                    await this.loadBlogPosts();
                    break;
                case 'testimonials':
                    await this.loadTestimonials();
                    break;
                case 'settings':
                    await this.loadSiteSettings();
                    break;
            }
        } catch (error) {
            console.error('Error loading tab content:', error);
            this.showNotification('Error loading content: ' + error.message, 'error');
        }
    }

    async loadPageContent(pageName) {
        try {
            console.log('Loading page content for:', pageName);
            
            const { data: pageContent, error } = await supabase
                .from('page_content')
                .select('*')
                .eq('page', pageName);

            if (error) throw error;
            console.log('Page content loaded:', pageContent?.length || 0, 'records');

            const { data: heroSection, error: heroError } = await supabase
                .from('hero_sections')
                .select('*')
                .eq('page', pageName)
                .single();

            if (heroError && heroError.code !== 'PGRST116') throw heroError;
            console.log('Hero section loaded:', heroSection ? 'Yes' : 'No');

            // Populate form fields
            const contentMap = {};
            pageContent?.forEach(item => {
                contentMap[item.section_key] = item.content_value;
            });

            console.log('Content map:', contentMap);

            document.getElementById('pageTitle').value = contentMap.page_title || '';
            document.getElementById('metaDescription').value = contentMap.meta_description || '';
            document.getElementById('heroTitle').value = heroSection?.title || contentMap.hero_title || '';
            document.getElementById('heroSubtitle').value = heroSection?.subtitle || '';
            document.getElementById('heroDescription').value = heroSection?.description || '';
            // Load hero image (handle both URLs and media IDs)
            const heroImageUrl = heroSection?.image_url || '';
            document.getElementById('heroImageUrl').value = heroImageUrl;
            if (heroImageUrl) {
                this.updateHeroImagePreview(heroImageUrl);
            }
            
            // Load hero stats if they exist
            if (heroSection?.stats && Array.isArray(heroSection.stats)) {
                heroSection.stats.forEach((stat, index) => {
                    const statLabelId = `heroStatLabel${index + 1}`;
                    const statValueId = `heroStatValue${index + 1}`;
                    const statLabelEl = document.getElementById(statLabelId);
                    const statValueEl = document.getElementById(statValueId);
                    if (statLabelEl) statLabelEl.value = stat.label || '';
                    if (statValueEl) statValueEl.value = stat.number || '';
                });
            }

            console.log('Form fields populated successfully');

        } catch (error) {
            console.error('Error loading page content:', error);
            this.showNotification('Error loading page content: ' + error.message, 'error');
        }
    }

    async loadServices() {
        try {
            const { data: services, error } = await supabase
                .from('services')
                .select('*')
                .order('display_order');

            if (error) throw error;

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
            const { data: posts, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('published_date', { ascending: false });

            if (error) throw error;

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
            const { data: testimonials, error } = await supabase
                .from('testimonials')
                .select('*')
                .order('display_order');

            if (error) throw error;

            const testimonialsList = document.getElementById('testimonialsList');
            if (testimonials.length === 0) {
                testimonialsList.innerHTML = '<p>No testimonials found. <a href="#" onclick="cmsManager.showAddTestimonialModal()">Add your first testimonial</a>.</p>';
                return;
            }

            testimonialsList.innerHTML = testimonials.map(testimonial => `
                <div class="content-item">
                    <div class="content-item-info">
                        <h4>${testimonial.author_name}</h4>
                        <p><strong>Company:</strong> ${testimonial.company || 'Not specified'}</p>
                        <p><strong>Rating:</strong> ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</p>
                        <p>${testimonial.content.substring(0, 100)}${testimonial.content.length > 100 ? '...' : ''}</p>
                        <span class="status-badge ${testimonial.active ? 'active' : 'inactive'}">${testimonial.active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div class="content-item-actions">
                        <button class="btn-secondary btn-small" onclick="cmsManager.editTestimonial('${testimonial.id}')">Edit</button>
                        <button class="btn-danger btn-small" onclick="cmsManager.deleteTestimonial('${testimonial.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            this.showNotification('Error loading testimonials: ' + error.message, 'error');
        }
    }

    async loadSiteSettings() {
        try {
            const { data: settings, error } = await supabase
                .from('site_settings')
                .select('*');

            if (error) throw error;

            const settingsMap = {};
            settings.forEach(setting => {
                settingsMap[setting.key] = setting.value;
            });

            // Populate form fields
            document.getElementById('siteName').value = settingsMap.site_name || '';
            document.getElementById('siteTagline').value = settingsMap.site_tagline || '';
            document.getElementById('contactEmail').value = settingsMap.contact_email || '';
            document.getElementById('contactPhone').value = settingsMap.contact_phone || '';
            document.getElementById('contactAddress').value = settingsMap.contact_address || '';
            document.getElementById('logoUrl').value = settingsMap.logo_url || '';
            document.getElementById('footerText').value = settingsMap.footer_text || '';

        } catch (error) {
            this.showNotification('Error loading site settings: ' + error.message, 'error');
        }
    }

    async savePageContent() {
        const pageSelector = document.getElementById('pageSelector');
        const pageName = pageSelector.value;
        
        const pageTitle = document.getElementById('pageTitle').value;
        const metaDescription = document.getElementById('metaDescription').value;
        const heroTitle = document.getElementById('heroTitle').value;
        const heroSubtitle = document.getElementById('heroSubtitle').value;
        const heroDescription = document.getElementById('heroDescription').value;
        const heroImageUrl = document.getElementById('heroImageUrl').value;

        const loading = document.getElementById('pageLoading');
        loading.style.display = 'inline-block';

        try {
            // Save page content
            const pageContentData = [
                { page: pageName, section_key: 'page_title', content_type: 'text', content_value: pageTitle },
                { page: pageName, section_key: 'meta_description', content_type: 'text', content_value: metaDescription },
                { page: pageName, section_key: 'hero_title', content_type: 'text', content_value: heroTitle }
            ];

            const { error: pageError } = await supabase
                .from('page_content')
                .upsert(pageContentData, { onConflict: 'page,section_key' });

            if (pageError) throw pageError;

            // Collect hero stats
            const heroStats = [];
            for (let i = 1; i <= 3; i++) {
                const labelEl = document.getElementById(`heroStatLabel${i}`);
                const valueEl = document.getElementById(`heroStatValue${i}`);
                if (labelEl && valueEl && labelEl.value && valueEl.value) {
                    heroStats.push({
                        label: labelEl.value,
                        number: valueEl.value
                    });
                }
            }

            // Save hero section
            const { error: heroError } = await supabase
                .from('hero_sections')
                .upsert({
                    page: pageName,
                    title: heroTitle,
                    subtitle: heroSubtitle,
                    description: heroDescription,
                    image_url: heroImageUrl,
                    stats: heroStats
                }, { onConflict: 'page' });

            if (heroError) throw heroError;

            this.showNotification('Page content saved successfully!', 'success');
            this.loadStats(); // Refresh stats

            // Clear frontend cache
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
            const { error } = await supabase
                .from('site_settings')
                .upsert(settingsData, { onConflict: 'key' });

            if (error) throw error;

            this.showNotification('Site settings saved successfully!', 'success');

        } catch (error) {
            this.showNotification('Error saving site settings: ' + error.message, 'error');
        } finally {
            loading.style.display = 'none';
        }
    }

    showAddServiceModal() {
        this.createModal('Add New Service', this.getServiceFormHTML(), async (formData) => {
            const { error } = await supabase
                .from('services')
                .insert([{
                    slug: formData.slug,
                    title: formData.title,
                    subtitle: formData.subtitle,
                    description: formData.description,
                    base_price: formData.base_price,
                    features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : [],
                    add_ons: [],
                    display_order: 999,
                    status: 'active'
                }]);

            if (error) throw error;
            this.showNotification('Service added successfully!', 'success');
            this.loadServices();
            this.loadStats();
        });
    }

    editService(serviceId) {
        // Implementation for editing service
        this.showNotification('Service editing coming soon!', 'info');
    }

    deleteService(serviceId) {
        if (confirm('Are you sure you want to delete this service?')) {
            supabase.from('services').delete().eq('id', serviceId)
                .then(({ error }) => {
                    if (error) throw error;
                    this.showNotification('Service deleted successfully!', 'success');
                    this.loadServices();
                    this.loadStats();
                })
                .catch(error => {
                    this.showNotification('Error deleting service: ' + error.message, 'error');
                });
        }
    }

    showAddBlogModal() {
        this.createModal('Add New Blog Post', this.getBlogFormHTML(), async (formData) => {
            const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            
            const { error } = await supabase
                .from('blog_posts')
                .insert([{
                    title: formData.title,
                    slug: slug,
                    excerpt: formData.excerpt,
                    content: formData.content,
                    featured_image: formData.featured_image,
                    author: formData.author,
                    published_date: formData.status === 'published' ? new Date().toISOString().split('T')[0] : null,
                    status: formData.status
                }]);

            if (error) throw error;
            this.showNotification('Blog post added successfully!', 'success');
            this.loadBlogPosts();
            this.loadStats();
        });
    }

    editBlogPost(postId) {
        // Implementation for editing blog post
        this.showNotification('Blog post editing coming soon!', 'info');
    }

    deleteBlogPost(postId) {
        if (confirm('Are you sure you want to delete this blog post?')) {
            supabase.from('blog_posts').delete().eq('id', postId)
                .then(({ error }) => {
                    if (error) throw error;
                    this.showNotification('Blog post deleted successfully!', 'success');
                    this.loadBlogPosts();
                    this.loadStats();
                })
                .catch(error => {
                    this.showNotification('Error deleting blog post: ' + error.message, 'error');
                });
        }
    }

    showAddTestimonialModal() {
        this.createModal('Add New Testimonial', this.getTestimonialFormHTML(), async (formData) => {
            const { error } = await supabase
                .from('testimonials')
                .insert([{
                    author_name: formData.author_name,
                    company: formData.company,
                    content: formData.content,
                    rating: parseInt(formData.rating),
                    display_order: 999,
                    active: true
                }]);

            if (error) throw error;
            this.showNotification('Testimonial added successfully!', 'success');
            this.loadTestimonials();
            this.loadStats();
        });
    }

    editTestimonial(testimonialId) {
        // Implementation for editing testimonial
        this.showNotification('Testimonial editing coming soon!', 'info');
    }

    deleteTestimonial(testimonialId) {
        if (confirm('Are you sure you want to delete this testimonial?')) {
            supabase.from('testimonials').delete().eq('id', testimonialId)
                .then(({ error }) => {
                    if (error) throw error;
                    this.showNotification('Testimonial deleted successfully!', 'success');
                    this.loadTestimonials();
                    this.loadStats();
                })
                .catch(error => {
                    this.showNotification('Error deleting testimonial: ' + error.message, 'error');
                });
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
        
        // Store the onSubmit function for later use
        this.currentModalSubmit = onSubmit;
    }

    submitModal(modalContent) {
        const form = modalContent.querySelector('form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        this.currentModalSubmit(data).catch(error => {
            this.showNotification('Error: ' + error.message, 'error');
        }).finally(() => {
            modalContent.closest('.modal-overlay').remove();
        });
    }

    getServiceFormHTML() {
        return `
            <form>
                <div class="form-group">
                    <label class="form-label">Service Title</label>
                    <input type="text" name="title" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Subtitle</label>
                    <input type="text" name="subtitle" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea name="description" class="form-textarea" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Base Price</label>
                    <input type="text" name="base_price" class="form-input" placeholder="e.g., $200 per sample">
                </div>
                <div class="form-group">
                    <label class="form-label">Features (one per line)</label>
                    <textarea name="features" class="form-textarea" rows="4" placeholder="Peptide purity percentage&#10;Molecular weight confirmation&#10;Impurity identification"></textarea>
                </div>
            </form>
        `;
    }

    getBlogFormHTML() {
        return `
            <form>
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" name="title" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Excerpt</label>
                    <textarea name="excerpt" class="form-textarea" rows="2"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Content</label>
                    <textarea name="content" class="form-textarea" rows="6"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Featured Image URL</label>
                    <input type="text" name="featured_image" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Author</label>
                    <input type="text" name="author" class="form-input" value="Zyntro Team">
                </div>
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select name="status" class="form-select">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>
            </form>
        `;
    }

    getTestimonialFormHTML() {
        return `
            <form>
                <div class="form-group">
                    <label class="form-label">Author Name</label>
                    <input type="text" name="author_name" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Company</label>
                    <input type="text" name="company" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Rating</label>
                    <select name="rating" class="form-select">
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Testimonial Content</label>
                    <textarea name="content" class="form-textarea" rows="4" required></textarea>
                </div>
            </form>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
    
    // Hero image media selection methods
    async updateHeroImagePreview(imageValue) {
        const preview = document.getElementById('heroImagePreview');
        const thumbnail = document.getElementById('heroImageThumbnail');
        const imageName = document.getElementById('heroImageName');
        
        if (!imageValue) {
            preview.style.display = 'none';
            return;
        }
        
        // Check if it's a media ID (UUID format) or direct URL
        const isMediaId = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(imageValue);
        
        if (isMediaId) {
            // Load from media table
            try {
                const { data: media, error } = await supabase
                    .from('cms_media')
                    .select('*')
                    .eq('id', imageValue)
                    .single();
                    
                if (error) throw error;
                
                if (media) {
                    thumbnail.src = media.file_url;
                    thumbnail.alt = media.alt_text || media.original_name;
                    imageName.textContent = media.original_name;
                    preview.style.display = 'block';
                }
            } catch (error) {
                console.error('Error loading media:', error);
                this.showNotification('Error loading image from media library', 'error');
            }
        } else {
            // Direct URL
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
            // Load media from database
            const { data: mediaItems, error } = await supabase
                .from('cms_media')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            const mediaHTML = mediaItems.map(media => `
                <div class="media-item" style="display: inline-block; margin: 0.5rem; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; text-align: center;" onclick="cmsManager.handleMediaSelect('${media.id}', this)">
                    <img src="${media.file_url}" alt="${media.alt_text || media.original_name}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 4px; display: block; margin-bottom: 0.5rem;">
                    <p style="margin: 0; font-size: 0.75rem; color: #64748b; word-break: break-all;">${media.original_name}</p>
                </div>
            `).join('');
            
            const modalContent = `
                <div style="max-height: 400px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px; padding: 1rem; margin: 1rem 0;">
                    ${mediaItems.length > 0 ? mediaHTML : '<p style="text-align: center; color: #64748b;">No media files found. Upload some images first.</p>'}
                </div>
                <p style="color: #64748b; font-size: 0.875rem;">Click on an image to select it, or <a href="#" onclick="document.querySelector('[data-tab=\"media\"]').click(); this.closest('.modal-overlay').remove();">upload new media</a>.</p>
            `;
            
            const modalHTML = `
                <div class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;" onclick="if(event.target === this) this.remove()">
                    <div class="modal-content" style="background: white; border-radius: 8px; padding: 2rem; max-width: 800px; width: 90%; max-height: 80%; overflow-y: auto;">
                        <h3 style="margin-top: 0;">${title}</h3>
                        ${modalContent}
                        <div style="margin-top: 2rem; text-align: right;">
                            <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Store the onSelect callback
            this.mediaSelectCallback = onSelect;
            
        } catch (error) {
            console.error('Error loading media:', error);
            this.showNotification('Error loading media library', 'error');
        }
    }
    
    handleMediaSelect(mediaId, element) {
        // Remove previous selection
        document.querySelectorAll('.media-item').forEach(item => {
            item.style.border = '1px solid #e2e8f0';
            item.style.backgroundColor = 'transparent';
        });
        
        // Highlight selected item
        element.style.border = '2px solid #3b82f6';
        element.style.backgroundColor = '#eff6ff';
        
        // Find the selected media data
        const mediaItems = document.querySelectorAll('.media-item');
        let selectedIndex = -1;
        mediaItems.forEach((item, index) => {
            if (item === element) selectedIndex = index;
        });
        
        if (selectedIndex >= 0 && this.mediaSelectCallback) {
            // Get media data and call callback
            supabase.from('cms_media')
                .select('*')
                .order('created_at', { ascending: false })
                .then(({ data, error }) => {
                    if (!error && data && data[selectedIndex]) {
                        this.mediaSelectCallback(data[selectedIndex]);
                        element.closest('.modal-overlay').remove();
                    }
                });
        }
    }
}

// Initialize CMS Manager
const cmsManager = new CMSManager();

// Global functions for onclick handlers
window.cmsManager = cmsManager;
window.showAddServiceModal = () => cmsManager.showAddServiceModal();
window.showAddBlogModal = () => cmsManager.showAddBlogModal();
window.showAddTestimonialModal = () => cmsManager.showAddTestimonialModal();
window.savePageContent = () => cmsManager.savePageContent();
window.saveSiteSettings = () => cmsManager.saveSiteSettings();
window.selectHeroImage = () => cmsManager.selectHeroImage();
window.clearHeroImage = () => cmsManager.clearHeroImage();

// Logout function
window.logout = () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('admin_authenticated');
        window.location.href = 'index.html';
    }
};
