# Bytemark Dashboards (bmdash) Server Overview

The server is a Ruby application based on `sinatra` It provides:

* An asset pipeline via [sprockets][0]
* A scheduler for running repeatable tasks via [Rufus Scheduler][1]
* Automatic loading of new Widgets and Dashboards vis [File Watcher][2]
* An SSE (Sever Sent Events) stream for clients to get updates from the server
  and from widgets

## SSE Event (Server Sent Events) Stream
Sever sent events are a mechanism for server to send updates to listening
clients. It works similarily to [long HTTP polling][3] or [COMET][4], but has a
defined structure with it's messages. Read more about it on [Mozilla Developer
Netowrk][5] 

Each widget can send it's own events that client side code can respond to. As 
well as this bmdash will send it's own events to the client these are listed 
below:

### client_connection
    id: 1439284359
    event: client_connection
    data: {
      "msg": "Welcome saki",
      "token": "cac8d0ac-6346-42d9-a6aa-7b264626e91f"
    }

## Watched Directories 
The server watchines the directories `widgets/` and `dashboards/` for changes. 
Any new files are loaded up, and any changed files will trigger a reload for
that widget or dashboard.

Once reloaded the clients get sent reload events to ensure the new changes are
picked up


[0]: https://github.com/sstephenson/sprockets
[1]: https://github.com/jmettraux/rufus-scheduler
[2]: https://github.com/thomasfl/filewatcher
[3]: https://en.wikipedia.org/wiki/Push_technology#Long_polling
[4]: https://en.wikipedia.org/wiki/Comet_(programming)
[5]: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
