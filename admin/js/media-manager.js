// Media Manager for CMS
class MediaManager {
    constructor() {
        this.supabase = null;
        this.mediaContainer = null;
        this.uploadModal = null;
        this.init();
    }

    async init() {
        // Wait for Supabase to be available
        await this.waitForSupabase();
        this.setupEventListeners();
        this.loadMedia();
    }

    async waitForSupabase() {
        return new Promise((resolve) => {
            const checkSupabase = () => {
                if (window.supabaseClient) {
                    this.supabase = window.supabaseClient;
                    resolve();
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };
            checkSupabase();
        });
    }

    setupEventListeners() {
        // Upload button
        const uploadBtn = document.getElementById('uploadMediaBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.showUploadModal());
        }

        // Upload form
        const uploadForm = document.getElementById('mediaUploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleUpload(e));
        }

        // Close modal
        const closeModal = document.getElementById('closeMediaModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideUploadModal());
        }
    }

    showUploadModal() {
        if (!this.uploadModal) {
            this.createUploadModal();
        }
        this.uploadModal.style.display = 'block';
    }

    hideUploadModal() {
        if (this.uploadModal) {
            this.uploadModal.style.display = 'none';
        }
    }

    createUploadModal() {
        this.uploadModal = document.createElement('div');
        this.uploadModal.className = 'media-modal';
        this.uploadModal.innerHTML = `
            <div class="media-modal-content">
                <div class="media-modal-header">
                    <h3>Upload Media</h3>
                    <button id="closeMediaModal" class="media-modal-close">&times;</button>
                </div>
                <div class="media-modal-body">
                    <form id="mediaUploadForm" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="mediaFile">Select Image</label>
                            <input type="file" id="mediaFile" name="mediaFile" accept="image/*" required>
                        </div>
                        <div class="form-group">
                            <label for="mediaTitle">Title (optional)</label>
                            <input type="text" id="mediaTitle" name="mediaTitle" placeholder="Enter image title">
                        </div>
                        <div class="form-group">
                            <label for="mediaAlt">Alt Text (optional)</label>
                            <input type="text" id="mediaAlt" name="mediaAlt" placeholder="Enter alt text for accessibility">
                        </div>
                        <div class="form-actions">
                            <button type="button" onclick="mediaManager.hideUploadModal()" class="btn btn-secondary">Cancel</button>
                            <button type="submit" class="btn btn-primary">Upload</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(this.uploadModal);
    }

    async handleUpload(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('mediaFile');
        const titleInput = document.getElementById('mediaTitle');
        const altInput = document.getElementById('mediaAlt');
        
        if (!fileInput.files[0]) {
            this.showNotification('Please select a file', 'error');
            return;
        }

        const file = fileInput.files[0];
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `cms-media/${fileName}`;

        try {
            // Upload to Supabase storage
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from('coa-files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = this.supabase.storage
                .from('coa-files')
                .getPublicUrl(filePath);

            // Save to media table
            const { data: mediaData, error: mediaError } = await this.supabase
                .from('cms_media')
                .insert({
                    filename: fileName,
                    original_name: file.name,
                    file_path: filePath,
                    file_url: urlData.publicUrl,
                    file_size: file.size,
                    mime_type: file.type,
                    title: titleInput.value || file.name,
                    alt_text: altInput.value || '',
                    width: 0, // Will be updated after image loads
                    height: 0
                });

            if (mediaError) throw mediaError;

            this.showNotification('Media uploaded successfully!', 'success');
            this.hideUploadModal();
            this.loadMedia();

            // Reset form
            fileInput.value = '';
            titleInput.value = '';
            altInput.value = '';

        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('Error uploading media: ' + error.message, 'error');
        }
    }

    async loadMedia() {
        try {
            const { data: media, error } = await this.supabase
                .from('cms_media')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.displayMedia(media || []);

        } catch (error) {
            console.error('Error loading media:', error);
            this.showNotification('Error loading media: ' + error.message, 'error');
        }
    }

    displayMedia(mediaList) {
        const container = document.getElementById('mediaGrid');
        if (!container) return;

        if (mediaList.length === 0) {
            container.innerHTML = '<p>No media found. <a href="#" onclick="mediaManager.showUploadModal()">Upload your first image</a></p>';
            return;
        }

        container.innerHTML = mediaList.map(media => `
            <div class="media-item" data-id="${media.id}">
                <div class="media-thumbnail">
                    <img src="${media.file_url}" alt="${media.alt_text || media.title}" 
                         onload="this.style.opacity=1" style="opacity:0; transition: opacity 0.3s;">
                    <div class="media-overlay">
                        <button class="media-btn media-edit" onclick="mediaManager.editMedia(${media.id})" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                        </button>
                        <button class="media-btn media-delete" onclick="mediaManager.deleteMedia(${media.id})" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                        <button class="media-btn media-copy" onclick="mediaManager.copyUrl('${media.file_url}')" title="Copy URL">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="media-info">
                    <div class="media-title">${media.title}</div>
                    <div class="media-meta">${this.formatFileSize(media.file_size)} • ${media.mime_type}</div>
                </div>
            </div>
        `).join('');
    }

    async editMedia(mediaId) {
        try {
            const { data: media, error } = await this.supabase
                .from('cms_media')
                .select('*')
                .eq('id', mediaId)
                .single();

            if (error) throw error;

            const newTitle = prompt('Edit title:', media.title);
            if (newTitle === null) return;

            const newAlt = prompt('Edit alt text:', media.alt_text);
            if (newAlt === null) return;

            const { error: updateError } = await this.supabase
                .from('cms_media')
                .update({
                    title: newTitle,
                    alt_text: newAlt
                })
                .eq('id', mediaId);

            if (updateError) throw updateError;

            this.showNotification('Media updated successfully!', 'success');
            this.loadMedia();

        } catch (error) {
            console.error('Error editing media:', error);
            this.showNotification('Error editing media: ' + error.message, 'error');
        }
    }

    async deleteMedia(mediaId) {
        if (!confirm('Are you sure you want to delete this media item?')) return;

        try {
            // Get media info first
            const { data: media, error: fetchError } = await this.supabase
                .from('cms_media')
                .select('*')
                .eq('id', mediaId)
                .single();

            if (fetchError) throw fetchError;

            // Delete from storage
            const { error: storageError } = await this.supabase.storage
                .from('coa-files')
                .remove([media.file_path]);

            if (storageError) console.warn('Storage delete error:', storageError);

            // Delete from database
            const { error: dbError } = await this.supabase
                .from('cms_media')
                .delete()
                .eq('id', mediaId);

            if (dbError) throw dbError;

            this.showNotification('Media deleted successfully!', 'success');
            this.loadMedia();

        } catch (error) {
            console.error('Error deleting media:', error);
            this.showNotification('Error deleting media: ' + error.message, 'error');
        }
    }

    copyUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            this.showNotification('URL copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy URL', 'error');
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type) {
        // Use existing notification system if available
        if (window.cmsManager && window.cmsManager.showNotification) {
            window.cmsManager.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize media manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mediaManager = new MediaManager();
});
