import { CONFIG } from "../config/config.js";

let googleAccessToken = null;

export function setGoogleAccessToken(token) {
  googleAccessToken = token;
}

export async function fetchGoogleCalendarEvents(dateStr) {
  if (!googleAccessToken) {
    // Request token via GIS if not present
    googleAccessToken = await requestGoogleAccessToken();
  }

  // Calculate start and end of day in ISO format
  const startOfDay = new Date(`${dateStr}T00:00:00`);
  const endOfDay = new Date(`${dateStr}T23:59:59`);

  const timeMin = startOfDay.toISOString();
  const timeMax = endOfDay.toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${googleAccessToken}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, re-authenticate
      googleAccessToken = await requestGoogleAccessToken();
      return fetchGoogleCalendarEvents(dateStr);
    }
    throw new Error(`Google Calendar API error: ${response.statusText}`);
  }

  const data = await response.json();
  return parseCalendarEvents(data.items || [], dateStr);
}

function requestGoogleAccessToken() {
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CONFIG.google.clientId,
      scope: CONFIG.google.scopes,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.access_token);
        }
      }
    });
    client.requestAccessToken();
  });
}

function parseCalendarEvents(items, dateStr) {
  return items.map(item => {
    const isAllDay = !!item.start.date;
    const startTime = isAllDay ? `${item.start.date}T00:00:00` : item.start.dateTime;
    const endTime = isAllDay ? `${item.end.date}T23:59:59` : item.end.dateTime;

    return {
      googleEventId: item.id,
      title: item.summary || 'Untitled Event',
      description: item.description || '',
      startTime,
      endTime,
      isAllDay,
      calendarId: 'primary',
      status: 'upcoming', // default initial status before firestore reconciliation
      syncedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    };
  });
}