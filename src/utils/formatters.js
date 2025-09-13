// Currency formatter
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  
  const numAmount = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

// Number formatter
export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  const num = parseFloat(number);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// Percentage formatter
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  const num = parseFloat(value);
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100);
};

// Date formatter
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat('en-US', formatOptions).format(dateObj);
};

// Date and time formatter
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
};

// Relative time formatter (e.g., "2 hours ago", "yesterday")
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return '';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Duration formatter (for time tracking)
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0h 0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  
  return `${hours}h ${mins}m`;
};

// Phone number formatter
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phoneNumber;
};

// Tax ID formatter
export const formatTaxId = (taxId) => {
  if (!taxId) return '';
  
  const cleaned = taxId.replace(/\D/g, '');
  
  // Format as EIN: XX-XXXXXXX
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
  }
  
  return taxId;
};

// Invoice/Estimate number formatter
export const formatInvoiceNumber = (prefix, number) => {
  if (!number) return '';
  
  const paddedNumber = String(number).padStart(4, '0');
  return prefix ? `${prefix}-${paddedNumber}` : paddedNumber;
};

// Address formatter
export const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [
    address.street_address,
    address.city,
    address.state && address.postal_code ? `${address.state} ${address.postal_code}` : address.state || address.postal_code,
    address.country && address.country !== 'US' ? address.country : null
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Status badge formatter
export const getStatusColor = (status) => {
  const colors = {
    // Invoice/Estimate statuses
    'draft': 'gray',
    'sent': 'blue',
    'viewed': 'yellow',
    'approved': 'green',
    'paid': 'green',
    'overdue': 'red',
    'cancelled': 'red',
    'rejected': 'red',
    
    // General statuses
    'active': 'green',
    'inactive': 'gray',
    'pending': 'yellow',
    'completed': 'green',
    'failed': 'red',
    'processing': 'blue',
    
    // Time tracking
    'running': 'green',
    'paused': 'yellow',
    'stopped': 'gray',
  };
  
  return colors[status?.toLowerCase()] || 'gray';
};

// Compact number formatter (e.g., 1.2K, 1.5M)
export const formatCompactNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  const num = parseFloat(number);
  
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
  
  return (num / 1000000000).toFixed(1) + 'B';
};

// Default export with all formatters
export default {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatFileSize,
  formatDuration,
  formatPhoneNumber,
  formatTaxId,
  formatInvoiceNumber,
  formatAddress,
  getStatusColor,
  formatCompactNumber,
};