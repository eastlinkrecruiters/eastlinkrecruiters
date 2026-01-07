// assets/js/main.js

// 1. Set Copyright Year
document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById("year");
    if(yearSpan) yearSpan.textContent = new Date().getFullYear();
    
    const dateDisplay = document.getElementById('date-display');
    if(dateDisplay) dateDisplay.innerText = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
});

// 2. Mobile Menu Toggle
window.toggleMenu = () => {
    const menu = document.getElementById('menuOverlay');
    if (menu) {
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : 'auto';
    }
};

// 3. Scroll Progress Bar
window.addEventListener('scroll', () => {
    const progressBar = document.getElementById("scroll-progress");
    if (progressBar) {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    }
});
