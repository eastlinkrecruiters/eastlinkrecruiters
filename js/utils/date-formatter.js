// Date Utils - Exported for dashboard, blog, etc.
export function formatDate(dateInput) {
  if (!dateInput) return 'N/A';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-KE', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatSalary(range) {
  if (!range) return 'Negotiable';
  const { min = 0, max = '' } = range;
  const formattedMin = min.toLocaleString();
  return max ? `Ksh ${formattedMin} - Ksh ${max.toLocaleString()}` : `Ksh ${formattedMin}+`;
}

export function isDeadlinePassed(deadline) {
  const deadlineDate = new Date(deadline);
  return deadlineDate < new Date();
}

export function deadlineCountdown(deadline) {
  const now = new Date();
  const diff = new Date(deadline) - now;
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h remaining`;
}

// Example usage in dashboard renders
export function renderDateField(value) {
  return `<small class="date-field">${formatDate(value)}</small>`;
}

// Default export for convenience in main.js
export default { formatDate, formatSalary, isDeadlinePassed, deadlineCountdown, renderDateField };
