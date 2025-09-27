const consolidatedCalendarId = 'yyyyyyyyyyyy@group.calendar.google.com';

const sourceCalendars = {
  'main': 'primary',
  'main_job': 'xxxxxxxxxx@group.calendar.google.com',
  // ...
};

const prefix = '[MIRROR]';

function syncCalendars() {

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return;
  
  try {
    const props = PropertiesService.getScriptProperties();
    const map = props.getProperties();

    let now = new Date();
    let start = new Date(now.getFullYear(), now.getMonth(), 1); 
    let end = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59); // Look ahead two months (from the 1st of this month to the last day of next month)

    let consolidatedCalendar = CalendarApp.getCalendarById(consolidatedCalendarId);
  
    const alive = {};

    let sourceCalendarIds = Object.values(sourceCalendars);
    
    sourceCalendarIds.forEach((id) => {
      let calendar = CalendarApp.getCalendarById(id);
      if (!calendar) return;

      // Using Calendar API to expand recurring events
      const apiResponse = Calendar.Events.list(id, {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      let events = apiResponse.items || [];

      events.forEach((event) => {
        const key = `${id}|${event.id}`;
        alive[key] = true;

        const eventName = event.summary && (event.summary.trim() !== '') 
          ? event.summary 
          : 'Hashtag Trainings';

        const destinationId = map[key];

        if (destinationId) {
          const destinationEvent = consolidatedCalendar.getEventById(destinationId);
          
          if (destinationEvent) {
            const startTime = new Date(event.start.dateTime || event.start.date); 
            const endTime = new Date(event.end.dateTime || event.end.date);

            if (destinationEvent.getStartTime().getTime() !== startTime.getTime() 
            || destinationEvent.getEndTime().getTime() !== endTime.getTime()) {
              destinationEvent.setTime(startTime, endTime);
              Utilities.sleep(200);
            }
          } else {
            const newEvent = consolidatedCalendar.createEvent(
              eventName,
              new Date(event.start.dateTime || event.start.date),
              new Date(event.end.dateTime || event.end.date),
              {description: `${prefix} ${key}`}
            );
            map[key] = newEvent.getId();
            Utilities.sleep(200);
          }

        } else {
          const newEvent = consolidatedCalendar.createEvent(
            eventName,
            new Date(event.start.dateTime || event.start.date),
            new Date(event.end.dateTime || event.end.date),
            {description: `${prefix} ${key}`}
          );
          map[key] = newEvent.getId();
          Utilities.sleep(200);
        }
      });
      Utilities.sleep(400);
    });

    const consolidatedEvents = consolidatedCalendar.getEvents(start, end);

    consolidatedEvents.forEach((event) => {
      const description = event.getDescription() || '';
      if (description.indexOf(prefix) !== -1) {
        const match = description.match(/\[MIRROR\]\s+(.+)$/);
        const key = match ? match[1] : null;
        if (key && !alive[key]) {
          event.deleteEvent();
          delete map[key];
          Utilities.sleep(200);
        }
      }  
    });

    props.setProperties(map, true);
  
  } finally {
    lock.releaseLock();
  }
}
