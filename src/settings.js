//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import React, { useEffect, useState } from 'react';
import deepmerge from 'deepmerge';
import parseToml from '@iarna/toml/parse-string';
import { decodeHexString } from './util';


const LOCAL_STORAGE_KEY = 'ocStudioSettings';
const CONTEXT_SETTINGS_FILE = 'settings.toml';

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
  // storage and attempting to load context settings from the server..
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

    const rawContextSettings = await SettingsManager.loadContextSettings() || {};
    self.contextSettings = self.validate(rawContextSettings, false, 'from server settings file');

    // Get settings from URL query.
    const urlParams = new URLSearchParams(window.location.search);

    let rawUrlSettings = {};
    if (urlParams.get('config')) {
      // In this case, the GET parameter `config` is specified. We now expect a
      // hex encoded TOML file describing the configuration. This is possible in
      // cases where special characters in GET parameters might get modified
      // somehow (e.g. by an LMS). A config=hexstring only uses the most basic
      // characters, so it should always work.

      const encoded = urlParams.get('config');
      let decoded;
      try {
        decoded = decodeHexString(encoded);
      } catch (e) {
        console.warn(
          `Could not decode hex-encoded string given to GET parameter 'config'. Ignoring. Error:`,
          e,
        );
      }

      try {
        rawUrlSettings = parseToml(decoded);
      } catch (e) {
        console.warn(
          `Could not parse (as TOML) decoded hex-string given to GET parameter 'config'. `
            + `Ignoring. Error:`,
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

    return self;
  }

  // Attempts to load `settings.toml` (or REACT_APP_SETTINGS_PATH is that's
  // specified) from the server. If it fails for some reason, returns `null` and
  // prints an appropriate message on console.
  static async loadContextSettings() {
    // Try to retrieve the context settings.
    let basepath = process.env.PUBLIC_URL || '/';
    if (!basepath.endsWith('/')) {
      basepath += '/';
    }

    // Construct path to settings file. If the `REACT_APP_SETTINGS_PATH` is
    // given and starts with '/', it is interpreted as absolute path from the
    // server root.
    const settingsPath = process.env.REACT_APP_SETTINGS_PATH || CONTEXT_SETTINGS_FILE;
    const base = settingsPath.startsWith('/') ? '' : basepath;
    const url = `${window.location.origin}${base}${settingsPath}`;
    let response;
    try {
      response = await fetch(url);
    } catch (e) {
      console.warn(`Could not access '${settingsPath}' due to network error!`, e || "");
      return null;
    }

    if (response.status === 404) {
      // If the settings file was not found, we silently ignore the error. We
      // expect many installation to provide this file.
      console.debug(`'${settingsPath}' returned 404: ignoring`);
      return null;
    } else if (!response.ok) {
      console.error(
        `Fetching '${settingsPath}' failed: ${response.status} ${response.statusText}`
      );
      return null;
    }

    if (response.headers.get('Content-Type')?.startsWith('text/html')) {
      console.warn(`'${settingsPath}' request has 'Content-Type: text/html' -> ignoring...`);
      return null;
    }

    try {
      return parseToml(await response.text());
    } catch (e) {
      console.error(`Could not parse '${settingsPath}' as TOML: `, e);
      throw new SyntaxError(`Could not parse '${settingsPath}' as TOML: ${e}`);
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
    // Validates `obj` with `schema`. `path` is the current path used for error
    // messages.
    const validate = (schema, obj, path) => {
      if (typeof schema === 'function') {
        return validateValue(schema, obj, path);
      } else {
        return validateObj(schema, obj, path);
      }
    };

    // Validate a settings value with a validation function. Returns the final
    // value of the setting or `null` if it should be ignored.
    const validateValue = (validation, value, path) => {
      try {
        const newValue = validation(value, allowParse);
        return newValue === undefined ? value : newValue;
      } catch (e) {
        console.warn(
          `Validation of setting '${path}' (${source}) with value '${value}' failed: `
            + `${e}. Ignoring.`
        );
        return null;
      }
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


// The values prefilled on the settings page. These settings are *not* used
// automatically, they are just the defaults for the UI.
const defaultSettings = {
  opencast: {
    serverUrl: 'https://develop.opencast.org/',
    loginName: 'admin',
    loginPassword: 'opencast',
  },
};

// Validation functions for different types.
const types = {
  'string': (v, allowParse) => {
    if (typeof v !== 'string') {
      throw new Error("is not a string, but should be");
    }
  },
  'int': (v, allowParse) => {
    if (Number.isInteger(v)) {
      return v;
    }

    if (allowParse) {
      if (/^[-+]?(\d+)$/.test(v)) {
        return Number(v);
      }

      throw new Error("can't be parsed as integer");
    } else {
      throw new Error("is not an integer");
    }
  },
  'boolean': (v, allowParse) => {
    if (typeof v === 'boolean') {
      return;
    }

    if (allowParse) {
      if (v === 'true') {
        return true;
      }
      if (v === 'false') {
        return false;
      }
      throw new Error("can't be parsed as boolean");
    } else {
      throw new Error("is not a boolean");
    }
  },
  positiveInteger: (v, allowParse) => {
    let i = types.int(v, allowParse);
    if (i <= 0) {
      throw new Error("has to be positive, but isn't");
    }

    return i;
  },
  "array": elementType => {
    return (v, allowParse) => {
      if (typeof v === 'string' && allowParse) {
        try {
          v = JSON.parse(v);
        } catch {
          throw new Error("can't be parsed as array");
        }
      }

      if (!Array.isArray(v)) {
        throw new Error("is not an array");
      }

      return v.map(element => {
        try {
          const newValue = elementType(element, allowParse);
          return newValue === undefined ? element : newValue;
        } catch (err) {
          throw new Error(`failed to validate element '${element}' of array: ${err}`);
        }
      });
    };
  },
};

// Defines all potential settings and their types.
//
// Each setting value has to be a validation function. Such a function takes two
// arguments: the input value `v` and the boolean `allowParse` which specifies
// whether the input might be parsed into the correct type (this is only `true`
// for GET parameters). The validation should throw an error if the input value
// is not valid for the setting. If the function returns `undefined`, the input
// value is valid and used. If the validator returns a different value, the
// input is valid, but is replaced by that new value. See the `types` object
// above for some examples.
const SCHEMA = {
  opencast: {
    serverUrl: v => {
      types.string(v);

      if (v === '/' || v === '') {
        return;
      }

      const url = new URL(v);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        throw new Error('the URL does not start with "http:" or "https:"');
      }

      // TODO: we could return the `URL` here or do other adjustments
    },
    loginName: types.string,
    loginPassword: types.string,
    loginProvided: types.boolean,
  },
  upload: {
    seriesId: types.string,
    workflowId: types.string,
    // This gets some special treatment in `fetchAcl`. After `fetchAcl` is
    // done, this one of:
    // - undefined: setting was not set.
    // - `false`: do not send any ACLs when uploading
    // - `true`: explictely send default ACLs when uploading (this is the default behavior)
    // - ACL template string: already fetched ACL template string.
    acl: (v, allowParse) => {
      if ((allowParse && v === 'false') || v === false) {
        return false;
      }
      if ((allowParse && v === 'true') || v === true) {
        return true;
      }

      if (typeof v === 'string') {
        return;
      }

      throw new Error("needs to be 'true', 'false' or a string");
    },
  },
  recording: {
    videoBitrate: types.positiveInteger,
    mimes: types.array(types.string),
  },
  review: {
    disableCutting: types.boolean,
  },
  display: {
    maxFps: types.positiveInteger,
    maxHeight: types.positiveInteger,
  },
  camera: {
    maxFps: types.positiveInteger,
    maxHeight: types.positiveInteger,
  },
  return: {
    label: types.string,
    target: (v, allowParse) => {
      types.string(v, allowParse);
      if (!(v.startsWith('/') || v.startsWith('http'))) {
        throw new Error(`has to start with '/' or 'http'`);
      }
    },
  },
};


// Customize array merge behavior
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
