// Validation Regex Utils - For forms.js, signup fields
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
}

export function validatePhone(phone) {
  // Kenyan format: +2547/1xxxxxxxx
  const phoneRegex = /^\+?254[17]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function validateID(id) {
  // Basic Kenyan ID: 8 digits - 1 digit (checksum placeholder)
  const idRegex = /^\d{8}-?\d{1}$/;
  return idRegex.test(id.replace(/-/g, ''));
}

export function validateDOB(dobStr) {
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age >= 18 && age <= 65 && !isNaN(dob.getTime());
}

export function validatePassword(pw) {
  // Min 8 chars, uppercase, lowercase, number, special
  const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return pwRegex.test(pw);
}

export function validateSalaryRange(min, max) {
  return min > 0 && max >= min && min <= 1000000 && max <= 5000000; // Ksh reasonable
}

export function validateSkills(skills) {
  // Tags: comma-separated, min 1
  return skills.split(',').filter(s => s.trim().length > 0).length >= 1;
}

export function validateLocation(loc) {
  // Basic: Not empty, East Africa focus
  const eastAfrica = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan'];
  return loc.trim().length > 0 && (loc.includes(',') || eastAfrica.some(country => loc.toLowerCase().includes(country.toLowerCase())));
}

// General validator helper for forms.js
export function validateField(field, value) {
  const validators = {
    email: validateEmail,
    phone: validatePhone,
    id: validateID,
    dob: validateDOB,
    password: validatePassword
  };
  const validator = validators[field.name] || (() => true);
  return validator(value);
}

// Default export
export default { 
  validateEmail, validatePhone, validateID, validateDOB, validatePassword, 
  validateSalaryRange, validateSkills, validateLocation, validateField 
};
