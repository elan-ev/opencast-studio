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
| Win10   | Chrome 77  | ✔   | ✔ | ✔   |
| Win10   | Firefox 68 | ✔   | ✔ | ✔   |
| Win10   | Edge 79    | ✔   | ✔ | ✔   |
| Linux   | Chrome 77  | ✔   | ✔ | ✔   |
| Linux   | Firefox 68 | ✔   | ✔ | ✔   |
| MacOS   | Firefox 70 | ✔   | ✔ | ✔   |
| MacOS   | Chrome 78  | ✔   | ✔ | ✔   | Video file does not allow seeking
| MacOS   | Safari 13  | ✔   | ✘ | ✘   | Recording seems to fail due to unsupported MIME type
| Android | Firefox 68 | ✔   | ✘ | ✔   |
| Android | Chrome 78  | (✔) | ✘ | ✔   | No camera selection. See [issue #217](https://github.com/elan-ev/opencast-studio/issues/217)
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

Opencast Studio can be configured in three different ways:

- the user can manually configure certain things on the settings page,
- the server can provide a `settings.json` (only applicable if you deploy Studio yourself), and
- configuration values can be given via GET parameters in the URL.

Settings configured by the user have the lowest priority and are overwritten by
both, `settings.json` and GET parameters. GET parameters also override settings
given in `settings.json`. Additionally, on the settings page, values that are
already preconfigured via `settings.json` or a GET parameter are hidden from the
user.

The following settings are currently understood by Studio. The column "shown to user" means whether or not the user can configure this value on the settings page (only if this value is not configured via `settings.json` or a GET parameter, of course).

| Name | Example | Shown to user | Notes |
| ---- | ------- | ---------------------- | ----- |
| `opencast.serverUrl` | `https://develop.opencast.org` | ✔ | The server that recordings are uploaded to. Has to include `https://`. If this is set to an empty string, the domain Studio is deployed on is used. |
| `opencast.loginName` | `peter` | ✔ | Username of the Opencast user to authenticate as |
| `opencast.loginPassword` | `verysecure123` | ✔ | Password of the Opencast user to authenticate as |
| `opencast.loginProvided` | `true` | ✘ | If this is set to `true`, `loginPassword` and `loginName` are ignored. Instead, Studio assumes that the user's browser is already authenticated (via cookies) at the Opencast server URL. This pretty much only makes sense if studio is deployed on the same domain as the target Opencast server (e.g. in the path `/studio`). |
| `upload.seriesId` | `3fe9ea49-a671-4d1e-9669-0c96ff0f8f79` | ✘ | The ID of the series which the recording is a part of. When uploading the recording, it is automatically associated with that series. |
| `upload.workflowId` | `fast` | ✘ | The workflow ID used to process the recording. |
| `upload.acl` | `acl.xml` | ✘ | Defines which ACL to send when uploading the recording. See below for more information. |
| `recording.mimes` | `["video/mp4", "video/webm"]` | ✘ | A list of preferred MIME types used by the media recorder. Studio uses the first MIME type in that list for which `MediaRecorder.isTypeSupported` returns `true`. If none of the specified ones is supported or if the browser does not support `isTypeSupported`, then Studio lets the browser choose a MIME-type. |
| `recording.videoBitrate` | `2000000` | ✘ | The target video bitrate of the recording in bits per second. Please note that specifying this for all users is usually a bad idea, as the video stream and situation is different for everyone. The resulting quality also largely depends on the browser's encoder. |
| `display.maxHeight` | `1080` | ✘ | Passed as `height: { max: _ }` `MediaStreamConstraint` to `getDisplayMedia`. Resolutions larger than that should be scaled down by the browser. |
| `display.maxFps` | `30` | ✘ | Passed as `framerate: { max: _ }` `MediaStreamConstraint` to `getDisplayMedia`. Most browsers capture with a maximum of 30 FPS by default anyway, so you might not need this. |
| `camera.maxHeight` | `480` | ✘ | Passed as `height: { max: _ }` `MediaStreamConstraint` to `getUserMedia`. Different maximum heights can affect the aspect ratio of the video. |
| `camera.maxFps` | `30` | ✘ | Passed as `framerate: { max: _ }` `MediaStreamConstraint` to `getUserMedia`. Setting this might lead to some users not being able to share their webcam! |

**Note**: all data configured via `settings.json` is as public as your Studio installation. For example, if your students can access your deployed studio app, they can also see the `settings.json`. This is particularly important if you want to preconfigure an Opencast user.

Please also note that all settings related to video capture or recording should be treated carefully. Setting any of those means that you know better than the user's browser, which is unlikely as the browser has exact information about screen resolution, connected cameras, CPU usage and the like. So before setting those for all of your users, make sure to test those settings first!


#### Example `settings.json`

```json
{
  "opencast": {
    "serverUrl": "https://develop.opencast.org"
  },
  "upload": {
    "workflowId": "fast",
    "seriesId": "3fe9ea49-a671-4d1e-9669-0c96ff0f8f79",
  }
}
```

#### Example GET Parameters

GET parameters can simply be attached to the studio URL if the form `…/?option1=value1&option2=value2&…`.
They are an easy way to provide a link with specific settings to someone.
An example of such a link would be:

```
https://studio.opencast.org/?opencast.serverUrl=https://develop.opencast.org&upload.workflowId=fast&upload.seriesId=3fe9ea49-a671-4d1e-9669-0c96ff0f8f79
```

You can also include your configuration in a JSON object, encode it as UTF-8 string then encode that as hex string and pass it with the `config=` GET parameter. This might help to avoid problems if URLs (and thus the GET parameters) are processed (e.g. by an LMS) in a way that modifies special characters. For example:

- Stringified JSON: `{"opencast":{"loginProvided":true}}`
- Encoded as hex string:
  ```
  7B226F70656E63617374223A7B226C6F67696E50726F7669646564223A747275657D7D
  ```
- Pass to Studio:
  ```
  https://studio.opencast.org?config=7B226F70656E63617374223A7B226C6F67696E50726F7669646564223A747275657D7D
  ```

You can encode your JSON string as hex string with [this tool](https://onlineutf8tools.com/convert-utf8-to-hexadecimal), for example. Be sure to disable the options "Use Hex Radix Prefix" and "Use Extra Spacing".

Note that this can't be used with other GET parameters. If `config=` is specified, all other parameters are ignored.


#### Debugging/Help

To check if your configuration is correctly applied, you can open Studio in your browser and open the developer tools console (via F12). Studio prints the merged settings and the current state of the connection to the Opencast server there.


#### Specify ACL

With `upload.acl` you can configure which ACL are sent (as an attachment) to the Opencast server when uploading. Possible values:
- `true`: use the default ACL (this is the default behavior)
- `false`: do not send an ACL when uploading
- Path to XML template (e.g. `acl.xml` or `/config/acl.xml`). A path to an XML file specifying the ACL. If the path starts with `/` it is considered absolute on the current server and `server.url${path}` is loaded. If it doesn't start with `/`, `server.url/$PUBLIC_URL/${path}` is loaded.

The ACL XML template is a Mustache template. The following variables are passed as view:

- `userName`: the username of the currnet user (e.g. `admin`)
- `userRole`: the user role of the current user (e.g. `ROLE_USER_ADMIN`)
- `roleOAuthUser`: `"ROLE_OAUTH_USER"` if this role is in `user.roles` or `undefined` otherwise
- `ltiCourseId`: the LTI course ID extracted from user roles that end with `_Learner` or `_Instructor`. `undefined` if no such roles are within `user.roles`.
- `defaultReadRoles`: a convenience array of roles that usually have read access. Always contains `userRole`. If `ltiCourseId` is defined, also contains `"${ltiCourseId}_Learner"` and `"${ltiCourseId}_Instructor"`.
- `defaultWriteRoles`: a convenience array of roles that usually have read access. Always contains `userRole`. If `ltiCourseId` is defined, also contains `"${ltiCourseId}_Instructor"`.

The default ACL definition template simply gives read and write access to `userRole`:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Policy PolicyId="mediapackage-1"
  RuleCombiningAlgId="urn:oasis:names:tc:xacml:1.0:rule-combining-algorithm:permit-overrides"
  Version="2.0"
  xmlns="urn:oasis:names:tc:xacml:2.0:policy:schema:os">
  <Rule RuleId="Administrator_read_Permit" Effect="Permit">
    <Target>
      <Actions>
        <Action>
          <ActionMatch MatchId="urn:oasis:names:tc:xacml:1.0:function:string-equal">
            <AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">read</AttributeValue>
            <ActionAttributeDesignator AttributeId="urn:oasis:names:tc:xacml:1.0:action:action-id"
              DataType="http://www.w3.org/2001/XMLSchema#string"/>
          </ActionMatch>
        </Action>
      </Actions>
    </Target>
    <Condition>
      <Apply FunctionId="urn:oasis:names:tc:xacml:1.0:function:string-is-in">
        <AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">{{ userRole }}</AttributeValue>
        <SubjectAttributeDesignator AttributeId="urn:oasis:names:tc:xacml:2.0:subject:role"
          DataType="http://www.w3.org/2001/XMLSchema#string"/>
      </Apply>
    </Condition>
  </Rule>
  <Rule RuleId="Administrator_write_Permit" Effect="Permit">
    <Target>
      <Actions>
        <Action>
          <ActionMatch MatchId="urn:oasis:names:tc:xacml:1.0:function:string-equal">
            <AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">write</AttributeValue>
            <ActionAttributeDesignator AttributeId="urn:oasis:names:tc:xacml:1.0:action:action-id"
              DataType="http://www.w3.org/2001/XMLSchema#string"/>
          </ActionMatch>
        </Action>
      </Actions>
    </Target>
    <Condition>
      <Apply FunctionId="urn:oasis:names:tc:xacml:1.0:function:string-is-in">
        <AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">{{ userRole }}</AttributeValue>
        <SubjectAttributeDesignator AttributeId="urn:oasis:names:tc:xacml:2.0:subject:role"
          DataType="http://www.w3.org/2001/XMLSchema#string"/>
      </Apply>
    </Condition>
  </Rule>
</Policy>
```


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

| Option                    | Example            | Description
| ------------------------- | ------------------ | -----------
| `PUBLIC_URL`              | `/studio`          | Path from which Studio will be served
| `REACT_APP_SETTINGS_PATH` | `/mysettings.json` | Path from which to load the configuration
