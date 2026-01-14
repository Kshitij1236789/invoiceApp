// Utility functions for storing and retrieving events from localStorage

const STORAGE_KEY = "saved_events";

export const saveEvent = (eventData) => {
  try {
    const events = getEvents();

    const event = {
      id: eventData.eventId || generateEventId(),
      eventId: eventData.eventId || generateEventId(),
      eventName: eventData.eventName,
      eventType: eventData.eventType,
      eventDate: eventData.eventDate,
      clientEmail: eventData.clientEmail,
      clientPhone: eventData.clientPhone,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    const index = events.findIndex(
      evt => evt.eventId === event.eventId
    );

    if (index >= 0) {
      events[index] = {
        ...events[index],
        ...event,
        lastUpdated: new Date().toISOString()
      };
    } else {
      events.push(event);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return event;
  } catch (e) {
    console.error("Save event failed", e);
    return null;
  }
};

export const getEvents = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getEventById = (id) => {
  const events = getEvents();
  return events.find(
    evt => evt.id === id || evt.eventId === id
  );
};

export const deleteEvent = (id) => {
  const events = getEvents().filter(
    evt => evt.id !== id && evt.eventId !== id
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

const generateEventId = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `EVT/${year}-${month}/${random}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  } catch (error) {
    return dateString;
  }
};


