// Supabase COA Manager - Handles CRUD operations for Certificates of Analysis
// Uses Supabase database instead of localStorage for persistent storage

const SupabaseCOAManager = {
    // COA Types
    COA_TYPES: {
        'peptide': 'Peptide Analysis',
        'supplement': 'Supplement Screening', 
        'biotech': 'Biotech Analysis'
    },
    
    // Storage bucket name
    STORAGE_BUCKET: 'coa-files',
    
    /**
     * Initialize Supabase COA Manager
     */
    async init() {
        try {
            console.log('SupabaseCOAManager: Initializing...');
            
            // Ensure Supabase is initialized
            if (!window.supabaseClient) {
                await window.initSupabase();
            }
            
            // Test connection
            const isConnected = await SupabaseUtils.isConnected();
            if (!isConnected) {
                console.warn('SupabaseCOAManager: Database connection test failed');
            }
            
            console.log('SupabaseCOAManager: Initialized successfully');
            return true;
        } catch (error) {
            console.error('SupabaseCOAManager: Initialization failed:', error);
            throw error;
        }
    },
    
    /**
     * Get all COAs from Supabase
     * @returns {Promise<Array>} Array of COA objects
     */
    async getAllCOAs() {
        try {
            const client = SupabaseUtils.getClient();
            const { data, error } = await client
                .from('coas')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                throw new Error(SupabaseUtils.handleError(error));
            }
            
            // Transform data to match frontend expectations
            return data.map(coa => ({
                id: coa.id,
                client: coa.client,
                compound: coa.compound,
                date: coa.test_date || new Date().toLocaleDateString(),
                type: coa.analysis_type,
                status: coa.status || 'Complete',
                purity: coa.purity || null,
                result: coa.result || null,
                dateAdded: coa.created_at,
                dateModified: coa.updated_at,
                fileName: coa.file_name || null,
                fileSize: coa.file_size || null,
                fileUrl: coa.file_url || null,
                notes: coa.notes || ''
            }));
        } catch (error) {
            console.error('SupabaseCOAManager: Error loading COAs:', error);
            return [];
        }
    },
    
    /**
     * Get COA by ID from Supabase
     * @param {string} id 
     * @returns {Promise<Object|null>}
     */
    async getCOAById(id) {
        try {
            const client = SupabaseUtils.getClient();
            const { data, error } = await client
                .from('coas')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                throw new Error(SupabaseUtils.handleError(error));
            }
            
            // Transform data to match frontend expectations
            return {
                id: data.id,
                client: data.client,
                compound: data.compound,
                date: data.test_date || new Date().toLocaleDateString(),
                type: data.analysis_type,
                status: data.status || 'Complete',
                purity: data.purity || null,
                result: data.result || null,
                dateAdded: data.created_at,
                dateModified: data.updated_at,
                fileName: data.file_name || null,
                fileSize: data.file_size || null,
                fileUrl: data.file_url || null,
                notes: data.notes || ''
            };
        } catch (error) {
            console.error('SupabaseCOAManager: Error loading COA:', error);
            return null;
        }
    },
    
    /**
     * Add new COA to Supabase
     * @param {Object} coaData 
     * @returns {Promise<boolean>}
     */
    async addCOA(coaData) {
        try {
            // Validate required fields
            if (!coaData.id || !coaData.client || !coaData.compound) {
                throw new Error('Missing required fields: ID, client, or compound');
            }
            
            const client = SupabaseUtils.getClient();
            
            // Transform data for database
            const dbData = {
                id: coaData.id,
                client: coaData.client,
                compound: coaData.compound,
                analysis_type: coaData.type || 'Peptide Analysis',
                test_date: coaData.date ? new Date(coaData.date).toISOString().split('T')[0] : null,
                status: coaData.status || 'Complete',
                purity: coaData.purity || null,
                result: coaData.result || null,
                notes: coaData.notes || '',
                file_name: coaData.fileName || null,
                file_size: coaData.fileSize || null,
                file_url: coaData.fileUrl || null,
                created_by: 'admin'
            };
            
            const { data, error } = await client
                .from('coas')
                .insert([dbData])
                .select()
                .single();
            
            if (error) {
                throw new Error(SupabaseUtils.handleError(error));
            }
            
            console.log('SupabaseCOAManager: Added COA:', data.id);
            return true;
        } catch (error) {
            console.error('SupabaseCOAManager: Error adding COA:', error);
            throw error;
        }
    },
    
    /**
     * Update existing COA in Supabase
     * @param {string} id 
     * @param {Object} updateData 
     * @returns {Promise<boolean>}
     */
    async updateCOA(id, updateData) {
        try {
            const client = SupabaseUtils.getClient();
            
            // Transform data for database
            const dbData = {
                client: updateData.client,
                compound: updateData.compound,
                analysis_type: updateData.type,
                test_date: updateData.date ? new Date(updateData.date).toISOString().split('T')[0] : null,
                status: updateData.status,
                purity: updateData.purity || null,
                result: updateData.result || null,
                notes: updateData.notes || '',
                file_name: updateData.fileName || null,
                file_size: updateData.fileSize || null,
                file_url: updateData.fileUrl || null
            };
            
            // Remove undefined values
            Object.keys(dbData).forEach(key => {
                if (dbData[key] === undefined) {
                    delete dbData[key];
                }
            });
            
            const { data, error } = await client
                .from('coas')
                .update(dbData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) {
                throw new Error(SupabaseUtils.handleError(error));
            }
            
            console.log('SupabaseCOAManager: Updated COA:', id);
            return true;
        } catch (error) {
            console.error('SupabaseCOAManager: Error updating COA:', error);
            throw error;
        }
    },
    
    /**
     * Delete COA from Supabase
     * @param {string} id 
     * @returns {Promise<boolean>}
     */
    async deleteCOA(id) {
        try {
            const client = SupabaseUtils.getClient();
            
            // First get the COA to check for associated files
            const coa = await this.getCOAById(id);
            
            // Delete associated file from storage if it exists
            if (coa && coa.fileName) {
                await this.deleteFile(coa.fileName);
            }
            
            // Delete from database
            const { error } = await client
                .from('coas')
                .delete()
                .eq('id', id);
            
            if (error) {
                throw new Error(SupabaseUtils.handleError(error));
            }
            
            console.log('SupabaseCOAManager: Deleted COA:', id);
            return true;
        } catch (error) {
            console.error('SupabaseCOAManager: Error deleting COA:', error);
            throw error;
        }
    },
    
    /**
     * Upload file to Supabase Storage
     * @param {File} file 
     * @param {string} fileName 
     * @returns {Promise<Object>}
     */
    async uploadFile(file, fileName) {
        try {
            const client = SupabaseUtils.getClient();
            
            const { data, error } = await client.storage
                .from(this.STORAGE_BUCKET)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) {
                throw new Error(SupabaseUtils.handleError(error));
            }
            
            // Get public URL
            const { data: urlData } = client.storage
                .from(this.STORAGE_BUCKET)
                .getPublicUrl(fileName);
            
            return {
                path: data.path,
                fullPath: data.fullPath,
                publicUrl: urlData.publicUrl
            };
        } catch (error) {
            console.error('SupabaseCOAManager: Error uploading file:', error);
            throw error;
        }
    },
    
    /**
     * Delete file from Supabase Storage
     * @param {string} fileName 
     * @returns {Promise<boolean>}
     */
    async deleteFile(fileName) {
        try {
            const client = SupabaseUtils.getClient();
            
            const { error } = await client.storage
                .from(this.STORAGE_BUCKET)
                .remove([fileName]);
            
            if (error) {
                console.warn('SupabaseCOAManager: Error deleting file:', error);
                return false;
            }
            
            return true;
        } catch (error) {
            console.warn('SupabaseCOAManager: Error deleting file:', error);
            return false;
        }
    },
    
    /**
     * Generate next available COA ID
     * @returns {Promise<string>}
     */
    async generateCOAId() {
        try {
            const currentYear = new Date().getFullYear();
            const coas = await this.getAllCOAs();
            
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
        } catch (error) {
            console.error('SupabaseCOAManager: Error generating COA ID:', error);
            // Fallback to timestamp-based ID
            return `ZT-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
        }
    },
    
    /**
     * Search COAs
     * @param {string} query 
     * @returns {Promise<Array>}
     */
    async searchCOAs(query) {
        try {
            const client = SupabaseUtils.getClient();
            const searchTerm = `%${query.toLowerCase()}%`;
            
            const { data, error } = await client
                .from('coas')
                .select('*')
                .or(`id.ilike.${searchTerm},client.ilike.${searchTerm},compound.ilike.${searchTerm},analysis_type.ilike.${searchTerm}`)
                .order('created_at', { ascending: false });
            
            if (error) {
                throw new Error(SupabaseUtils.handleError(error));
            }
            
            // Transform data
            return data.map(coa => ({
                id: coa.id,
                client: coa.client,
                compound: coa.compound,
                date: coa.test_date || new Date().toLocaleDateString(),
                type: coa.analysis_type,
                status: coa.status || 'Complete',
                purity: coa.purity || null,
                result: coa.result || null,
                dateAdded: coa.created_at,
                dateModified: coa.updated_at,
                fileName: coa.file_name || null,
                fileSize: coa.file_size || null,
                fileUrl: coa.file_url || null,
                notes: coa.notes || ''
            }));
        } catch (error) {
            console.error('SupabaseCOAManager: Error searching COAs:', error);
            return [];
        }
    },
    
    /**
     * Filter COAs by type
     * @param {string} type 
     * @returns {Promise<Array>}
     */
    async filterByType(type) {
        try {
            const client = SupabaseUtils.getClient();
            
            const { data, error } = await client
                .from('coas')
                .select('*')
                .eq('analysis_type', type)
                .order('created_at', { ascending: false });
            
            if (error) {
                throw new Error(SupabaseUtils.handleError(error));
            }
            
            // Transform data
            return data.map(coa => ({
                id: coa.id,
                client: coa.client,
                compound: coa.compound,
                date: coa.test_date || new Date().toLocaleDateString(),
                type: coa.analysis_type,
                status: coa.status || 'Complete',
                purity: coa.purity || null,
                result: coa.result || null,
                dateAdded: coa.created_at,
                dateModified: coa.updated_at,
                fileName: coa.file_name || null,
                fileSize: coa.file_size || null,
                fileUrl: coa.file_url || null,
                notes: coa.notes || ''
            }));
        } catch (error) {
            console.error('SupabaseCOAManager: Error filtering COAs:', error);
            return [];
        }
    },
    
    /**
     * Get statistics
     * @returns {Promise<Object>}
     */
    async getStatistics() {
        try {
            const client = SupabaseUtils.getClient();
            
            // Get total count
            const { count: totalCount, error: totalError } = await client
                .from('coas')
                .select('*', { count: 'exact', head: true });
            
            if (totalError) {
                throw new Error(SupabaseUtils.handleError(totalError));
            }
            
            // Get counts by type
            const { data: typeData, error: typeError } = await client
                .from('coas')
                .select('analysis_type')
                .eq('status', 'Complete');
            
            if (typeError) {
                throw new Error(SupabaseUtils.handleError(typeError));
            }
            
            const byType = {
                peptide: typeData.filter(row => row.analysis_type === 'Peptide Analysis').length,
                supplement: typeData.filter(row => row.analysis_type === 'Supplement Screening').length,
                biotech: typeData.filter(row => row.analysis_type === 'Biotech Analysis').length
            };
            
            // Get recent counts (this month and today)
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            const { count: thisMonthCount } = await client
                .from('coas')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfMonth.toISOString());
            
            const { count: todayCount } = await client
                .from('coas')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfDay.toISOString());
            
            return {
                total: totalCount || 0,
                thisMonth: thisMonthCount || 0,
                today: todayCount || 0,
                byType: byType
            };
        } catch (error) {
            console.error('SupabaseCOAManager: Error getting statistics:', error);
            return {
                total: 0,
                thisMonth: 0,
                today: 0,
                byType: { peptide: 0, supplement: 0, biotech: 0 }
            };
        }
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
        if (coaData.id && !/^ZT-\d{4}-\d{3}$/.test(coaData.id)) {
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
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await SupabaseCOAManager.init();
        console.log('SupabaseCOAManager auto-initialization complete');
    } catch (error) {
        console.error('SupabaseCOAManager auto-initialization failed:', error);
    }
});

// Export for use in other scripts
window.SupabaseCOAManager = SupabaseCOAManager;

// Also create a compatibility layer with the old COAManager
window.COAManager = SupabaseCOAManager;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseCOAManager;
}