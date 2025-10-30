import axios from 'axios';

// Blog API configuration
const BLOG_API_URL = process.env.REACT_APP_BLOG_API_URL || 'http://localhost:3001/api/blog';
const BLOG_API_KEY = process.env.REACT_APP_BLOG_API_KEY || '5a2fb4327b6d1f5210e850cbecd42bb70cf3bbdcc45a670f019e251e82dd13f7';

// Create axios instance for blog API
const blogApi = axios.create({
  baseURL: BLOG_API_URL,
  timeout: 10000,
  headers: {
    'X-API-Key': BLOG_API_KEY
  }
});

/**
 * Get all blog posts for invoicegear platform
 * @param {Object} params - Query parameters (page, limit, etc.)
 * @returns {Promise} Promise containing blog posts
 */
export const getBlogPosts = async (params = {}) => {
  try {
    const response = await blogApi.get('/posts', {
      params: {
        platform: 'invoicegear',
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
};

/**
 * Get a single blog post by slug
 * @param {string} slug - Post slug
 * @returns {Promise} Promise containing blog post
 */
export const getBlogPost = async (slug) => {
  try {
    const response = await blogApi.get('/posts', {
      params: {
        slug
      }
    });
    return response.data.post;
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    throw error;
  }
};

/**
 * Get blog posts by category
 * @param {string} category - Category name
 * @param {Object} params - Additional query parameters
 * @returns {Promise} Promise containing blog posts
 */
export const getBlogPostsByCategory = async (category, params = {}) => {
  try {
    const response = await blogApi.get('/posts', {
      params: {
        platform: 'invoicegear',
        category,
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for category ${category}:`, error);
    throw error;
  }
};

/**
 * Get blog posts by tag
 * @param {string} tag - Tag name
 * @param {Object} params - Additional query parameters
 * @returns {Promise} Promise containing blog posts
 */
export const getBlogPostsByTag = async (tag, params = {}) => {
  try {
    const response = await blogApi.get('/posts', {
      params: {
        platform: 'invoicegear',
        tags: tag,
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for tag ${tag}:`, error);
    throw error;
  }
};

export default {
  getBlogPosts,
  getBlogPost,
  getBlogPostsByCategory,
  getBlogPostsByTag
};
