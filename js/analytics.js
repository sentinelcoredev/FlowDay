import { collection, getDocs } from "./firebase.js";
import { db } from "./firebase.js";

/**
 * Fetches and aggregates execution statistics for a given date range.
 * Range types: 'week' (last 7 days), 'month' (current month), 'year' (current year)
 */
export async function fetchRangeAnalytics(userId, rangeType) {
  const now = new Date();
  const dates = generateDateRange(now, rangeType);
  
  let totalEvents = 0;
  let completedEvents = 0;
  let missedEvents = 0;

  // Batch query daily plans for the computed date array
  for (const dateStr of dates) {
    try {
      const eventsColRef = collection(db, `users/${userId}/daily_plans/${dateStr}/events`);
      const snapshot = await getDocs(eventsColRef);
      
      snapshot.forEach(doc => {
        const event = doc.data();
        if (event.status !== 'cancelled') {
          totalEvents++;
          if (event.status === 'completed') completedEvents++;
          if (event.status === 'missed') missedEvents++;
        }
      });
    } catch (err) {
      // Missing subcollections for past days are expected; skip gracefully
    }
  }

  const percentage = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

  return {
    total: totalEvents,
    completed: completedEvents,
    missed: missedEvents,
    percentage
  };
}

function generateDateRange(currentDate, rangeType) {
  const dates = [];
  const d = new Date(currentDate);

  if (rangeType === 'week') {
    // Last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const tempDate = new Date(d);
      tempDate.setDate(d.getDate() - i);
      dates.push(formatDateString(tempDate));
    }
  } else if (rangeType === 'month') {
    // All days from the 1st of the current month up to today
    const year = d.getFullYear();
    const month = d.getMonth();
    const todayDate = d.getDate();
    for (let i = 1; i <= todayDate; i++) {
      const tempDate = new Date(year, month, i);
      dates.push(formatDateString(tempDate));
    }
  } else if (rangeType === 'year') {
    // Sampled optimization: Check past 365 days or active months to save reads
    // For performance, we query active days of the current year up to today
    const year = d.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    let curr = new Date(startOfYear);
    while (curr <= d) {
      dates.push(formatDateString(curr));
      curr.setDate(curr.getDate() + 1);
    }
  }

  return dates;
}

function formatDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}