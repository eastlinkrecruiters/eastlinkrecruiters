// pwa.js - PWA Core Logic for EastLink Recruiters
// Registers SW, install prompt, offline queue/sync, FCM push setup

// Check for SW support
if ('serviceWorker' in navigator && 'PushManager' in window) {
  let swRegistration;

  // Register SW
  function registerSW() {
    return navigator.serviceWorker.register('/sw.js', {scope: '/'})
      .then((registration) => {
        console.log('PWA: SW registered', registration.scope);
        swRegistration = registration;
        // Register for background sync
        if ('sync' in registration) {
          navigator.serviceWorker.ready.then(() => {
            // Enable sync for queue (tag from postMessage)
            registration.sync.register('sync-queue').catch((err) => console.error('PWA: Sync reg failed', err));
          });
        }
        return registration;
      })
      .catch((err) => console.error('PWA: SW reg failed', err));
  }

  // Initialize on load
  window.addEventListener('load', () => {
    registerSW();
    setupFCM();
    setupOffline();
    setupInstallPrompt();
  });

  // FCM Push Setup (integrate with Firebase)
  async function setupFCM() {
    // Assume firebase-messaging.js loaded in main.js or here
    // Import dynamically if needed: import('https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging.js')
    // For simplicity, assume initialized in firebase-init.js

    try {
      const { getMessaging, getToken } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging.js');
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Get from Firebase Console > Project Settings > Cloud Messaging
      });
      console.log('PWA: FCM Token', token);
      // Send token to server (Firestore) for targeting: e.g., firebase.firestore().collection('users').doc(userId).update({fcmToken: token});
      // Subscribe to topics: await messaging.subscribeToTopic(token, '/topics/announcements');
    } catch (err) {
      console.error('PWA: FCM setup failed', err);
    }
  }

  // Install Prompt
  function setupInstallPrompt() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Show install button (add to UI, e.g., in header)
      const installBtn = document.getElementById('install-app'); // Assume ID in HTML
      if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', () => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
              console.log('PWA: Installed');
            }
            deferredPrompt = null;
            installBtn.style.display = 'none';
          });
        });
      }
    });

    // Hide prompt on app install
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed');
      deferredPrompt = null;
    });
  }

  // Offline Management & Queue
  function setupOffline() {
    window.addEventListener('online', syncQueue);
    window.addEventListener('offline', () => {
      // Show toast (integrate with notifications.js)
      showToast('Offline mode - Actions queued for sync.', 'warning');
    });

    // Listen for SW messages (e.g., sync success)
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_SUCCESS') {
        showToast(`Synced: ${event.data.item}`, 'success');
      } else if (event.data.type === 'OFFLINE_ERROR') {
        showToast(event.data.msg, 'warning');
      }
    });
  }

  async function syncQueue() {
    // Trigger SW sync
    if (swRegistration && 'sync' in swRegistration) {
      await swRegistration.sync.register('sync-queue');
      console.log('PWA: Queue sync triggered');
    }
  }

  // Queue Offline Action (e.g., call from forms.js before submit)
  window.queueAction = function(type, data) {
    if (!navigator.onLine) {
      const db = openQueueDB();
      db.then((dbOpen) => {
        const tx = dbOpen.transaction('queue', 'readwrite');
        tx.objectStore('queue').add({type, data, timestamp: Date.now()});
        tx.oncomplete = () => dbOpen.close();
        showToast('Action queued offline.', 'info');
      });
      return false; // Don't submit
    }
    return true; // Online - submit normally
  };

  function openQueueDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('eastlink-queue', 1);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', {keyPath: 'id', autoIncrement: true});
        }
      };
    });
  }

  // Simple Toast (integrate with Toastify if loaded)
  function showToast(msg, type = 'info') {
    // Use native or library; placeholder
    const toast = document.createElement('div');
    toast.innerText = msg;
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: ${type === 'success' ? '#28A745' : type === 'warning' ? '#FFC107' : '#007BFF'}; 
      color: white; padding: 16px; border-radius: 4px; z-index: 10000; transform: translateX(400px); transition: transform 0.3s;
    `;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 100);
    setTimeout(() => { toast.remove(); }, 3000);
  }

} else {
  console.warn('PWA: Browser does not support SW/Push');
}
