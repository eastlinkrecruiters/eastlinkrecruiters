// Animations Module - GSAP/AOS
import { gsap } from '../vendor/gsap.min.js'; // Adjust path if bundled

export function initAnimations() {
  // Page load stagger
  gsap.from('.card', {
    duration: 0.8,
    y: 50,
    opacity: 0,
    stagger: 0.2,
    ease: 'power2.out'
  });

  // Hover effects
  document.querySelectorAll('.card.job').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { duration: 0.4, rotationY: 180, transformStyle: 'preserve-3d' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { duration: 0.4, rotationY: 0 });
    });
  });

  // Wizard progress
  const progress = document.querySelector('.progress-bar');
  if (progress) {
    gsap.from(progress, { duration: 1, scaleX: 0, transformOrigin: 'left', ease: 'power2.out' });
  }

  // Confetti on upgrade (call from payments.js)
  window.triggerConfetti = () => {
    // Use particles.js or GSAP divs
    gsap.to('.confetti', { duration: 2, y: -window.innerHeight, rotation: 360, stagger: 0.05, ease: 'none' });
  };

  // Button glow
  document.querySelectorAll('.button').forEach(btn => {
    btn.addEventListener('mouseover', () => gsap.to(btn, { duration: 0.3, scale: 1.05, boxShadow: '0 0 20px rgba(0,123,255,0.5)' }));
    btn.addEventListener('mouseout', () => gsap.to(btn, { duration: 0.3, scale: 1, boxShadow: 'none' }));
  });
}

// Scroll reveals (AOS)
window.addEventListener('load', () => {
  document.querySelectorAll('[data-aos]').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(50px)';
  });
  // Custom AOS without lib if not loaded
});
