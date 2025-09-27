function clearConsolidatedEvents() {
  const consolidatedCalendarId = 'xxxxxxxxxxx';

  const calendar = CalendarApp.getCalendarById(consolidatedCalendarId);

  let now = new Date();
  let start = new Date(now.getFullYear(), now.getMonth(), 1); 
  let end = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);

  const events = calendar.getEvents(start, end);

  events.forEach(ev => {
    ev.deleteEvent();
    Utilities.sleep(100);
  });
}
