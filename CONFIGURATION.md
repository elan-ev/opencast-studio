# Configuration

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

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Example</th>
      <th>Shown to user</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b><code>opencast.serverUrl</code></b></td>
      <td>string</td>
      <td><code>https://develop.opencast.org</code></td>
      <td>✔</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">The server that recordings are uploaded to. Has to include <code>https://</code>. If this is set to an empty string, the domain Studio is deployed on is used.</td>
    </tr>
    <tr>
      <td><b><code>opencast.loginName</code></b></td>
      <td>string</td>
      <td><code>peter</code></td>
      <td>✔</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">
        Username of the Opencast user to authenticate as.
      </td>
    </tr>
    <tr>
      <td><b><code>opencast.loginPassword</code></b></td>
      <td>string</td>
      <td><code>verysecure123</code></td>
      <td>✔</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">
        Password of the Opencast user to authenticate as.
      </td>
    </tr>
    <tr>
      <td><b><code>opencast.loginProvided</code></b></td>
      <td>boolean</td>
      <td><code>true</code></td>
      <td>✘</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">
        If this is set to <code>true</code>, <code>loginPassword</code> and <code>loginName</code> are ignored. Instead, Studio assumes that the user's browser is already authenticated (via cookies) at the Opencast server URL. This pretty much only makes sense if studio is deployed on the same domain as the target Opencast server (e.g. in the path <code>/studio</code>).
      </td>
    </tr>
    <tr>
      <td><b><code>upload.seriesId</code></b></td>
      <td>string</td>
      <td><code>3fe9ea49-a671-4d1e-9669-0c96ff0f8f79</code></td>
      <td>✘</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">
        The ID of the series which the recording is a part of. When uploading the recording, it is automatically associated with that series.
      </td>
    </tr>
    <tr>
      <td><b><code>upload.workflowId</code></b></td>
      <td>string</td>
      <td><code>fast</code></td>
      <td>✘</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">
        The workflow ID used to process the recording.
      </td>
    </tr>
    <tr>
      <td><b><code>upload.acl</code></b></td>
      <td>string or boolean</td>
      <td><code>acl.xml</code></td>
      <td>✘</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">
        Defines which ACL to send when uploading the recording. See below for more information.
      </td>
    </tr>
    <tr>
      <td><b><code>recording.mimes</code></b></td>
      <td>array of strings</td>
      <td><code>["video/mp4", "video/webm"]</code></td>
      <td>✘</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">
        A list of preferred MIME types used by the media recorder. Studio uses the first MIME type in that list for which <code>MediaRecorder.isTypeSupported</code> returns <code>true</code>. If none of the specified ones is supported or if the browser does not support <code>isTypeSupported</code>, then Studio lets the browser choose a MIME-type.
      </td>
    </tr>
    <tr>
      <td><b><code>recording.videoBitrate</code></b></td>
      <td>positive integer</td>
      <td><code>2000000</code></td>
      <td>✘</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">
        The target video bitrate of the recording in bits per second. Please note that specifying this for all users is usually a bad idea, as the video stream and situation is different for everyone. The resulting quality also largely depends on the browser's encoder.
      </td>
    </tr>
    <tr>
      <td><b><code>display.maxHeight</code></b></td>
      <td>positive integer</td>
      <td><code>1080</code></td>
      <td>✘</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">
        Passed as <code>height: { max: _ }</code> <code>MediaStreamConstraint</code> to <code>getDisplayMedia</code>. Resolutions larger than that should be scaled down by the browser.
      </td>
    </tr>
    <tr>
      <td><b><code>display.maxFps</code></b></td>
      <td>positive integer</td>
      <td><code>30</code></td>
      <td>✘</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">
        Passed as <code>framerate: { max: _ }</code> <code>MediaStreamConstraint</code> to <code>getDisplayMedia</code>. Most browsers capture with a maximum of 30 FPS by default anyway, so you might not need this.
      </td>
    </tr>
    <tr>
      <td><b><code>camera.maxHeight</code></b></td>
      <td>positive integer</td>
      <td><code>480</code></td>
      <td>✘</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">
        Passed as <code>height: { max: _ }</code> <code>MediaStreamConstraint</code> to <code>getUserMedia</code>. Different maximum heights can affect the aspect ratio of the video.
      </td>
    </tr>
    <tr>
      <td><b><code>camera.maxFps</code></b></td>
      <td>positive integer</td>
      <td><code>30</code></td>
      <td>✘</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">
        Passed as <code>framerate: { max: _ }</code> <code>MediaStreamConstraint</code> to <code>getUserMedia</code>. Setting this might lead to some users not being able to share their webcam!
      </td>
    </tr>
    <tr>
      <td><b><code>review.disableCutting</code></b></td>
      <td>boolean</td>
      <td><code>true</code></td>
      <td>✘</td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3">
        Disables and hides the cutting tools from the review page when set to <code>true</code>. By default, this is <code>false</code>. It only makes sense to set this to <code>true</code> if your workflows can't handle the cutting information (SMIL file). The default Studio worflow in Opencast 8.4 and newer supports this.
      </td>
    </tr>
  </tbody>
</table>


**Note**: all data configured via `settings.json` is as public as your Studio installation. For example, if your students can access your deployed studio app, they can also see the `settings.json`. This is particularly important if you want to preconfigure an Opencast user.

Please also note that all settings related to video capture or recording should be treated carefully. Setting any of those means that you know better than the user's browser, which is unlikely as the browser has exact information about screen resolution, connected cameras, CPU usage and the like. So before setting those for all of your users, make sure to test those settings first!


### Example `settings.json`

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

### Example GET Parameters

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


### Debugging/Help

To check if your configuration is correctly applied, you can open Studio in your browser and open the developer tools console (via F12). Studio prints the merged settings and the current state of the connection to the Opencast server there.

You can also check the "Network" tab in the browser's dev tools. There you can see where Studio tries to fetch `settings.json` and your ACL template from and what your server returned.


### Specify ACL

With `upload.acl` you can configure which ACL are sent (as an attachment) to the Opencast server when uploading. Possible values:
- `true`: use the default ACL (this is the default behavior)
- `false`: do not send an ACL when uploading
- Path to XML template (e.g. `acl.xml` or `/config/acl.xml`). A path to an XML file specifying the ACL. If the path starts with `/` it is considered absolute on the current server and `server.url${path}` is loaded. If it doesn't start with `/`, `server.url/$PUBLIC_URL/${path}` is loaded.

The ACL XML template is a Mustache template. The following variables are passed as view:

- `userName`: the username of the currnet user (e.g. `admin`)
- `userRole`: the user role of the current user (e.g. `ROLE_USER_ADMIN`)
- `roleOAuthUser`: `"ROLE_OAUTH_USER"` if this role is in `user.roles` or `undefined` otherwise
- `ltiCourseId`: the `context_id` taken from the `/lti` endpoint or `undefined` if the field does not exist.
- `defaultReadRoles`: a convenience array of roles that usually have read access. Always contains `userRole`. If `ltiCourseId` is defined, also contains `"${ltiCourseId}_Learner"` and `"${ltiCourseId}_Instructor"`.
- `defaultWriteRoles`: a convenience array of roles that usually have read access. Always contains `userRole`. If `ltiCourseId` is defined, also contains `"${ltiCourseId}_Instructor"`.

The default ACL definition template simply gives read and write access to `userRole`:

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
