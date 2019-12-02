import merge from 'deepmerge';

const LOCAL_STORAGE_KEY = 'ocStudioSettings';
const CONTEXT_SETTINGS_FILE = 'settings.json';

// Responsible for obtaining settings from different places (context settings,
// local storage, query parameter) and merging them appropriately.
export class SettingsManager {
  // The settings set by the server. These cannot be edited by the user. If the
  // server did not specify any settings, this is `{}`.
  contextSettings;

  // The settings set by the user and stored in local storage. This is `null`
  // if there were no settings in local storage.
  #userSettings = null;

  // This function is called whenever the user saved their settings. The new
  // settings object is passed as parameter.
  onChange = null;

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
        self.#userSettings = {};
      }
    }

    // Try to retrieve the context settings.
    const basepath = process.env.PUBLIC_URL || '/';
    const url = `${window.location.origin}${basepath}${CONTEXT_SETTINGS_FILE}`;
    try {
      const response = await window.fetch(url);
      if (response.headers.get('Content-Type').startsWith('application/json')) {
        self.contextSettings = await response.json();
      } else {
        // No context settings were defined.
        self.contextSettings = {};
      }
    } catch (e) {
      console.warn('Could not load `settings.json`!', e);
      self.contextSettings = {};
    }

    return self;
  }

  // Stores the given `newSettings` as user settings. The given object might be
  // partial, i.e. only the new values can be specified. Values in `newSettings`
  // override values in the old user settings.
  saveSettings(newSettings) {
    this.#userSettings = merge(this.#userSettings || {}, newSettings);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.#userSettings));
    if (this.onChange) {
      this.onChange(this.settings());
    }
  }

  // The merged settings that the whole application should use.
  settings() {
    return merge(this.#userSettings, this.contextSettings);
  }

  // The values for the settings forms. These are simply the user settings with
  // missing settings filled by `defaultSettings`.
  formValues() {
    return merge(defaultSettings, this.#userSettings || {});
  }

  // Returns whether or not the initial setup dialog should be shown. This is
  // the case if there are no user settings in local storage, so we assume this
  // is the the user's first visit.
  showFirstRunSetup() {
    return this.#userSettings === null;
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
