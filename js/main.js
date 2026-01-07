// Main Entry - Loads all modules, inits everything
import './pwa.js'; // Register SW first
import './firebase-init.js'; // Init Firebase
import { initNavigation } from './navigation.js';
import { initAuth } from './auth.js';
import { initPayments } from './payments.js';
import { initNotifications } from './notifications.js';
import { initAnimations } from './animations.js';
import { initForms } from './forms.js';
import { initDashboard } from './dashboard.js';
import { apiCall } from './api.js'; // Wrapper
import { setupOffline } from './offline-handler.js';
import { formatDate } from './utils/date-formatter.js';
import { toggleLang } from './utils/i18n-toggle.js';
import { getUUID } from './utils/uuid-generator.js';
import { storeTheme } from './utils/localstorage-manager.js';

// Vendor inits (assume loaded)
AOS.init({ duration: 800, once: true }); // AOS for scroll

// Load partials dynamically for static pages
async function loadPartials() {
  // Header
  const headerRes = await fetch('/partials/header.html');
  if (headerRes.ok) {
    const headerHtml = await headerRes.text();
    document.body.insertAdjacentHTML('afterbegin', headerHtml);
  }
  // Footer
  const footerRes = await fetch('/partials/footer.html');
  if (footerRes.ok) {
    const footerHtml = await footerRes.text();
    document.body.insertAdjacentHTML('beforeend', footerHtml);
  }
  // Sidebar
  const sidebarRes = await fetch('/partials/sidebar-nav.html');
  if (sidebarRes.ok) {
    const sidebarHtml = await sidebarRes.text();
    document.querySelector('.sidebar') ? document.querySelector('.sidebar').innerHTML += sidebarHtml : null;
  }
}

// Init on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  await loadPartials();
  initNavigation(); // Nav after header
  initAuth(); // Check logged in, redirect if needed
  initAnimations(); // Page stagger
  initForms(); // Form toggles
  initPayments(); // If payment page
  initNotifications(); // Bell setup
  initDashboard(); // If dashboard
  setupOffline(); // Queue
  toggleLang('en'); // Default lang
  const userRole = await apiCall('getRole'); // Check premium for theme
  if (userRole === 'premium') initNavigation.updateTheme('gold');
  storeTheme('light'); // Default
  gsap.from('.card', { duration: 0.8, y: 50, opacity: 0, stagger: 0.2 }); // Example GSAP
});

// Error global
window.addEventListener('error', (e) => {
  // Log to Firestore via api.js
  apiCall('logError', { msg: e.message, stack: e.error?.stack });
  console.error('Global error:', e);
});

// Export for partials (e.g., button clicks)
window.EastLink = { formatDate, getUUID, queueAction: window.queueAction };
