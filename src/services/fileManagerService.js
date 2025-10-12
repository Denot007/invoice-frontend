import api from './api';

const fileManagerService = {
  // Folder operations
  getRootFolders: () => {
    console.log('Calling getRootFolders');
    return api.get('/filemanager/folders/root/');
  },

  getFolderContents: (folderId) => {
    console.log('Calling getFolderContents for folder:', folderId);
    return api.get(`/filemanager/folders/${folderId}/contents/`);
  },

  createFolder: (data) => {
    console.log('Calling createFolder with data:', data);
    return api.post('/filemanager/folders/', data);
  },

  updateFolder: (id, data) => api.put(`/filemanager/folders/${id}/`, data),

  deleteFolder: (id) => api.delete(`/filemanager/folders/${id}/`),

  deleteFolderRecursive: (id) => api.delete(`/filemanager/folders/${id}/delete_recursive/`),

  // File operations
  getFilesByFolder: (folderId = null) => {
    const params = folderId ? { folder: folderId } : {};
    console.log('Calling getFilesByFolder with params:', params);
    return api.get('/filemanager/files/by_folder/', { params });
  },

  uploadFile: (file, folderId = null, originalName = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folder', folderId);
    // Always send original_name - use file.name if not provided
    formData.append('original_name', originalName || file.name);

    return api.post('/filemanager/files/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadMultipleFiles: (files, folderId = null) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (folderId) formData.append('folder', folderId);

    return api.post('/filemanager/files/upload_multiple/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  downloadFile: async (id) => {
    try {
      // Get the download URL from backend
      const response = await api.get(`/filemanager/files/${id}/download/`);

      // Backend returns { url, filename } for S3 files
      if (response.data.url) {
        // Simply open the public S3 URL in a new tab
        // The browser will either display it or download it depending on the file type
        window.open(response.data.url, '_blank');
        return { success: true };
      } else {
        // For local files, the response is already the blob
        return response;
      }
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },

  deleteFile: (id) => api.delete(`/filemanager/files/${id}/`),

  updateFile: (id, data) => api.put(`/filemanager/files/${id}/`, data),

  // Utility functions
  downloadFileFromBlob: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileIcon: (filename) => {
    const ext = filename.toLowerCase().split('.').pop();

    const icons = {
      // Images
      jpg: 'fas fa-image text-green-500',
      jpeg: 'fas fa-image text-green-500',
      png: 'fas fa-image text-green-500',
      gif: 'fas fa-image text-green-500',
      bmp: 'fas fa-image text-green-500',
      webp: 'fas fa-image text-green-500',
      svg: 'fas fa-image text-green-500',

      // Documents
      pdf: 'fas fa-file-pdf text-red-500',
      doc: 'fas fa-file-word text-blue-600',
      docx: 'fas fa-file-word text-blue-600',
      txt: 'fas fa-file-alt text-gray-500',
      rtf: 'fas fa-file-alt text-gray-500',

      // Spreadsheets
      xls: 'fas fa-file-excel text-green-600',
      xlsx: 'fas fa-file-excel text-green-600',
      csv: 'fas fa-file-csv text-green-600',

      // Archives
      zip: 'fas fa-file-archive text-yellow-500',
      rar: 'fas fa-file-archive text-yellow-500',
      '7z': 'fas fa-file-archive text-yellow-500',
      tar: 'fas fa-file-archive text-yellow-500',
      gz: 'fas fa-file-archive text-yellow-500',

      // Videos
      mp4: 'fas fa-file-video text-purple-500',
      avi: 'fas fa-file-video text-purple-500',
      mov: 'fas fa-file-video text-purple-500',
      mkv: 'fas fa-file-video text-purple-500',

      // Audio
      mp3: 'fas fa-file-audio text-blue-500',
      wav: 'fas fa-file-audio text-blue-500',
      flac: 'fas fa-file-audio text-blue-500',

      // Code
      js: 'fas fa-file-code text-yellow-600',
      html: 'fas fa-file-code text-orange-500',
      css: 'fas fa-file-code text-blue-500',
      py: 'fas fa-file-code text-green-500',
      java: 'fas fa-file-code text-red-500',
      cpp: 'fas fa-file-code text-blue-600',
      c: 'fas fa-file-code text-blue-600',
    };

    return icons[ext] || 'fas fa-file text-gray-500';
  }
};

export default fileManagerService;