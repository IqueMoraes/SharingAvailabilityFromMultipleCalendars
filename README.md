# Sharing availability from many calendars
Simple script to merge events from mulitple calendars into a single one.

## About
I created this script to mirror events from multiple calendars into a one, so I can share my availability with clients without exposing the details of my events.
I have Google Calendars for my main job, personal activities, collaborative events and others. They are integrated in a way that allows other people(colleagues, my boyfriend and even IA software) to schedule events while respecting availability of each calendar.

Of course, this is not new - when I check my Google Calendar I can already see all events together.
But when scheduling time with a new client, I would normally have to share the 3 or more calendars, hiding the details(simple configuration on Google calendar).

To simplify this, I chose to merge all events into a single calendar, making it public while hiding the details. 
To keep it automatic and synced with the originals, I wrote a script and added to Google AppsScript. 


## Is this for you?
You can solve this problem with many online tools, but I haven't tried any of them. 
I prefer to keep everything in one app, so I spent a few minutes coding my solution =)

## What is necessary?
The calendars IDs and enabling the Google Calendar API (to read the recurring events).

## How it works (step by step)

1. **Lock the script**  
   Uses `LockService` to make sure the script doesn’t run twice at the same time.  
   This prevents duplicated or conflicting updates.  

2. **Prepare configuration**  
   Loads the saved mapping (`map`) from `PropertiesService`.  
   Defines the **time window**: from the first day of the current month to the last day of the next month.  

3. **Select calendars**  
   Reads the IDs of all source calendars (`sourceCalendars`).  
   Opens the consolidated calendar (`consolidatedCalendarId`) where mirrored events will be created.  

4. **Fetch events from source calendars**  
   For each source calendar:  
   - Calls the Google Calendar Advanced API (`Calendar.Events.list`) with `singleEvents:true` to expand recurring events.  
   - Collects all events within the defined 2-month window.  

5. **Process each event**  
   - Builds a unique key = `calendarId|eventId`.  
   - Checks if the event already exists in the consolidated calendar (`map[key]`).  
     - If **yes**: compares start/end times and updates if necessary.  
     - If **no**: creates a new event in the consolidated calendar.  
   - Marks the event as **alive** (still exists in origin).  

6. **Clean up removed events**  
   - Iterates over events already in the consolidated calendar.  
   - If an event has the `[MIRROR]` marker but is not marked as alive, deletes it.  

7. **Update mapping**  
   Saves the updated `map` in `PropertiesService`.  
   This ensures the next run knows which consolidated event corresponds to which source event.  

8. **Release lock**  
   Unlocks the script so future runs can execute safely.


## Selecting the trigger

To keep the consolidated calendar always updated, you need to add a **time-driven trigger** in Google Apps Script.

1. Open the Apps Script editor.  
2. Click on the **clock icon (Triggers)** in the left sidebar.  
3. Click **+ Add Trigger**.  
4. Choose the function: `syncCalendars`.  
5. Select **Deployment → Test** (this is the default and expected option if you haven’t published the script).  
6. Select **Event source → Time-driven**.  
7. Set the type of trigger: **Hour timer**.  
8. Choose the frequency: **Every 12 hours**.  
9. Save.

### Why every 12 hours?
- The script copies and updates all events from the source calendars.  
- Running too often (e.g., every 15 minutes) could hit Google Calendar’s limits and slow down execution.  
- Running too rarely (e.g., once a week) could make your availability outdated for too long.  
- **Every 12 hours** is a good balance:  
  - Keeps the consolidated calendar fresh for sharing with clients.  
  - Avoids exceeding Google’s quotas for creating and updating events.  
  - Runs twice per day, which is more than enough for most use cases.

## Clearing all events manually

If something goes wrong or you want to reset the consolidated calendar, you can use a separate script with the function `clearConsolidatedEvents()`.  
This function deletes **all events** from the consolidated calendar within the 2-month window (current month + next month).  

⚠️ **Warning:** this script was created as a separate Google Apps Script project, and it should be executed **manually** when needed.  
Once executed, the consolidated calendar will be empty until the next scheduled run of `syncCalendars` repopulates it with the mirrored events.
