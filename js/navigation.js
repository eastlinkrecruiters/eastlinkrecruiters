// Navigation Module - Hamburger, theme, signout
export function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const sidebar = document.querySelector('.sidebar');
  const title = document.querySelector('.logo-title h1'); // Clickable title
  const signoutBtn = document.querySelector('.signout-btn');
  const installBtn = document.getElementById('install-app'); // PWA

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  if (title) {
    title.addEventListener('click', () => {
      const user = FirebaseApp.auth.currentUser;
      if (user) {
        const role = localStorage.getItem('role'); // From signin
        window.location.href = `/dashboard-${role}.html`;
      } else {
        window.location.href = '/';
      }
    });
  }

  if (signoutBtn) {
    signoutBtn.addEventListener('click', () => {
      FirebaseApp.auth.signOut().then(() => {
        localStorage.clear();
        window.location.href = '/signin.html';
      });
    });
  }

  // Premium theme update
  export function updateTheme(theme) {
    document.body.className = theme === 'gold' ? 'premium-theme' : '';
    if (theme === 'gold') document.documentElement.style.setProperty('--primary-blue', '#FFC107');
  }

  // PWA install if exists
  if (installBtn) {
    // Handled in pwa.js, but show button
    window.addEventListener('beforeinstallprompt', (e) => installBtn.style.display = 'block');
  }

  // Hide nav on index (check path)
  if (window.location.pathname === '/') {
    document.querySelector('nav').style.display = 'none';
    const appBtn = document.createElement('button');
    appBtn.innerHTML = 'Download App';
    appBtn.className = 'button';
    appBtn.onclick = () => window.open('https://www.mediafire.com/file/968pt3i5pvm6ma6/Top+Autocare-1.apk/file', '_blank');
    document.querySelector('header').appendChild(appBtn); // Right side
  }
}

// Auto-collapse on link click
document.addEventListener('click', (e) => {
  if (e.target.closest('.nav-link')) {
    document.querySelector('.sidebar').classList.remove('open');
  }
});
