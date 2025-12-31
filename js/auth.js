// Auth Module - Signup/Verify/Signin
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, verifyPasswordResetCode, confirmPasswordReset } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
const { auth } = FirebaseApp;

export function initAuth() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Get role from Firestore via api.js
      apiCall('getUserRole', user.uid).then((role) => {
        localStorage.setItem('role', role);
        if (window.location.pathname.includes('signin') || window.location.pathname.includes('signup')) {
          window.location.href = role === 'seeker' ? '/seeker-dashboard.html' : role === 'employer' ? '/employer-dashboard.html' : '/admin-dashboard.html';
        }
      });
    } else {
      if (window.location.pathname.includes('dashboard')) window.location.href = '/signin.html';
    }
  });
}

export function signup(email, password, role, details) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // Save to Firestore via api.js
      apiCall('createUser', { uid: user.uid, role, ...details });
      // Send verification code/email
      // Use Functions for OTP: apiCall('sendVerifyCode', user.email);
      localStorage.setItem('pendingUid', user.uid);
      window.location.href = '/verify.html';
    })
    .catch((error) => {
      showToast('Signup error: ' + error.message, 'error');
    });
}

export function signin(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Get role, redirect as above
    })
    .catch((error) => showToast('Signin error: ' + error.message, 'error'));
}

export function forgotPassword(email) {
  sendPasswordResetEmail(auth, email)
    .then(() => showToast('Reset email sent', 'success'))
    .catch((error) => showToast('Error: ' + error.message, 'error'));
}

// Wizard for signup (call from forms.js)
export function handleWizard(role) {
  const sections = document.querySelectorAll('.wizard-section'); // Assume HTML wizard
  let current = 0;
  function next() {
    sections[current].style.display = 'none';
    current++;
    if (current < sections.length) sections[current].style.display = 'block';
    else submitSignup(); // Credentials last
  }
  // Role switch: Hide irrelevant fields
  if (role === 'seeker') document.querySelector('.employer-fields').style.display = 'none';
  else document.querySelector('.seeker-fields').style.display = 'none';
  // Bind next/prev buttons
  document.querySelector('.next-btn').addEventListener('click', next);
}

// Verify (in verify.html)
export function verifyCode(code) {
  // For email link: auth.applyActionCode(code)
  // For OTP: apiCall('verifyOTP', code)
  .then(() => {
    const uid = localStorage.getItem('pendingUid');
    apiCall('confirmUser', uid);
    localStorage.removeItem('pendingUid');
    window.location.href = '/signin.html';
  });
}

// Reset (confirm)
export function resetPassword(code, newPassword) {
  confirmPasswordReset(auth, code, newPassword)
    .then(() => showToast('Password reset', 'success'))
    .catch((error) => showToast('Error: ' + error.message, 'error'));
}

// Utils
function showToast(msg, type) {
  // Call from pwa.js or toastify
  const toastEl = document.createElement('div');
  // ... (as in pwa.js showToast)
}
