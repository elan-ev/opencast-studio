//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import React, { useEffect, useState } from 'react';
import deepmerge from 'deepmerge';
import { decodeHexString } from './util';


const LOCAL_STORAGE_KEY = 'ocStudioSettings';
const CONTEXT_SETTINGS_FILE = 'settings.json';

// Responsible for obtaining settings from different places (context settings,
// local storage, query parameter) and merging them appropriately.
export class SettingsManager {
  // The settings set by the server. These cannot be edited by the user. If the
  // server did not specify any settings, this is `{}`.
  contextSettings = {};

  // These settings are given in the query part of the URL (e.g.
  // `?opencast.loginName=peter`). If there are no settings in the URL, this
  // is `{}`.
  urlSettings = {};

  // The settings set by the user and stored in local storage. This is `{}` if
  // there were no settings in local storage.
  #userSettings = {};

  // This function is called whenever the user saved their settings. The new
  // settings object is passed as parameter.
  onChange = null;

  // This constructor is mainly used for tests. Use `init()` to get an instance
  // for the real application.
  constructor(values) {
    if (values) {
      if (values.contextSettings) {
        this.contextSettings = values.contextSettings;
      }
      if (values.urlSettings) {
        this.urlSettings = values.urlSettings;
      }
      if (values.userSettings) {
        this.#userSettings = values.userSettings;
      }
    }
  }

  // Creates a new `Settings` instance by loading user settings from local
  // storage and attempting to load context settings from `/settings.json`.
  static async init() {
    let self = new SettingsManager();

    // Load the user settings from local storage
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored !== null) {
      let rawUserSettings;
      try {
        rawUserSettings = JSON.parse(stored);
      } catch {
        console.warn("Could not parse settings stored in local storage. Ignoring.");
      }
      self.#userSettings = self.validate(
        rawUserSettings,
        false,
        'from local storage user settings',
      );
    }

    const rawContextSettings = await SettingsManager.loadContextSettings() || {};;
    self.contextSettings = self.validate(rawContextSettings, false, 'specified in \'settings.json\'');

    // Get settings from URL query.
    const urlParams = new URLSearchParams(window.location.search);

    let rawUrlSettings = {};
    if (urlParams.get('config')) {
      // In this case, the GET parameter `config` is specified. We now expect a
      // hex encoded stringified JSON object describing the configuration. This
      // is possible in cases where special characters in GET parameters might
      // get modified somehow (e.g. by an LMS). A config=hexstring only uses
      // the most basic characters, so it should always work.

      const encoded = urlParams.get('config');
      try {
        const decoded = decodeHexString(encoded);
        rawUrlSettings = JSON.parse(decoded);
      } catch (e) {
        console.warn(
          `Could not decode and parse hex-encoded JSON string given to GET parameter `
          + `'config'. Ignoring. Error:`,
          e,
        );
      }

      for (const key of urlParams.keys()) {
        if (key !== 'config') {
          console.warn(
            `URL GET parameter '${key}' is ignored as 'config' is specified. Either specify `
            + ` all configuration via the 'config' GET parameter hex string or via direct GET `
            + `parameters. Mixing is not allowed.`
          );
        }
      }
    } else {
      // Interpret each get parameter as single configuration value.
      for (let [key, value] of urlParams) {
        // Create empty objects for full path (if the key contains '.') and set
        // the value at the end.
        let obj = rawUrlSettings;
        const segments = key.split('.');
        segments.slice(0, -1).forEach((segment) => {
          if (!(segment in obj)) {
            obj[segment] = {};
          }
          obj = obj[segment];
        });
        obj[segments[segments.length - 1]] = value;
      }
    }

    self.urlSettings = self.validate(rawUrlSettings, true, 'given as URL GET parameter');

    // We have to do some special treatment of the `upload.acl` property. Users
    // cannot set this setting, so we only have to check urlSettings and
    // contextSettings.
    if (typeof self.urlSettings.upload?.acl !== 'undefined') {
      await SettingsManager.fetchAcl(self.urlSettings.upload);
    } else if (typeof self.contextSettings.upload?.acl !== 'undefined') {
      await SettingsManager.fetchAcl(self.contextSettings.upload);
    }

    return self;
  }

  // Attempts to loads `settings.json`. If it fails for some reason, returns
  // `null` and prints an appropriate message on console.
  static async loadContextSettings() {
    // Try to retrieve the context settings.
    let basepath = process.env.PUBLIC_URL || '/';
    if (!basepath.endsWith('/')) {
      basepath += '/';
    }

    // Construct path to settings JSON file. If the `REACT_APP_SETTINGS_PATH` is
    // given and starts with '/', it is interpreted as absolute path from the
    // server root.
    const settingsPath = process.env.REACT_APP_SETTINGS_PATH || CONTEXT_SETTINGS_FILE;
    const base = settingsPath.startsWith('/') ? '' : basepath;
    const url = `${window.location.origin}${base}${settingsPath}`;
    let response;
    try {
      response = await fetch(url);
    } catch (e) {
      console.warn('Could not access `settings.json` due to network error!', e || "");
      return null;
    }

    if (response.status === 404) {
      // If `settings.json` was not found, we silently ignore the error. We
      // expecet many installation to now provide this file.
      console.debug("`settings.json` returned 404: ignoring");
      return null;
    } else if (!response.ok) {
      console.error(
        `Fetching 'settings.json' failed: ${response.status} ${response.statusText}`
      );
      return null;
    }

    if (!response.headers.get('Content-Type').startsWith('application/json')) {
      console.warn(
        "'settings.json' request does not have 'Content-Type: application/json' -> ignoring..."
      );
      return null;
    }

    try {
      return await response.json();
    } catch(e) {
      console.error("Could not parse 'settings.json': ", e);
      throw new SyntaxError(`Could not parse 'settings.json': ${e}`);
    }
  }

  static async fetchAcl(uploadSettings) {
    if (uploadSettings.acl === 'false' || uploadSettings.acl === false) {
      uploadSettings.acl = false;
      return;
    } else if (typeof uploadSettings.acl === 'string') {
      // Try to retrieve the context settings.
      let basepath = process.env.PUBLIC_URL || '/';
      if (!basepath.endsWith('/')) {
        basepath += '/';
      }

      // Construct path to settings XML file. If the `uploadSettings.acl`
      // starts with '/', it is interpreted as absolute path from the server
      // root.
      const base = uploadSettings.acl.startsWith('/') ? '' : basepath;
      const url = `${window.location.origin}${base}${uploadSettings.acl}`;

      // Try to download ACL template file
      let response;
      try {
        response = await fetch(url);
      } catch (e) {
        console.error(
          `Could not access ACL template '${url}' due to network error! Using default ACLs.`,
          e || "",
        );
        uploadSettings.acl = true;
        return;
      }

      // Check for 404 error
      if (response.status === 404) {
        console.error(`ACL template '${url}' returned 404! Using default ACLs`);
        uploadSettings.acl = true;
        return;
      } else if (!response.ok) {
        console.error(
          `Fetching ACL template '${url}' failed: ${response.status} ${response.statusText}`
        );
        uploadSettings.acl = true;
        return;
      }

      // Warn if the content type of the request is unexpected. We still use the
      // response as, opposed to `settings.xml`, the path is explicitly set.
      const contentType = response.headers.get('Content-Type');
      if (!contentType.startsWith('application/xml') && !contentType.startsWith('text/xml')) {
        console.warn(
          `ACL template request '${url}' does not have 'Content-Type: application/xml' or 'Content-Type: text/xml'. `
          + `This could be a bug. Using the response as ACL template anyway.`
        );
      }

      // Finally, set the setting to the template string.
      uploadSettings.acl = await response.text();
    } else {
      uploadSettings.acl = true;
      console.warn(
        `'upload.acl' has invalid value (has to be 'false' or a path to an XML `
        + `template file. Using default ACLs.`
      );
      return;
    }
  }

  // Stores the given `newSettings` as user settings. The given object might be
  // partial, i.e. only the new values can be specified. Values in `newSettings`
  // override values in the old user settings.
  saveSettings(newSettings) {
    this.#userSettings = merge(this.#userSettings, newSettings);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.#userSettings));
    if (this.onChange) {
      this.onChange(this.settings());
    }
  }

  // The merged settings that the whole application should use.
  settings() {
    return merge.all([this.#userSettings, this.contextSettings, this.urlSettings]);
  }

  // The values for the settings forms. These are simply the user settings with
  // missing settings filled by `defaultSettings`.
  formValues() {
    return merge(defaultSettings, this.#userSettings);
  }

  fixedSettings() {
    return merge(this.contextSettings, this.urlSettings);
  }

  // Returns whether a specific setting is configurable by the user. It is not
  // if the setting is fixed by the context setting or an URL setting. The path
  // is given as string. Example: `manager.isConfigurable('opencast.loginName')`
  isConfigurable(path) {
    let obj = this.fixedSettings();
    const segments = path.split('.');
    for (const segment of segments) {
      if (!(segment in obj)) {
        return true;
      }
      obj = obj[segment];
    }

    return false;
  }

  isUsernameConfigurable() {
    return this.isConfigurable('opencast.loginName')
      && this.fixedSettings().opencast?.loginProvided !== true;
  }
  isPasswordConfigurable() {
    return this.isConfigurable('opencast.loginPassword')
      && this.fixedSettings().opencast?.loginProvided !== true;
  }

  // Validate the given `obj` with the global settings `SCHEMA`. If `allowParse`
  // is true, string values are attempted to parse into the expected type.
  // `source` is just a string for error messages specifying where `obj` comes
  // from.
  validate(obj, allowParse, source) {
    const parseBoolean = (s, path) => {
      switch (s) {
        case 'true':
          return true;

        case 'false':
          return false;

        default:
          console.warn(
            `Settings value '${path}' (${source}) can't be parsed as 'boolean' `
            + ` (value: '${s}'). Ignoring.`
          );
          return null;
      }
    };

    const parseInteger = (s, path) => {
      if (/^[-+]?(\d+)$/.test(s)) {
        return Number(s);
      } else {
        console.warn(
          `Settings value '${path}' (${source}) can't be parsed as integer `
          + `(value: '${s}'). Ignoring.`
        );
        return null;
      }
    };

    const parseArray = (s, path) => {
      try {
        const parsed = JSON.parse(s);
        if (!Array.isArray(parsed)) {
          console.warn(
            `Settings value '${path}' (${source}) is not an 'array' (value: '${s}'). Ignoring.`
          );
          return null;
        }

        return parsed;
      } catch {
        console.warn(
          `Settings value '${path}' (${source}) can't be parsed as its `
          + `expected type 'array' (value: '${s}'). Ignoring.`
        );
        return null;
      }
    };

    // Validates `obj` with `schema`. `path` is the current path used for error
    // messages.
    const validate = (schema, obj, path) => {
      if (typeof schema === 'string' || typeof schema._type === 'string') {
        return validateValue(schema, obj, path);
      } else {
        return validateObj(schema, obj, path);
      }
    };

    // Validate a settings value. `schema` should either be a string specifying
    // the expected type or an object with these fields:
    //
    // - `_type`: a string specifying the expected type
    // - `_validate` (optional): a function returning either `true` (validation
    //   successful) or a string (validation error).
    // - `_elements`: Only if `_type` is 'array'! Specifies type and validation
    //   function for array elements. Object with fields `_type` and optionally
    //   `_validate`.
    const validateValue = (schema, value, path) => {
      // Check the type of this value.
      const expectedType = typeof schema === 'string' ? schema : schema._type;
      let actualType;
      if (Array.isArray(value)) {
        actualType = 'array';
      } else if (Number.isInteger(value)) {
        actualType = 'int';
      } else {
        actualType = typeof value;
      }

      let out = null;
      if (expectedType === 'any' || actualType === expectedType) {
        out = value;
      } else {
        if (actualType === 'string' && allowParse) {
          switch (expectedType) {
            case 'boolean': out = parseBoolean(value, path); break;
            case 'int': out = parseInteger(value, path); break;
            case 'array': out = parseArray(value, path); break;
            default:
              console.warn(`internal bug: unknown type ${expectedType}. Ignoring ${path}.`);
          }
        } else {
          console.warn(
            `Settings value '${path}' (${source}) should be of type '${expectedType}', but is `
            + `'${actualType}' (${value}). Ignoring.`
          );
        }
      }

      // Check type of array elements and validate those.
      if (Array.isArray(out) && typeof schema === 'object' && '_elements' in schema) {
        const expectedElementType = typeof schema._elements === 'string'
          ? schema._elements
          : schema._elements._type;

        for (const elem of out) {
          if (typeof elem !== expectedElementType) {
            console.warn(
              `Some elements of array value '${path}' (${source}) are not of type `
              + `'${expectedElementType}'. Ignoring complete array.`
            );
            return null;
          }

          if (typeof schema._elements === 'object' && '_validate' in schema._elements) {
            const validateResult = schema._elements._validate(elem);
            if (validateResult !== true) {
              console.warn(
                `Validation of one element in array setting value '${path}' (${source}) `
                + `failed: ${validateResult}. Ignoring complete array.`
              );
              return null;
            }
          }
        }
      }

      // Run validation function if the type was correct and a validation is
      // specified.
      if (out !== null && typeof schema === 'object' && '_validate' in schema) {
        const validateResult = schema._validate(out);
        if (validateResult !== true) {
          console.warn(
            `Validation of setting value '${path}' (${source}) failed: ${validateResult}. `
            + `Ignoring.`
          );
          return null;
        }
      }

      return out;
    };

    // Validate a settings object/namespace. `schema` and `obj` need to be
    // objects.
    const validateObj = (schema, obj, path) => {
      // We iterate through all keys of the given settings object, checking if
      // each key is valid and recursively validating the value of that key.
      let out = {};
      for (const key of Object.keys(obj)) {
        const newPath = path ? `${path}.${key}` : key;
        if (key in schema) {
          const value = validate(schema[key], obj[key], newPath);

          // If `null` is returned, the validation failed and we ignore this
          // value.
          if (value !== null) {
            out[key] = value;
          }
        } else {
          console.warn(
            `'${newPath}' (${source}) is not a valid settings key. Ignoring.`
          );
        }
      }

      return out;
    };

    return validate(SCHEMA, obj, "");
  }
}


export const validateServerUrl = value => {
  if (value === '/' || value === '') {
    return true;
  }

  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:')
      || 'the URL does not start with "http:" or "https:"';
  } catch (e) {
    return 'not a valid URL';
  }
};


const defaultSettings = {
  opencast: {
    serverUrl: 'https://develop.opencast.org/',
    loginName: 'admin',
    loginPassword: 'opencast',
  }
};

const positiveInteger = name => ({
  _type: 'int',
  _validate: i => i > 0 || `'${name}' has to be positive, but is '${i}'`,
});

// Defines all potential settings and their types
const SCHEMA = {
  opencast: {
    serverUrl: {
      _type: 'string',
      _validate: validateServerUrl,
    },
    loginName: 'string',
    loginPassword: 'string',
    loginProvided: 'boolean',
  },
  upload: {
    enableSeries: 'string',
    seriesId: 'string',
    workflowId: 'string',
    // This gets some special treatment in `fetchAcl`. After `fetchAcl` is
    // done, this one of:
    // - undefined: setting was not set.
    // - `false`: do not send any ACLs when uploading
    // - `true`: explictely send default ACLs when uploading (this is the default behavior)
    // - ACL template string: already fetched ACL template string.
    acl: {
      _type: 'any',
      _validate: v => (
        v === false || typeof v === 'string' || `'upload.acl' needs to be 'false' or a string`
      ),
    },
  },
  recording: {
    videoBitrate: positiveInteger('bitrate'),
    mimes: {
      _type: 'array',
      _elements: {
        _type: 'string',
      }
    },
  },
  'display': {
    maxFps: positiveInteger('display.maxFps'),
    maxHeight: positiveInteger('display.maxHeight'),
  },
  'camera': {
    maxFps: positiveInteger('camera.maxFps'),
    maxHeight: positiveInteger('camera.maxHeight'),
  },
};


// Custumize array merge behavior
let merge = (a, b) => {
  return deepmerge(a, b, { arrayMerge });
};
merge.all = array => deepmerge.all(array, { arrayMerge })
const arrayMerge = (destinationArray, sourceArray, options) => sourceArray;


const Context = React.createContext(null);

// Returns the current provided Opencast instance.
export const useSettings = () => React.useContext(Context);

export const Provider = ({ settingsManager, children }) => {
  const [settings, updateSettings] = useState(settingsManager.settings());
  settingsManager.onChange = newSettings => updateSettings(newSettings);

  // This debug output will be useful for future debugging sessions.
  useEffect(() => {
    console.debug("Current settings: ", settings);
  });

  return (
    <Context.Provider value={settings}>
      {children}
    </Context.Provider>
  );
};
