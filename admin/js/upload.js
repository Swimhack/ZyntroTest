// Upload utility functions for COA file handling
// Handles file validation, upload simulation, and storage

const FileUploader = {
    // Configuration
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['application/pdf'],
    UPLOAD_ENDPOINT: '/api/upload-coa', // For future server implementation
    
    /**
     * Validate uploaded file
     * @param {File} file 
     * @returns {Object} validation result
     */
    validateFile(file) {
        const errors = [];
        
        // Check file type
        if (!this.ALLOWED_TYPES.includes(file.type)) {
            errors.push('Only PDF files are allowed');
        }
        
        // Check file size
        if (file.size > this.MAX_FILE_SIZE) {
            errors.push(`File size must be less than ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
        
        // Check filename
        if (!file.name || file.name.length === 0) {
            errors.push('File must have a valid name');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    /**
     * Format file size for display
     * @param {number} bytes 
     * @returns {string}
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * Generate unique filename to prevent conflicts
     * @param {string} originalName 
     * @param {string} coaId 
     * @returns {string}
     */
    generateUniqueFilename(originalName, coaId) {
        const timestamp = Date.now();
        const extension = originalName.split('.').pop();
        const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
        
        return `${coaId}_${timestamp}_${safeName}`;
    },
    
    /**
     * Simulate file upload (for demonstration)
     * In production, this would upload to a server
     * @param {File} file 
     * @param {string} coaId 
     * @param {Function} progressCallback 
     * @returns {Promise<Object>}
     */
    async simulateUpload(file, coaId, progressCallback) {
        return new Promise((resolve, reject) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 100) progress = 100;
                
                if (progressCallback) {
                    progressCallback(Math.round(progress));
                }
                
                if (progress >= 100) {
                    clearInterval(interval);
                    
                    // Simulate successful upload result
                    const result = {
                        success: true,
                        filename: this.generateUniqueFilename(file.name, coaId),
                        originalName: file.name,
                        size: file.size,
                        uploadedAt: new Date().toISOString(),
                        url: `uploads/coas/${this.generateUniqueFilename(file.name, coaId)}`
                    };
                    
                    resolve(result);
                }
            }, 100);
            
            // Simulate potential upload error (very rare)
            if (Math.random() < 0.02) {
                clearInterval(interval);
                reject(new Error('Upload failed due to network error'));
            }
        });
    },
    
    /**
     * Store file in browser storage (for demo purposes)
     * In production, files would be stored on server
     * @param {File} file 
     * @param {string} coaId 
     * @returns {Promise<Object>}
     */
    async storeFile(file, coaId) {
        try {
            // Convert file to base64 for storage
            const base64Data = await this.fileToBase64(file);
            const filename = this.generateUniqueFilename(file.name, coaId);
            
            // Store in localStorage (not recommended for production)
            const fileData = {
                filename: filename,
                originalName: file.name,
                size: file.size,
                type: file.type,
                data: base64Data,
                uploadedAt: new Date().toISOString(),
                coaId: coaId
            };
            
            // Get existing files
            const existingFiles = this.getStoredFiles();
            existingFiles[filename] = fileData;
            
            // Save back to storage
            localStorage.setItem('zyntro_uploaded_files', JSON.stringify(existingFiles));
            
            return {
                success: true,
                filename: filename,
                url: `#file-${filename}` // Placeholder URL for demo
            };
        } catch (error) {
            console.error('Error storing file:', error);
            throw new Error('Failed to store file');
        }
    },
    
    /**
     * Get all stored files
     * @returns {Object}
     */
    getStoredFiles() {
        try {
            const files = localStorage.getItem('zyntro_uploaded_files');
            return files ? JSON.parse(files) : {};
        } catch (error) {
            console.error('Error loading stored files:', error);
            return {};
        }
    },
    
    /**
     * Get file by filename
     * @param {string} filename 
     * @returns {Object|null}
     */
    getStoredFile(filename) {
        const files = this.getStoredFiles();
        return files[filename] || null;
    },
    
    /**
     * Delete stored file
     * @param {string} filename 
     * @returns {boolean}
     */
    deleteStoredFile(filename) {
        try {
            const files = this.getStoredFiles();
            if (files[filename]) {
                delete files[filename];
                localStorage.setItem('zyntro_uploaded_files', JSON.stringify(files));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    },
    
    /**
     * Convert file to base64 string
     * @param {File} file 
     * @returns {Promise<string>}
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },
    
    /**
     * Create download link for stored file
     * @param {string} filename 
     * @returns {string|null}
     */
    createDownloadLink(filename) {
        const fileData = this.getStoredFile(filename);
        if (!fileData) return null;
        
        try {
            // Convert base64 back to blob
            const byteCharacters = atob(fileData.data.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: fileData.type });
            
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error creating download link:', error);
            return null;
        }
    },
    
    /**
     * Trigger file download
     * @param {string} filename 
     */
    downloadFile(filename) {
        const downloadUrl = this.createDownloadLink(filename);
        const fileData = this.getStoredFile(filename);
        
        if (!downloadUrl || !fileData) {
            alert('File not found or corrupted');
            return;
        }
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileData.originalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the URL
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
    },
    
    /**
     * Get storage usage information
     * @returns {Object}
     */
    getStorageInfo() {
        const files = this.getStoredFiles();
        const fileCount = Object.keys(files).length;
        
        let totalSize = 0;
        Object.values(files).forEach(file => {
            totalSize += file.size;
        });
        
        return {
            fileCount: fileCount,
            totalSize: totalSize,
            totalSizeFormatted: this.formatFileSize(totalSize),
            files: files
        };
    },
    
    /**
     * Clean up old files (optional maintenance)
     * @param {number} daysOld - Remove files older than this many days
     * @returns {number} Number of files removed
     */
    cleanupOldFiles(daysOld = 365) {
        const files = this.getStoredFiles();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        let removedCount = 0;
        Object.keys(files).forEach(filename => {
            const file = files[filename];
            const fileDate = new Date(file.uploadedAt);
            
            if (fileDate < cutoffDate) {
                delete files[filename];
                removedCount++;
            }
        });
        
        if (removedCount > 0) {
            localStorage.setItem('zyntro_uploaded_files', JSON.stringify(files));
            console.log(`Cleaned up ${removedCount} old files`);
        }
        
        return removedCount;
    },
    
    /**
     * Validate file before upload
     * @param {File} file 
     * @param {string} coaId 
     * @returns {Object}
     */
    preUploadValidation(file, coaId) {
        const validation = this.validateFile(file);
        const warnings = [];
        
        // Check if COA ID is provided
        if (!coaId || coaId.trim().length === 0) {
            warnings.push('COA ID not provided - filename will be auto-generated');
        }
        
        // Check if file already exists for this COA
        const files = this.getStoredFiles();
        const existingFile = Object.values(files).find(f => f.coaId === coaId);
        if (existingFile) {
            warnings.push('A file already exists for this COA ID - it will be replaced');
        }
        
        return {
            ...validation,
            warnings: warnings
        };
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileUploader;
}