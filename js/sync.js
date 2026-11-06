import { fetchGoogleCalendarEvents } from "./calendar.js";
import { loadDayPlanFromFirestore, saveEventsToFirestore } from "./firestore.js";

export async function synchronizeDay(userId, dateStr, onStatusChange) {
  try {
    onStatusChange('syncing', 'Syncing...');

    // 1. Load existing Firestore events to preserve completion statuses
    const existingEvents = await loadDayPlanFromFirestore(userId, dateStr);
    const existingMap = new Map(existingEvents.map(e => [e.googleEventId, e]));

    // 2. Fetch fresh events from Google Calendar
    const calendarEvents = await fetchGoogleCalendarEvents(dateStr);

    // 3. Reconcile and save to Firestore
    await saveEventsToFirestore(userId, dateStr, calendarEvents, existingMap);

    // 4. Reload updated day plan
    const updatedEvents = await loadDayPlanFromFirestore(userId, dateStr);
    onStatusChange('success', 'Synced');
    return updatedEvents;
  } catch (error) {
    console.error("Synchronization failed:", error);
    onStatusChange('error', 'Sync Failed');
    throw error;
  }
}