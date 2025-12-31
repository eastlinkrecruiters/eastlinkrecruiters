// Payments Module - M-Pesa STK/Validate/Upgrade
import { apiCall } from './api.js';
import { showToast } from './utils/toast-helper.js'; // Assume utils

export function initPayments() {
  const payBtn = document.querySelector('.pay-btn');
  if (payBtn) {
    payBtn.addEventListener('click', handlePayment);
  }
}

async function handlePayment(type) { // 'seeker' or 'employer'
  const phone = document.getElementById('phone').value || '+254' + localStorage.getItem('phone')?.slice(1);
  const amount = type === 'seeker' ? 1150 : 650;
  try {
    // Call Functions via api
    const stkRes = await apiCall('mpesaStkPush', { phone, amount, type });
    if (stkRes.success) {
      showToast('STK push sent to phone. Enter code to validate.', 'info');
      const codeInput = prompt('Enter M-Pesa transaction code:');
      await validateCode(codeInput, type);
    } else {
      showToast('STK error: ' + stkRes.error, 'error');
    }
  } catch (err) {
    showToast('Payment failed offline - queued.', 'warning');
    window.queueAction('payment', { type, phone, amount }); // pwa.js
  }
}

async function validateCode(code, type) {
  const res = await apiCall('validateCode', { code, type });
  if (res.valid) {
    // Upgrade
    const uid = FirebaseApp.auth.currentUser.uid;
    await apiCall('upgradePremium', { uid, type });
    showToast('Upgraded! Gold theme activated.', 'success');
    // Play sound from assets/sounds/success-chime.mp3
    new Audio('/assets/sounds/success-chime.mp3').play();
    // Confetti via particles.js
    particlesJS('confetti-container', { /* config for burst */ });
    // FCM notify
    apiCall('sendNotification', { uid, type: 'premiumUpgrade' });
    // Update theme
    import('./navigation.js').then(({ updateTheme }) => updateTheme('gold'));
    // Reload dashboard
    window.location.reload();
  } else {
    showToast('Invalid code. Retry.', 'error');
  }
}

// International: Link to email
document.getElementById('international-link')?.addEventListener('click', () => {
  window.location.href = `mailto:eastlinkrecruiters@gmail.com?subject=International Premium Upgrade&body=Request manual upgrade.`;
});
