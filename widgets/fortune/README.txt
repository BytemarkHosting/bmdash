A mid-level summary of how the fortune widget works
===================================================

1. The about.yml script is loaded. This ties the template in fortune.html to the name 'Fortune'.
2. The fortune.rb script is loaded and run.
   From then on, every ten seconds it pushes a Fortune event to the event stream.
3. When a client connects and opens up a dashboard containing a Fortune widget, the dashboard
   javascript automatically register the widget as a listener for Fortune events.
4. Every time a Fortune event is received, the data is provided to the template
   because the widget is listening to Fortune events.
5. The {{ latest_fortune }} in the template is replaced with the value of the latest_fortune data key in the event.

Events
======

It is important to first understand how the events system works in bmdash.
An event is a small collection of data that has a name. Event listeners on 
the client side listen out for events with a certain name, and then use the
data from the event.

Widgets also have names. By default, a widget listens to events having the
same name as themselves.

It is possible to make your widget listen for events by adding
data-listener="event-name" as an attribute to any html element.
This allows you to eavesdrop on events being provided by other widgets, too.

Widgets folder structure
========================

The name of the .rb and .html files must match the name specified in the about.yml file.

/about.yml
/widget.html
/widget.rb
/stylesheets/*.scss
/javascripts/*.js

about.yml
---------

This is where some metadata about your widget goes, you just need a name, author, email and about, all of which are strings.

widget.rb
---------

This file provides implementation of any server-side features of your widget - generally data collection.

This is typically done by defining a schedule to run your code, then using the event stream to push data to the widget.

The dashboard provides a few class variables to the widget: @logger, @scheduler and @events

To push an event to the event stream, use @events.push(event), where event is a hash like this:

{ name: "my-cool-event-name",
  data: {
      somekey: "some value",
      howmanychickens: 9,
      isitchristmas: false
  }
}

On any client with a widget listening for events called "my-cool-event-name" the data object will be provided to the template.

widget.html
-----------

This is the template file. Simple HTML. To bind some text to a data field, use {{ field_name }}. For example, if we wanted to know
how many chickens there are, in a really big way, <h1>{{ howmanychickens }}</h1> would do the job.

This file is also where you'd include any CSS and javascript using link or script tags.

stylesheets/
------------

Files in this directory are processed with sprockets and provided at the url /assets/<file name>.css
If you place a .scss file in this directory, you can @import "colors"; to include the Bytemark colours.
I wouldn't recommend importing any other of the partials in the /assets folder.

javascripts/
------------
Files in this directory are processed with sprockets and provided at the url /assets/<file name>.js
