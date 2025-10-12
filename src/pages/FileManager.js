import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FolderIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  HomeIcon,
  ChevronRightIcon,
  FolderPlusIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { FolderIcon as FolderSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import fileManagerService from '../services/fileManagerService';
import StorageStats from '../components/storage/StorageStats';

const FileManager = () => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [thumbnailErrors, setThumbnailErrors] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  useEffect(() => {
    loadFolderContents();
  }, [currentFolder]);

  // File thumbnail component with fallback
  const FileThumbnail = ({ file, size = 'text-5xl' }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const fileExtension = file.original_name.toLowerCase().split('.').pop();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension);
    const isPDF = fileExtension === 'pdf';

    // For images, try to load actual thumbnail, fallback to icon
    if (isImage && !imageError && !thumbnailErrors.has(file.id)) {
      return (
        <div className="w-full h-full flex items-center justify-center relative">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={`/api/filemanager/files/${file.id}/thumbnail/`}
            alt={file.original_name}
            className={`max-w-full max-h-full object-contain rounded ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setThumbnailErrors(prev => new Set([...prev, file.id]));
              setImageLoading(false);
            }}
          />
        </div>
      );
    }

    // Default icon fallback
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <i className={`${fileManagerService.getFileIcon(file.original_name)} ${size} opacity-70 mb-2`}></i>
        {isPDF && (
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center px-2">
            PDF Document
          </div>
        )}
        {!isPDF && !isImage && (
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center px-2 capitalize">
            {fileExtension} File
          </div>
        )}
      </div>
    );
  };

  const loadFolderContents = async () => {
    try {
      setLoading(true);

      if (currentFolder) {
        const response = await fileManagerService.getFolderContents(currentFolder.id);
        setFolders(response.data.subfolders || []);
        setFiles(response.data.files || []);
        setBreadcrumbs(response.data.breadcrumbs || []);
      } else {
        // Load root folders
        const [foldersResponse, filesResponse] = await Promise.all([
          fileManagerService.getRootFolders(),
          fileManagerService.getFilesByFolder(null)
        ]);
        setFolders(foldersResponse.data);
        setFiles(filesResponse.data);
        setBreadcrumbs([]);
      }
    } catch (error) {
      console.error('Error loading folder contents:', error);
      console.error('Error details:', error.response?.data);
      toast.error(`Failed to load folder contents: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
    setSelectedItems([]);
  };

  const handleBreadcrumbClick = (folder) => {
    setCurrentFolder(folder);
    setSelectedItems([]);
  };

  const handleGoHome = () => {
    setCurrentFolder(null);
    setSelectedItems([]);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      const data = {
        name: newFolderName.trim(),
        parent: currentFolder?.id || null
      };

      console.log('Creating folder with data:', data);
      const response = await fileManagerService.createFolder(data);
      console.log('Folder creation response:', response);

      toast.success('Folder created successfully');
      setNewFolderName('');
      setShowCreateFolderModal(false);
      loadFolderContents();
    } catch (error) {
      console.error('Error creating folder:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.name?.[0] || error.response?.data?.detail || 'Failed to create folder');
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      setUploadLoading(true);

      if (files.length === 1) {
        await fileManagerService.uploadFile(files[0], currentFolder?.id);
        toast.success('File uploaded successfully');
      } else {
        const response = await fileManagerService.uploadMultipleFiles(files, currentFolder?.id);
        toast.success(`${response.data.total_uploaded} files uploaded successfully`);
        if (response.data.total_errors > 0) {
          toast.error(`${response.data.total_errors} files failed to upload`);
        }
      }

      loadFolderContents();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploadLoading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      // Download file - service will open S3 URL in new tab
      await fileManagerService.downloadFile(file.id);
      toast.success('Opening file in new tab');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDeleteFile = (file) => {
    setFileToDelete(file);
    setShowDeleteModal(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      await fileManagerService.deleteFile(fileToDelete.id);
      toast.success('File deleted successfully');
      setShowDeleteModal(false);
      setFileToDelete(null);
      loadFolderContents();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleDeleteItems = async () => {
    if (selectedItems.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      return;
    }

    try {
      const deletePromises = selectedItems.map(item => {
        if (item.type === 'folder') {
          return fileManagerService.deleteFolderRecursive(item.id);
        } else {
          return fileManagerService.deleteFile(item.id);
        }
      });

      await Promise.all(deletePromises);
      toast.success(`${selectedItems.length} items deleted successfully`);
      setSelectedItems([]);
      loadFolderContents();
    } catch (error) {
      console.error('Error deleting items:', error);
      toast.error('Failed to delete some items');
    }
  };

  const handleItemSelect = (item, type) => {
    const itemWithType = { ...item, type };
    const isSelected = selectedItems.some(selected =>
      selected.id === item.id && selected.type === type
    );

    if (isSelected) {
      setSelectedItems(selectedItems.filter(selected =>
        !(selected.id === item.id && selected.type === type)
      ));
    } else {
      setSelectedItems([...selectedItems, itemWithType]);
    }
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles = files.filter(file =>
    file.original_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isItemSelected = (item, type) => {
    return selectedItems.some(selected =>
      selected.id === item.id && selected.type === type
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            File Manager
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Organize and manage your files and folders
          </p>
        </div>

        {/* Storage Statistics */}
        <div className="mb-8">
          <StorageStats />
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left side - Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateFolderModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FolderPlusIcon className="h-4 w-4 mr-1" />
                New Folder
              </motion.button>

              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 cursor-pointer"
              >
                <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                {uploadLoading ? 'Uploading...' : 'Upload Files'}
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploadLoading}
                  className="sr-only"
                />
              </motion.label>

              {selectedItems.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteItems}
                  className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete ({selectedItems.length})
                </motion.button>
              )}
            </div>

            {/* Right side - View Toggle & Search */}
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              {(filteredFiles.length > 0 || filteredFolders.length > 0) && (
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-l-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    title="Grid View"
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-r-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    title="List View"
                  >
                    <ListBulletIcon className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search files and folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 mb-6 text-sm">
          <button
            onClick={handleGoHome}
            className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <HomeIcon className="h-4 w-4 mr-1" />
            Home
          </button>

          {breadcrumbs.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => handleBreadcrumbClick(folder)}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {searchTerm ? 'No results found' : 'This folder is empty'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Upload files or create folders to get started'
                }
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* Folders */}
              {filteredFolders.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Folders ({filteredFolders.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredFolders.map((folder) => (
                      <motion.div
                        key={folder.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative group cursor-pointer p-3 rounded-lg border-2 transition-colors ${
                          isItemSelected(folder, 'folder')
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        onClick={(e) => {
                          if (e.ctrlKey || e.metaKey) {
                            handleItemSelect(folder, 'folder');
                          } else {
                            handleFolderClick(folder);
                          }
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <FolderSolidIcon className="h-12 w-12 text-primary-500 mb-2" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white text-center truncate w-full">
                            {folder.name}
                          </p>
                        </div>

                        {/* Selection checkbox */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <input
                            type="checkbox"
                            checked={isItemSelected(folder, 'folder')}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleItemSelect(folder, 'folder');
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {filteredFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Files ({filteredFiles.length})
                  </h3>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filteredFiles.map((file) => (
                        <motion.div
                          key={file.id}
                          whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative group cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br ${
                            isItemSelected(file, 'file')
                              ? 'from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 ring-2 ring-primary-500'
                              : 'from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-800'
                          } shadow-md transition-all duration-200`}
                          onClick={(e) => {
                            if (e.ctrlKey || e.metaKey) {
                              handleItemSelect(file, 'file');
                            }
                          }}
                        >
                          {/* File Preview Area */}
                          <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center relative">
                            <FileThumbnail file={file} />

                            {/* File Type Badge */}
                            <span className="absolute top-2 left-2 px-2 py-1 bg-black/20 backdrop-blur text-white text-xs font-semibold rounded-md">
                              {file.original_name.split('.').pop().toUpperCase()}
                            </span>

                            {/* Action Buttons */}
                            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadFile(file);
                                }}
                                className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur text-gray-700 dark:text-gray-300 hover:bg-primary-500 hover:text-white rounded-lg transition-colors"
                                title="Download"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFile(file);
                                }}
                                className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                title="Delete"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Selection Checkbox */}
                            <div className="absolute bottom-2 right-2">
                              <input
                                type="checkbox"
                                checked={isItemSelected(file, 'file')}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleItemSelect(file, 'file');
                                }}
                                className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded shadow-sm"
                              />
                            </div>
                          </div>

                          {/* File Info */}
                          <div className="p-4">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-2" title={file.original_name}>
                              {file.original_name}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h10m-7 5h4" />
                                </svg>
                                {file.file_size_display}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(file.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: new Date(file.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                })}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    // List View
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="w-12 px-4 py-3"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modified</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredFiles.map((file) => (
                            <tr
                              key={file.id}
                              className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                isItemSelected(file, 'file') ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                              }`}
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={isItemSelected(file, 'file')}
                                  onChange={() => handleItemSelect(file, 'file')}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 mr-3 flex-shrink-0">
                                    <FileThumbnail file={file} size="text-lg" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs" title={file.original_name}>
                                    {file.original_name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {file.file_size_display}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(file.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleDownloadFile(file)}
                                    className="text-gray-400 hover:text-primary-600 transition-colors"
                                    title="Download"
                                  >
                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFile(file)}
                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Create New Folder
              </h3>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateFolderModal(false);
                    setNewFolderName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && fileToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center mb-2">
                Delete File?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                Are you sure you want to delete "{fileToDelete.original_name}"? This action cannot be undone and the file will be permanently removed from storage.
              </p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setFileToDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteFile}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FileManager;