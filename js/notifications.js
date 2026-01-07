// Notifications Module - Bell/FCM
import { getMessaging, onMessage, getToken } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging.js';
import { apiCall } from './api.js';
import { showToast } from './utils/toast-helper.js';

const { messaging } = FirebaseApp;
const bell = document.querySelector('.notification-bell');

export function initNotifications() {
  if (bell) {
    setupBell();
  }
  setupFCM();
  listenForMessages();
}

function setupBell() {
  // Load notifs from Firestore via api
  apiCall('getNotifications').then((notifs) => {
    const count = notifs.length;
    const badge = document.querySelector('.badge');
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = count > 0 ? 'flex' : 'none';
    // Dropdown
    bell.addEventListener('click', () => {
      const dropdown = document.querySelector('.notif-dropdown') || createDropdown(notifs);
      bell.appendChild(dropdown);
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      if (count > 0) apiCall('markRead', notifs.map(n => n.id)); // Reset count
      badge.style.display = 'none';
    });
  });

  // Delete single
  bell.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-notif')) {
      const id = e.target.dataset.id;
      apiCall('deleteNotification', id);
      e.target.closest('.notif-item').remove();
    }
  });
}

function createDropdown(notifs) {
  const div = document.createElement('div');
  div.className = 'notif-dropdown';
  div.innerHTML = notifs.map(n => `
    <div class="notif-item card">
      <p>${n.title}: ${n.body}</p>
      <span class="delete-notif" data-id="${n.id}">Delete</span>
    </div>
  `).join('');
  return div;
}

async function setupFCM() {
  try {
    const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
    if (token) {
      // Save to user doc
      const uid = FirebaseApp.auth.currentUser?.uid;
      if (uid) apiCall('updateFcmToken', { uid, token });
      // Subscribe topics
      // messaging.subscribeToTopic(token, '/topics/premium_jobs');
      // messaging.subscribeToTopic(token, '/topics/announcements');
    }
  } catch (err) {
    console.error('FCM token error', err);
  }
}

function listenForMessages() {
  onMessage(messaging, (payload) => {
    // Foreground push
    showToast(`${payload.notification.title}: ${payload.notification.body}`, 'info');
    // Update bell count via apiCall('addNotification', payload);
    // Reload bell
    if (bell) setupBell();
  });
}

// Export for announcements/matches etc.
export function sendCustomNotif(uid, templateKey, vars = {}) {
  const template = // Load from config/notif-templates.json via fetch
  apiCall('sendFCM', { to: uid, data: { ...template, body: template.body.replace('{jobTitle}', vars.jobTitle) } });
}
