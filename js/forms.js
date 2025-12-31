// Forms Module - Validation/Wizard/Toggles
import { validateEmail, validatePhone, validateID, validateDOB } from './utils/validation-regex.js';

export function initForms() {
  // Password eye toggle
  document.querySelectorAll('.password-input').forEach(input => {
    const eye = input.nextElementSibling; // .eye-toggle
    eye.addEventListener('click', () => {
      input.type = input.type === 'password' ? 'text' : 'password';
      eye.src = input.type === 'password' ? '/assets/icons/eye-slash.svg' : '/assets/icons/eye.svg';
    });
  });

  // Confirm password match
  const confirmPw = document.querySelector('#confirm-password');
  if (confirmPw) {
    confirmPw.addEventListener('input', () => {
      const pw = document.querySelector('#password').value;
      const matchIcon = confirmPw.nextElementSibling;
      if (pw === confirmPw.value) {
        matchIcon.src = '/assets/icons/check.svg';
        matchIcon.style.color = 'green';
      } else {
        matchIcon.src = '/assets/icons/error.svg';
        matchIcon.style.color = 'red';
      }
    });
  }

  // Repeatable fields (exp/edu)
  document.querySelectorAll('.add-repeatable').forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.previousElementSibling;
      const newField = container.firstElementChild.cloneNode(true);
      newField.querySelectorAll('input, textarea').forEach(field => field.value = ''); // Clear
      gsap.from(newField, { duration: 0.5, scale: 0.8, opacity: 0, y: 20 });
      container.appendChild(newField);
    });
  });

  // Wizard (call from auth.js)
  document.querySelectorAll('.wizard-next').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentSection = document.querySelector('.wizard-section.active');
      // Validate current
      if (validateSection(currentSection)) {
        currentSection.classList.remove('active');
        const nextSection = currentSection.nextElementSibling;
        nextSection.classList.add('active');
        gsap.from(nextSection, { duration: 0.5, x: 50, opacity: 0 });
        updateProgress();
      }
    });
  });

  // Queue if offline
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      if (!navigator.onLine) {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        if (!window.queueAction(form.dataset.type || 'form_submit', data)) {
          showToast('Queued offline.', 'warning');
        }
      }
    });
  });
}

function validateSection(section) {
  let valid = true;
  section.querySelectorAll('input[required], select[required]').forEach(field => {
    const val = field.value.trim();
    const icon = field.nextElementSibling;
    if (!val) {
      valid = false;
      icon.src = '/assets/icons/error.svg';
      icon.style.color = 'red';
    } else {
      // Specific validates
      if (field.type === 'email' && !validateEmail(val)) valid = false;
      if (field.name === 'phone' && !validatePhone(val)) valid = false;
      if (field.name === 'id' && !validateID(val)) valid = false;
      if (field.name === 'dob' && !validateDOB(val)) valid = false;
      if (valid) {
        icon.src = '/assets/icons/check.svg';
        icon.style.color = 'green';
      }
    }
  });
  return valid;
}

function updateProgress() {
  const steps = document.querySelectorAll('.wizard-section').length;
  const current = document.querySelectorAll('.wizard-section.active, .wizard-section').length; // Count completed + active
  const progress = document.querySelector('.progress');
  progress.style.width = ((current / steps) * 100) + '%';
}

function showToast(msg, type) {
  // As in pwa.js
}
