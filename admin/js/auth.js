// Authentication module for ZyntroTest COA Dashboard
// Handles login, logout, and session management

const Auth = {
    // Configuration
    SESSION_KEY: 'zyntro_admin_session',
    REMEMBER_KEY: 'zyntro_admin_remember',
    SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    REMEMBER_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    
    // Default credentials (In production, this should be server-side)
    CREDENTIALS: {
        username: 'drew',
        password: 'ZyntroAdmin2025!'
    },
    
    /**
     * Attempt to log in with provided credentials
     * @param {string} username 
     * @param {string} password 
     * @param {boolean} remember 
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async login(username, password, remember = false) {
        // Simulate network delay
        await this.delay(500);
        
        if (username === this.CREDENTIALS.username && password === this.CREDENTIALS.password) {
            const session = {
                username: username,
                loginTime: Date.now(),
                expiresAt: Date.now() + this.SESSION_DURATION,
                remember: remember
            };
            
            // Store session
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            
            // If remember me, also store in longer-term storage
            if (remember) {
                const rememberToken = {
                    username: username,
                    createdAt: Date.now(),
                    expiresAt: Date.now() + this.REMEMBER_DURATION
                };
                localStorage.setItem(this.REMEMBER_KEY, JSON.stringify(rememberToken));
            }
            
            console.log('Login successful for user:', username);
            return { success: true, message: 'Login successful' };
        } else {
            console.log('Login failed for user:', username);
            return { success: false, message: 'Invalid username or password' };
        }
    },
    
    /**
     * Log out current user
     */
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.REMEMBER_KEY);
        console.log('User logged out');
        
        // Redirect to login page
        if (window.location.pathname !== '/admin/index.html' && !window.location.pathname.endsWith('/admin/')) {
            window.location.href = 'index.html';
        }
    },
    
    /**
     * Check if user is currently logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        const session = this.getSession();
        if (session && session.expiresAt > Date.now()) {
            return true;
        }
        
        // Check remember me token
        const rememberToken = this.getRememberToken();
        if (rememberToken && rememberToken.expiresAt > Date.now()) {
            // Auto-login from remember token
            this.renewSessionFromRemember(rememberToken);
            return true;
        }
        
        return false;
    },
    
    /**
     * Get current session data
     * @returns {object|null}
     */
    getSession() {
        try {
            const sessionData = localStorage.getItem(this.SESSION_KEY);
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (error) {
            console.error('Error parsing session data:', error);
            return null;
        }
    },
    
    /**
     * Get remember me token
     * @returns {object|null}
     */
    getRememberToken() {
        try {
            const tokenData = localStorage.getItem(this.REMEMBER_KEY);
            return tokenData ? JSON.parse(tokenData) : null;
        } catch (error) {
            console.error('Error parsing remember token:', error);
            return null;
        }
    },
    
    /**
     * Renew session from remember token
     * @param {object} rememberToken 
     */
    renewSessionFromRemember(rememberToken) {
        const session = {
            username: rememberToken.username,
            loginTime: Date.now(),
            expiresAt: Date.now() + this.SESSION_DURATION,
            remember: true
        };
        
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        console.log('Session renewed from remember token');
    },
    
    /**
     * Get current user info
     * @returns {object|null}
     */
    getCurrentUser() {
        const session = this.getSession();
        if (session && this.isLoggedIn()) {
            return {
                username: session.username,
                loginTime: new Date(session.loginTime),
                expiresAt: new Date(session.expiresAt)
            };
        }
        return null;
    },
    
    /**
     * Extend current session
     */
    extendSession() {
        const session = this.getSession();
        if (session) {
            session.expiresAt = Date.now() + this.SESSION_DURATION;
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            console.log('Session extended');
        }
    },
    
    /**
     * Check session and redirect if needed
     * Call this on protected pages
     */
    requireAuth() {
        if (!this.isLoggedIn()) {
            console.log('Authentication required - redirecting to login');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },
    
    /**
     * Initialize auth system
     * Sets up automatic session extension on activity
     */
    init() {
        // Extend session on user activity
        const activityEvents = ['click', 'keydown', 'mousemove', 'scroll'];
        let lastActivity = Date.now();
        
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                const now = Date.now();
                // Only extend if more than 5 minutes since last extension
                if (now - lastActivity > 5 * 60 * 1000) {
                    this.extendSession();
                    lastActivity = now;
                }
            });
        });
        
        // Check session validity every minute
        setInterval(() => {
            if (!this.isLoggedIn() && window.location.pathname.includes('/admin/') && !window.location.pathname.endsWith('index.html')) {
                console.log('Session expired - redirecting to login');
                this.logout();
            }
        }, 60 * 1000);
        
        console.log('Auth system initialized');
    },
    
    /**
     * Utility function to create delays
     * @param {number} ms 
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Initialize auth system when script loads
Auth.init();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}