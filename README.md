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

