/**
 * ZyntroTest Animation Utilities
 * Strategic anime.js animations for enhanced UX
 * Maintains professional laboratory aesthetic
 */

// Animation configuration
const AnimationConfig = {
    easing: 'easeOutQuart',
    fastDuration: 200,
    mediumDuration: 400,
    slowDuration: 600,
    
    // Respect accessibility preferences
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    // Mobile performance optimization  
    isMobile: window.innerWidth <= 768
};

class ZyntroAnimations {
    constructor() {
        this.initialized = false;
        this.init();
    }
    
    init() {
        // Check if anime.js is loaded
        if (typeof anime === 'undefined') {
            console.warn('Anime.js not loaded - animations disabled');
            return;
        }
        
        this.initialized = true;
        this.setupAnimations();
    }
    
    setupAnimations() {
        if (!this.initialized || AnimationConfig.prefersReducedMotion) {
            return;
        }
        
        // Phase 1: High-impact, low-risk animations
        this.setupServiceCardAnimations();
        this.setupHeroStatCounters();
        this.setupButtonAnimations();
        this.setupNavigationAnimations();
        this.setupFormFeedbackAnimations();
    }
    
    // 1. Service Cards Hover Animation
    setupServiceCardAnimations() {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (AnimationConfig.isMobile) return;
                
                anime({
                    targets: card,
                    scale: 1.02,
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                    duration: AnimationConfig.fastDuration,
                    easing: AnimationConfig.easing
                });
            });
            
            card.addEventListener('mouseleave', () => {
                if (AnimationConfig.isMobile) return;
                
                anime({
                    targets: card,
                    scale: 1,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    duration: AnimationConfig.fastDuration,
                    easing: AnimationConfig.easing
                });
            });
        });
    }
    
    // 2. Hero Statistics Counter Animation
    setupHeroStatCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
                    this.animateCounter(entry.target);
                    entry.target.setAttribute('data-animated', 'true');
                }
            });
        }, observerOptions);
        
        statNumbers.forEach(stat => observer.observe(stat));
    }
    
    animateCounter(element) {
        const text = element.textContent;
        const isPercentage = text.includes('%');
        const isDecimal = text.includes('.');
        
        let targetValue, suffix = '';
        
        if (isPercentage) {
            targetValue = parseFloat(text.replace('%', ''));
            suffix = '%';
        } else if (text.includes('-')) {
            // Handle ranges like "3-5"
            const parts = text.split('-');
            targetValue = parseInt(parts[1]);
            suffix = '';
            element.textContent = '0-0';
        } else if (text.includes('+')) {
            targetValue = parseInt(text.replace('+', ''));
            suffix = '+';
        } else {
            targetValue = parseInt(text);
        }
        
        const animationObj = { count: 0 };
        
        anime({
            targets: animationObj,
            count: targetValue,
            duration: AnimationConfig.slowDuration * 2.5, // 1500ms
            easing: 'easeOutExpo',
            update: () => {
                if (text.includes('-')) {
                    // Special handling for ranges
                    const currentMax = Math.floor(animationObj.count);
                    const currentMin = Math.max(0, Math.floor(currentMax * 0.6)); // 3-5 ratio
                    element.textContent = `${currentMin}-${currentMax}`;
                } else {
                    const currentValue = isDecimal ? 
                        animationObj.count.toFixed(1) : 
                        Math.floor(animationObj.count);
                    element.textContent = currentValue + suffix;
                }
            }
        });
    }
    
    // 3. Button Interaction Animations
    setupButtonAnimations() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('mousedown', () => {
                anime({
                    targets: btn,
                    scale: 0.98,
                    duration: 100,
                    easing: 'easeInQuad'
                });
            });
            
            btn.addEventListener('mouseup', () => {
                anime({
                    targets: btn,
                    scale: 1,
                    duration: AnimationConfig.fastDuration,
                    easing: AnimationConfig.easing
                });
            });
            
            btn.addEventListener('mouseleave', () => {
                anime({
                    targets: btn,
                    scale: 1,
                    duration: AnimationConfig.fastDuration,
                    easing: AnimationConfig.easing
                });
            });
        });
    }
    
    // 4. Navigation Hover Animations
    setupNavigationAnimations() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            // Create underline element
            const underline = document.createElement('div');
            underline.className = 'nav-underline';
            underline.style.cssText = `
                position: absolute;
                bottom: -2px;
                left: 0;
                height: 2px;
                background: var(--primary-blue);
                width: 0;
                transition: none;
            `;
            
            if (link.style.position !== 'absolute') {
                link.style.position = 'relative';
            }
            link.appendChild(underline);
            
            link.addEventListener('mouseenter', () => {
                if (AnimationConfig.isMobile) return;
                
                anime({
                    targets: underline,
                    width: '100%',
                    duration: AnimationConfig.fastDuration,
                    easing: AnimationConfig.easing
                });
            });
            
            link.addEventListener('mouseleave', () => {
                if (AnimationConfig.isMobile) return;
                
                anime({
                    targets: underline,
                    width: '0%',
                    duration: AnimationConfig.fastDuration,
                    easing: AnimationConfig.easing
                });
            });
        });
    }
    
    // 5. Form Feedback Animations
    setupFormFeedbackAnimations() {
        // This will be called from the form submission handler
        this.showFormFeedback = (message, type = 'success') => {
            const existingFeedback = document.querySelector('.form-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }
            
            const feedback = document.createElement('div');
            feedback.className = `form-feedback form-feedback-${type}`;
            feedback.textContent = message;
            feedback.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? 'var(--secondary-green)' : '#ef4444'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                z-index: 1000;
                transform: translateY(-100px);
                opacity: 0;
            `;
            
            document.body.appendChild(feedback);
            
            // Slide in animation
            anime({
                targets: feedback,
                translateY: 0,
                opacity: 1,
                duration: AnimationConfig.mediumDuration,
                easing: AnimationConfig.easing,
                complete: () => {
                    // Auto-hide after 3 seconds
                    setTimeout(() => {
                        anime({
                            targets: feedback,
                            translateY: -100,
                            opacity: 0,
                            duration: AnimationConfig.mediumDuration,
                            easing: 'easeInQuart',
                            complete: () => feedback.remove()
                        });
                    }, 3000);
                }
            });
        };
    }
    
    // Phase 2: Scroll-based animations (optional)
    setupScrollAnimations() {
        if (!this.initialized || AnimationConfig.prefersReducedMotion || AnimationConfig.isMobile) {
            return;
        }
        
        this.setupServiceIconsReveal();
        this.setupTrustBadgesSequence();
    }
    
    setupServiceIconsReveal() {
        const serviceIcons = document.querySelectorAll('.service-icon, .service-icon-large');
        
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '50px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting && !entry.target.hasAttribute('data-revealed')) {
                    anime({
                        targets: entry.target,
                        translateY: [20, 0],
                        opacity: [0, 1],
                        duration: AnimationConfig.mediumDuration,
                        delay: index * 100, // Stagger effect
                        easing: AnimationConfig.easing
                    });
                    entry.target.setAttribute('data-revealed', 'true');
                }
            });
        }, observerOptions);
        
        serviceIcons.forEach(icon => {
            icon.style.opacity = '0';
            icon.style.transform = 'translateY(20px)';
            observer.observe(icon);
        });
    }
    
    setupTrustBadgesSequence() {
        const trustBadges = document.querySelectorAll('.trust-badge, .badge-item');
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
                    const badges = Array.from(entry.target.parentElement.children);
                    const index = badges.indexOf(entry.target);
                    
                    anime({
                        targets: entry.target,
                        scale: [0.8, 1],
                        opacity: [0, 1],
                        duration: AnimationConfig.fastDuration,
                        delay: index * 100,
                        easing: AnimationConfig.easing
                    });
                    
                    entry.target.setAttribute('data-animated', 'true');
                }
            });
        }, observerOptions);
        
        trustBadges.forEach(badge => {
            badge.style.opacity = '0';
            badge.style.transform = 'scale(0.8)';
            observer.observe(badge);
        });
    }
    
    // Utility method to enable Phase 2 animations
    enableScrollAnimations() {
        this.setupScrollAnimations();
    }
    
    // Utility method to disable all animations (emergency)
    disableAnimations() {
        AnimationConfig.prefersReducedMotion = true;
        console.log('Animations disabled');
    }
}

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.zyntroAnimations = new ZyntroAnimations();
});

// Export for use in other scripts
window.ZyntroAnimations = ZyntroAnimations;