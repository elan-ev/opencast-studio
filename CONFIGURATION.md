# Configuration

Opencast Studio can be configured in three different ways:

- the user can manually configure certain things on the settings page,
- the server can provide a `settings.toml` (only applicable if you deploy Studio yourself or as part of your Opencast), and
- configuration values can be given via GET parameters in the URL.

Settings configured by the user have the lowest priority and are overwritten by
both, `settings.toml` and GET parameters. GET parameters also override settings
given in `settings.toml`. Additionally, on the settings page, values that are
already preconfigured via `settings.toml` or a GET parameter are hidden from the
user.

**Backwards compatibility note:** in previous versions, `settings.toml` was
`settings.json`. JSON settings are now deprecated, but are still supported until
Studio drops support for Opencast 8. To continue using the JSON configuration
file, you have to specify `REACT_APP_SETTINGS_PATH` and it has to end with
`.json`. This is correctly set in the released versions for Opencast 8.


## Possible configuration values

The following settings are currently understood and respected by Studio. This
code block shows the TOML configuration, but all values can be specified as GET
parameter as well. See further below for information on that.

```toml
# Configuration for Opencast Studio.
#
# Is loaded by Studio in the beginning. Default path is "settings.toml"
# (relative to current URL), but can be overwritten via the environment variable
# `REACT_APP_SETTINGS_PATH` at build time.


[opencast]
# URL of the Opencast server that recordings are uploaded to. Has to include
# `https://`. If this is set to an empty string, Studio uses the domain it is
# deployed on. This mostly makes sense for Studio integrated into Opencast. If
# this value is not defined, the user can specify the server URL on the settings
# page.
#serverUrl = "https://opencast.my-university.net"

# Username of the Opencast user to authenticate as. Specifying this value in
# this configuration file is rarely useful, but it can be used if a proper user
# authentication can't be implemented and you want all Studio users to use the
# same Opencast user. This is not ideal and should be avoided, though.
#
# If this value is undefined and `loginProvided` (see below) is NOT `true`, the
# Studio user can configure the login name on the Studio settings page.
#loginName = "peter"

# Password of the Opencast user to authenticate as. See `loginName` for more
# information on when specifying this value is useful. BE AWARE that a password
# specified in the Studio configuration file is as public as your Studio
# installation: if a user can access Studio, they can access this password. As
# such, specifying a pasword in the config file should be avoided if possible.
#loginPassword = "aligator"

# If this is set to `true`, `loginPassword` and `loginName` are ignored.
# Instead, Studio assumes that the user's browser is already authenticated (via
# cookies) at the Opencast server URL. This pretty much only makes sense if
# studio is deployed on the same domain as the target Opencast server (e.g. at
# `/studio`). Default: false.
#loginProvided = true


[upload]
# The ID of the series which the recording is a part of. When uploading the
# recording, it is automatically associated with that series. This value is
# mostly passed as GET parameter; specifying it in the configuration file only
# makes sense if you want all the Studio uploads (that don't specify a series
# otherwise) to be associated with one series.
#seriesId = "979e0a0b-db25-47cd-869a-10daa1b3eb7a"

# The workflow ID used to process the recording.
#workflowId = "studio-upload"

# Defines which ACL to send when uploading the recording.
#acl = false


[recording]
# A list of preferred MIME types used by the media recorder. Studio uses the
# first MIME type in that list for which `MediaRecorder.isTypeSupported` returns
# `true`. If this is not defined, or if none of the specified MIME-types is
# supported or if the browser does not support `isTypeSupported`, then Studio
# lets the browser choose a MIME-type.
#mimes = ["video/mp4", "video/webm"]

# The target video bitrate of the recording in bits per second. Please note that
# specifying this for all users is usually a bad idea, as the video stream and
# situation is different for everyone. The resulting quality also largely
# depends on the browser's encoder.
#videoBitrate = 2000000


[review]
# Disables and hides the cutting tools from the review page when set to `true`.
# By default, this is `false`. It only makes sense to set this to `true` if your
# workflows can't handle the cutting information (SMIL file). The default Studio
# worflow in Opencast 8.4 and newer supports this.
#disableCutting = true


[display]
# Passed as `height: { max: _ }` `MediaStreamConstraint` to `getDisplayMedia`.
# Resolutions larger than that should be scaled down by the browser.
#maxHeight = 720

# Passed as `framerate: { max: _ }` `MediaStreamConstraint` to
# `getDisplayMedia`. Most browsers capture with a maximum of 30 FPS by default
# anyway, so you probably don't need this.
#maxFps = 30


[camera]
# Passed as `height: { max: _ }` `MediaStreamConstraint` to `getUserMedia`.
# Different maximum heights can affect the aspect ratio of the video.
#maxHeight = 480

# Passed as `framerate: { max: _ }` `MediaStreamConstraint` to `getUserMedia`.
# Setting this might lead to some users not being able to share their webcam!
#maxFps = 30
```


**Note**: all data configured via `settings.toml` is as public as your Studio installation. For example, if your students can access your deployed studio app, they can also see the `settings.toml`. This is particularly important if you want to preconfigure an Opencast user.

Please also note that all settings related to video capture or recording should be treated carefully. Setting any of those means that you know more than the user's browser, which is unlikely: the browser has exact information about screen resolution, connected cameras, CPU usage and the like. As such, before setting any of those values for all of your users, make sure to test everything first!


## Specifying settings via GET Parameters

GET parameters can simply be attached to the studio URL. Values specified this way overwrite values set by the user or by `settings.toml`. Example URL:

```
https://studio.opencast.org/?opencast.serverUrl=https://develop.opencast.org&upload.workflowId=studio-upload&upload.seriesId=3fe9ea49-a671-4d1e-9669-0c96ff0f8f79
```

Note that each key is a "path" like `opencast.serverUrl`. The first part of that path is the "section" in the TOML file shown above (e.g. `[opencast]`).

TODO
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


## Debugging/Help

To check if your configuration is correctly applied, you can open Studio in your browser and open the developer tools console (via F12). Studio prints the merged settings and the current state of the connection to the Opencast server there.

You can also check the "Network" tab in the browser's dev tools. There you can see where Studio tries to fetch `settings.toml` and your ACL template from and what your server returned.


### Specify ACL

With `upload.acl` you can configure which ACL is sent (as an attachment) to the Opencast server when uploading. Possible values:
- `true`: use the default ACL (this is the default behavior)
- `false`: do not send an ACL when uploading
- Path to XML template (e.g. `acl.xml` or `/config/acl.xml`). A path to an XML file specifying the ACL. If the path starts with `/` it is considered absolute on the current server and `server.url${path}` is loaded. If it doesn't start with `/`, `server.url/${PUBLIC_URL}/${path}` is loaded.

The ACL XML template is a Mustache template. The following variables are passed as view:

- `userName`: the username of the currnet user (e.g. `admin`).
- `userRole`: the user role of the current user (e.g. `ROLE_USER_ADMIN`).
- `roleOAuthUser`: `"ROLE_OAUTH_USER"` if this role is in `user.roles` or `undefined` otherwise.
- `ltiCourseId`: the `context_id` taken from the `/lti` endpoint or `undefined` if the field does not exist.
- `defaultReadRoles`: a convenience array of roles that usually have read access. Always contains `userRole`. If `ltiCourseId` is defined, also contains `"${ltiCourseId}_Learner"` and `"${ltiCourseId}_Instructor"`.
- `defaultWriteRoles`: a convenience array of roles that usually have read access. Always contains `userRole`. If `ltiCourseId` is defined, also contains `"${ltiCourseId}_Instructor"`.

The default ACL template simply gives read and write access to `userRole`:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Policy PolicyId="mediapackage-1"
  RuleCombiningAlgId="urn:oasis:names:tc:xacml:1.0:rule-combining-algorithm:permit-overrides"
  Version="2.0"
  xmlns="urn:oasis:names:tc:xacml:2.0:policy:schema:os">
  <Rule RuleId="user_read_Permit" Effect="Permit">
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
  <Rule RuleId="user_write_Permit" Effect="Permit">
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
