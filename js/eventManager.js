export function evaluateEventStatuses(events, autoMissedEnabled) {
  const now = new Date();

  const evaluated = events.map(event => {
    if (event.status === 'completed') {
      return event; // Completed status is permanent unless manually toggled
    }

    const endTime = new Date(event.endTime);
    if (autoMissedEnabled && now > endTime) {
      return { ...event, status: 'missed' };
    }

    return event;
  });

  // Sort events chronologically by start time
  return evaluated.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

export function calculateProgress(events) {
  const eligibleEvents = events.filter(e => e.status !== 'cancelled');
  const total = eligibleEvents.length;
  if (total === 0) return { total: 0, completed: 0, missed: 0, upcoming: 0, percentage: 0 };

  const completed = eligibleEvents.filter(e => e.status === 'completed').length;
  const missed = eligibleEvents.filter(e => e.status === 'missed').length;
  const upcoming = eligibleEvents.filter(e => e.status === 'upcoming').length;
  const percentage = Math.round((completed / total) * 100);

  return { total, completed, missed, upcoming, percentage };
}