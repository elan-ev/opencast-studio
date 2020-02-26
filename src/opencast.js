const STATE_UNCONFIGURED = 'unconfigured';
const STATE_CONNECTED = 'connected';
const STATE_LOGGED_IN = 'logged_in';
const STATE_NETWORK_ERROR = 'network_error';
const STATE_RESPONSE_NOT_OK = 'response_not_ok';
const STATE_INVALID_RESPONSE = 'invalid_response';
const STATE_INCORRECT_LOGIN = 'incorrect_login';


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

  static async init(settings) {
    let self = new Opencast();
    await self.updateSettings(settings);
    console.log("initialized opencast: ", self);
    return self;
  }


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

    if (settings.loginProvided) {
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
    // if (this.#login) {
    // } else {
    //   // TODO: maybe check if the user is logged in anyway?
    //   if (await this.checkConnection() !== null) {
    //     this.#state = STATE_CONNECTED;
    //   }
    // }
  }

  // async checkConnection() {
  //   const me = await this.getInfoMe();
  //   console.log(me);
  //   return !!me;
  // }

  async updateUser() {
    // if (typeof this.#login === 'object') {
    //   await login();
    // }
    const me = await this.getInfoMe();
    console.log(me);
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

  // async login() {
  //   const body = `j_username=${this.#login.username}&j_password=${this.#login.password}`
  //     + "&_spring_security_remember_me=on";
  //   const url = `${this.server_url}/admin_ng/j_spring_security_check`;
  //   return await this.jsonRequest(url, { method: 'post', body });
  // }

  async getInfoMe() {
    return await this.jsonRequest("info/me.json");
  }

  // Sends a request to the Opencast API expecting a JSON response.
  //
  // On success, the parsed JSON is returned as object. If anything goes wrong,
  // a `RequestError` is thrown and the corresponding `this.#state` is set.
  //
  // If `this.#login` contains a username and password, these are used with HTTP
  // Basic auth to authenticate.
  async jsonRequest(path, options = {}) {
    const url = `${this.#serverUrl}/${path}`;

    let response;

    let headers = {};
    if (this.#login?.username && this.#login?.password) {
      const encoded = btoa(unescape(encodeURIComponent(
        this.#login.username + ':' + this.#login.password
      )));
      headers = { 'Authorization': `Basic ${encoded}` };
    }

    try {
      response = await fetch(url, {
        ...options,
        credentials: 'same-origin',
        redirect: 'manual',
        headers,
      });
    } catch (e) {
      this.#state = STATE_NETWORK_ERROR;
      throw new RequestError(`network error when accessing '${url}': `, e);
    }

    if (!response.ok) {
      this.#state = STATE_RESPONSE_NOT_OK;
      throw new RequestError(
        `unexpected ${response.status} ${response.statusText} response when accessing ${url}`
      );
    }

    try {
      return await response.json();
    } catch(e) {
      this.#state = STATE_INVALID_RESPONSE;
      throw new RequestError(`invalid response (invalid JSON) when accessing ${url}: `, e);
    }
  }
}

function RequestError(msg) {
  this.msg = msg;
}
