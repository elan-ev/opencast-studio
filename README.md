Opencast Studio
===============

[![Build Status](https://travis-ci.com/elan-ev/opencast-studio.svg?branch=master)
](https://travis-ci.com/elan-ev/opencast-studio)
](https://github.com/elan-ev/opencast-studio/issues)
[![Crowdin](https://badges.crowdin.net/e/d961aac56447c193679dfdb5b349e683/localized.svg)
](https://elan-ev.crowdin.com/opencast-studio)
[![MIT license](https://img.shields.io/github/license/elan-ev/opencast-studio)
](https://github.com/elan-ev/opencast-studio/blob/master/LICENSE)

A web-based recording studio for [Opencast](https://opencast.org).

Opencast Studio uses the recording capabilities built into modern browsers to
record audio and video streams. The recording happens completely in the user's
browser: no server is involved in that part. Network access is only needed to
initially load the application and to (optionally) upload the videos to an
Opencast instance.


## Supported Browsers

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


## Usage

There are mainly two ways how to use Opencast Studio.

### Standalone version at [`studio.opencast.org`](https://studio.opencast.org)

This is the easiest solution in many situations. However, uploading your
recording to your own/your institution's Opencast server becomes a bit more
difficult.

In order to upload to an Opencast server from `studio.opencast.org`, that server
needs to be configured appropriately. In particular, CORS requests from Studio
need to be allowed and return the status code 200. For nginx, you need to add
this to your configuration:

```
# Alternatively, hardcode `studio.opencast.org` instead of `$http_origin` to
# only allow requests from that origin.
add_header Access-Control-Allow-Origin $http_origin always;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS' always;
add_header Access-Control-Allow-Credentials true always;
add_header Access-Control-Allow-Headers 'Origin,Content-Type,Accept,Authorization' always;

# Always respond with 200 to OPTIONS requests as browsers do not accept
# non-200 responses to CORS preflight requests.
if ($request_method = OPTIONS) {
    # NOTE: on older nginx versions, these two `add_header` lines cause errors.
    # The quick'n'dirty fix is to remove those two lines: it still works.
    add_header 'Access-Control-Max-Age' 1728000;
    add_header 'Content-Length' 0;
    return 200;
}
```

### Self hosted/integrated in your Opencast

Many institutions prefer a self-hosted solution. As this is a client-only
application, you can simply build Opencast Studio and then serve the resulting
static files.

More easily even, Opencast Studio will be integrated into and shipped with
Opencast itself – for versions ≥8.2. With this, you don't need to configure
your webserver (as described above) and you are more flexible in terms of
user authentication.



## Build Instructions

To build Studio yourself, execute these commands:

```sh
% git clone git@github.com:elan-ev/opencast-studio.git
% cd opencast-studio
% npm install
% npm run build
```

This will generate static content you can serve via any web server in `build/`.
That's it.

If you prefer to run a local development server directly, you can use this
instead:

```sh
% npm run start
```
