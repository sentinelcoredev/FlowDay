import { fetchRangeAnalytics } from "./analytics.js";
import { initAuth, loginWithGoogle, logoutUser, getCurrentUser } from "./auth.js";
import { loadDayPlanFromFirestore, updateEventStatusInFirestore } from "./firestore.js";
import { synchronizeDay } from "./sync.js";
import { evaluateEventStatuses, calculateProgress } from "./eventManager.js";
import { renderEvents, renderEventDetailModal, setSyncBadgeStatus } from "./ui.js";
import { renderProgress } from "./progress.js";
import { initSettingsModal, setUserEmail } from "./settings.js";
import { formatDateString, formatDisplayDate, showToast } from "./utils.js";
import { CONFIG } from "../config/config.js";


let currentDate = new Date();
let currentEvents = [];
let autoMissedEnabled = true;

document.addEventListener('DOMContentLoaded', () => {
  // Theme initialization
  const savedTheme = localStorage.getItem('flowday_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('flowday_theme', next);
  });

  // Auth initialization
  initAuth(handleAuthenticated, handleSignedOut);

  document.getElementById('google-signin-btn').addEventListener('click', async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      const errEl = document.getElementById('auth-error');
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });

  // Date Navigation
  // Date Navigation
    document.getElementById('prev-day-btn')?.addEventListener('click', () => changeDate(-1));
    document.getElementById('next-day-btn')?.addEventListener('click', () => changeDate(1));
    document.getElementById('today-jump-btn')?.addEventListener('click', () => {
    currentDate = new Date();
    loadDashboardData();
});

    // Sync Button
    document.getElementById('sync-btn')?.addEventListener('click', async () => {
    const user = getCurrentUser();
    if (!user) return;
    const dateStr = formatDateString(currentDate);
    try {
        currentEvents = await synchronizeDay(user.uid, dateStr, setSyncBadgeStatus);
        refreshDashboardView();
        showToast('Calendar synchronized successfully', 'success');
    } catch (err) {
        // error handler
    }
});

  // Settings & Modals
  initSettingsModal(
    () => logoutUser(),
    (tz) => {
      document.getElementById('timezone-label').textContent = tz;
      showToast(`Timezone updated to ${tz}`, 'success');
    },
    (enabled) => {
      autoMissedEnabled = enabled;
      refreshDashboardView();
    }
  );

  document.getElementById('close-detail-btn').addEventListener('click', () => {
    document.getElementById('event-detail-modal').classList.add('hidden');
  });
});

function handleAuthenticated(user) {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('dashboard-screen').classList.add('active');
  setUserEmail(user.email);
  loadDashboardData();
}

function handleSignedOut() {
  document.getElementById('dashboard-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');
}

async function loadDashboardData() {
  const user = getCurrentUser();
  if (!user) return;

  const dateStr = formatDateString(currentDate);
  document.getElementById('current-date-display').textContent = formatDisplayDate(currentDate);

  try {
    currentEvents = await loadDayPlanFromFirestore(user.uid, dateStr);
    refreshDashboardView();
  } catch (err) {
    console.error("Error loading day plan:", err);
    showToast('Failed to load saved schedule', 'error');
  }
}

function refreshDashboardView() {
  const evaluatedEvents = evaluateEventStatuses(currentEvents, autoMissedEnabled);
  renderEvents(evaluatedEvents, handleToggleComplete, handleSelectEvent);
  const stats = calculateProgress(evaluatedEvents);
  renderProgress(stats);
}

async function handleToggleComplete(googleEventId) {
  const user = getCurrentUser();
  if (!user) return;

  const event = currentEvents.find(e => e.googleEventId === googleEventId);
  if (!event) return;

  const newStatus = event.status === 'completed' ? 'upcoming' : 'completed';
  event.status = newStatus;

  try {
    const dateStr = formatDateString(currentDate);
    await updateEventStatusInFirestore(user.uid, dateStr, googleEventId, newStatus);
    refreshDashboardView();
    showToast(newStatus === 'completed' ? 'Event completed!' : 'Event marked upcoming', 'success');
  } catch (err) {
    console.error("Failed to update status:", err);
    showToast('Failed to update event status', 'error');
  }
}

function handleSelectEvent(event) {
  renderEventDetailModal(event);
}

function changeDate(deltaDays) {
  currentDate.setDate(currentDate.getDate() + deltaDays);
  loadDashboardData();
}
// Analytics Modal Wiring
  const analyticsModal = document.getElementById('analytics-modal');
  document.getElementById('analytics-btn').addEventListener('click', async () => {
    analyticsModal.classList.remove('hidden');
    await loadAnalyticsData('week');
  });
  document.getElementById('close-analytics-btn').addEventListener('click', () => {
    analyticsModal.classList.add('hidden');
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      await loadAnalyticsData(e.target.getAttribute('data-range'));
    });
  });
  async function loadAnalyticsData(rangeType) {
  const user = getCurrentUser();
  if (!user) return;

  const loadingEl = document.getElementById('analytics-loading');
  loadingEl.classList.remove('hidden');

  try {
    const stats = await fetchRangeAnalytics(user.uid, rangeType);
    document.getElementById('ana-total').textContent = stats.total;
    document.getElementById('ana-completed').textContent = stats.completed;
    document.getElementById('ana-missed').textContent = stats.missed;
    document.getElementById('ana-percentage').textContent = stats.percentage;
    document.getElementById('ana-progress-fill').style.width = `${stats.percentage}%`;
  } catch (err) {
    console.error("Failed to load analytics:", err);
  } finally {
    loadingEl.classList.add('hidden');
  }
}