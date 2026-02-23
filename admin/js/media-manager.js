// Media Manager for CMS - Uses ApiClient instead of Supabase

class MediaManager {
    constructor() {
        this.uploadModal = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadMedia();
    }

    setupEventListeners() {
        const uploadBtn = document.getElementById('uploadMediaBtn');
        if (uploadBtn) uploadBtn.addEventListener('click', () => this.showUploadModal());
    }

    showUploadModal() {
        if (!this.uploadModal) this.createUploadModal();
        this.uploadModal.style.display = 'block';
    }

    hideUploadModal() {
        if (this.uploadModal) this.uploadModal.style.display = 'none';
    }

    createUploadModal() {
        this.uploadModal = document.createElement('div');
        this.uploadModal.className = 'media-modal';
        this.uploadModal.innerHTML = `
            <div class="media-modal-content">
                <div class="media-modal-header">
                    <h3>Upload Media</h3>
                    <button class="media-modal-close" onclick="mediaManager.hideUploadModal()">&times;</button>
                </div>
                <div class="media-modal-body">
                    <form id="mediaUploadForm">
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

        this.uploadModal.querySelector('#mediaUploadForm').addEventListener('submit', (e) => this.handleUpload(e));
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

        try {
            const file = fileInput.files[0];
            const result = await window.ApiClient.uploadMedia(file, titleInput.value, altInput.value);

            this.showNotification('Media uploaded successfully!', 'success');
            this.hideUploadModal();
            this.loadMedia();

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
            const result = await window.ApiClient.getMedia();
            this.displayMedia(result.data || []);
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
                        <button class="media-btn media-edit" onclick="mediaManager.editMedia('${media.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        </button>
                        <button class="media-btn media-delete" onclick="mediaManager.deleteMedia('${media.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                        <button class="media-btn media-copy" onclick="mediaManager.copyUrl('${media.file_url}')" title="Copy URL">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                        </button>
                    </div>
                </div>
                <div class="media-info">
                    <div class="media-title">${media.title}</div>
                    <div class="media-meta">${this.formatFileSize(media.file_size)} - ${media.mime_type}</div>
                </div>
            </div>
        `).join('');
    }

    async editMedia(mediaId) {
        try {
            const result = await window.ApiClient.adminGet('cms_media', mediaId);
            const media = result.data;
            const newTitle = prompt('Edit title:', media.title);
            if (newTitle === null) return;
            const newAlt = prompt('Edit alt text:', media.alt_text);
            if (newAlt === null) return;

            await window.ApiClient.adminUpdate('cms_media', mediaId, { title: newTitle, alt_text: newAlt });
            this.showNotification('Media updated successfully!', 'success');
            this.loadMedia();
        } catch (error) {
            this.showNotification('Error editing media: ' + error.message, 'error');
        }
    }

    async deleteMedia(mediaId) {
        if (!confirm('Are you sure you want to delete this media item?')) return;
        try {
            await window.ApiClient.adminDelete('cms_media', mediaId);
            this.showNotification('Media deleted successfully!', 'success');
            this.loadMedia();
        } catch (error) {
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
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type) {
        if (window.cmsManager && window.cmsManager.showNotification) {
            window.cmsManager.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.mediaManager = new MediaManager();
});
