import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhotoIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/urls';

const Profile = () => {
  const { user, updateUser: _updateUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company_name: '',
    company_address: '',
    company_email: '',
    company_website: '',
    phone_number: '',
    company_logo: null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        company_name: user.profile?.company_name || '',
        company_address: user.profile?.company_address || '',
        company_email: user.profile?.company_email || '',
        company_website: user.profile?.company_website || '',
        phone_number: user.profile?.phone_number || '',
        company_logo: null,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file size cannot exceed 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        company_logo: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add user fields
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('email', formData.email);
      
      // Add company profile fields
      formDataToSend.append('company_name', formData.company_name);
      formDataToSend.append('company_address', formData.company_address);
      formDataToSend.append('company_email', formData.company_email);
      formDataToSend.append('company_website', formData.company_website);
      formDataToSend.append('phone_number', formData.phone_number);
      
      // Add logo if selected
      if (formData.company_logo) {
        formDataToSend.append('company_logo', formData.company_logo);
      }

      // Update profile via API
     
      const response = await fetch(`${API_BASE_URL}/accounts/company/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        
        toast.success('Profile updated successfully!');
        setEditing(false);
        setLogoPreview(null);
        
        // Refresh user data from server to get updated logo URL
        if (refreshUser) {
          await refreshUser();
        }
        
        // Reset form data to updated values
        setFormData({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          company_name: updatedProfile.company_name || '',
          company_address: updatedProfile.company_address || '',
          company_email: updatedProfile.company_email || '',
          company_website: updatedProfile.company_website || '',
          phone_number: updatedProfile.phone_number || '',
          company_logo: null, // Reset file input
        });
      } else {
        const errorData = await response.json();
        toast.error('Error updating profile: ' + (errorData.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setLogoPreview(null);
    // Reset form data
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        company_name: user.profile?.company_name || '',
        company_address: user.profile?.company_address || '',
        company_email: user.profile?.company_email || '',
        company_website: user.profile?.company_website || '',
        phone_number: user.profile?.phone_number || '',
        company_logo: null,
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account and company information
          </p>
        </motion.div>
        
        {!editing && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditing(true)}
            className="btn-primary flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Profile
          </motion.button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture / Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Company Logo
              </h3>
              
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center mb-4 overflow-hidden">
                  {logoPreview || user.profile?.company_logo ? (
                    <img
                      src={logoPreview || user.profile.company_logo}
                      alt="Company Logo"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                
                {editing && (
                  <div>
                    <input
                      type="file"
                      id="company_logo"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="company_logo"
                      className="btn-secondary cursor-pointer flex items-center"
                    >
                      <PhotoIcon className="w-4 h-4 mr-2" />
                      {logoPreview || user.profile?.company_logo ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Form Fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="card p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-primary-500" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800"
                      placeholder="Your first name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800"
                      placeholder="Your last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input pl-10 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 mr-2 text-primary-500" />
                  Company Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name
                    </label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        disabled={!editing}
                        className="input pl-10 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800"
                        placeholder="Your Company Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Address
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <textarea
                        name="company_address"
                        rows="3"
                        value={formData.company_address}
                        onChange={handleChange}
                        disabled={!editing}
                        className="input pl-10 resize-none disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800"
                        placeholder="123 Business Street, City, State 12345"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Business Email
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          name="company_email"
                          value={formData.company_email}
                          onChange={handleChange}
                          disabled={!editing}
                          className="input pl-10 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800"
                          placeholder="contact@company.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          disabled={!editing}
                          className="input pl-10 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Website
                    </label>
                    <div className="relative">
                      <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        name="company_website"
                        value={formData.company_website}
                        onChange={handleChange}
                        disabled={!editing}
                        className="input pl-10 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800"
                        placeholder="https://www.company.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-end space-x-4 mt-6"
          >
            <motion.button
              type="button"
              onClick={handleCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary flex items-center"
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Cancel
            </motion.button>
            
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </form>
    </div>
  );
};

export default Profile;