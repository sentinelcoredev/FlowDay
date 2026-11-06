export function initSettingsModal(onSignOut, onTimezoneChange, onAutoMissedChange) {
  const modal = document.getElementById('settings-modal');
  const settingsBtn = document.getElementById('settings-btn');
  const closeBtn = document.getElementById('close-settings-btn');
  const signoutBtn = document.getElementById('signout-btn');
  const timezoneSelect = document.getElementById('timezone-select');
  const autoMissedToggle = document.getElementById('auto-missed-toggle');

  settingsBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  signoutBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    onSignOut();
  });

  timezoneSelect.addEventListener('change', (e) => {
    onTimezoneChange(e.target.value);
  });

  autoMissedToggle.addEventListener('change', (e) => {
    onAutoMissedChange(e.target.checked);
  });
}

export function setUserEmail(email) {
  document.getElementById('user-email-display').textContent = email || 'Connected';
}