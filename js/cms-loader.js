// CMS Loader - Loads dynamic content from the API

class CMSLoader {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    updateStatus(message) {
        const statusEl = document.getElementById('cms-status');
        if (statusEl) {
            statusEl.innerHTML = message;
            console.log('CMS Status:', message);
        }
    }

    init() {
        console.log('CMS Loader: Initializing...');
        this.updateStatus('Loading content...');

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadPageContent());
        } else {
            this.loadPageContent();
        }
    }

    async loadPageContent() {
        const currentPage = this.getCurrentPageName();
        console.log('CMS Loader: Loading content for page:', currentPage);
        if (!currentPage) return;

        try {
            const loadPromises = [
                this.loadSiteSettings(),
                this.loadPageSpecificContent(currentPage),
                this.loadHeroSection(currentPage),
                this.loadServices(),
                this.loadTestimonials(),
                this.loadBlogPosts()
            ];

            if (currentPage === 'index') {
                this.updateStatus('Loading sample COA...');
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
        const pageMap = {
            'index': 'index', '': 'index',
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
        if (cached) { this.applySiteSettings(cached); return cached; }

        try {
            const result = await window.ApiClient.getSiteSettings();
            const settings = result.data;
            this.setCached('site_settings', settings);
            this.applySiteSettings(settings);
            return settings;
        } catch (error) {
            console.warn('Failed to load site settings:', error);
            return {};
        }
    }

    applySiteSettings(settings) {
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
        if (settings.contact_email) {
            const emailLinks = document.querySelectorAll('a[href*="mailto:"]');
            emailLinks.forEach(link => {
                if (link.href.includes('info@zyntrotest.com')) {
                    link.href = `mailto:${settings.contact_email}`;
                    link.textContent = settings.contact_email;
                }
            });
        }
        if (settings.footer_text) {
            const footerText = document.querySelector('.footer-text, .trust-text');
            if (footerText) footerText.textContent = settings.footer_text;
        }
    }

    async loadPageSpecificContent(pageName) {
        const cached = this.getCached(`page_content_${pageName}`);
        if (cached) { this.applyPageContent(cached); return cached; }

        try {
            const result = await window.ApiClient.getPageContent(pageName);
            const contentMap = result.data.content;
            this.setCached(`page_content_${pageName}`, contentMap);
            this.applyPageContent(contentMap);
            // Also cache hero data if returned
            if (result.data.hero) {
                this.setCached(`hero_${pageName}`, result.data.hero);
                this.applyHeroSection(result.data.hero);
            }
            return contentMap;
        } catch (error) {
            console.warn(`Failed to load page content for ${pageName}:`, error);
            return {};
        }
    }

    applyPageContent(content) {
        if (content.meta_description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', content.meta_description);
        }
        if (content.page_title) {
            document.title = content.page_title;
        }
        if (content.hero_title) {
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle && !heroTitle.hasAttribute('data-cms-loaded')) {
                heroTitle.textContent = content.hero_title;
            }
        }
    }

    async loadHeroSection(pageName) {
        const cached = this.getCached(`hero_${pageName}`);
        if (cached) { this.applyHeroSection(cached); return cached; }
        // Hero data is loaded in loadPageSpecificContent, so this is a fallback
        return null;
    }

    applyHeroSection(hero) {
        if (!hero) return;
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle && hero.title) {
            heroTitle.textContent = hero.title;
            heroTitle.setAttribute('data-cms-loaded', 'true');
        }
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle && hero.subtitle) heroSubtitle.textContent = hero.subtitle;
        const heroDescription = document.querySelector('.hero-description');
        if (heroDescription && hero.description) heroDescription.textContent = hero.description;

        const heroImage = document.querySelector('.hero-image img');
        if (heroImage && hero.image_url) {
            const isMediaId = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(hero.image_url);
            if (isMediaId) {
                this.loadMediaImage(hero.image_url, heroImage);
            } else {
                heroImage.src = hero.image_url;
            }
        }

        if (hero.cta_primary_text) {
            const primaryBtn = document.querySelector('.hero-cta .btn-primary');
            if (primaryBtn) {
                primaryBtn.textContent = hero.cta_primary_text;
                if (hero.cta_primary_link) primaryBtn.href = hero.cta_primary_link;
            }
        }
        if (hero.cta_secondary_text) {
            const secondaryBtn = document.querySelector('.hero-cta .btn-outline');
            if (secondaryBtn) {
                secondaryBtn.textContent = hero.cta_secondary_text;
                if (hero.cta_secondary_link) secondaryBtn.href = hero.cta_secondary_link;
            }
        }
        if (hero.stats && Array.isArray(hero.stats)) {
            const statsContainer = document.querySelector('.hero-stats');
            if (statsContainer) {
                statsContainer.innerHTML = hero.stats.map(stat => `
                    <div class="stat">
                        <div class="stat-number">${stat.number}</div>
                        <div class="stat-label">${stat.label}</div>
                    </div>
                `).join('');
            }
        }
    }

    async loadMediaImage(mediaId, imageElement) {
        try {
            const result = await window.ApiClient.getMediaById(mediaId);
            if (result.data && result.data.file_url) {
                imageElement.src = result.data.file_url;
                if (result.data.alt_text) imageElement.alt = result.data.alt_text;
            }
        } catch (error) {
            console.warn('CMS Loader: Error loading media image:', error);
        }
    }

    async loadServices() {
        const cached = this.getCached('services');
        if (cached) { this.applyServices(cached); return cached; }

        try {
            const result = await window.ApiClient.getServices();
            const services = result.data;
            this.setCached('services', services);
            this.applyServices(services);
            return services;
        } catch (error) {
            console.warn('Failed to load services:', error);
            return [];
        }
    }

    applyServices(services) {
        const servicesGrid = document.querySelector('.services-grid');
        if (servicesGrid && services.length > 0) {
            servicesGrid.innerHTML = services.map((service, index) => `
                <div class="service-card">
                    <div class="service-icon">${service.icon_svg || this.getDefaultServiceIcon(index)}</div>
                    <h3>${service.title}</h3>
                    <p>${service.description || service.subtitle || ''}</p>
                    <div class="price-range">${service.base_price || ''}</div>
                    <a href="services.html#${service.slug}" class="service-link">Learn More</a>
                </div>
            `).join('');
        }
        this.updateServicesPage(services);
    }

    updateServicesPage(services) {
        if (!window.location.pathname.includes('services.html')) return;
        services.forEach(service => {
            const detailCard = document.getElementById(service.slug);
            if (!detailCard) return;
            const title = detailCard.querySelector('h2');
            if (title) title.textContent = service.title;
            const subtitle = detailCard.querySelector('.service-subtitle');
            if (subtitle) subtitle.textContent = service.subtitle || '';
            const price = detailCard.querySelector('.price-range-large');
            if (price) price.textContent = service.base_price || '';
            const description = detailCard.querySelector('.service-description p');
            if (description) description.textContent = service.description || '';
            if (service.features && Array.isArray(service.features)) {
                const featuresList = detailCard.querySelector('.service-description ul:first-of-type');
                if (featuresList) featuresList.innerHTML = service.features.map(f => `<li>${f}</li>`).join('');
            }
            if (service.add_ons && Array.isArray(service.add_ons)) {
                const addOnsList = detailCard.querySelector('.service-description ul:last-of-type');
                if (addOnsList) addOnsList.innerHTML = service.add_ons.map(a => `<li><strong>${a.name}:</strong> ${a.price}</li>`).join('');
            }
        });

        const pricingTable = document.querySelector('.pricing-table tbody');
        if (pricingTable && services.length > 0) {
            pricingTable.innerHTML = services.map(service => {
                const addOnsText = service.add_ons && Array.isArray(service.add_ons)
                    ? service.add_ons.map(a => `${a.name}: ${a.price}`).join('<br>') : '';
                return `<tr>
                    <td data-label="Test Type"><strong>${service.title}</strong></td>
                    <td data-label="Base Price"><span class="price-highlight">${service.base_price || ''}</span></td>
                    <td data-label="Add-Ons">${addOnsText}</td>
                </tr>`;
            }).join('');
        }
    }

    async loadTestimonials() {
        const cached = this.getCached('testimonials');
        if (cached) { this.applyTestimonials(cached); return cached; }

        try {
            const result = await window.ApiClient.getTestimonials();
            const testimonials = result.data;
            this.setCached('testimonials', testimonials);
            this.applyTestimonials(testimonials);
            return testimonials;
        } catch (error) {
            console.warn('Failed to load testimonials:', error);
            return [];
        }
    }

    applyTestimonials(testimonials) {
        const container = document.querySelector('.testimonials .testimonials-grid');
        if (container && testimonials.length > 0) {
            container.innerHTML = testimonials.map(t => `
                <div class="testimonial">
                    <div class="testimonial-content"><p>"${t.content}"</p></div>
                    <div class="testimonial-author">
                        <strong>${t.author_name}</strong>
                        ${t.company ? `<span class="testimonial-company">${t.company}</span>` : ''}
                    </div>
                    <div class="testimonial-rating">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
                </div>
            `).join('');
        }
    }

    async loadBlogPosts() {
        const cached = this.getCached('blog_posts');
        if (cached) { this.applyBlogPosts(cached); return cached; }

        try {
            const result = await window.ApiClient.getBlogPosts();
            const posts = result.data;
            this.setCached('blog_posts', posts);
            this.applyBlogPosts(posts);
            return posts;
        } catch (error) {
            console.warn('Failed to load blog posts:', error);
            return [];
        }
    }

    applyBlogPosts(posts) {
        if (!window.location.pathname.includes('blog.html')) return;
        const blogList = document.querySelector('.blog-posts, .posts-list');
        if (blogList && posts.length > 0) {
            blogList.innerHTML = posts.map(post => `
                <article class="blog-post">
                    ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="post-image">` : ''}
                    <div class="post-content">
                        <h3><a href="#post-${post.slug}">${post.title}</a></h3>
                        <p class="post-meta">By ${post.author} ${post.published_date ? `- ${new Date(post.published_date).toLocaleDateString()}` : ''}</p>
                        <p class="post-excerpt">${post.excerpt || ''}</p>
                        <a href="#post-${post.slug}" class="read-more">Read More</a>
                    </div>
                </article>
            `).join('');
        }
        if (posts.length > 0) {
            const featuredContainer = document.querySelector('.featured-post, .featured-article');
            if (featuredContainer) {
                const fp = posts[0];
                featuredContainer.innerHTML = `
                    <div class="featured-image">${fp.featured_image ? `<img src="${fp.featured_image}" alt="${fp.title}">` : ''}</div>
                    <div class="featured-content">
                        <h2><a href="#post-${fp.slug}">${fp.title}</a></h2>
                        <p class="post-meta">By ${fp.author} ${fp.published_date ? `- ${new Date(fp.published_date).toLocaleDateString()}` : ''}</p>
                        <p class="post-excerpt">${fp.excerpt || ''}</p>
                        <a href="#post-${fp.slug}" class="read-more">Read More</a>
                    </div>
                `;
            }
        }
    }

    getDefaultServiceIcon(index) {
        const icons = [
            '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.169.659 1.591L19.8 14.5M14.25 3.104c.251.023.501.05.75.082M19.8 14.5l-2.6 2.6a2.25 2.25 0 0 1-1.591.659h-8.218a2.25 2.25 0 0 1-1.591-.659l-2.6-2.6a1.125 1.125 0 0 1-.329-.79V9.75A2.25 2.25 0 0 1 5.25 7.5h13.5A2.25 2.25 0 0 1 21 9.75v3.96c0 .296-.118.58-.329.79Z" /></svg>',
            '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655-5.653a2.548 2.548 0 0 1-.1-3.528l.893-.893a2.548 2.548 0 0 1 3.528-.1l5.653 4.655M8.776 15.17l4.655-5.653M15.124 9.517l-2.612-2.15c-.317-.26-.74-.398-1.18-.398H5.25C3.455 6.969 2 8.424 2 10.219v6.062A2.219 2.219 0 0 0 4.219 18.5h.781" /></svg>',
            '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>'
        ];
        return icons[index % icons.length];
    }

    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) return cached.data;
        this.cache.delete(key);
        return null;
    }

    setCached(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    async loadSampleCOA() {
        try {
            const result = await window.ApiClient.getCOAs();
            const coas = result.data;

            // Find a COA with a file_url
            const coaWithFile = coas.find(c => c.file_url && c.file_url.trim() !== '');
            const coa = coaWithFile || coas[0];

            if (!coa) {
                this.showSampleCOAError('No sample COAs available');
                return;
            }

            this.applySampleCOA(coa);
        } catch (error) {
            console.error('CMS Loader: Failed to load sample COA:', error);
            this.showSampleCOAError('Failed to load sample COA: ' + error.message);
        }
    }

    showSampleCOAError(message) {
        console.warn('CMS Loader: Showing sample COA error:', message);
        this.updateStatus(`Error: ${message}`);
        const coaContent = document.getElementById('coa-content');
        if (coaContent) {
            coaContent.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: #fef3c7; border-radius: 0.5rem; margin: 1rem 0;">
                    <p style="color: #92400e; font-size: 1rem; margin: 0;">${message}</p>
                    <p style="color: #92400e; font-size: 0.9rem; margin: 0.5rem 0 0 0;">
                        Please check back later or <a href="contact.html" style="color: #2563eb; text-decoration: underline;">contact us</a> for assistance.
                    </p>
                </div>
            `;
        }
        const pdfIframe = document.getElementById('pdf-viewer');
        if (pdfIframe) pdfIframe.style.display = 'none';
    }

    applySampleCOA(coa) {
        const coaContent = document.getElementById('coa-content');
        if (!coaContent) return;
        coaContent.innerHTML = this.generateCOAContent(coa);
        this.setupPDFPreview(coa);
        this.updateStatus('');
        const statusEl = document.getElementById('cms-status');
        if (statusEl) statusEl.style.display = 'none';
    }

    generateCOAContent(coa) {
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            if (dateString.includes('/')) return dateString;
            if (dateString.includes('-') && dateString.length === 10) {
                const [year, month, day] = dateString.split('-');
                return `${month}/${day}/${year}`;
            }
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return dateString;
                return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
            } catch { return dateString; }
        };

        return `
            <div class="data-grid">
                <div class="data-item"><strong>COA ID:</strong><span>${coa.id || 'N/A'}</span></div>
                <div class="data-item"><strong>Client:</strong><span>${coa.client || 'N/A'}</span></div>
                <div class="data-item"><strong>Compound:</strong><span>${coa.compound || 'N/A'}</span></div>
                <div class="data-item"><strong>Type:</strong><span>${coa.analysis_type || 'N/A'}</span></div>
                <div class="data-item"><strong>Date:</strong><span>${formatDate(coa.test_date)}</span></div>
                <div class="data-item"><strong>Status:</strong><span class="status-badge">${coa.status || 'N/A'}</span></div>
            </div>
            ${coa.purity ? `<div class="result-highlight"><strong>Purity:</strong> ${coa.purity}%</div>` : ''}
            ${coa.result ? `<div class="result-highlight"><strong>Test Result:</strong> ${coa.result}</div>` : ''}
            ${coa.notes ? `<div class="notes-section"><strong>Notes:</strong><p>${coa.notes}</p></div>` : ''}
        `;
    }

    setupPDFPreview(coa) {
        const pdfPreview = document.getElementById('pdf-preview-section');
        if (pdfPreview) pdfPreview.style.display = 'block';
        if (!window.PDFViewer) return;
        if (window.indexPDFViewer) {
            window.indexPDFViewer.loadFromCOAData(coa);
        } else {
            const tempViewer = new window.PDFViewer('pdf-preview-section', {
                defaultPDF: './COAs/Zyntro BPC-157.pdf',
                showDownloadButton: true,
                showStatusIndicator: false
            });
            tempViewer.loadFromCOAData(coa);
        }
    }

    refresh() {
        this.cache.clear();
        this.loadPageContent();
    }
}

// Initialize CMS Loader
const cmsLoader = new CMSLoader();
window.cmsLoader = cmsLoader;
window.refreshCMS = () => cmsLoader.refresh();

window.debugSampleCOA = async () => {
    await cmsLoader.loadSampleCOA();
};

window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'cms-content-updated') {
        cmsLoader.cache.clear();
        cmsLoader.loadPageContent();
    }
});
