/**
 * Telemetry functionality for IoT Security System
 * Handles sending and displaying telemetry data
 */

// DOM Elements - Telemetry
const telemetryForm = document.getElementById('telemetryForm');
const temperatureInput = document.getElementById('temperature');
const humidityInput = document.getElementById('humidity');
const currentTemperature = document.getElementById('currentTemperature');
const currentHumidity = document.getElementById('currentHumidity');

// DOM Elements - Navigation
const dashboardLink = document.getElementById('dashboardLink');
const telemetryLink = document.getElementById('telemetryLink');
const dashboardPage = document.getElementById('dashboardPage');
const telemetryPage = document.getElementById('telemetryPage');

/**
 * Initialize telemetry functionality
 */
function initTelemetry() {
  // Add event listeners
  telemetryForm.addEventListener('submit', handleSendTelemetry);
  
  // Add event listeners for navigation
  const dashboardLinks = document.querySelectorAll('#dashboardLink');
  dashboardLinks.forEach(link => {
    link.addEventListener('click', () => showPage('dashboardPage'));
  });
  
  const telemetryLinks = document.querySelectorAll('#telemetryLink');
  telemetryLinks.forEach(link => {
    link.addEventListener('click', () => showPage('telemetryPage'));
  });
  
  // Set default values for telemetry inputs
  setDefaultTelemetryValues();
}

/**
 * Set default values for telemetry inputs
 */
function setDefaultTelemetryValues() {
  // Generate random values for temperature and humidity
  const defaultTemp = (Math.random() * 10 + 20).toFixed(1);
  const defaultHumidity = (Math.random() * 20 + 40).toFixed(1);
  
  temperatureInput.value = defaultTemp;
  humidityInput.value = defaultHumidity;
}

/**
 * Show main page
 * @param {string} pageId - ID of the page to show
 */
function showPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  
  // Show selected page
  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.classList.add('active');
  }
}

/**
 * Handle send telemetry form submission
 * @param {Event} event - Form submit event
 */
async function handleSendTelemetry(event) {
  event.preventDefault();
  
  const temperature = parseFloat(temperatureInput.value);
  const humidity = parseFloat(humidityInput.value);
  
  if (isNaN(temperature) || isNaN(humidity)) {
    const currentLanguage = localStorage.getItem('language') || 'en';
    const errorMessage = currentLanguage === 'en' 
      ? 'Please enter valid values for temperature and humidity' 
      : 'يرجى إدخال قيم صحيحة لدرجة الحرارة والرطوبة';
    
    showToast(errorMessage, 'error');
    return;
  }
  
  try {
    showLoading(true);
    
    const response = await api.sendTelemetry(temperature, humidity);
    
    // Update current values
    updateCurrentValues(temperature, humidity);
    
    // Generate new default values
    setDefaultTelemetryValues();
    
    const currentLanguage = localStorage.getItem('language') || 'en';
    const successMessage = response.message || (currentLanguage === 'en' 
      ? 'Telemetry data sent successfully' 
      : 'تم إرسال بيانات القياس بنجاح');
    
    showToast(successMessage, 'success');
    
    // Switch to dashboard page to show the updated values
    showPage('dashboardPage');
  } catch (error) {
    const currentLanguage = localStorage.getItem('language') || 'en';
    const errorMessage = error.message || (currentLanguage === 'en' 
      ? 'Failed to send telemetry data. Please try again.' 
      : 'فشل إرسال بيانات القياس. يرجى المحاولة مرة أخرى.');
    
    showToast(errorMessage, 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Update current telemetry values
 * @param {number} temperature - Temperature value
 * @param {number} humidity - Humidity value
 */
function updateCurrentValues(temperature, humidity) {
  currentTemperature.textContent = temperature;
  currentHumidity.textContent = humidity;
}
