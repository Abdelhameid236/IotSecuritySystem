/**
 * Main application functionality for IoT Security System
 * Initializes and coordinates all components
 */

// DOM Elements - UI Components
const loadingOverlay = document.getElementById('loadingOverlay');
const toastContainer = document.getElementById('toastContainer');

/**
 * Initialize application
 */
function initApp() {
  // Initialize authentication functionality
  initAuth();
  
  // Initialize telemetry functionality
  initTelemetry();
}

/**
 * Show loading overlay
 * @param {boolean} show - Whether to show or hide the overlay
 */
function showLoading(show) {
  if (show) {
    loadingOverlay.classList.add('active');
  } else {
    loadingOverlay.classList.remove('active');
  }
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, info)
 */
function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Create toast icon
  const icon = document.createElement('div');
  icon.className = 'toast-icon';
  
  // Set icon based on type
  let iconClass = 'fa-info-circle';
  if (type === 'success') {
    iconClass = 'fa-check-circle';
  } else if (type === 'error') {
    iconClass = 'fa-exclamation-circle';
  }
  
  icon.innerHTML = `<i class="fas ${iconClass}"></i>`;
  
  // Create toast message
  const messageElement = document.createElement('div');
  messageElement.className = 'toast-message';
  messageElement.textContent = message;
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.className = 'toast-close';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  });
  
  // Assemble toast
  toast.appendChild(icon);
  toast.appendChild(messageElement);
  toast.appendChild(closeButton);
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Auto-hide toast after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
