// COA Manager - Handles CRUD operations for Certificates of Analysis
// Integrates with existing config.js coaDatabase to maintain backward compatibility

const COAManager = {
    // Storage keys
    COA_STORAGE_KEY: 'zyntro_coa_database',
    COA_METADATA_KEY: 'zyntro_coa_metadata',
    
    // COA Types
    COA_TYPES: {
        'peptide': 'Peptide Analysis',
        'supplement': 'Supplement Screening', 
        'biotech': 'Biotech Analysis'
    },
    
    /**
     * Initialize COA Manager
     * Load existing COAs from config.js and local storage
     */
    init() {
        console.log('COAManager: Initializing...');
        this.syncWithConfig();
        this.cleanupOldEntries();
        console.log('COAManager: Initialized successfully');
    },
    
    /**
     * Get all COAs from storage
     * @returns {Array} Array of COA objects
     */
    getAllCOAs() {
        try {
            const stored = localStorage.getItem(this.COA_STORAGE_KEY);
            const coas = stored ? JSON.parse(stored) : [];
            
            // Ensure all COAs have required fields
            return coas.map(coa => ({
                id: coa.id,
                client: coa.client || 'Unknown Client',
                compound: coa.compound || 'Unknown Compound',
                date: coa.date || new Date().toLocaleDateString(),
                type: coa.type || 'Peptide Analysis',
                status: coa.status || 'Complete',
                purity: coa.purity || null,
                result: coa.result || null,
                dateAdded: coa.dateAdded || new Date().toISOString(),
                fileName: coa.fileName || null,
                fileSize: coa.fileSize || null,
                notes: coa.notes || ''
            }));
        } catch (error) {
            console.error('COAManager: Error loading COAs:', error);
            return [];
        }
    },
    
    /**
     * Get COA by ID
     * @param {string} id 
     * @returns {Object|null}
     */
    getCOAById(id) {
        const coas = this.getAllCOAs();
        return coas.find(coa => coa.id === id) || null;
    },
    
    /**
     * Add new COA
     * @param {Object} coaData 
     * @returns {boolean}
     */
    addCOA(coaData) {
        try {
            const coas = this.getAllCOAs();
            
            // Validate required fields
            if (!coaData.id || !coaData.client || !coaData.compound) {
                throw new Error('Missing required fields: ID, client, or compound');
            }
            
            // Check for duplicate ID
            if (coas.some(coa => coa.id === coaData.id)) {
                throw new Error('COA with this ID already exists');
            }
            
            // Create new COA object
            const newCOA = {
                id: coaData.id,
                client: coaData.client,
                compound: coaData.compound,
                date: coaData.date || new Date().toLocaleDateString(),
                type: coaData.type || 'Peptide Analysis',
                status: coaData.status || 'Complete',
                purity: coaData.purity || null,
                result: coaData.result || null,
                dateAdded: new Date().toISOString(),
                fileName: coaData.fileName || null,
                fileSize: coaData.fileSize || null,
                notes: coaData.notes || ''
            };
            
            // Add to array
            coas.push(newCOA);
            
            // Save to storage
            localStorage.setItem(this.COA_STORAGE_KEY, JSON.stringify(coas));
            
            // Update config.js integration
            this.updateConfigFile();
            
            console.log('COAManager: Added COA:', newCOA.id);
            return true;
        } catch (error) {
            console.error('COAManager: Error adding COA:', error);
            throw error;
        }
    },
    
    /**
     * Update existing COA
     * @param {string} id 
     * @param {Object} updateData 
     * @returns {boolean}
     */
    updateCOA(id, updateData) {
        try {
            const coas = this.getAllCOAs();
            const index = coas.findIndex(coa => coa.id === id);
            
            if (index === -1) {
                throw new Error('COA not found');
            }
            
            // Update COA data
            coas[index] = {
                ...coas[index],
                ...updateData,
                dateModified: new Date().toISOString()
            };
            
            // Save to storage
            localStorage.setItem(this.COA_STORAGE_KEY, JSON.stringify(coas));
            
            // Update config.js integration
            this.updateConfigFile();
            
            console.log('COAManager: Updated COA:', id);
            return true;
        } catch (error) {
            console.error('COAManager: Error updating COA:', error);
            throw error;
        }
    },
    
    /**
     * Delete COA
     * @param {string} id 
     * @returns {boolean}
     */
    deleteCOA(id) {
        try {
            const coas = this.getAllCOAs();
            const filteredCOAs = coas.filter(coa => coa.id !== id);
            
            if (filteredCOAs.length === coas.length) {
                throw new Error('COA not found');
            }
            
            // Save updated array
            localStorage.setItem(this.COA_STORAGE_KEY, JSON.stringify(filteredCOAs));
            
            // Update config.js integration
            this.updateConfigFile();
            
            console.log('COAManager: Deleted COA:', id);
            return true;
        } catch (error) {
            console.error('COAManager: Error deleting COA:', error);
            throw error;
        }
    },
    
    /**
     * Generate next available COA ID
     * @returns {string}
     */
    generateCOAId() {
        const currentYear = new Date().getFullYear();
        const coas = this.getAllCOAs();
        
        // Find highest number for current year
        const yearPrefix = `ZT-${currentYear}-`;
        const currentYearCOAs = coas.filter(coa => coa.id.startsWith(yearPrefix));
        
        let maxNumber = 0;
        currentYearCOAs.forEach(coa => {
            const match = coa.id.match(/ZT-\d{4}-(\d+)/);
            if (match) {
                const number = parseInt(match[1]);
                if (number > maxNumber) {
                    maxNumber = number;
                }
            }
        });
        
        // Generate next ID
        const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
        return `ZT-${currentYear}-${nextNumber}`;
    },
    
    /**
     * Search COAs
     * @param {string} query 
     * @returns {Array}
     */
    searchCOAs(query) {
        const coas = this.getAllCOAs();
        const searchTerm = query.toLowerCase();
        
        return coas.filter(coa => 
            coa.id.toLowerCase().includes(searchTerm) ||
            coa.client.toLowerCase().includes(searchTerm) ||
            coa.compound.toLowerCase().includes(searchTerm) ||
            coa.type.toLowerCase().includes(searchTerm)
        );
    },
    
    /**
     * Filter COAs by type
     * @param {string} type 
     * @returns {Array}
     */
    filterByType(type) {
        const coas = this.getAllCOAs();
        return coas.filter(coa => coa.type === type);
    },
    
    /**
     * Get COAs added in date range
     * @param {Date} startDate 
     * @param {Date} endDate 
     * @returns {Array}
     */
    getCOAsByDateRange(startDate, endDate) {
        const coas = this.getAllCOAs();
        return coas.filter(coa => {
            const coaDate = new Date(coa.dateAdded);
            return coaDate >= startDate && coaDate <= endDate;
        });
    },
    
    /**
     * Get statistics
     * @returns {Object}
     */
    getStatistics() {
        const coas = this.getAllCOAs();
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        return {
            total: coas.length,
            thisMonth: coas.filter(coa => new Date(coa.dateAdded) >= startOfMonth).length,
            today: coas.filter(coa => new Date(coa.dateAdded) >= startOfDay).length,
            byType: {
                peptide: coas.filter(coa => coa.type === 'Peptide Analysis').length,
                supplement: coas.filter(coa => coa.type === 'Supplement Screening').length,
                biotech: coas.filter(coa => coa.type === 'Biotech Analysis').length
            }
        };
    },
    
    /**
     * Sync with existing config.js coaDatabase
     * Import any COAs that aren't in our storage yet
     */
    syncWithConfig() {
        try {
            // Check if SITE_CONFIG exists (loaded from config.js)
            if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.coaDatabase) {
                const configCOAs = SITE_CONFIG.coaDatabase;
                const existingCOAs = this.getAllCOAs();
                const existingIds = new Set(existingCOAs.map(coa => coa.id));
                
                // Import COAs from config that don't exist in our storage
                Object.keys(configCOAs).forEach(id => {
                    if (!existingIds.has(id)) {
                        const configCOA = configCOAs[id];
                        const newCOA = {
                            id: id,
                            client: configCOA.client,
                            compound: configCOA.compound,
                            date: configCOA.date,
                            type: configCOA.type,
                            status: configCOA.status || 'Complete',
                            purity: configCOA.purity || null,
                            result: configCOA.result || null,
                            dateAdded: new Date().toISOString(), // Default to now since not in config
                            fileName: null,
                            fileSize: null,
                            notes: 'Imported from existing config'
                        };
                        existingCOAs.push(newCOA);
                    }
                });
                
                // Save updated array
                if (existingCOAs.length > this.getAllCOAs().length) {
                    localStorage.setItem(this.COA_STORAGE_KEY, JSON.stringify(existingCOAs));
                    console.log('COAManager: Synced with config.js');
                }
            }
        } catch (error) {
            console.error('COAManager: Error syncing with config:', error);
        }
    },
    
    /**
     * Update config.js format for backward compatibility
     * This creates the data structure needed by the public search
     */
    updateConfigFile() {
        try {
            const coas = this.getAllCOAs();
            const configFormat = {};
            
            // Convert to config.js format
            coas.forEach(coa => {
                configFormat[coa.id] = {
                    id: coa.id,
                    client: coa.client,
                    compound: coa.compound,
                    date: coa.date,
                    type: coa.type,
                    status: coa.status
                };
                
                // Add type-specific fields
                if (coa.purity) {
                    configFormat[coa.id].purity = coa.purity;
                }
                if (coa.result) {
                    configFormat[coa.id].result = coa.result;
                }
            });
            
            // Store in format compatible with existing search
            localStorage.setItem('zyntro_config_coa_database', JSON.stringify(configFormat));
            
            console.log('COAManager: Updated config format for public search');
        } catch (error) {
            console.error('COAManager: Error updating config format:', error);
        }
    },
    
    /**
     * Export COA data
     * @param {string} format - 'json' or 'csv'
     * @returns {string}
     */
    exportData(format = 'json') {
        const coas = this.getAllCOAs();
        
        if (format === 'csv') {
            const headers = ['ID', 'Client', 'Compound', 'Type', 'Date', 'Status', 'Date Added'];
            const csvData = [headers];
            
            coas.forEach(coa => {
                csvData.push([
                    coa.id,
                    coa.client,
                    coa.compound,
                    coa.type,
                    coa.date,
                    coa.status,
                    new Date(coa.dateAdded).toLocaleDateString()
                ]);
            });
            
            return csvData.map(row => row.join(',')).join('\\n');
        }
        
        return JSON.stringify(coas, null, 2);
    },
    
    /**
     * Import COA data
     * @param {string} jsonData 
     * @returns {number} Number of COAs imported
     */
    importData(jsonData) {
        try {
            const importedCOAs = JSON.parse(jsonData);
            const existingCOAs = this.getAllCOAs();
            const existingIds = new Set(existingCOAs.map(coa => coa.id));
            
            let importCount = 0;
            
            importedCOAs.forEach(coa => {
                if (!existingIds.has(coa.id)) {
                    existingCOAs.push({
                        ...coa,
                        dateAdded: coa.dateAdded || new Date().toISOString()
                    });
                    importCount++;
                }
            });
            
            if (importCount > 0) {
                localStorage.setItem(this.COA_STORAGE_KEY, JSON.stringify(existingCOAs));
                this.updateConfigFile();
            }
            
            return importCount;
        } catch (error) {
            console.error('COAManager: Error importing data:', error);
            throw error;
        }
    },
    
    /**
     * Clean up old entries (optional housekeeping)
     */
    cleanupOldEntries() {
        // This could be used to remove very old COAs if needed
        // For now, we keep everything
        console.log('COAManager: Cleanup check complete');
    },
    
    /**
     * Validate COA data
     * @param {Object} coaData 
     * @returns {Object} validation result
     */
    validateCOA(coaData) {
        const errors = [];
        const warnings = [];
        
        // Required fields
        if (!coaData.id) errors.push('COA ID is required');
        if (!coaData.client) errors.push('Client name is required');
        if (!coaData.compound) errors.push('Compound name is required');
        
        // ID format validation
        if (coaData.id && !/^ZT-\\d{4}-\\d{3}$/.test(coaData.id)) {
            warnings.push('COA ID does not match standard format (ZT-YYYY-XXX)');
        }
        
        // Type validation
        if (coaData.type && !Object.values(this.COA_TYPES).includes(coaData.type)) {
            warnings.push('Unknown COA type');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }
};

// Initialize when script loads
COAManager.init();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = COAManager;
}