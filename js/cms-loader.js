// Wait for Supabase to be available
let supabase = null;

// Initialize Supabase when available
const initSupabase = () => {
    if (window.supabaseClient) {
        supabase = window.supabaseClient;
        return true;
    }
    return false;
};

class CMSLoader {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    init() {
        console.log('CMS Loader: Initializing...');
        
        // Wait for Supabase to be available
        const checkSupabase = () => {
            if (initSupabase()) {
                console.log('CMS Loader: Supabase client found, loading content...');
                this.loadPageContent();
            } else {
                setTimeout(checkSupabase, 100);
            }
        };
        
        // Load content when DOM is ready
        if (document.readyState === 'loading') {
            console.log('CMS Loader: Waiting for DOM ready...');
            document.addEventListener('DOMContentLoaded', checkSupabase);
        } else {
            console.log('CMS Loader: DOM already ready, checking Supabase...');
            checkSupabase();
        }
    }

    async loadPageContent() {
        const currentPage = this.getCurrentPageName();
        console.log('CMS Loader: Loading content for page:', currentPage);
        if (!currentPage) {
            console.warn('CMS Loader: No current page found');
            return;
        }

        try {
            console.log('CMS Loader: Starting parallel content loading...');
            const loadPromises = [
                this.loadSiteSettings(),
                this.loadPageSpecificContent(currentPage),
                this.loadHeroSection(currentPage),
                this.loadServices(),
                this.loadTestimonials(),
                this.loadBlogPosts()
            ];

            // Load sample COA on homepage
            if (currentPage === 'index') {
                loadPromises.push(this.loadSampleCOA());
            }

            await Promise.all(loadPromises);
            console.log('CMS Loader: All content loaded successfully');
        } catch (error) {
            console.warn('CMS content loading failed, using fallback content:', error);
        }
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        const pageName = filename.replace('.html', '');
        
        // Map filenames to page names
        const pageMap = {
            'index': 'index',
            'services': 'services',
            'contact': 'contact',
            'blog': 'blog',
            'sample-submission': 'sample-submission',
            'search': 'search'
        };

        return pageMap[pageName] || 'index';
    }

    async loadSiteSettings() {
        const cached = this.getCached('site_settings');
        if (cached) {
            this.applySiteSettings(cached);
            return cached;
        }

        try {
            const { data: settings, error } = await supabase
                .from('site_settings')
                .select('*');

            if (error) throw error;

            const settingsMap = {};
            settings.forEach(setting => {
                settingsMap[setting.key] = setting.value;
            });

            this.setCached('site_settings', settingsMap);
            this.applySiteSettings(settingsMap);
            return settingsMap;
        } catch (error) {
            console.warn('Failed to load site settings:', error);
            return {};
        }
    }

    applySiteSettings(settings) {
        // Update site title if available
        if (settings.site_name) {
            const titleElements = document.querySelectorAll('title, .site-title, .logo-text');
            titleElements.forEach(el => {
                if (el.tagName === 'TITLE') {
                    el.textContent = el.textContent.replace('ZyntroTest', settings.site_name);
                } else {
                    el.textContent = settings.site_name;
                }
            });
        }

        // Update contact information
        if (settings.contact_email) {
            const emailLinks = document.querySelectorAll('a[href*="mailto:"]');
            emailLinks.forEach(link => {
                if (link.href.includes('info@zyntrotest.com')) {
                    link.href = `mailto:${settings.contact_email}`;
                    link.textContent = settings.contact_email;
                }
            });
        }

        // Update footer text
        if (settings.footer_text) {
            const footerText = document.querySelector('.footer-text, .trust-text');
            if (footerText) {
                footerText.textContent = settings.footer_text;
            }
        }
    }

    async loadPageSpecificContent(pageName) {
        const cached = this.getCached(`page_content_${pageName}`);
        if (cached) {
            this.applyPageContent(cached);
            return cached;
        }

        try {
            const { data: content, error } = await supabase
                .from('page_content')
                .select('*')
                .eq('page', pageName);

            if (error) throw error;

            const contentMap = {};
            content.forEach(item => {
                contentMap[item.section_key] = item.content_value;
            });

            this.setCached(`page_content_${pageName}`, contentMap);
            this.applyPageContent(contentMap);
            return contentMap;
        } catch (error) {
            console.warn(`Failed to load page content for ${pageName}:`, error);
            return {};
        }
    }

    applyPageContent(content) {
        // Update meta description
        if (content.meta_description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', content.meta_description);
            }
        }

        // Update page title
        if (content.page_title) {
            document.title = content.page_title;
        }

        // Update hero title if no hero section is loaded
        if (content.hero_title && !document.querySelector('.hero-title').hasAttribute('data-cms-loaded')) {
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle) {
                heroTitle.textContent = content.hero_title;
            }
        }
    }

    async loadHeroSection(pageName) {
        const cached = this.getCached(`hero_${pageName}`);
        if (cached) {
            this.applyHeroSection(cached);
            return cached;
        }

        try {
            const { data: hero, error } = await supabase
                .from('hero_sections')
                .select('*')
                .eq('page', pageName)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (hero) {
                this.setCached(`hero_${pageName}`, hero);
                this.applyHeroSection(hero);
            }
            return hero;
        } catch (error) {
            console.warn(`Failed to load hero section for ${pageName}:`, error);
            return null;
        }
    }

    applyHeroSection(hero) {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle && hero.title) {
            heroTitle.textContent = hero.title;
            heroTitle.setAttribute('data-cms-loaded', 'true');
        }

        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle && hero.subtitle) {
            heroSubtitle.textContent = hero.subtitle;
        }

        const heroDescription = document.querySelector('.hero-description');
        if (heroDescription && hero.description) {
            heroDescription.textContent = hero.description;
        }

        const heroImage = document.querySelector('.hero-image img');
        if (heroImage && hero.image_url) {
            heroImage.src = hero.image_url;
        }

        // Update CTA buttons
        if (hero.cta_primary_text) {
            const primaryBtn = document.querySelector('.hero-cta .btn-primary');
            if (primaryBtn) {
                primaryBtn.textContent = hero.cta_primary_text;
                if (hero.cta_primary_link) {
                    primaryBtn.href = hero.cta_primary_link;
                }
            }
        }

        if (hero.cta_secondary_text) {
            const secondaryBtn = document.querySelector('.hero-cta .btn-outline');
            if (secondaryBtn) {
                secondaryBtn.textContent = hero.cta_secondary_text;
                if (hero.cta_secondary_link) {
                    secondaryBtn.href = hero.cta_secondary_link;
                }
            }
        }

        // Update stats
        if (hero.stats && Array.isArray(hero.stats)) {
            console.log('CMS Loader: Loading hero stats:', hero.stats);
            const statsContainer = document.querySelector('.hero-stats');
            if (statsContainer) {
                console.log('CMS Loader: Stats container found, updating...');
                statsContainer.innerHTML = hero.stats.map(stat => `
                    <div class="stat">
                        <div class="stat-number">${stat.number}</div>
                        <div class="stat-label">${stat.label}</div>
                    </div>
                `).join('');
                console.log('CMS Loader: Stats updated successfully');
            } else {
                console.warn('CMS Loader: Stats container not found');
            }
        }
    }

    async loadServices() {
        const cached = this.getCached('services');
        if (cached) {
            this.applyServices(cached);
            return cached;
        }

        try {
            const { data: services, error } = await supabase
                .from('services')
                .select('*')
                .eq('status', 'active')
                .order('display_order');

            if (error) throw error;

            this.setCached('services', services);
            this.applyServices(services);
            return services;
        } catch (error) {
            console.warn('Failed to load services:', error);
            return [];
        }
    }

    applyServices(services) {
        // Update services grid on homepage
        const servicesGrid = document.querySelector('.services-grid');
        if (servicesGrid && services.length > 0) {
            servicesGrid.innerHTML = services.map((service, index) => `
                <div class="service-card">
                    <div class="service-icon">
                        ${service.icon_svg || this.getDefaultServiceIcon(index)}
                    </div>
                    <h3>${service.title}</h3>
                    <p>${service.description || service.subtitle || ''}</p>
                    <div class="price-range">${service.base_price || ''}</div>
                    <a href="services.html#${service.slug}" class="service-link">Learn More</a>
                </div>
            `).join('');
        }

        // Update services on services page
        this.updateServicesPage(services);
    }

    updateServicesPage(services) {
        if (window.location.pathname.includes('services.html')) {
            // Update service detail cards
            services.forEach(service => {
                const detailCard = document.getElementById(service.slug);
                if (detailCard) {
                    const title = detailCard.querySelector('h2');
                    if (title) title.textContent = service.title;

                    const subtitle = detailCard.querySelector('.service-subtitle');
                    if (subtitle) subtitle.textContent = service.subtitle || '';

                    const price = detailCard.querySelector('.price-range-large');
                    if (price) price.textContent = service.base_price || '';

                    const description = detailCard.querySelector('.service-description p');
                    if (description) description.textContent = service.description || '';

                    // Update features list
                    if (service.features && Array.isArray(service.features)) {
                        const featuresList = detailCard.querySelector('.service-description ul:first-of-type');
                        if (featuresList) {
                            featuresList.innerHTML = service.features.map(feature => 
                                `<li>${feature}</li>`
                            ).join('');
                        }
                    }

                    // Update add-ons list
                    if (service.add_ons && Array.isArray(service.add_ons)) {
                        const addOnsList = detailCard.querySelector('.service-description ul:last-of-type');
                        if (addOnsList) {
                            addOnsList.innerHTML = service.add_ons.map(addon => 
                                `<li><strong>${addon.name}:</strong> ${addon.price}</li>`
                            ).join('');
                        }
                    }
                }
            });

            // Update pricing table
            this.updatePricingTable(services);
        }
    }

    updatePricingTable(services) {
        const pricingTable = document.querySelector('.pricing-table tbody');
        if (pricingTable && services.length > 0) {
            pricingTable.innerHTML = services.map(service => {
                const addOnsText = service.add_ons && Array.isArray(service.add_ons) 
                    ? service.add_ons.map(addon => `${addon.name}: ${addon.price}`).join('<br>')
                    : '';
                
                return `
                    <tr>
                        <td data-label="Test Type">
                            <strong>${service.title}</strong>
                        </td>
                        <td data-label="Base Price">
                            <span class="price-highlight">${service.base_price || ''}</span>
                        </td>
                        <td data-label="Add-Ons">
                            ${addOnsText}
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    async loadTestimonials() {
        const cached = this.getCached('testimonials');
        if (cached) {
            this.applyTestimonials(cached);
            return cached;
        }

        try {
            const { data: testimonials, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('active', true)
                .order('display_order');

            if (error) throw error;

            this.setCached('testimonials', testimonials);
            this.applyTestimonials(testimonials);
            return testimonials;
        } catch (error) {
            console.warn('Failed to load testimonials:', error);
            return [];
        }
    }

    applyTestimonials(testimonials) {
        const testimonialsContainer = document.querySelector('.testimonials .testimonials-grid');
        if (testimonialsContainer && testimonials.length > 0) {
            testimonialsContainer.innerHTML = testimonials.map(testimonial => `
                <div class="testimonial">
                    <div class="testimonial-content">
                        <p>"${testimonial.content}"</p>
                    </div>
                    <div class="testimonial-author">
                        <strong>${testimonial.author_name}</strong>
                        ${testimonial.company ? `<span class="testimonial-company">${testimonial.company}</span>` : ''}
                    </div>
                    <div class="testimonial-rating">
                        ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                    </div>
                </div>
            `).join('');
        }
    }

    async loadBlogPosts() {
        const cached = this.getCached('blog_posts');
        if (cached) {
            this.applyBlogPosts(cached);
            return cached;
        }

        try {
            const { data: posts, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('status', 'published')
                .order('published_date', { ascending: false });

            if (error) throw error;

            this.setCached('blog_posts', posts);
            this.applyBlogPosts(posts);
            return posts;
        } catch (error) {
            console.warn('Failed to load blog posts:', error);
            return [];
        }
    }

    applyBlogPosts(posts) {
        if (window.location.pathname.includes('blog.html')) {
            // Update blog posts list
            const blogList = document.querySelector('.blog-posts, .posts-list');
            if (blogList && posts.length > 0) {
                blogList.innerHTML = posts.map(post => `
                    <article class="blog-post">
                        ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="post-image">` : ''}
                        <div class="post-content">
                            <h3><a href="#post-${post.slug}">${post.title}</a></h3>
                            <p class="post-meta">
                                By ${post.author} 
                                ${post.published_date ? `• ${new Date(post.published_date).toLocaleDateString()}` : ''}
                            </p>
                            <p class="post-excerpt">${post.excerpt || ''}</p>
                            <a href="#post-${post.slug}" class="read-more">Read More</a>
                        </div>
                    </article>
                `).join('');
            }

            // Update featured post if it exists
            if (posts.length > 0) {
                const featuredPost = posts[0];
                const featuredContainer = document.querySelector('.featured-post, .featured-article');
                if (featuredContainer) {
                    featuredContainer.innerHTML = `
                        <div class="featured-image">
                            ${featuredPost.featured_image ? `<img src="${featuredPost.featured_image}" alt="${featuredPost.title}">` : ''}
                        </div>
                        <div class="featured-content">
                            <h2><a href="#post-${featuredPost.slug}">${featuredPost.title}</a></h2>
                            <p class="post-meta">
                                By ${featuredPost.author} 
                                ${featuredPost.published_date ? `• ${new Date(featuredPost.published_date).toLocaleDateString()}` : ''}
                            </p>
                            <p class="post-excerpt">${featuredPost.excerpt || ''}</p>
                            <a href="#post-${featuredPost.slug}" class="read-more">Read More</a>
                        </div>
                    `;
                }
            }
        }
    }

    getDefaultServiceIcon(index) {
        const icons = [
            // Peptide testing icon
            '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.169.659 1.591L19.8 14.5M14.25 3.104c.251.023.501.05.75.082M19.8 14.5l-2.6 2.6a2.25 2.25 0 0 1-1.591.659h-8.218a2.25 2.25 0 0 1-1.591-.659l-2.6-2.6a1.125 1.125 0 0 1-.329-.79V9.75A2.25 2.25 0 0 1 5.25 7.5h13.5A2.25 2.25 0 0 1 21 9.75v3.96c0 .296-.118.58-.329.79Z" /></svg>',
            // Supplement testing icon
            '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655-5.653a2.548 2.548 0 0 1-.1-3.528l.893-.893a2.548 2.548 0 0 1 3.528-.1l5.653 4.655M8.776 15.17l4.655-5.653M15.124 9.517l-2.612-2.15c-.317-.26-.74-.398-1.18-.398H5.25C3.455 6.969 2 8.424 2 10.219v6.062A2.219 2.219 0 0 0 4.219 18.5h.781" /></svg>',
            // Cannabis testing icon
            '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>'
        ];
        return icons[index % icons.length];
    }

    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCached(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    async loadSampleCOA() {
        try {
            console.log('CMS Loader: Loading sample COA...');
            console.log('CMS Loader: Supabase client available:', !!supabase);
            
            if (!supabase) {
                console.error('CMS Loader: Supabase client not available');
                this.showSampleCOAError('Database connection not available');
                return;
            }
            
            // Try to get the most recent COA with a file URL first
            const { data: coas, error } = await supabase
                .from('coas')
                .select('*')
                .not('file_url', 'is', null)
                .neq('file_url', '')
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) {
                console.error('CMS Loader: Database error:', error);
                this.showSampleCOAError('Database query failed: ' + error.message);
                return;
            }

            if (coas.length === 0) {
                console.warn('CMS Loader: No COAs with file URLs found for sample display');
                // Try to get any COA as fallback
                const { data: fallbackCoas, error: fallbackError } = await supabase
                    .from('coas')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(1);
                    
                if (fallbackError || fallbackCoas.length === 0) {
                    this.showSampleCOAError('No sample COAs available');
                    return;
                }
                
                const coa = fallbackCoas[0];
                console.log('CMS Loader: Found fallback COA (no file):', coa.id);
                this.applySampleCOA(coa);
                return;
            }

            const coa = coas[0];
            console.log('CMS Loader: Found COA for sample:', coa.id, 'File URL:', coa.file_url);
            this.applySampleCOA(coa);
        } catch (error) {
            console.error('CMS Loader: Failed to load sample COA:', error);
            this.showSampleCOAError('Failed to load sample COA: ' + error.message);
        }
    }
    
    showSampleCOAError(message) {
        console.warn('CMS Loader: Showing sample COA error:', message);
        const coaContent = document.getElementById('coa-content');
        const pdfError = document.getElementById('pdf-error-message');
        const pdfIframe = document.getElementById('pdf-viewer');
        
        if (coaContent) {
            coaContent.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: #fef3c7; border-radius: 0.5rem; margin: 1rem 0;">
                    <p style="color: #92400e; font-size: 1rem; margin: 0;">
                        ⚠️ ${message}
                    </p>
                    <p style="color: #92400e; font-size: 0.9rem; margin: 0.5rem 0 0 0;">
                        Please check back later or <a href="contact.html" style="color: #2563eb; text-decoration: underline;">contact us</a> for assistance.
                    </p>
                </div>
            `;
        }
        
        if (pdfIframe) pdfIframe.style.display = 'none';
        if (pdfError) {
            pdfError.style.display = 'block';
            pdfError.innerHTML = `<p style="color: #92400e; font-size: 1rem; margin: 0;">⚠️ ${message}</p>`;
        }
    }

    applySampleCOA(coa) {
        console.log('CMS Loader: Applying sample COA:', coa.id);
        
        const coaContent = document.getElementById('coa-content');
        if (!coaContent) {
            console.error('CMS Loader: coa-content element not found');
            return;
        }

        // Generate the same content format as search results page
        coaContent.innerHTML = this.generateCOAContent(coa);
        console.log('CMS Loader: COA content generated');

        // Setup PDF preview
        this.setupPDFPreview(coa);

        console.log('CMS Loader: Sample COA updated with real data');
    }

    generateCOAContent(coa) {
        // Format the test date properly - handle database format (YYYY-MM-DD)
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            
            // If it's already in MM/DD/YYYY format, return as is
            if (dateString.includes('/')) {
                return dateString;
            }
            
            // If it's in YYYY-MM-DD format (database format), convert to MM/DD/YYYY
            if (dateString.includes('-') && dateString.length === 10) {
                try {
                    const [year, month, day] = dateString.split('-');
                    return `${month}/${day}/${year}`;
                } catch (error) {
                    return dateString;
                }
            }
            
            // Try to parse as a date and format
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    return dateString; // Return original if not a valid date
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
        `;
    }

    setupPDFPreview(coa) {
        const pdfIframe = document.getElementById('pdf-viewer');
        const pdfError = document.getElementById('pdf-error-message');
        const pdfPreview = document.getElementById('pdf-preview-section');

        if (!pdfIframe || !coa.file_url) {
            console.log('CMS Loader: No PDF iframe or file URL available');
            if (pdfError) {
                pdfError.style.display = 'block';
                pdfError.innerHTML = '<p style="color: #92400e; font-size: 1rem; margin: 0;">⚠️ No PDF file available for this COA.</p>';
            }
            return;
        }

        // Automatically show PDF preview on homepage (like search results)
        if (pdfPreview) {
            pdfPreview.style.display = 'block';
        }

        // Hide error initially
        if (pdfError) pdfError.style.display = 'none';

        // For Supabase storage URLs, we need to handle them properly
        let pdfUrl = coa.file_url;
        let attemptedDirectLoad = false;
        
        // If it's a Supabase storage URL, ensure it's accessible
        if (pdfUrl.includes('supabase.co/storage')) {
            console.log('CMS Loader: Using Supabase storage URL:', pdfUrl);
            
            // Try direct PDF loading first (most reliable for iframes)
            const loadDirect = () => {
                console.log('CMS Loader: Loading PDF directly:', pdfUrl);
                attemptedDirectLoad = true;
                pdfIframe.src = pdfUrl;
                
                // Set timeout to check if direct load worked
                setTimeout(() => {
                    // If iframe still doesn't have proper content, try Google viewer
                    if (pdfIframe.contentDocument === null || 
                        (pdfIframe.contentDocument && pdfIframe.contentDocument.body && 
                         pdfIframe.contentDocument.body.innerHTML.trim() === '')) {
                        console.log('CMS Loader: Direct load may have failed, trying Google viewer...');
                        const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
                        pdfIframe.src = googleViewerUrl;
                    }
                }, 2000);
            };
            
            // Set up iframe error handling
            pdfIframe.onerror = () => {
                console.warn('CMS Loader: PDF failed to load');
                if (!attemptedDirectLoad) {
                    // If Google viewer failed, try direct
                    loadDirect();
                } else {
                    // Both failed, show error
                    if (pdfError) {
                        pdfError.style.display = 'block';
                        pdfIframe.style.display = 'none';
                    }
                }
            };

            pdfIframe.onload = () => {
                console.log('CMS Loader: PDF loaded successfully');
                pdfIframe.style.display = 'block';
                if (pdfError) pdfError.style.display = 'none';
            };

            // Start with direct loading for better performance
            loadDirect();
        } else {
            // Direct PDF URL
            pdfIframe.onerror = () => {
                console.warn('CMS Loader: PDF failed to load');
                pdfIframe.style.display = 'none';
                if (pdfError) pdfError.style.display = 'block';
            };

            pdfIframe.onload = () => {
                console.log('CMS Loader: PDF loaded successfully');
                pdfIframe.style.display = 'block';
                if (pdfError) pdfError.style.display = 'none';
            };

            console.log('CMS Loader: Loading PDF directly:', pdfUrl);
            pdfIframe.src = pdfUrl;
        }
        
        console.log('CMS Loader: PDF preview setup complete for:', coa.file_url);
    }

    // Public method to refresh content
    refresh() {
        console.log('CMS Loader: Manual refresh triggered, clearing cache...');
        this.cache.clear();
        this.loadPageContent();
    }
}

// Initialize CMS Loader
const cmsLoader = new CMSLoader();

// Make it globally available
window.cmsLoader = cmsLoader;

// Make refresh accessible globally for testing
window.refreshCMS = () => cmsLoader.refresh();

// Add debug functions for testing PDF loading
window.debugSampleCOA = async () => {
    console.log('=== DEBUG: Sample COA Loading ===');
    await cmsLoader.loadSampleCOA();
};

window.testPDFUrl = (url) => {
    console.log('=== DEBUG: Testing PDF URL ===', url);
    const iframe = document.getElementById('pdf-viewer');
    if (iframe) {
        iframe.src = url;
        console.log('PDF URL set to iframe');
    } else {
        console.error('PDF iframe not found');
    }
};

// Listen for CMS updates
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'cms-content-updated') {
        console.log('CMS Loader: Content updated, clearing cache...');
        cmsLoader.cache.clear();
        cmsLoader.loadPageContent();
    }
});
