/**
 * Authentication functionality for IoT Security System
 * Handles user authentication, registration, and password management
 */

// Global variables for authentication
let currentUser = null;
let currentEmail = null;
let currentAuthPage = 'loginPage';
let codeExpiryInterval = null;
let codeExpiryTime = 0;
let activationExpiryInterval = null;
let activationExpiryTime = 0;
let resetExpiryInterval = null;
let resetExpiryTime = 0;
let currentLanguage = 'en'; // Default language is English

// DOM Elements - Auth Pages
const authPages = document.getElementById('authPages');
const mainPages = document.getElementById('mainPages');
const loginPage = document.getElementById('loginPage');
const verifyCodePage = document.getElementById('verifyCodePage');
const registerPage = document.getElementById('registerPage');
const emailVerificationPage = document.getElementById('emailVerificationPage');
const forgotPasswordPage = document.getElementById('forgotPasswordPage');
const resetCodePage = document.getElementById('resetCodePage');
const resetPasswordPage = document.getElementById('resetPasswordPage');

// DOM Elements - Forms
const loginForm = document.getElementById('loginForm');
const verifyCodeForm = document.getElementById('verifyCodeForm');
const registerForm = document.getElementById('registerForm');
const emailVerificationForm = document.getElementById('emailVerificationForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const resetCodeForm = document.getElementById('resetCodeForm');
const resetPasswordForm = document.getElementById('resetPasswordForm');

// DOM Elements - Navigation
const mainNav = document.getElementById('mainNav');
const loggedOutMenu = document.getElementById('loggedOutMenu');
const loggedInMenu = document.getElementById('loggedInMenu');
const userDisplayName = document.getElementById('userDisplayName');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const goToRegisterLink = document.getElementById('goToRegisterLink');
const goToLoginLink = document.getElementById('goToLoginLink');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const backToLoginLink = document.getElementById('backToLoginLink');
const resendCodeLink = document.getElementById('resendCodeLink');
const resendActivationLink = document.getElementById('resendActivationLink');

// DOM Elements - Other
const codeExpiryTimer = document.getElementById('codeExpiryTimer');
const activationExpiryTimer = document.getElementById('activationExpiryTimer');
const resetExpiryTimer = document.getElementById('resetExpiryTimer');
const toggleLoginPassword = document.getElementById('toggleLoginPassword');
const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
const toggleNewPassword = document.getElementById('toggleNewPassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const darkModeToggle = document.getElementById('darkModeToggle');
const languageToggle = document.getElementById('languageToggle');
const currentLang = document.getElementById('currentLang');

/**
 * Initialize authentication functionality
 */
function initAuth() {
  // Check if user is already logged in
  checkAuthStatus();
  
  // Add event listeners for forms
  loginForm.addEventListener('submit', handleLogin);
  verifyCodeForm.addEventListener('submit', handleVerifyCode);
  registerForm.addEventListener('submit', handleRegister);
  emailVerificationForm.addEventListener('submit', handleEmailVerification);
  forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  resetCodeForm.addEventListener('submit', handleResetCode);
  resetPasswordForm.addEventListener('submit', handleResetPassword);
  
  // Add event listeners for navigation
  loginBtn.addEventListener('click', () => showAuthPage('loginPage'));
  registerBtn.addEventListener('click', () => showAuthPage('registerPage'));
  logoutBtn.addEventListener('click', handleLogout);
  goToRegisterLink.addEventListener('click', () => showAuthPage('registerPage'));
  goToLoginLink.addEventListener('click', () => showAuthPage('loginPage'));
  forgotPasswordLink.addEventListener('click', () => showAuthPage('forgotPasswordPage'));
  backToLoginLink.addEventListener('click', () => showAuthPage('loginPage'));
  resendCodeLink.addEventListener('click', handleResendCode);
  resendActivationLink.addEventListener('click', handleResendActivation);
  
  // Add event listeners for password toggles
  toggleLoginPassword.addEventListener('click', () => togglePasswordVisibility('loginPassword', toggleLoginPassword));
  toggleRegisterPassword.addEventListener('click', () => togglePasswordVisibility('registerPassword', toggleRegisterPassword));
  toggleNewPassword.addEventListener('click', () => togglePasswordVisibility('newPassword', toggleNewPassword));
  toggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility('confirmNewPassword', toggleConfirmPassword));
  
  // Add event listeners for dark mode and language toggle
  darkModeToggle.addEventListener('click', toggleDarkMode);
  languageToggle.addEventListener('click', toggleLanguage);
  
  // Initialize dark mode from localStorage
  initDarkMode();
  
  // Initialize language from localStorage
  initLanguage();
}

/**
 * Initialize dark mode from localStorage
 */
function initDarkMode() {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeToggle.querySelector('i').classList.remove('fa-moon');
    darkModeToggle.querySelector('i').classList.add('fa-sun');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    darkModeToggle.querySelector('i').classList.remove('fa-sun');
    darkModeToggle.querySelector('i').classList.add('fa-moon');
  }
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'light');
    darkModeToggle.querySelector('i').classList.remove('fa-sun');
    darkModeToggle.querySelector('i').classList.add('fa-moon');
    localStorage.setItem('darkMode', 'false');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeToggle.querySelector('i').classList.remove('fa-moon');
    darkModeToggle.querySelector('i').classList.add('fa-sun');
    localStorage.setItem('darkMode', 'true');
  }
}

/**
 * Initialize language from localStorage
 */
function initLanguage() {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    currentLanguage = savedLanguage;
  }
  
  // Update UI for the current language
  updateLanguageUI();
}

/**
 * Toggle language between English and Arabic
 */
function toggleLanguage() {
  currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
  localStorage.setItem('language', currentLanguage);
  
  // Update UI for the new language
  updateLanguageUI();
}

/**
 * Update UI for the current language
 */
function updateLanguageUI() {
  // Update HTML direction and language attributes
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  
  // Update language toggle button text
  currentLang.textContent = currentLanguage.toUpperCase();
  
  // Show elements for current language and hide elements for other language
  const elements = document.querySelectorAll('[data-lang]');
  elements.forEach(element => {
    if (element.getAttribute('data-lang') === currentLanguage) {
      element.style.display = '';
    } else {
      element.style.display = 'none';
    }
  });
}

/**
 * Check if user is already logged in
 */
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  
  if (token && userData) {
    try {
      currentUser = JSON.parse(userData);
      showLoggedInState();
    } catch (error) {
      console.error('Error parsing user data:', error);
      clearAuthData();
      showLoggedOutState();
    }
  } else {
    showLoggedOutState();
  }
}

/**
 * Show logged in state
 */
function showLoggedInState() {
  authPages.style.display = 'none';
  mainPages.style.display = 'block';
  mainNav.style.display = 'block';
  loggedOutMenu.style.display = 'none';
  loggedInMenu.style.display = 'block';
  
  if (currentUser && currentUser.displayName) {
    userDisplayName.textContent = currentUser.displayName;
  }
}

/**
 * Show logged out state
 */
function showLoggedOutState() {
  authPages.style.display = 'block';
  mainPages.style.display = 'none';
  mainNav.style.display = 'none';
  loggedOutMenu.style.display = 'block';
  loggedInMenu.style.display = 'none';
  
  showAuthPage('loginPage');
}

/**
 * Clear authentication data
 */
function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  currentUser = null;
  currentEmail = null;
}

/**
 * Show authentication page
 * @param {string} pageId - ID of the page to show
 */
function showAuthPage(pageId) {
  // Hide all auth pages
  const pages = document.querySelectorAll('.auth-page');
  pages.forEach(page => page.classList.remove('active'));
  
  // Show selected page
  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.classList.add('active');
    currentAuthPage = pageId;
  }
  
  // Clear any existing timers
  clearAllTimers();
}

/**
 * Clear all expiry timers
 */
function clearAllTimers() {
  if (codeExpiryInterval) {
    clearInterval(codeExpiryInterval);
    codeExpiryInterval = null;
  }
  
  if (activationExpiryInterval) {
    clearInterval(activationExpiryInterval);
    activationExpiryInterval = null;
  }
  
  if (resetExpiryInterval) {
    clearInterval(resetExpiryInterval);
    resetExpiryInterval = null;
  }
}

/**
 * Toggle password visibility
 * @param {string} inputId - ID of the password input
 * @param {HTMLElement} toggleBtn - Toggle button element
 */
function togglePasswordVisibility(inputId, toggleBtn) {
  const passwordInput = document.getElementById(inputId);
  const icon = toggleBtn.querySelector('i');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

/**
 * Start code expiry timer
 * @param {number} expiresIn - Expiry time in seconds
 */
function startCodeExpiryTimer(expiresIn) {
  if (codeExpiryInterval) {
    clearInterval(codeExpiryInterval);
  }
  
  codeExpiryTime = expiresIn;
  updateExpiryTimer(codeExpiryTimer, codeExpiryTime);
  
  codeExpiryInterval = setInterval(() => {
    codeExpiryTime--;
    
    if (codeExpiryTime <= 0) {
      clearInterval(codeExpiryInterval);
      codeExpiryInterval = null;
      updateExpiryTimerExpired(codeExpiryTimer);
    } else {
      updateExpiryTimer(codeExpiryTimer, codeExpiryTime);
    }
  }, 1000);
}

/**
 * Start activation expiry timer
 * @param {number} expiresIn - Expiry time in seconds
 */
function startActivationExpiryTimer(expiresIn) {
  if (activationExpiryInterval) {
    clearInterval(activationExpiryInterval);
  }
  
  activationExpiryTime = expiresIn;
  updateExpiryTimer(activationExpiryTimer, activationExpiryTime);
  
  activationExpiryInterval = setInterval(() => {
    activationExpiryTime--;
    
    if (activationExpiryTime <= 0) {
      clearInterval(activationExpiryInterval);
      activationExpiryInterval = null;
      updateExpiryTimerExpired(activationExpiryTimer);
    } else {
      updateExpiryTimer(activationExpiryTimer, activationExpiryTime);
    }
  }, 1000);
}

/**
 * Start reset expiry timer
 * @param {number} expiresIn - Expiry time in seconds
 */
function startResetExpiryTimer(expiresIn) {
  if (resetExpiryInterval) {
    clearInterval(resetExpiryInterval);
  }
  
  resetExpiryTime = expiresIn;
  updateExpiryTimer(resetExpiryTimer, resetExpiryTime);
  
  resetExpiryInterval = setInterval(() => {
    resetExpiryTime--;
    
    if (resetExpiryTime <= 0) {
      clearInterval(resetExpiryInterval);
      resetExpiryInterval = null;
      updateExpiryTimerExpired(resetExpiryTimer);
    } else {
      updateExpiryTimer(resetExpiryTimer, resetExpiryTime);
    }
  }, 1000);
}

/**
 * Update expiry timer display
 * @param {HTMLElement} timerElement - Timer element to update
 * @param {number} time - Time in seconds
 */
function updateExpiryTimer(timerElement, time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  
  // Update all language versions of the timer
  const enTimer = timerElement.querySelector('[data-lang="en"]') || timerElement;
  const arTimer = timerElement.querySelector('[data-lang="ar"]') || timerElement;
  
  if (enTimer) {
    enTimer.textContent = `Expires in: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  if (arTimer) {
    arTimer.textContent = `ينتهي في: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Update expiry timer when expired
 * @param {HTMLElement} timerElement - Timer element to update
 */
function updateExpiryTimerExpired(timerElement) {
  // Update all language versions of the timer
  const enTimer = timerElement.querySelector('[data-lang="en"]') || timerElement;
  const arTimer = timerElement.querySelector('[data-lang="ar"]') || timerElement;
  
  if (enTimer) {
    enTimer.textContent = 'Code expired';
  }
  
  if (arTimer) {
    arTimer.textContent = 'انتهت صلاحية الرمز';
  }
}

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showToast(currentLanguage === 'en' ? 'Please enter email and password' : 'يرجى إدخال البريد الإلكتروني وكلمة المرور', 'error');
    return;
  }

  try {
    showLoading(true);

    const response = await api.login(email, password);

    currentEmail = email;

    if (response.expiresIn) {
      showAuthPage('verifyCodePage');
      startCodeExpiryTimer(response.expiresIn);
      showToast(response.message || (currentLanguage === 'en' ? 'Verification code sent to your email' : 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'), 'success');
      return;
    }

    if (response.token) {
      localStorage.setItem('token', response.token);

      const userData = {
        displayName: response.displayName,
        email: response.email
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      currentUser = userData;

      showLoggedInState();
      showToast(response.message || (currentLanguage === 'en' ? 'Login successful' : 'تم تسجيل الدخول بنجاح'), 'success');
    }

  } catch (error) {
    const serverResponse = error.responseData || {};

    if (
      error.message.includes("login code has already been sent") ||
      error.message.includes("A login code has already been sent")
    ) {
      currentEmail = email;
      showAuthPage('verifyCodePage');
    
      const seconds = serverResponse.expiresIn || 180;
    
      // Start the timer if not already running
      if (!codeExpiryInterval) {
        startCodeExpiryTimer(seconds);
      }
    
      showToast(currentLanguage === 'en' ? 'A verification code has already been sent, please enter it.' : 'رمز تحقق تم إرساله مسبقًا، يرجى إدخاله.', 'info');
      return;
    }
    
    showToast(error.message || (currentLanguage === 'en' ? 'Login failed. Please check your credentials and try again.' : 'فشل تسجيل الدخول. يرجى التحقق من بياناتك والمحاولة مرة أخرى.'), 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Handle verification code form submission
 * @param {Event} event - Form submit event
 */
async function handleVerifyCode(event) {
  event.preventDefault();
  
  const code = document.getElementById('verificationCode').value;
  
  if (!code) {
    showToast(currentLanguage === 'en' ? 'Please enter verification code' : 'يرجى إدخال رمز التحقق', 'error');
    return;
  }
  
  if (!currentEmail) {
    showToast(currentLanguage === 'en' ? 'An error occurred. Please login again.' : 'حدث خطأ. يرجى تسجيل الدخول مرة أخرى.', 'error');
    showAuthPage('loginPage');
    return;
  }
  
  try {
    showLoading(true);
    
    const response = await api.verifyLoginCode(currentEmail, code);
    
    if (response.token) {
      // Save authentication data
      localStorage.setItem('token', response.token);
      
      const userData = {
        displayName: response.displayName,
        email: response.email
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      currentUser = userData;
      
      // Clear verification code
      document.getElementById('verificationCode').value = '';
      
      // Show logged in state
      showLoggedInState();
      
      showToast(response.message || (currentLanguage === 'en' ? 'Login successful' : 'تم تسجيل الدخول بنجاح'), 'success');
    }
  } catch (error) {
    showToast(error.message || (currentLanguage === 'en' ? 'Verification failed. Please try again.' : 'فشل التحقق من الرمز. يرجى المحاولة مرة أخرى.'), 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Handle register form submission
 * @param {Event} event - Form submit event
 */
async function handleRegister(event) {
  event.preventDefault();
  
  const displayName = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const phoneNumber = document.getElementById('registerPhone').value;
  const password = document.getElementById('registerPassword').value;
  const deviceId = document.getElementById('deviceId').value;
  const deviceAccessToken = document.getElementById('deviceAccessToken').value;
  
  if (!displayName || !email || !phoneNumber || !password || !deviceId || !deviceAccessToken) {
    showToast(currentLanguage === 'en' ? 'Please fill in all required fields' : 'يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }
  
  try {
    showLoading(true);
    
    const userData = {
      displayName,
      email,
      phoneNumber,
      password,
      deviceId,
      deviceAccessToken
    };
    
    const response = await api.register(userData);
    
    currentEmail = email;
    
    if (response.expiresIn) {
      showAuthPage('emailVerificationPage');
      startActivationExpiryTimer(response.expiresIn);
      showToast(response.message || (currentLanguage === 'en' ? 'Registration successful. Please verify your email.' : 'تم التسجيل بنجاح. يرجى تفعيل بريدك الإلكتروني.'), 'success');
    }
  } catch (error) {
    showToast(error.message || (currentLanguage === 'en' ? 'Registration failed. Please try again.' : 'فشل التسجيل. يرجى المحاولة مرة أخرى.'), 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Handle email verification form submission
 * @param {Event} event - Form submit event
 */
async function handleEmailVerification(event) {
  event.preventDefault();
  
  const activationCode = document.getElementById('activationCode').value;
  
  if (!activationCode) {
    showToast(currentLanguage === 'en' ? 'Please enter activation code' : 'يرجى إدخال رمز التفعيل', 'error');
    return;
  }
  
  if (!currentEmail) {
    showToast(currentLanguage === 'en' ? 'An error occurred. Please register again.' : 'حدث خطأ. يرجى التسجيل مرة أخرى.', 'error');
    showAuthPage('registerPage');
    return;
  }
  
  try {
    showLoading(true);
    
    const response = await api.verifyEmail(currentEmail, activationCode);
    
    // Clear activation code
    document.getElementById('activationCode').value = '';
    
    showAuthPage('loginPage');
    showToast(response.message || (currentLanguage === 'en' ? 'Email verified successfully. You can now login.' : 'تم تفعيل بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.'), 'success');
  } catch (error) {
    showToast(error.message || (currentLanguage === 'en' ? 'Email verification failed. Please try again.' : 'فشل تفعيل البريد الإلكتروني. يرجى المحاولة مرة أخرى.'), 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Handle forgot password form submission
 * @param {Event} event - Form submit event
 */
async function handleForgotPassword(event) {
  event.preventDefault();
  
  const email = document.getElementById('forgotEmail').value;
  
  if (!email) {
    showToast(currentLanguage === 'en' ? 'Please enter email' : 'يرجى إدخال البريد الإلكتروني', 'error');
    return;
  }
  
  try {
    showLoading(true);
    
    const response = await api.forgotPassword(email);
    
    currentEmail = email;
    
    showAuthPage('resetCodePage');
    startResetExpiryTimer(response.expiresIn || 300); // Default to 5 minutes if not provided
    showToast(response.message || (currentLanguage === 'en' ? 'Reset code sent to your email' : 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'), 'success');
  } catch (error) {
    showToast(error.message || (currentLanguage === 'en' ? 'Failed to send reset code. Please try again.' : 'فشل إرسال رمز إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.'), 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Handle reset code form submission
 * @param {Event} event - Form submit event
 */
async function handleResetCode(event) {
  event.preventDefault();
  
  const resetCode = document.getElementById('resetCode').value;
  
  if (!resetCode) {
    showToast(currentLanguage === 'en' ? 'Please enter reset code' : 'يرجى إدخال رمز إعادة تعيين كلمة المرور', 'error');
    return;
  }
  
  if (!currentEmail) {
    showToast(currentLanguage === 'en' ? 'An error occurred. Please request password reset again.' : 'حدث خطأ. يرجى طلب إعادة تعيين كلمة المرور مرة أخرى.', 'error');
    showAuthPage('forgotPasswordPage');
    return;
  }
  
  try {
    showLoading(true);
    
    const response = await api.verifyResetCode(currentEmail, resetCode);
    
    // Clear reset code
    document.getElementById('resetCode').value = '';
    
    showAuthPage('resetPasswordPage');
    showToast(response.message || (currentLanguage === 'en' ? 'Code verified successfully. Please enter a new password.' : 'تم التحقق من الرمز بنجاح. يرجى إدخال كلمة مرور جديدة.'), 'success');
  } catch (error) {
    showToast(error.message || (currentLanguage === 'en' ? 'Code verification failed. Please try again.' : 'فشل التحقق من الرمز. يرجى المحاولة مرة أخرى.'), 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Handle reset password form submission
 * @param {Event} event - Form submit event
 */
async function handleResetPassword(event) {
  event.preventDefault();
  
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
  
  if (!newPassword || !confirmNewPassword) {
    showToast(currentLanguage === 'en' ? 'Please enter and confirm new password' : 'يرجى إدخال كلمة المرور الجديدة وتأكيدها', 'error');
    return;
  }
  
  if (newPassword !== confirmNewPassword) {
    showToast(currentLanguage === 'en' ? 'Passwords do not match' : 'كلمات المرور غير متطابقة', 'error');
    return;
  }
  
  if (!currentEmail) {
    showToast(currentLanguage === 'en' ? 'An error occurred. Please request password reset again.' : 'حدث خطأ. يرجى طلب إعادة تعيين كلمة المرور مرة أخرى.', 'error');
    showAuthPage('forgotPasswordPage');
    return;
  }
  
  try {
    showLoading(true);
    
    const response = await api.resetPassword(currentEmail, newPassword);
    
    // Clear password fields
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    
    showAuthPage('loginPage');
    showToast(response.message || (currentLanguage === 'en' ? 'Password reset successful. You can now login.' : 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.'), 'success');
  } catch (error) {
    showToast(error.message || (currentLanguage === 'en' ? 'Password reset failed. Please try again.' : 'فشل إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.'), 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Handle resend verification code
 */
async function handleResendCode() {
  if (!currentEmail) {
    showToast(currentLanguage === 'en' ? 'An error occurred. Please login again.' : 'حدث خطأ. يرجى تسجيل الدخول مرة أخرى.', 'error');
    showAuthPage('loginPage');
    return;
  }
  
  try {
    showLoading(true);
    
    // Re-login to get a new code
    const password = document.getElementById('loginPassword').value;
    if (!password) {
      showToast(currentLanguage === 'en' ? 'Please login again to get a new code' : 'يرجى تسجيل الدخول مرة أخرى للحصول على رمز جديد', 'error');
      showAuthPage('loginPage');
      return;
    }
    
    const response = await api.login(currentEmail, password);
    
    if (response.expiresIn) {
      startCodeExpiryTimer(response.expiresIn);
      showToast(response.message || (currentLanguage === 'en' ? 'Verification code resent to your email' : 'تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني'), 'success');
    }
  } catch (error) {
    showToast(error.message || (currentLanguage === 'en' ? 'Failed to resend code. Please try again.' : 'فشل إعادة إرسال الرمز. يرجى المحاولة مرة أخرى.'), 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Handle resend activation code
 */
async function handleResendActivation() {
  if (!currentEmail) {
    showToast(currentLanguage === 'en' ? 'An error occurred. Please register again.' : 'حدث خطأ. يرجى التسجيل مرة أخرى.', 'error');
    showAuthPage('registerPage');
    return;
  }
  
  try {
    showLoading(true);
    
    const response = await api.resendActivation(currentEmail);
    
    if (response.expiresIn) {
      startActivationExpiryTimer(response.expiresIn);
    }
    
    showToast(response.message || (currentLanguage === 'en' ? 'Activation code resent to your email' : 'تم إعادة إرسال رمز التفعيل إلى بريدك الإلكتروني'), 'success');
  } catch (error) {
    showToast(error.message || (currentLanguage === 'en' ? 'Failed to resend activation code. Please try again.' : 'فشل إعادة إرسال رمز التفعيل. يرجى المحاولة مرة أخرى.'), 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  clearAuthData();
  showLoggedOutState();
  showToast(currentLanguage === 'en' ? 'Logged out successfully' : 'تم تسجيل الخروج بنجاح', 'success');
}
