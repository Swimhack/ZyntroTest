// COA Manager - Handles CRUD operations for Certificates of Analysis
// Uses ApiClient instead of Supabase

const SupabaseCOAManager = {
    COA_TYPES: {
        'peptide': 'Peptide Analysis',
        'supplement': 'Supplement Screening',
        'biotech': 'Biotech Analysis'
    },

    async init() {
        console.log('COAManager: Initialized');
        return true;
    },

    async getAllCOAs() {
        try {
            const result = await window.ApiClient.adminList('coas');
            const transformedData = (result.data || []).map(coa => ({
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
            return { success: true, data: transformedData };
        } catch (error) {
            console.error('COAManager: Error loading COAs:', error);
            return { success: false, error: error.message, data: [] };
        }
    },

    async getCOAById(id) {
        try {
            const result = await window.ApiClient.adminGet('coas', id);
            const data = result.data;
            if (!data) return null;
            return {
                id: data.id, client: data.client, compound: data.compound,
                date: data.test_date || new Date().toLocaleDateString(),
                type: data.analysis_type, status: data.status || 'Complete',
                purity: data.purity || null, result: data.result || null,
                dateAdded: data.created_at, dateModified: data.updated_at,
                fileName: data.file_name || null, fileSize: data.file_size || null,
                fileUrl: data.file_url || null, notes: data.notes || ''
            };
        } catch (error) {
            console.error('COAManager: Error loading COA:', error);
            return null;
        }
    },

    async addCOA(coaData) {
        try {
            if (!coaData.id || !coaData.client || !coaData.compound) {
                throw new Error('Missing required fields: ID, client, or compound');
            }
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
            const result = await window.ApiClient.adminInsert('coas', dbData);
            return { success: true, data: result.data };
        } catch (error) {
            console.error('COAManager: Error adding COA:', error);
            return { success: false, error: error.message };
        }
    },

    async updateCOA(id, updateData) {
        try {
            const newId = updateData.id;
            const isIdChanging = newId && newId !== id;

            if (isIdChanging) {
                try {
                    await window.ApiClient.adminGet('coas', newId);
                    return { success: false, error: 'COA ID already exists. Please choose a different ID.' };
                } catch (e) {
                    // 404 means new ID doesn't exist - good
                }
            }

            const dbData = {};
            if (updateData.client !== undefined) dbData.client = updateData.client;
            if (updateData.compound !== undefined) dbData.compound = updateData.compound;
            if (updateData.type !== undefined) dbData.analysis_type = updateData.type;
            if (updateData.date !== undefined) dbData.test_date = updateData.date ? new Date(updateData.date).toISOString().split('T')[0] : null;
            if (updateData.status !== undefined) dbData.status = updateData.status;
            if (updateData.purity !== undefined) dbData.purity = updateData.purity || null;
            if (updateData.result !== undefined) dbData.result = updateData.result || null;
            if (updateData.notes !== undefined) dbData.notes = updateData.notes || '';
            if (updateData.fileName !== undefined) dbData.file_name = updateData.fileName || null;
            if (updateData.fileSize !== undefined) dbData.file_size = updateData.fileSize || null;
            if (updateData.fileUrl !== undefined) dbData.file_url = updateData.fileUrl || null;
            if (isIdChanging) dbData.id = newId;

            const result = await window.ApiClient.adminUpdate('coas', id, dbData);
            return { success: true, data: result.data };
        } catch (error) {
            console.error('COAManager: Error updating COA:', error);
            return { success: false, error: error.message };
        }
    },

    async deleteCOA(id) {
        try {
            await window.ApiClient.adminDelete('coas', id);
            return true;
        } catch (error) {
            console.error('COAManager: Error deleting COA:', error);
            throw error;
        }
    },

    async uploadFile(file, fileName) {
        try {
            const result = await window.ApiClient.uploadCOAFile(file);
            return {
                path: result.fileUrl,
                fullPath: result.fileUrl,
                publicUrl: result.fileUrl,
                fileName: result.fileName
            };
        } catch (error) {
            console.error('COAManager: Error uploading file:', error);
            throw error;
        }
    },

    async deleteFile(fileName) {
        // Files are stored locally, admin can delete manually
        console.log('COAManager: File deletion for local files not implemented via API');
        return true;
    },

    async generateCOAId() {
        try {
            const currentYear = new Date().getFullYear();
            const result = await this.getAllCOAs();
            const coas = result.data || [];
            const yearPrefix = `ZT-${currentYear}-`;
            let maxNumber = 0;
            coas.forEach(coa => {
                const match = coa.id.match(/ZT-\d{4}-(\d+)/);
                if (match) {
                    const number = parseInt(match[1]);
                    if (number > maxNumber) maxNumber = number;
                }
            });
            const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
            return `ZT-${currentYear}-${nextNumber}`;
        } catch (error) {
            return `ZT-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
        }
    },

    async searchCOAs(query) {
        try {
            const result = await window.ApiClient.getCOAs({ q: query });
            return (result.data || []).map(coa => ({
                id: coa.id, client: coa.client, compound: coa.compound,
                date: coa.test_date || new Date().toLocaleDateString(),
                type: coa.analysis_type, status: coa.status || 'Complete',
                purity: coa.purity || null, result: coa.result || null,
                dateAdded: coa.created_at, dateModified: coa.updated_at,
                fileName: coa.file_name || null, fileSize: coa.file_size || null,
                fileUrl: coa.file_url || null, notes: coa.notes || ''
            }));
        } catch (error) {
            console.error('COAManager: Error searching COAs:', error);
            return [];
        }
    },

    async filterByType(type) {
        try {
            const result = await window.ApiClient.getCOAs({ type });
            return (result.data || []).map(coa => ({
                id: coa.id, client: coa.client, compound: coa.compound,
                date: coa.test_date || new Date().toLocaleDateString(),
                type: coa.analysis_type, status: coa.status || 'Complete',
                purity: coa.purity || null, result: coa.result || null,
                dateAdded: coa.created_at, dateModified: coa.updated_at,
                fileName: coa.file_name || null, fileSize: coa.file_size || null,
                fileUrl: coa.file_url || null, notes: coa.notes || ''
            }));
        } catch (error) {
            console.error('COAManager: Error filtering COAs:', error);
            return [];
        }
    },

    async getStatistics() {
        try {
            const result = await this.getAllCOAs();
            const coas = result.data || [];
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            return {
                total: coas.length,
                thisMonth: coas.filter(c => new Date(c.dateAdded) >= startOfMonth).length,
                today: coas.filter(c => new Date(c.dateAdded) >= startOfDay).length,
                byType: {
                    peptide: coas.filter(c => c.type === 'Peptide Analysis').length,
                    supplement: coas.filter(c => c.type === 'Supplement Screening').length,
                    biotech: coas.filter(c => c.type === 'Biotech Analysis').length
                }
            };
        } catch (error) {
            return { total: 0, thisMonth: 0, today: 0, byType: { peptide: 0, supplement: 0, biotech: 0 } };
        }
    },

    validateCOA(coaData) {
        const errors = [];
        const warnings = [];
        if (!coaData.id) errors.push('COA ID is required');
        if (!coaData.client) errors.push('Client name is required');
        if (!coaData.compound) errors.push('Compound name is required');
        if (coaData.id && !/^ZT-\d{4}-\d{3}$/.test(coaData.id)) {
            warnings.push('COA ID does not match standard format (ZT-YYYY-XXX)');
        }
        if (coaData.type && !Object.values(this.COA_TYPES).includes(coaData.type)) {
            warnings.push('Unknown COA type');
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await SupabaseCOAManager.init();
    } catch (error) {
        console.error('COAManager auto-initialization failed:', error);
    }
});

window.SupabaseCOAManager = SupabaseCOAManager;
window.COAManager = SupabaseCOAManager;
