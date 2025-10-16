import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';
import { supabaseConfig } from './supabase-config.js';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

class CMSLoader {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    init() {
        // Load content when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadPageContent());
        } else {
            this.loadPageContent();
        }
    }

    async loadPageContent() {
        const currentPage = this.getCurrentPageName();
        if (!currentPage) return;

        try {
            await Promise.all([
                this.loadSiteSettings(),
                this.loadPageSpecificContent(currentPage),
                this.loadHeroSection(currentPage),
                this.loadServices(),
                this.loadTestimonials(),
                this.loadBlogPosts()
            ]);
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

    // Public method to refresh content
    refresh() {
        this.cache.clear();
        this.loadPageContent();
    }
}

// Initialize CMS Loader
const cmsLoader = new CMSLoader();

// Make it globally available
window.cmsLoader = cmsLoader;
