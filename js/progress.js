export function renderProgress(stats) {
  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-completed').textContent = stats.completed;
  document.getElementById('stat-missed').textContent = stats.missed;
  document.getElementById('stat-upcoming').textContent = stats.upcoming;
  document.getElementById('stat-percentage').textContent = stats.percentage;
  
  const fillBar = document.getElementById('progress-bar-fill');
  fillBar.style.width = `${stats.percentage}%`;
}