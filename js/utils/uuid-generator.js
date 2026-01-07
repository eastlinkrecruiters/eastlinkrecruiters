// UUID Generator - For referrals, unique IDs (client-side)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Referral link generator (e.g., /ref/{uuid})
export function generateReferralLink(userId = '') {
  const uuid = generateUUID();
  const link = `${window.location.origin}/referral-share.html?ref=${uuid}`;
  // Save to Firestore via api (in referrals section)
  return { uuid, link };
}

// Validate UUID (optional)
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Hash for short links (simple, not crypto)
export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}

// Example for referral code from user email
export function generateReferralCode(email) {
  return simpleHash(email);
}

// Default export
export { generateUUID, generateReferralLink, isValidUUID, simpleHash, generateReferralCode };
export default { generateUUID, generateReferralLink };
