/**
 * Optional Phase 2 Animation Enablement
 * Enables scroll-based animations after testing Phase 1
 * Can be included to enhance the experience further
 */

document.addEventListener('DOMContentLoaded', () => {
    // Wait for animations to be initialized
    setTimeout(() => {
        if (window.zyntroAnimations) {
            console.log('Enabling Phase 2 animations...');
            window.zyntroAnimations.enableScrollAnimations();
        }
    }, 1000);
});

// Optional: Add a toggle for testing
if (window.location.search.includes('phase2=true')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.zyntroAnimations) {
                window.zyntroAnimations.enableScrollAnimations();
                console.log('Phase 2 animations enabled via URL parameter');
            }
        }, 1000);
    });
}