// i18n Toggle - Simple client-side from config/i18n.json
import i18nData from '../../config/i18n.json' assert { type: 'json' };

let currentLang = 'en'; // Default

export function toggleLang(lang) {
  currentLang = lang === 'en' || lang === 'sw' ? lang : 'en';
  updateDOMText();
  localStorage.setItem('lang', currentLang); // Persist via localstorage-manager
  // Animate toggle (e.g., lang button rotate)
  const toggleBtn = document.getElementById('lang-toggle');
  if (toggleBtn) gsap.to(toggleBtn, { duration: 0.3, rotation: 360 });
}

function updateDOMText() {
  // Replace translatable elements (data-i18n="key")
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const text = i18nData[currentLang][key] || i18nData['en'][key] || el.textContent;
    el.textContent = text;
  });
}

// Load on init
export function initI18n() {
  const savedLang = localStorage.getItem('lang') || 'en';
  toggleLang(savedLang);
  // Lang switcher HTML (assume in header partial)
  const switcher = document.getElementById('lang-switcher');
  if (switcher) {
    switcher.innerHTML = `
      <button onclick="toggleLang('en')">EN</button>
      <button onclick="toggleLang('sw')">SW</button>
    `;
  }
}

// Export toggleLang globally
window.toggleLang = toggleLang;

// Default export
export { toggleLang, initI18n };
export default { toggleLang, initI18n };
