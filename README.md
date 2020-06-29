Opencast Studio
===============

[![Build Status](https://travis-ci.com/elan-ev/opencast-studio.svg?branch=master)
](https://travis-ci.com/elan-ev/opencast-studio)
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

| OS      | Browser    | Capture Camera | Capture Screen | Record | Notes |
| --------| ---------- | -------------- | -------------- | ------ | ----- |
| Win10   | Chrome 77  | ✔   | ✔ | ✔   | Video file does not allow seeking ([#517](https://github.com/elan-ev/opencast-studio/issues/517))
| Win10   | Firefox 68 | ✔   | ✔ | ✔   |
| Win10   | Edge 79    | ✔   | ✔ | ✔   | Video file does not allow seeking ([#517](https://github.com/elan-ev/opencast-studio/issues/517))
| Linux   | Chrome 77  | ✔   | ✔ | ✔   | Video file does not allow seeking ([#517](https://github.com/elan-ev/opencast-studio/issues/517))
| Linux   | Firefox 68 | ✔   | ✔ | ✔   |
| macOS   | Chrome 78  | ✔   | ✔ | ✔   | Video file does not allow seeking ([#517](https://github.com/elan-ev/opencast-studio/issues/517))
| macOS   | Firefox 70 | ✔   | ✔ | ✔   |
| macOS   | Safari 13  | ✔   | ✘ | ✘   | Recording seems to fail due to unsupported MIME type
| Android | Chrome 78  | (✔) | ✘ | ✔   | No camera selection ([#217](https://github.com/elan-ev/opencast-studio/issues/217))
| Android | Firefox 68 | ✔   | ✘ | ✔   |
| iOS     | Safari     | (✘) | ✘ | (✘) | Many issues. For details see [issue #84](https://github.com/elan-ev/opencast-studio/issues/84)
| iOS     | Firefox    | ✘   | ✘ | ✘   | Non-Safari browsers on iOS are severely limited
| iOS     | Chrome     | ✘   | ✘ | ✘   | Non-Safari browsers on iOS are severely limited

Browsers/systems not listed in this table are not currently tested by us, so they might or might not work.


## Usage

There are mainly two ways how to use Opencast Studio.

### Standalone Version at [studio.opencast.org](https://studio.opencast.org)

This is the easiest solution in many situations. However, uploading your
recording to your own/your institution's Opencast server becomes a bit more
difficult.

In order to upload to an Opencast server from `studio.opencast.org`, that server
needs to be configured appropriately. In particular, CORS requests from Studio
need to be allowed and return the status code 200. For nginx, you need to add
this to your configuration:

```
add_header Access-Control-Allow-Origin https://studio.opencast.org always;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS' always;
add_header Access-Control-Allow-Credentials true always;
add_header Access-Control-Allow-Headers 'Origin,Content-Type,Accept,Authorization' always;

# Always respond with 200 to OPTIONS requests as browsers do not accept
# non-200 responses to CORS preflight requests.
if ($request_method = OPTIONS) {
    # On newer nginx versions, you can optionally send an
    # Access-Control-Max-Age header to reduce the number of requests a browser
    # will send.
    #add_header 'Access-Control-Max-Age' 1728000;
    return 200;
}
```

### Self-hosted/Integrated in Opencast

Many institutions prefer a self-hosted solution. As this is a client-only
application, you can simply build Opencast Studio and then serve the resulting
static files.

More easily even, Opencast Studio will be integrated into and shipped with
Opencast itself – for versions ≥8.2. With this, you don't need to configure
your webserver (as described above) and you are more flexible in terms of
user authentication.

## Configuration

See [`CONFIGURATION.md`](CONFIGURATION.md).

## Opencast APIs used by Studio

Opencast Studio uses the following APIs:

- `/ingest/*`
- `/info/me.json`

You have to make sure that these APIs are accessible to the user using Studio.
In Opencast ≥8.2, providing a user with `ROLE_STUDIO` should grant a user all necessary rights.
In older versions, you might need to create such a role in the security configuration (e.g. `mh_default_org.xml`) of Opencast.


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

### Additional Build Options

By default, Studio expects to be deployed under the root path of a domain (e.g. https://studio.example.com/) and using a
sub-path would not work (e.g. https://example.com/studio). This can be changed by using a number of build options. You
can apply these options by exporting them as environment variable before starting the build process like this:

```sh
export OPTION=VALUE
npm run build
```

| Option                            | Example            | Description
| --------------------------------- | ------------------ | -----------
| `PUBLIC_URL`                      | `/studio`          | Path from which Studio will be served
| `REACT_APP_SETTINGS_PATH`         | `/mysettings.json` | Path from which to load the configuration
| `REACT_APP_INCLUDE_LEGAL_NOTICES` | `1`                | Set to `1` to include legal notices and information about ELAN e.V., any other value or having this variable not set will not include them. Unless you are working for ELAN e.V. there is probably no reason for you to use this variable.


## Branches

- `master` is the main development branch and targets the `develop` branch Opencast version (currently Opencast 9). New releases are mainly released from `master`.
- `production` is updates whenever a new release is published and always points to the latest release. This branch is automatically deployed to `studio.opencast.org`.
- `opencast-8` is a maintenance branch that targets Opencast 8. Only bug fixes are backported.
