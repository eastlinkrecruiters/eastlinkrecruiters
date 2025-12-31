// Global Error Handler - Logs, toasts, modals
import { apiCall } from './api.js';
import { showToast } from './pwa.js'; // Reuse toast

// Uncaught errors
window.addEventListener('error', async (event) => {
  const errorData = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack || 'Unknown',
    timestamp: new Date(),
    uid: FirebaseApp.auth.currentUser?.uid
  };
  try {
    await apiCall('logError', errorData); // Save to Firestore logs
  } catch (logErr) {
    console.error('Failed to log error', logErr);
  }
  showToast('An error occurred. Please try again.', 'error');
  event.preventDefault(); // Prevent default if needed
  return false;
});

// Promise rejections
window.addEventListener('unhandledrejection', async (event) => {
  const errorData = {
    reason: event.reason,
    timestamp: new Date(),
    uid: FirebaseApp.auth.currentUser?.uid
  };
  await apiCall('logError', errorData);
  showToast('Operation failed. Check connection.', 'warning');
  event.preventDefault();
  return false;
});

// Network errors
window.addEventListener('offline', () => {
  const modal = document.createElement('div');
  modal.className = 'offline-modal';
  modal.innerHTML = `
    <div class="card">
      <h3>Offline Mode</h3>
      <p>Actions are queued. Syncing will happen automatically.</p>
    </div>
  `;
  modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000; background: white; padding: 2rem; border-radius: 8px;';
  document.body.appendChild(modal);
  setTimeout(() => modal.remove(), 5000);
});

// Custom error wrapper for API calls (use in api.js but global)
window.handleApiError = (err, context) => {
  console.error(`Error in ${context}:`, err);
  const userFriendly = err.code === 'auth/user-not-found' ? 'User not found. Please sign up.' : 'Something went wrong. Retry.';
  showToast(userFriendly, 'error');
  if (err.code.startsWith('network')) window.queueAction('retry_api', { context, err }); // Offline queue
};

// Init: Set global
if (typeof console !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    originalError.apply(console, args);
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Firebase')) {
      window.handleApiError({ code: 'firebase_error', message: args[0] }, 'Firebase');
    }
  };
}
