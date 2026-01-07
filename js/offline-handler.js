// Offline Handler - Enhanced queue with retry
import { openQueueDB } from './pwa.js'; // Reuse from pwa

export function setupOffline() {
  // Already in pwa.js; enhance with retry
  window.addEventListener('online', retryFailedQueue);
}

async function retryFailedQueue() {
  const db = await openQueueDB();
  const tx = db.transaction('queue', 'readwrite');
  const store = tx.objectStore('queue');
  const pending = await store.getAll();

  // Retry up to 3 times (add retryCount to data on queue)
  for (const item of pending) {
    if (item.retryCount >= 3) {
      await store.delete(item.id);
      // Notify failure
      postMessageToSW({ type: 'QUEUE_FAILED', item });
      continue;
    }

    try {
      const success = await fetch('/api/' + item.type, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      if (success.ok) {
        await store.delete(item.id);
        postMessageToSW({ type: 'SYNC_SUCCESS', item });
      } else {
        item.retryCount = (item.retryCount || 0) + 1;
        await store.put(item);
      }
    } catch (err) {
      item.retryCount = (item.retryCount || 0) + 1;
      await store.put(item);
    }
  }
  db.close();
}

function postMessageToSW(msg) {
  navigator.serviceWorker.controller?.postMessage(msg);
}

// Expose for pwa.js
window.retryQueue = retryFailedQueue;
