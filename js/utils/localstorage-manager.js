// LocalStorage Manager - Persist theme, role, notifs, etc. Securely
const STORAGE_KEY = 'eastlink_data_v1';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Get all data or specific key
export function getItem(key, fallback = null) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return data[key] !== undefined ? data[key] : fallback;
  } catch (err) {
    console.warn('LocalStorage read error:', err);
    return fallback;
  }
}

// Set item (merge, check size)
export function setItem(key, value) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    data[key] = value;
    const str = JSON.stringify(data);
    if (str.length * 2 > MAX_SIZE) { // Rough byte estimate
      console.warn('LocalStorage full - oldest key removed');
      const keys = Object.keys(data);
      delete data[keys[0]]; // Simple LRU approx
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('LocalStorage write error:', err);
    return false;
  }
}

// Remove item
export function removeItem(key) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete data[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage remove error:', err);
  }
}

// Clear all (e.g., on signout)
export function clearAll() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('pendingUid'); // Auth specific
}

// Specific helpers
export function storeTheme(theme) {
  setItem('theme', theme);
  document.body.className = theme === 'dark' ? 'dark' : '';
}

export function getTheme() {
  return getItem('theme', 'light');
}

export function storeRole(role) {
  setItem('role', role);
}

export function getRole() {
  return getItem('role');
}

export function storeNotifications(notifs) {
  setItem('notifs', notifs); // Cache for offline
}

export function getNotifications() {
  return getItem('notifs', []);
}

// Secure (e.g., for temp tokens)
export function storeTemp(key, value) {
  const tempData = getItem('temp', {});
  tempData[key] = value;
  setItem('temp', tempData);
  setTimeout(() => removeItem('temp'), 3600000); // 1hr expiry
}

// Export default
export default { getItem, setItem, removeItem, clearAll, storeTheme, getTheme, storeRole, getRole, storeNotifications, getNotifications, storeTemp };
