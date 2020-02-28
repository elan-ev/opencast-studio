//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import React, { useEffect, useState } from 'react';
import equal from 'fast-deep-equal';


// The server URL was not specified.
export const STATE_UNCONFIGURED = 'unconfigured';

// The OC server is reachable but a login was not attempted and the current user
// is anonymous.
export const STATE_CONNECTED = 'connected';

// The OC server is reachable and the user is authenticated.
export const STATE_LOGGED_IN = 'logged_in';

// Some network error occured when accessing the server.
export const STATE_NETWORK_ERROR = 'network_error';

// When accessing the OC API, the request returned as non-2xx code unexpectedly.
// This likely indicates that the server is not actually a valid OC server.
export const STATE_RESPONSE_NOT_OK = 'response_not_ok';

// The API requested returned invalid JSON or unexpected data.
export const STATE_INVALID_RESPONSE = 'invalid_response';

// The server is reachable and a login was provided, but the login did not
// succeed.
export const STATE_INCORRECT_LOGIN = 'incorrect_login';


export class Opencast {
  #state = STATE_UNCONFIGURED;
  #serverUrl = null;
  #workflowId = null;

  // This can one of either:
  // - `null`: no login is provided and login data is not specified
  // - `true`: a login is already automatically provided from the OC context
  // - `{ username, password }`: username and password are given
  #login = null;

  // The response of `info/me.json` or `null` if requesting that API did not
  // succeed.
  #currentUser = null;

  updateGlobalOc = null;


  // Creates a new instance. Static method instead of constructor because it
  // needs to be async.
  static async init(settings) {
    let self = new Opencast();

    if (!settings.serverUrl) {
      self.#state = STATE_UNCONFIGURED;
      self.#serverUrl = null;
      self.#workflowId = null;
      self.#login = null;

      return;
    }

    self.#serverUrl = settings.serverUrl.endsWith('/')
      ? settings.serverUrl.slice(0, -1)
      : settings.serverUrl;
    self.#workflowId = settings.workflowId;

    if (settings.loginProvided === true) {
      // Here we can assume Studio is running within an Opencast instance and
      // the route to Studio is protected via login. This means that login
      // cookies are already present and we don't need to worry about that.
      self.#login = true;
    } else if (settings.loginName && settings.loginPassword) {
      // Studio is not running in OC context, but username and password are
      // provided.
      self.#login = {
        username: settings.loginName,
        password: settings.loginPassword,
      };
    } else {
      // Login is not yet provided.
      self.#login = null;
    }

    await catchRequestError(async () => {
      // If the user wants to login via username/password, we need to do that
      // now. If this fails, the exception will bubble up.
      if (self.#login?.username && self.#login?.password) {
        await self.login();
      }

      await self.updateUser();
    });

    return self;
  }

  // Updates the global OC instance from `this` to `newInstance`, IF the new
  // instance is different. This should only be called when the settings are
  // saved.
  setGlobalInstance(newInstance) {
    if (!this.updateGlobalOc) {
      console.error("bug: 'updateGlobalOc' not set");
    }

    // We only update if the two instances are different (ignoring the
    // `updateGlobalOc` key though).
    newInstance.updateGlobalOc = this.updateGlobalOc;
    if (!equal(this, newInstance)) {
      this.updateGlobalOc(newInstance);
    }
  }

  // Refreshes the connection by requesting `info/me` unless the state is
  // 'unconfigured'.
  //
  // If the request errors or returns a different user, the globale Opencast
  // instance is updated.
  async refreshConnection() {
    if (this.#state === STATE_UNCONFIGURED) {
      return;
    }

    await catchRequestError(async () => {
      // Request to `info/me`. If the user or the current state has changed
      const changed = await this.updateUser();
      if (changed) {
        this.updateGlobalOc(this);
      }
    });
  }

  // Updates `#currentUser` by checking 'info/me.json'.
  //
  // The `#state` is also updated accordingly to `STATE_LOGGED_IN`,
  // `STATE_INCORRECT_LOGIN` or `STATE_CONNECTED`. This method returns whether
  // the state or user object has changed in any way.
  async updateUser() {
    const newUser = await this.getInfoMe();

    if (!equal(newUser, this.#currentUser)) {
      this.#currentUser = newUser;
      if (newUser.user.username === 'anonymous') {
        if (this.#login) {
          this.#state = STATE_INCORRECT_LOGIN;
        } else {
          this.#state = STATE_CONNECTED;
        }
      } else {
        this.#state = STATE_LOGGED_IN;
      }
      return true;
    } else {
      return false;
    }
  }

  // Logs into Opencast with `#login.username` and `#login.password`. If the
  // request fails, this throws (as `request` does), otherwise the response is
  // ignored. If the login data is correct, the browser should have set some
  // cookies and a subsequent `info/me` request should show the logged in user.
  async login() {
    const body = `j_username=${this.#login.username}&j_password=${this.#login.password}`
      + "&_spring_security_remember_me=on";
    const url = "/admin_ng/j_spring_security_check";
    return await this.request(url, {
      method: 'post',
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  // Returns the response from the `info/me.json` endpoint.
  async getInfoMe() {
    return await this.jsonRequest("info/me.json");
  }

  // Sends a request to the Opencast API expecting a JSON response.
  //
  // On success, the parsed JSON is returned as object. If anything goes wrong,
  // a `RequestError` is thrown and the corresponding `this.#state` is set.
  async jsonRequest(path, options = {}) {
    const url = `${this.#serverUrl}/${path}`;
    const response = await this.request(path, options);

    try {
      return await response.json();
    } catch(e) {
      this.#state = STATE_INVALID_RESPONSE;
      throw new RequestError(`invalid response (invalid JSON) when accessing ${url}: `, e);
    }
  }

  // Sends a request to the Opencast API, returning the response object.
  //
  // If anything goes wrong, a `RequestError` is thrown and the corresponding
  // `this.#state` is set.
  async request(path, options = {}) {
    const url = `${this.#serverUrl}/${path}`;

    let response;
    try {
      response = await fetch(url, {
        ...options,
        credentials: 'include',
        redirect: 'manual',
      });
    } catch (e) {
      this.#state = STATE_NETWORK_ERROR;
      throw new RequestError(`network error when accessing '${url}': `, e);
    }

    if (!response.ok && response.type !== 'opaqueredirect') {
      this.#state = STATE_RESPONSE_NOT_OK;
      throw new RequestError(
        `unexpected ${response.status} ${response.statusText} response when accessing ${url}`
      );
    }

    return response;
  }

  // Uploads the given recordings with the given title and creator metadata. If
  // the upload fails, `false` is returned and `getState` changes to an error
  // state.
  async upload({ recordings, title, creator }) {
    // Refresh connection and check if we are ready to upload.
    await this.refreshConnection();
    if (!this.isReadyToUpload()) {
      return false;
    }

    // Actually upload
    try {
      // Create new media package
      let mediaPackage = await this.request("ingest/createMediaPackage")
        .then(response => response.text());


      // Prepare meta data
      let base_dc = `<?xml version="1.0" encoding="UTF-8"?>
        <dublincore xmlns="http://www.opencastproject.org/xsd/1.0/dublincore/"
                    xmlns:dcterms="http://purl.org/dc/terms/"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <dcterms:created xsi:type="dcterms:W3CDTF">2001-01-01T01:01Z</dcterms:created>
            <dcterms:creator>Creator not set</dcterms:creator>
            <dcterms:extent xsi:type="dcterms:ISO8601">PT5.568S</dcterms:extent>
            <dcterms:title>Title Not Set</dcterms:title>
            <dcterms:spatial>Opencast Studio</dcterms:spatial>
        </dublincore>`;

      const dc = new DOMParser().parseFromString(base_dc, 'text/xml');
      const dc_created = dc.getElementsByTagName('dcterms:created');
      const dc_creator = dc.getElementsByTagName('dcterms:creator');
      const dc_title = dc.getElementsByTagName('dcterms:title');

      dc_created[0].textContent = new Date(Date.now()).toISOString();
      dc_creator[0].textContent = creator;
      dc_title[0].textContent = title;


      // Add metadata to media package
      const body = new FormData();
      body.append('mediaPackage', mediaPackage);
      body.append('dublinCore', new XMLSerializer().serializeToString(dc));
      body.append('flavor', 'dublincore/episode');

      mediaPackage = await this.request("ingest/addDCCatalog", { method: 'post', body })
        .then(response => response.text());


      // Add all recordings
      for (const { deviceType, media } of recordings) {
        let trackFlavor = 'presentation/source';
        if (deviceType === 'desktop') {
          trackFlavor = 'presentation/source';
        } else if (deviceType === 'video') {
          trackFlavor = 'presenter/source';
        }

        const flavor = deviceType === 'desktop' ? 'Presentation' : 'Presenter';
        const downloadName = `${flavor} - ${title || 'Recording'}.webm`;

        const body = new FormData();
        body.append('mediaPackage', mediaPackage);
        body.append('flavor', trackFlavor);
        body.append('tags', '');
        body.append('BODY', media, downloadName);

        mediaPackage = await this.request("ingest/addTrack", { method: 'post', body })
          .then(response => response.text());
      }


      // Finalize/ingest media package
      const ingestBody = new FormData();
      ingestBody.append('mediaPackage', mediaPackage);
      ingestBody.append('workflowDefinitionId', this.#workflowId);
      await this.request("ingest/ingest", { method: 'post', body: ingestBody });

      return true;
    } catch(e) {
      console.error("Error occured during upload: ", e);
      return false;
    }
  }

  // Returns the current state of the connection to the OC server.
  getState() {
    return this.#state;
  }

  // Returns whether or not a login is already provided (i.e. we don't need to
  // login manually).
  isLoginProvided() {
    return this.#login === true;
  }

  // Returns whether or not the connection is ready to upload a video.
  isReadyToUpload() {
    return this.#state === STATE_LOGGED_IN;
  }
}


// Internal error type, simply containing a string.
function RequestError(msg) {
  this.msg = msg;
}

const catchRequestError = async (fn) => {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof RequestError) {
      console.error(e.msg);
    } else {
      throw e;
    }
    return null;
  }
};


const Context = React.createContext(null);

// Returns the current provided Opencast instance.
export const useOpencast = () => React.useContext(Context);

export const Provider = ({ initial, children }) => {
  const [opencast, updateOpencast] = useState(initial);
  opencast.updateGlobalOc = (newInstance) => {
    // We create a shallow clone here to force rerendering.
    updateOpencast({ ...newInstance });
  };

  // This debug output will be useful for future debugging sessions.
  useEffect(() => {
    console.debug("Current Opencast connection: ", opencast);
  });

  return (
    <Context.Provider value={opencast}>
      {children}
    </Context.Provider>
  );
};
