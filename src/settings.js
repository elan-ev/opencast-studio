import axios from 'axios';
import merge from 'deepmerge';


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
      try {
        self.#userSettings = JSON.parse(stored);
      } catch {
        console.warn("Could not parse settings stored in local storage. Ignoring.");
      }
    }

    // Try to retrieve the context settings.
    const basepath = process.env.PUBLIC_URL || '/';
    const url = `${window.location.origin}${basepath}${CONTEXT_SETTINGS_FILE}`;
    try {
      const response = await axios.get(url);
      const contentType = response.headers['Content-Type'];
      if (!contentType || contentType.startsWith('application/json')) {
        self.contextSettings = response.data;
      }
    } catch (e) {
      if (e) {
        console.warn('Could not load `settings.json`!', e);
      }
    }

    // Get settings from URL query.
    const urlParams = new URLSearchParams(window.location.search);
    for (let [key, value] of urlParams) {
      // Create empty objects for full path (if the key contains '.') and set
      // the value at the end.
      let obj = self.urlSettings;
      const segments = key.split('.');
      segments.slice(0, -1).forEach((segment) => {
        obj[segment] = {};
        obj = obj[segment];
      });
      obj[segments[segments.length - 1]] = value;
    }

    return self;
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

  // Returns whether a specific setting is fixed by the context setting or an
  // URL setting. The path is given as string.
  // Example: `manager.isFixed('opencast.loginName')`
  isFixed(path) {
    let obj = merge(this.contextSettings, this.urlSettings);
    const segments = path.split('.');
    for (const segment of segments.slice(0, -1)) {
      if (!(segment in obj)) {
        return false;
      }
      obj = obj[segment];
    }

    return segments[segments.length - 1] in obj;
  }
}

const defaultSettings = {
  opencast: {
    serverUrl: 'https://develop.opencast.org/',
    workflowId: 'fast',
    loginName: 'admin',
    loginPassword: 'opencast',
  }
};
