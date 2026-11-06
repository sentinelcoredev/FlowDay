import { db, doc, setDoc, getDoc, collection, getDocs, writeBatch } from "./firebase.js";

export async function loadDayPlanFromFirestore(userId, dateStr) {
  const eventsColRef = collection(db, `users/${userId}/daily_plans/${dateStr}/events`);
  const snapshot = await getDocs(eventsColRef);
  const events = [];
  snapshot.forEach(doc => {
    events.push(doc.data());
  });
  return events;
}

export async function saveEventsToFirestore(userId, dateStr, events, existingEventsMap) {
  const batch = writeBatch(db);
  const eventsColRef = collection(db, `users/${userId}/daily_plans/${dateStr}/events`);

  events.forEach(event => {
    const eventRef = doc(eventsColRef, event.googleEventId);
    const existing = existingEventsMap.get(event.googleEventId);

    // Preserve completion status if already marked completed
    if (existing && existing.status === 'completed') {
      event.status = 'completed';
    } else if (existing) {
      event.status = existing.status;
    }

    batch.set(eventRef, event, { merge: true });
  });

  await batch.commit();
}

export async function updateEventStatusInFirestore(userId, dateStr, googleEventId, status) {
  const eventRef = doc(db, `users/${userId}/daily_plans/${dateStr}/events`, googleEventId);
  await setDoc(eventRef, {
    status,
    lastUpdatedAt: new Date().toISOString()
  }, { merge: true });
}