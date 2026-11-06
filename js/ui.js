import { formatTime, calculateDuration } from "./utils.js";

export function renderEvents(events, onToggleComplete, onSelectEvent) {
  const container = document.getElementById('events-container');
  const emptyState = document.getElementById('empty-state');
  container.innerHTML = '';

  if (!events || events.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  events.forEach(event => {
    const card = document.createElement('div');
    card.className = `event-card status-${event.status}`;
    
    const timeStr = event.isAllDay ? 'All Day' : `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
    const durationStr = event.isAllDay ? '' : calculateDuration(event.startTime, event.endTime);

    card.innerHTML = `
      <div class="event-info">
        <div class="event-title">${escapeHtml(event.title)}</div>
        <div class="event-meta">
          <span>${timeStr}</span>
          ${durationStr ? `<span>• ${durationStr}</span>` : ''}
          <span style="text-transform: capitalize; font-weight: 500;">${event.status}</span>
        </div>
      </div>
      <div class="event-actions">
        <button class="complete-checkbox" title="Toggle Completion" data-id="${event.googleEventId}"></button>
      </div>
    `;

    card.querySelector('.event-info').addEventListener('click', () => onSelectEvent(event));
    card.querySelector('.complete-checkbox').addEventListener('click', (e) => {
      e.stopPropagation();
      onToggleComplete(event.googleEventId);
    });

    container.appendChild(card);
  });
}

export function renderEventDetailModal(event) {
  document.getElementById('detail-title').textContent = event.title;
  document.getElementById('detail-time').textContent = event.isAllDay ? 'All Day' : `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
  document.getElementById('detail-duration').textContent = event.isAllDay ? 'N/A' : calculateDuration(event.startTime, event.endTime);
  const statusEl = document.getElementById('detail-status');
  statusEl.textContent = event.status;
  statusEl.className = `badge status-${event.status}`;
  document.getElementById('detail-description').textContent = event.description || 'No description provided.';
  document.getElementById('event-detail-modal').classList.remove('hidden');
}

export function setSyncBadgeStatus(status, text) {
  const badge = document.getElementById('sync-status-badge');
  badge.className = `status-badge ${status}`;
  badge.textContent = text;
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}