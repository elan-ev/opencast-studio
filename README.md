Opencast Studio
===============

[![Build Status](https://travis-ci.com/elan-ev/opencast-studio.svg?branch=master)
](https://travis-ci.com/elan-ev/opencast-studio)

A web-based recording studio for [Opencast](https://opencast.org).

Opencast Studio uses the recording capabilities build into browsers to record
audio and video streams. The recording happens in the user's browser. Finally,
the recording is transferred directly from the users browser to the target
Opencast.

Demo at [studio.opencast.org](https://studio.opencast.org).


Introduction
------------

Record your webcam, microphone, desktop or any mediastream sourced via WebRTC.

1. Configure your Opencast server (gear symbol).
2. Enable the devices you want to record.
3. Click the recording button to start the recording.
4. Click the stop button to finish the recording.
5. Upload the recording.


Allow Studio to interact with your Opencast
-------------------------------------------

For Studio to work with your Opencast, your need to allow this on your Opencast
by serving a special HTTP header. The mechanism used is called Cross-Origin
Resource Sharing .

Here is a list of the required headers Nginx's configuration format:

```
# Basic open CORS for studio.opencast.org
add_header Access-Control-Allow-Origin https://studio.opencast.org;
add_header Access-Control-Allow-Methods 'GET, POST';
add_header Access-Control-Allow-Credentials true;
add_header Access-Control-Allow-Headers 'Origin,Content-Type,Accept,Authorization';
```

For a complete configuration file, take a look at [the test server configuration
](https://github.com/opencast/opencast-project-infrastructure/blob/9f09638e922d623cd4d3c91dd90aca39c421530d/ansible-allinone-demo-vm/roles/nginx/templates/nginx.conf#L158-L162).
