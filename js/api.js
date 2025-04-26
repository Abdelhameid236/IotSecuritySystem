/**
 * API Service for IoT Security System
 * Handles communication with backend API endpoints
 */

// Base API URL
const API_BASE_URL = 'https://iotsecuritysystem.runasp.net/api';

// API endpoints
const ENDPOINTS = {
  // Account controller endpoints
  auth: {
    login: '/Account/login',
    verifyLoginCode: '/Account/verifyLoginCode',
    register: '/Account/register',
    verifyEmail: '/Account/verifyEmail',
    resendActivation: '/Account/resendActivation',
    forgotPassword: '/Account/forgotPasswordByEmail',
    verifyResetCode: '/Account/verifyResetCode',
    resetPassword: '/Account/resetPassword'
  },
  // Telemetry controller endpoints
  telemetry: {
    send: '/Telemetry/send'
  }
};

/**
 * Helper function to make API requests
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {Object} data - Request data
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise} - Promise with response data
 */
async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = false) {
  try {
    const url = API_BASE_URL + endpoint;

    const headers = {
      'Content-Type': 'application/json'
    };

    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('غير مصرح لك بالوصول. يرجى تسجيل الدخول.');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      credentials: 'include'
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    let responseData;
    const contentType = response.headers.get("content-type");

    // ✅ نحاول نقرأ JSON إذا كان النوع يدعم، غير كده نقرأ نص فقط
    try {
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        responseData = { message: text };
      }
    } catch (parseError) {
      const text = await response.text();
      responseData = { message: text };
    }

    if (!response.ok) {
      const error = new Error(responseData.message || 'حدث خطأ في الطلب');
      error.responseData = responseData;
      throw error;
    }

    return responseData;

  } catch (error) {
    console.error(`API request error (${endpoint}):`, error);
    throw error;
  }
}


/**
 * Get generic error message based on current language
 * @returns {string} - Error message
 */
function getGenericErrorMessage() {
  const currentLanguage = localStorage.getItem('language') || 'en';
  return currentLanguage === 'en' 
    ? 'An error occurred with the request' 
    : 'حدث خطأ في الطلب';
}

// Authentication API functions
const api = {
  // Login with email and password
  login: async (email, password) => {
    return apiRequest(ENDPOINTS.auth.login, 'POST', { email, password });
  },
  
  // Verify login code
  verifyLoginCode: async (email, code) => {
    return apiRequest(ENDPOINTS.auth.verifyLoginCode, 'POST', { email, code });
  },
  
  // Register new user
  register: async (userData) => {
    return apiRequest(ENDPOINTS.auth.register, 'POST', userData);
  },
  
  // Verify email with activation code
  verifyEmail: async (email, activationCode) => {
    return apiRequest(ENDPOINTS.auth.verifyEmail, 'POST', { email, activationCode });
  },
  
  // Resend activation code
  resendActivation: async (email) => {
    return apiRequest(ENDPOINTS.auth.resendActivation, 'POST', { email });
  },
  
  // Request password reset
  forgotPassword: async (email) => {
    return apiRequest(ENDPOINTS.auth.forgotPassword, 'POST', { email });
  },
  
  // Verify reset code
  verifyResetCode: async (email, resetCode) => {
    return apiRequest(ENDPOINTS.auth.verifyResetCode, 'POST', { email, resetCode });
  },
  
  // Reset password
  resetPassword: async (email, newPassword) => {
    return apiRequest(ENDPOINTS.auth.resetPassword, 'POST', { email, newPassword });
  },
  
  // Send telemetry data
  sendTelemetry: async (temperature, humidity) => {
    return apiRequest(ENDPOINTS.telemetry.send, 'POST', { temperature, humidity }, true);
  }
};
