Opencast Studio
===============

[![Build Status](https://travis-ci.com/elan-ev/opencast-studio.svg?branch=react)
](https://travis-ci.com/elan-ev/opencast-studio)
[![GitHub issues](https://img.shields.io/github/issues-raw/elan-ev/opencast-studio?color=blue)
](https://github.com/elan-ev/opencast-studio/issues)
[![Crowdin](https://badges.crowdin.net/e/d961aac56447c193679dfdb5b349e683/localized.svg)
](https://elan-ev.crowdin.com/opencast-studio)
[![MIT license](https://img.shields.io/github/license/elan-ev/opencast-studio)
](https://github.com/elan-ev/opencast-studio/blob/master/LICENSE)

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


Build Instructions
------------------

Opencast Studio is mainly just meant to be used as a service and you do not
need to build and/or install it yourself. Just head over to
[studio.opencast.org](https://studio.opencast.org).

Nevertheless, if you want to build it yourself, here are a few instructions:

```sh
% git clone git@github.com:elan-ev/opencast-studio.git
% cd opencast-studio
% npm install
% npm run build
```

This will generate static content you can serve via any web server in `build/`.
That's it.

If you prefer to run a local **development** server directly, you can use instead:

```sh
% npm run start
```

Supported Browsers
------------------

The following table depicts the current state of browser support.
Please note that Opencast Studio uses fairly new web technologies that are not yet (fully) supported by all browsers.
That's usually the reason for why this app does not work on a particular browser/system.
In the table, "(✔)" means partial support and/or major bugs are still present.

| OS         | Browser    | Capture Camera | Capture Screen | Record | Notes |
| ---------- | ---------- | -------------- | -------------- | ------ | ----- |
| Win10 | Chrome 77  | ✔              | ✔              | ✔      |
| Win10 | Firefox 68 | ✔              | ✔              | ✔      |
| Win10 | Edge 79    | ✔              | ✔              | ✔      |
| Linux      | Chrome 77  | ✔              | ✔              | ✔      |
| Linux      | Firefox 68 | ✔              | ✔              | ✔      |
| MacOS      | Firefox 70 | ✔              | ✔              | ✔      |
| MacOS      | Chrome 78  | ✔              | ✔              | ✔      | Video file does not allow seeking
| MacOS      | Safari 13  | ✔              | ✘              | ✘      | Recording seems to fail due to unsupported MIME type
| Android    | Firefox 68 | ✔              | ✘              | ✔      |
| Android    | Chrome 78  | (✔) [#217](https://github.com/elan-ev/opencast-studio/issues/217) | ✘ | ✔ |
| iOS        | Safari     | (✔) [#217](https://github.com/elan-ev/opencast-studio/issues/217) | ✘ | (✔) [#84](https://github.com/elan-ev/opencast-studio/issues/84) | Video rotated by 180° in recording, requires enabling experimental feature in settings
| iOS        | Firefox    | ✘ | ✘ | ✘ | Non-Safari browsers on iOS are severely limited
| iOS        | Chrome     | ✘ | ✘ | ✘ | Non-Safari browsers on iOS are severely limited

Browsers/systems not listed in this table are not currently tested by us, so they might or might not work.
