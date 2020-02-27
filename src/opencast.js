//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import React, { useState } from 'react';

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
    await self.updateSettings(settings);
    console.debug("initialized opencast: ", self);
    return self;
  }

  // Updates the global OC instance from `this` to `newInstance`. This should
  // only be called when the settings are saved.
  setGlobalInstance(newInstance) {
    if (!this.updateGlobalOc) {
      console.error("bug: 'updateGlobalOc' not set");
    }

    newInstance.updateGlobalOc = this.updateGlobalOc;
    this.updateGlobalOc(newInstance);
  }

  // Update this object with the given Opencast settings. This also updates the
  // `#currentUser`.
  async updateSettings(settings) {
    if (!settings.serverUrl) {
      this.#state = STATE_UNCONFIGURED;
      this.#serverUrl = null;
      this.#workflowId = null;
      this.#login = null;

      return;
    }

    this.#serverUrl = settings.serverUrl.endsWith('/')
      ? settings.serverUrl.slice(0, -1)
      : settings.serverUrl;
    this.#workflowId = settings.workflowId;

    if (settings.loginProvided === true) {
      // Here we can assume Studio is running within an Opencast instance and
      // the route to Studio is protected via login. This means that login
      // cookies are already present and we don't need to worry about that.
      this.#login = true;
    } else if (settings.loginName && settings.loginPassword) {
      // Studio is not running in OC context, but username and password are
      // provided.
      this.#login = {
        username: settings.loginName,
        password: settings.loginPassword,
      };
    } else {
      // Login is not yet provided.
      this.#login = null;
    }

    try {
      await this.updateUser();
    } catch (e) {
      if (e instanceof RequestError) {
        console.error(e.msg);
      } else {
        throw e;
      }
    }
  }

  // Updates `#currentUser` by checking 'info/me.json'. If username and
  // password are provided, this method first tries to login with this data.
  //
  // The `#state` is also updated accordingly to `STATE_LOGGED_IN`,
  // `STATE_INCORRECT_LOGIN` or `STATE_CONNECTED`.
  async updateUser() {
    // If the user wants to login via username/password, we need to do that
    // now. If this fails, the exception will bubble up.
    if (this.#login?.username && this.#login?.password) {
      await this.login();
    }

    const me = await this.getInfoMe();
    console.debug(me);
    this.#currentUser = me;
    if (me.user.username === 'anonymous') {
      if (this.#login) {
        this.#state = STATE_INCORRECT_LOGIN;
      } else {
        this.#state = STATE_CONNECTED;
      }
    } else {
      this.#state = STATE_LOGGED_IN;
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

  getState() {
    return this.#state;
  }

  isLoginProvided() {
    return this.#login === true;
  }
}

function RequestError(msg) {
  this.msg = msg;
}

const Context = React.createContext(null);

// Returns the current provided Opencast instance.
export const useOpencast = () => React.useContext(Context);

export const Provider = ({ initial, children }) => {
  const [opencast, updateOpencast] = useState(initial);
  opencast.updateGlobalOc = updateOpencast;

  return (
    <Context.Provider value={opencast}>
      {children}
    </Context.Provider>
  );
};
