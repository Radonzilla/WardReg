// auth.js - Firebase Authentication Module
// Make sure Firebase Auth SDK is loaded before this script

// Initialize Firebase Auth
const auth = firebase.auth();

// Authentication state
let currentUser = null;
let authInitialized = false;

// Initialize authentication on page load
function initializeAuth() {
    console.log('Initializing authentication...');
    
    // Listen for authentication state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            console.log('User logged in:', user.email);
            showApp();
            updateUserInfo(user);
            
            // Load all data after authentication is confirmed
            loadAllInitialData();
            
        } else {
            // User is signed out
            currentUser = null;
            console.log('User logged out');
            showLoginForm();
        }
        
        authInitialized = true;
    });
    
    // Setup login form
    setupLoginForm();
    
    // Setup logout button
    setupLogoutButton();
}

// Load all initial data after authentication
function loadAllInitialData() {
    console.log('Loading initial data...');
    
    // Load dashboard data
    if (typeof loadDashboardData === 'function') {
        loadDashboardData();
    }
    
    // Pre-load families data (it will be cached)
    if (typeof loadFamilies === 'function') {
        loadFamilies();
    }
    
    // Pre-load members data (it will be cached)
    if (typeof loadMembers === 'function') {
        loadMembers();
    }
    
    // Pre-load requests data (it will be cached)
    if (typeof loadRequests === 'function') {
        loadRequests();
    }
    
    console.log('Initial data loading complete');
}

// Show the main app
function showApp() {
    document.getElementById('authContainer').classList.remove('active');
    document.querySelector('.app-container').classList.remove('auth-required');
}

// Show login form
function showLoginForm() {
    document.getElementById('authContainer').classList.add('active');
    document.querySelector('.app-container').classList.add('auth-required');
}

// Update user info in sidebar
function updateUserInfo(user) {
    const userEmail = document.getElementById('userEmail');
    if (userEmail) {
        userEmail.textContent = user.email;
    }
}

// Setup login form submission
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = document.getElementById('loginSubmit');
        const errorDiv = document.getElementById('authError');
        
        // Disable submit button and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="auth-loading"></span> Logging in...';
        errorDiv.classList.remove('active');
        
        try {
            // Sign in with email and password
            await auth.signInWithEmailAndPassword(email, password);
            
            // Success - onAuthStateChanged will handle showing the app
            console.log('Login successful');
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Show error message
            let errorMessage = 'Login failed. Please try again.';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            errorDiv.textContent = errorMessage;
            errorDiv.classList.add('active');
            
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });
}

// Setup logout button
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;
    
    logoutBtn.addEventListener('click', async () => {
        try {
            await auth.signOut();
            console.log('Logout successful');
            
            // Clear any cached data
            if (typeof clearAppData === 'function') {
                clearAppData();
            }
            
            // Reset app state
            familiesData = [];
            membersData = [];
            requestsData = [];
            
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error logging out. Please try again.');
        }
    });
}

// Password reset function (optional)
async function sendPasswordResetEmail(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true, message: 'Password reset email sent!' };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, message: error.message };
    }
}

// Export functions for use in other scripts
window.authModule = {
    currentUser: () => currentUser,
    isAuthenticated: () => currentUser !== null,
    isInitialized: () => authInitialized,
    sendPasswordReset: sendPasswordResetEmail,
    reloadAllData: loadAllInitialData
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}
