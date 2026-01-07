// Toast Helper - Wrapper for Toastify.js (loaded in vendor)
// Usage: showToast('Message', 'success'); in auth.js, dashboard.js, etc.

let Toastify; // Lazy load

export async function showToast(message, type = 'info', duration = 3000, position = 'top-right') {
  try {
    // Import if not loaded (dynamic for modules)
    if (!Toastify) {
      Toastify = (await import('../vendor/toastify.min.js')).default;
    }

    let backgroundColor, icon;
    switch (type) {
      case 'success':
        backgroundColor = '#28A745';
        icon = '/assets/icons/check.svg';
        // Play sound
        new Audio('/assets/sounds/success-chime.mp3').play().catch(() => {}); // Silent fail if no audio
        break;
      case 'error':
        backgroundColor = '#DC3545';
        icon = '/assets/icons/error.svg';
        break;
      case 'warning':
        backgroundColor = '#FFC107';
        icon = '/assets/icons/warning.svg'; // Assume icon exists
        break;
      case 'info':
      default:
        backgroundColor = '#007BFF';
        icon = '/assets/icons/info.svg';
        break;
    }

    const toast = Toastify({
      text: message,
      duration,
      gravity: 'top', // top/bottom
      position, // left/right/center
      backgroundColor,
      className: `toast-${type}`,
      stopOnFocus: true,
      callback: () => {
        // Optional: Dismiss action, e.g., mark notif read
        if (type === 'success' && message.includes('Notification')) {
          // Call api if needed
        }
      }
    });

    // Add icon via style or custom
    toast.element.innerHTML = `<img src="${icon}" style="width:16px;height:16px;margin-right:8px; vertical-align:middle;"> ${message}`;
    toast.showToast();

    return toast;
  } catch (error) {
    // Fallback native toast if Toastify fails (e.g., offline)
    console.warn('Toastify unavailable, using native:', error);
    const nativeToast = document.createElement('div');
    nativeToast.textContent = message;
    nativeToast.style.cssText = `
      position: fixed; ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'} top: 20px; 
      background: ${backgroundColor}; color: white; padding: 12px 16px; border-radius: 4px; z-index: 10000;
      animation: slideDown 0.3s ease-out;
    `;
    document.body.appendChild(nativeToast);
    setTimeout(() => nativeToast.remove(), duration);
  }
}

// Global expose (for onclick in partials)
window.showToast = showToast;

// Default export
export default { showToast };
