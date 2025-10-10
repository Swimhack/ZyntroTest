// Common admin functionality and utilities
// Shared functions across the admin dashboard

const AdminUtils = {
    /**
     * Show notification message
     * @param {string} message 
     * @param {string} type - 'success', 'error', 'warning', 'info'
     */
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.admin-notification');
        if (existing) {
            existing.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `admin-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    },
    
    /**
     * Format date for display
     * @param {string|Date} date 
     * @returns {string}
     */
    formatDate(date) {
        if (!date) return 'Not set';
        
        try {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    },
    
    /**
     * Format datetime for display
     * @param {string|Date} datetime 
     * @returns {string}
     */
    formatDateTime(datetime) {
        if (!datetime) return 'Not set';
        
        try {
            const d = new Date(datetime);
            return d.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid date';
        }
    },
    
    /**
     * Validate email format
     * @param {string} email 
     * @returns {boolean}
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    /**
     * Debounce function calls
     * @param {Function} func 
     * @param {number} wait 
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Copy text to clipboard
     * @param {string} text 
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copied to clipboard!', 'success');
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            this.showNotification('Failed to copy to clipboard', 'error');
            return false;
        }
    },
    
    /**
     * Confirm dialog with custom message
     * @param {string} message 
     * @param {string} confirmText 
     * @param {string} cancelText 
     * @returns {Promise<boolean>}
     */
    async confirm(message, confirmText = 'OK', cancelText = 'Cancel') {
        return new Promise((resolve) => {
            // Create modal dialog
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';
            modal.innerHTML = `
                <div class="confirm-modal-content">
                    <div class="confirm-message">${message}</div>
                    <div class="confirm-actions">
                        <button class="btn btn-secondary confirm-cancel">${cancelText}</button>
                        <button class="btn btn-primary confirm-ok">${confirmText}</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Handle actions
            modal.querySelector('.confirm-cancel').onclick = () => {
                modal.remove();
                resolve(false);
            };
            
            modal.querySelector('.confirm-ok').onclick = () => {
                modal.remove();
                resolve(true);
            };
            
            // Show modal
            setTimeout(() => modal.classList.add('show'), 10);
        });
    },
    
    /**
     * Sanitize HTML to prevent XSS
     * @param {string} html 
     * @returns {string}
     */
    sanitizeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },
    
    /**
     * Generate random ID
     * @param {number} length 
     * @returns {string}
     */
    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    /**
     * Get URL parameter value
     * @param {string} param 
     * @returns {string|null}
     */
    getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },
    
    /**
     * Set page title with admin prefix
     * @param {string} title 
     */
    setPageTitle(title) {
        document.title = `${title} | ZyntroTest Admin`;
    },
    
    /**
     * Initialize common admin features
     */
    init() {
        // Add notification styles if not present
        this.addNotificationStyles();
        
        // Set up global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });
        
        // Set up unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
        
        console.log('AdminUtils initialized');
    },
    
    /**
     * Add notification styles to page
     */
    addNotificationStyles() {
        if (document.getElementById('admin-notification-styles')) {
            return; // Already added
        }
        
        const styles = document.createElement('style');
        styles.id = 'admin-notification-styles';
        styles.textContent = `
            .admin-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease;
                border-left: 4px solid #3b82f6;
            }
            
            .admin-notification.show {
                transform: translateX(0);
            }
            
            .admin-notification.notification-success {
                border-left-color: #10b981;
            }
            
            .admin-notification.notification-error {
                border-left-color: #ef4444;
            }
            
            .admin-notification.notification-warning {
                border-left-color: #f59e0b;
            }
            
            .notification-content {
                padding: 1rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }
            
            .notification-message {
                flex: 1;
                font-size: 0.875rem;
                color: var(--gray-700);
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 1.25rem;
                cursor: pointer;
                color: var(--gray-400);
                padding: 0;
                line-height: 1;
            }
            
            .notification-close:hover {
                color: var(--gray-600);
            }
            
            .confirm-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            .confirm-modal.show {
                opacity: 1;
            }
            
            .confirm-modal-content {
                background: white;
                border-radius: var(--radius-lg);
                padding: 2rem;
                max-width: 400px;
                width: 90vw;
                text-align: center;
            }
            
            .confirm-message {
                margin-bottom: 1.5rem;
                font-size: 1rem;
                line-height: 1.5;
                color: var(--gray-700);
            }
            
            .confirm-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
        `;
        
        document.head.appendChild(styles);
    }
};

// Initialize admin utils when script loads
AdminUtils.init();

// Make available globally
window.AdminUtils = AdminUtils;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminUtils;
}