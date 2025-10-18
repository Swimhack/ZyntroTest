/**
 * No-Cache Utility
 * Adds comprehensive no-cache headers and meta tags to prevent browser caching
 * Safe to include on all pages without breaking existing functionality
 */

(function() {
    'use strict';

    // Add no-cache meta tags to document head
    function addNoCacheMetas() {
        const head = document.head || document.getElementsByTagName('head')[0];
        
        const metaTags = [
            { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
            { httpEquiv: 'Pragma', content: 'no-cache' },
            { httpEquiv: 'Expires', content: '0' },
            { name: 'cache-control', content: 'no-cache, no-store, must-revalidate' },
            { name: 'pragma', content: 'no-cache' },
            { name: 'expires', content: '0' }
        ];

        metaTags.forEach(tagConfig => {
            // Check if meta tag already exists to avoid duplicates
            const existingTag = head.querySelector(
                `meta[${tagConfig.httpEquiv ? 'http-equiv' : 'name'}="${tagConfig.httpEquiv || tagConfig.name}"]`
            );
            
            if (!existingTag) {
                const meta = document.createElement('meta');
                if (tagConfig.httpEquiv) {
                    meta.setAttribute('http-equiv', tagConfig.httpEquiv);
                } else {
                    meta.setAttribute('name', tagConfig.name);
                }
                meta.setAttribute('content', tagConfig.content);
                head.appendChild(meta);
            }
        });
        
        console.log('✅ No-cache meta tags added successfully');
    }

    // Add cache-busting query parameters to dynamic resources
    function addCacheBusting() {
        const timestamp = Date.now();
        const resources = [
            'link[rel="stylesheet"]',
            'script[src]:not([data-no-cache-bust])'
        ];

        resources.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const attr = element.tagName === 'LINK' ? 'href' : 'src';
                const url = element.getAttribute(attr);
                
                if (url && !url.includes('?') && !url.startsWith('http') && !url.includes('googleapis') && !url.includes('cdnjs')) {
                    element.setAttribute(attr, `${url}?v=${timestamp}`);
                }
            });
        });
        
        console.log('✅ Cache-busting parameters added to local resources');
    }

    // Set no-cache headers for fetch requests
    function interceptFetchRequests() {
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            // Add no-cache headers to fetch requests for local resources
            if (typeof url === 'string' && !url.startsWith('http')) {
                options.headers = {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    ...options.headers
                };
            }
            return originalFetch.call(this, url, options);
        };
        
        console.log('✅ Fetch requests intercepted for no-cache headers');
    }

    // Override XMLHttpRequest for no-cache
    function interceptXHRRequests() {
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            this.addEventListener('readystatechange', function() {
                if (this.readyState === 1) { // OPENED
                    this.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                    this.setRequestHeader('Pragma', 'no-cache');
                    this.setRequestHeader('Expires', '0');
                }
            });
            return originalOpen.call(this, method, url, async, user, password);
        };
        
        console.log('✅ XMLHttpRequest intercepted for no-cache headers');
    }

    // Initialize no-cache functionality
    function initializeNoCache() {
        try {
            addNoCacheMetas();
            addCacheBusting();
            interceptFetchRequests();
            interceptXHRRequests();
            
            console.log('🚫 No-cache system initialized successfully');
        } catch (error) {
            console.warn('⚠️ No-cache initialization warning:', error.message);
        }
    }

    // Run immediately if DOM is already loaded, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeNoCache);
    } else {
        initializeNoCache();
    }

    // Also run on page visibility change to refresh cache-busting
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            addCacheBusting();
        }
    });

})();