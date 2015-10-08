# Bytemark Dashboards (bmdash)

`bmdash` aims to be a easy to use dashboard system for setting up multiple
information screens, be it on a comptuer, TV or projector. It runs over HTTP and
defaultly relies on a browser based client to consume and show events to users.
However other clients can be made which can consume events.

## Overview

Data! For whatever activity there is generally a set of data you are very
interested in, that is nice to be able to monitor at a glance. 

For example, when supporting customers at Bytemark, it is often handy to see how
the "queues" are doing, to know if we require help or have time to work on other
proejcts. We also would like to know at a glance when urgent events are
happening. A TV infomration screen is a good use for this. 

We started off using [Dashing][1] however it became clear that this wasn't
a good solution when other members of the company wanted to contribute, have
their own specifc screen with certain functionallity and when information
screens contained more metrics then could have been shown on a single screen.

Due to this, bmdash was created to address some of the usabillity and options
lacking in `dashing`

BMdash aims to provide:

* A dashboard that supports multipe dashboards with multiple screen of metrics
* A dashboard which can push events out to clients, based on location or logical
  grouping, This is useful for global updates to all users, or selective updates
  to certain intersted parties.
* A dashboard that is simpler to contribute to and customise, with minimal
  knowledge of HTML/CSS/JS and Ruby or other language needed for simple tasks.
* A simple and readable way to define new dashboards.
* A dashboard that isn't dependant on code abstracted to various places on the
  OS

## About these docs
Good documentation makes it easier for poeople to get involved! So please take
a read about. 

*glossary* covers some common terms used in the docs and the code. Can't work
out the difference between a *screen* and a *display*? Read this!

*bmdash-server* covers the arcitechture of the server and, it does and what it
expects.

*bmdash-client* covers the default client side AngularJS application, which
consumes events from the server side.

*contribute* covers how you can get involved in the project, though bug
reporting, fixing and sharing of widgets you have made

*deployment* covers how to get this app running in production

*development* covers how to get a local instance running using some common tools
and general advice if you chose not to use them

## Contact

If you want to get in contact about this project you can send an email to
sherman@bytemark.co.uk or support@bytemark.co.uk, or post on the [project page][2]

[1]: http://dashing.io/
[2]: (TODO get project public)
