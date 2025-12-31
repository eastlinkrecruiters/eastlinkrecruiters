// Dashboard Module - Role-specific realtime UI, charts, renders
import { onSnapshot, query, collection, where, orderBy } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
import Chart from '../vendor/chart.min.js';
import { getUUID } from './utils/uuid-generator.js';
import { formatDate } from './utils/date-formatter.js';
import { apiCall } from './api.js'; // Wrapper for Firestore/Functions

const { db, auth } = FirebaseApp;
const uid = auth.currentUser?.uid;
const role = localStorage.getItem('role');

export function initDashboard() {
  if (!uid || !role) return window.location.href = '/signin.html';
  const dashboardEl = document.querySelector('.dashboard-content');
  if (!dashboardEl) return;

  if (role === 'seeker') initSeekerDashboard();
  else if (role === 'employer') initEmployerDashboard();
  else if (role === 'admin') initAdminDashboard();

  // Common: Load partials if needed, e.g., job cards
  loadJobCards();
}

function initSeekerDashboard() {
  // Recent applications listener
  const appsQuery = query(
    collection(db, 'applications'),
    where('seekerId', '==', uid),
    orderBy('timestamp', 'desc')
  );
  onSnapshot(appsQuery, (snapshot) => {
    const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderApps(apps); // Update table/timeline
    updateStats(apps); // Charts
  });

  // Featured premium jobs
  apiCall('getPremiumJobs').then((jobs) => {
    const featuredEl = document.getElementById('featured-jobs');
    featuredEl.innerHTML = jobs.map(job => renderFeaturedJob(job)).join('');
    // Animate carousel with GSAP
    gsap.to('.featured-job', { duration: 1, x: '-100%', ease: 'power2.inOut', repeat: -1, modifiers: { x: x => (parseFloat(x) % -100) + 'px' } });
  });

  // Profile completion percentage
  apiCall('getUserProfile', uid).then((profile) => {
    const completePct = calculateCompletion(profile);
    document.getElementById('profile-progress').style.width = completePct + '%';
    gsap.from('#profile-progress', { duration: 1, scaleX: 0, transformOrigin: 'left' });
  });

  // Alerts toggle for FCM
  document.getElementById('alert-toggle').addEventListener('change', (e) => {
    apiCall('toggleAlerts', { uid, enabled: e.target.checked });
  });
}

function initEmployerDashboard() {
  // Posted jobs listener
  const jobsQuery = query(
    collection(db, 'jobs'),
    where('employerId', '==', uid),
    orderBy('postedAt', 'desc')
  );
  onSnapshot(jobsQuery, (snapshot) => {
    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderJobs(jobs); // Update my-jobs list
  });

  // Applications received
  apiCall('getEmployerApps', uid).then((apps) => {
    renderEmployerApps(apps);
  });

  // Stats charts
  initHiresChart(); // Example
}

function initAdminDashboard() {
  // Global metrics query (Functions for aggregates)
  apiCall('getAdminMetrics').then((metrics) => {
    document.getElementById('total-users').textContent = metrics.users;
    document.getElementById('pending-jobs').textContent = metrics.pendingJobs;
    document.getElementById('revenue').textContent = 'Ksh ' + metrics.revenue;
    // Animate counters
    gsap.from(['#total-users', '#pending-jobs', '#revenue'], { duration: 1, y: 20, opacity: 0, stagger: 0.2 });
  });

  // Recent logs
  apiCall('getAdminLogs').then((logs) => {
    renderLogs(logs);
  });
}

// Render functions (use partials)
async function loadJobCards() {
  const cardRes = await fetch('/partials/job-card.html');
  const cardTemplate = await cardRes.text();
  window.jobCardTemplate = cardTemplate; // Global for render
}

function renderApps(apps) {
  const container = document.getElementById('recent-apps');
  container.innerHTML = apps.map(app => `
    <div class="card app-timeline" data-aos="fade-up">
      <h4>${app.jobTitle}</h4>
      <p>Status: ${app.status} (Applied: ${formatDate(app.timestamp)})</p>
      <div class="timeline-stepper">
        <span class="${app.status === 'pending' ? 'active' : ''}">Pending</span>
        <span class="${app.status === 'approved' ? 'active' : ''}">Approved</span>
        <span class="${app.status === 'rejected' ? 'active' : ''}">Rejected</span>
      </div>
      ${app.status === 'approved' ? `<button onclick="contactEmployer('${app.employerId}')">Contact Employer</button>` : ''}
    </div>
  `).join('');
  // Animate timeline
  gsap.from('.timeline-stepper span', { duration: 0.5, stagger: 0.1, scale: 0.5, opacity: 0 });
}

function renderFeaturedJob(job) {
  return `<div class="featured-job card">
    <h4>${job.title} <span class="premium-label" style="color: gold;">Premium</span></h4>
    <p>${job.salary} - ${job.location} - Category: ${job.category}</p>
    <button class="button" onclick="applyJob('${job.id}')">Apply</button>
  </div>`;
}

function renderJobs(jobs) {
  const container = document.getElementById('my-jobs');
  container.innerHTML = jobs.map(job => window.jobCardTemplate ? window.jobCardTemplate.replace('{title}', job.title).replace('{status}', job.status) : `<div class="card">${job.title} - ${job.status}</div>`).join('');
}

function renderEmployerApps(apps) {
  const container = document.getElementById('applications');
  container.innerHTML = apps.map(app => `
    <div class="applicant-card card">
      <h4>${app.seekerName}</h4>
      <p>Email: ${app.email} | Experience: ${app.years}</p>
      <button class="approve-btn" onclick="approveApp('${app.id}')">Approve</button>
      <button class="reject-btn" onclick="rejectApp('${app.id}')">Reject</button>
      <textarea placeholder="Request more info" oninput="updateMoreInfo('${app.id}', this.value)"></textarea>
      <button onclick="sendMoreInfo('${app.id}')">Send</button>
    </div>
  `).join('');
}

function calculateCompletion(profile) {
  const fields = ['name', 'phone', 'skills', 'education']; // Example
  const filled = fields.filter(f => profile[f] && profile[f].length > 0).length;
  return (filled / fields.length) * 100;
}

function initHiresChart() {
  const ctx = document.getElementById('hires-chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{ label: 'Hires', data: [12, 19, 3], backgroundColor: '#007BFF' }]
    },
    options: { animation: { duration: 1000 } }
  });
}

function renderLogs(logs) {
  // Similar to renderApps
  console.log('Admin logs:', logs);
}

// Global functions for buttons (exposed to window)
window.applyJob = (jobId) => {
  if (localStorage.getItem('role') !== 'premium') {
    showToast('Subscribe to premium to apply.', 'warning');
    return;
  }
  apiCall('submitApplication', { jobId, uid });
};

window.contactEmployer = (employerId) => {
  apiCall('getContact', employerId).then((contact) => {
    window.location.href = `mailto:${contact.email}?subject=Job Follow-up`;
  });
};

window.approveApp = (appId) => {
  apiCall('approveApplication', appId).then(() => showToast('Approved', 'success'));
};

window.rejectApp = (appId) => {
  const reason = prompt('Reason for rejection:');
  apiCall('rejectApplication', { appId, reason }).then(() => showToast('Rejected', 'success'));
};

window.updateMoreInfo = (appId, text) => {
  // Save draft
  localStorage.setItem(`moreinfo-${appId}`, text);
};

window.sendMoreInfo = (appId) => {
  const text = localStorage.getItem(`moreinfo-${appId}`);
  apiCall('sendMoreInfo', { appId, text }).then(() => showToast('Sent', 'success'));
};

function showToast(msg, type) {
  // From pwa.js or toastify-js
  import('../vendor/toastify.min.js').then(() => {
    Toastify({ text: msg, duration: 3000, gravity: 'top', position: 'right', backgroundColor: type === 'success' ? '#28A745' : '#DC3545' }).showToast();
  });
}
