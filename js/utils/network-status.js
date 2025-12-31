// Network Status - Offline detection, integrate with PWA/offline-handler
export function checkNetworkStatus() {
  const isOnline = navigator.onLine;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const type = connection ? connection.effectiveType : 'unknown'; // 4g, 3g, etc.
  const downlink = connection ? connection.downlink : 0; // Mbps
  return { isOnline, type, downlink };
}

export function onNetworkChange(callback) {
  window.addEventListener('online', () => {
    const status = checkNetworkStatus();
    callback(status);
    // Trigger sync
    import('../pwa.js').then(({ syncQueue }) => syncQueue());
    import('../offline-handler.js').then(({ retryFailedQueue }) => retryFailedQueue());
  });

  window.addEventListener('offline', () => {
    const status = checkNetworkStatus();
    callback(status);
    showNetworkToast('Offline - Queuing actions.');
  });
}

// Monitor quality (throttle for slow networks)
export function monitorConnection(callback) {
  let lastType = '';
  const interval = setInterval(() => {
    const status = checkNetworkStatus();
    if (status.type !== lastType) {
      callback(status);
      lastType = status.type;
      if (status.downlink < 0.5) { // Slow - warn
        showNetworkToast('Slow connection detected.');
      }
    }
  }, 5000); // Check every 5s

  // Cleanup
  window.addEventListener('beforeunload', () => clearInterval(interval));
}

function showNetworkToast(msg) {
  // Use toastify or pwa.js toast
  const toastify = window.Toastify || (() => console.log(msg));
  toastify({ text: msg, duration: 3000, gravity: 'top', position: 'right' }).showToast();
}

// Expose
window.checkNetwork = checkNetworkStatus;

// Default export
export { checkNetworkStatus, onNetworkChange, monitorConnection, showNetworkToast };
export default { checkNetworkStatus, onNetworkChange };
