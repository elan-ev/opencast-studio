import utils from './utils.js';

function OpencastUploader(ocUploaderSettings) {
  this.server_url = ocUploaderSettings.getServerUrl();
  this.workflow_id = ocUploaderSettings.getWorkflowId();

  this.login_name = ocUploaderSettings.getLoginName();
  this.login_password = ocUploaderSettings.getLoginPassword();
}

OpencastUploader.prototype = {
  constructor: OpencastUploader,
  loginAndUploadFromAnchor: async function(
    anchors,
    onsuccess,
    onloginfailed,
    onserverunreachable,
    oninetorpermfailed,
    title,
    creator
  ) {
    // relog needed?
    let isLoggedIn = true;
    try {
      isLoggedIn = await this.validateState();
    } catch (e) {
      onserverunreachable(e);
      return;
    }

    if (!isLoggedIn) {
      await this.login();
    }

    this.uploadFromAnchor(
      anchors,
      onsuccess,
      onloginfailed,
      onserverunreachable,
      oninetorpermfailed,
      title,
      creator
    );
  },
  uploadFromAnchor: async function(
    anchors,
    onsuccess,
    onnotloggedin,
    onserverunreachable,
    oninetorpermfailed,
    title,
    creator
  ) {
    // check Connection State
    try {
      let isLoggedIn = await this.validateState();
      if (!isLoggedIn) {
        onnotloggedin();
        return;
      }
    } catch (e) {
      onserverunreachable(e);
      return;
    }

    try {
      let mp = await this.getMediaPackage().then(mp => {
        let base_dc =
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<dublincore xmlns="http://www.opencastproject.org/xsd/1.0/dublincore/"' +
          '            xmlns:dcterms="http://purl.org/dc/terms/"' +
          '            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
          '  <dcterms:created xsi:type="dcterms:W3CDTF">2001-01-01T01:01Z</dcterms:created>' +
          '  <dcterms:creator>Creator not set</dcterms:creator>' +
          '  <dcterms:extent xsi:type="dcterms:ISO8601">PT5.568S</dcterms:extent>' +
          '  <dcterms:title>Title Not Set</dcterms:title>' +
          '</dublincore>';

        let dc = new DOMParser().parseFromString(base_dc, 'text/xml');
        let dc_created = dc.getElementsByTagName('dcterms:created');
        let dc_creator = dc.getElementsByTagName('dcterms:creator');
        let dc_title = dc.getElementsByTagName('dcterms:title');

        dc_created[0].textContent = new Date(Date.now()).toISOString();
        dc_creator[0].textContent = creator;
        dc_title[0].textContent = title;

        return this.addDCCatalog(
          mp,
          new XMLSerializer().serializeToString(dc),
          'dublincore/episode'
        );
      });

      for (let i in anchors) {
        let anchor = anchors[i];
        let blob = await this.retrieve_blob(anchor.href);

        let anchor_flavor = anchor.getAttribute('data-flavor');
        let track_flavor = 'presentation/source';

        if (anchor_flavor === 'Presentation') {
          track_flavor = 'presentation/source';
        } else if (anchor_flavor === 'Presenter') {
          track_flavor = 'presenter/source';
        } else if (anchor_flavor === 'Composite') {
          track_flavor = 'composite/preview';
        }

        mp = await this.addTrack(mp, blob, anchor.download, track_flavor, '');
      }

      mp = await this.ingest(mp, this.workflow_id);
    } catch (err) {
      // Inet failed (while transmitting) or not enough permission
      oninetorpermfailed(err);
      return;
    }

    onsuccess();

    return;
  },
  validateState: async function() {
    let me_info_json = await this.getMeInfo();
    let me_info = JSON.parse(me_info_json);

    // ret isLoggedIn
    return me_info['user']['username'] !== 'anonymous';
    // OnError: Couldn't connect to server: inet failed / is not a Opencast Api / CORS not allowed
  },
  login: function() {
    let data =
      'j_username=' +
      this.login_name +
      '&j_password=' +
      this.login_password +
      '&_spring_security_remember_me=on';

    return this.cred_xhr(this.server_url + 'admin_ng/j_spring_security_check', 'POST', data, true);
  },
  getMeInfo: function() {
    return this.cred_xhr(this.server_url + 'info/me.json');
  },
  getMediaPackage: function() {
    return this.cred_xhr(this.server_url + 'ingest/createMediaPackage');
  },
  addDCCatalog: function(mp, dc, flavor) {
    let data = new FormData();
    data.append('mediaPackage', mp);
    data.append('dublinCore', dc);
    data.append('flavor', flavor);

    return this.cred_xhr(this.server_url + 'ingest/addDCCatalog', 'POST', data);
  },
  addTrack: function(mp, track, track_filename, flavor, tags) {
    let data = new FormData();
    data.append('mediaPackage', mp);
    data.append('flavor', flavor);
    data.append('tags', tags);
    data.append('BODY', track, track_filename);

    return this.cred_xhr(this.server_url + 'ingest/addTrack', 'POST', data);
  },
  ingest: function(mp, workflowId) {
    let data = new FormData();
    data.append('mediaPackage', mp);
    data.append('workflowDefinitionId', workflowId);

    return this.cred_xhr(this.server_url + 'ingest/ingest', 'POST', data);
  },
  cred_xhr: function(url, type, data, isUrlencoded) {
    let opts = {
      properties: {
        withCredentials: true,
        responseType: 'text'
      }
    };

    opts.type = type;
    opts.data = data;
    opts.requestHeaders = {};

    if (isUrlencoded) {
      opts.requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    return utils.xhr(url, opts);
  },
  retrieve_blob: function(blob_url) {
    return utils.xhr(blob_url, {
      properties: {
        responseType: 'blob'
      }
    });
  }
};

function OpencastUploaderSettingsDialog() {
  // Init SettingsOpen Button
  this.openSettingsButton = document.getElementById('ocUploadSettingsOpenButton');
  this.openSettingsButton.addEventListener('click', this.show.bind(this), false);

  // Open oc server button
  this.openOcServerButton = document.getElementById('ocOpenServerButton');
  this.openOcServerButton.addEventListener('click', this.openOcServer.bind(this), false);

  // get all relevant HTML Elements
  this.toggleModalEl = document.getElementById('toggleOcUploadSettingsModal');
  this.saveOcUploadSettingsEl = document.getElementById('saveOcUploadSettings');

  this.serverURLEl = document.querySelector(
    '#ocUploadSettings input[name=ocUploadSettingsServerURL]'
  );
  this.workflowIdEl = document.querySelector(
    '#ocUploadSettings input[name=ocUploadSettingsWorkflowId]'
  );
  this.loginNameEl = document.querySelector(
    '#ocUploadSettings input[name=ocUploadSettingsLoginName]'
  );
  this.loginPasswordEl = document.querySelector(
    '#ocUploadSettings input[name=ocUploadSettingsLoginPassword]'
  );

  // Init HTMLElements with data from localStorage
  this.serverURLEl.value = localStorage.getItem('ocUploadSettingsServerURL');
  this.workflowIdEl.value = localStorage.getItem('ocUploadSettingsWorkflowId');
  this.loginNameEl.value = localStorage.getItem('ocUploadSettingsLoginName');
  this.loginPasswordEl.value = localStorage.getItem('ocUploadSettingsLoginPassword');
  if (
    this.workflowIdEl.value === '' &&
    this.serverURLEl.value === '' &&
    this.loginNameEl.value === '' &&
    this.loginPasswordEl.value === ''
  ) {
    // load defaults
    this.workflowIdEl.value = 'fast';
    this.serverURLEl.value = 'https://develop.opencast.org/';
    this.loginNameEl.value = 'admin';
    this.loginPasswordEl.value = 'opencast';
    this.show();
  }

  // bind save button
  this.saveOcUploadSettingsEl.addEventListener(
    'click',
    this.saveAndCloseOcUploadSettings.bind(this),
    false
  );
}

OpencastUploaderSettingsDialog.prototype = {
  constructor: OpencastUploaderSettingsDialog,
  show: function() {
    this.toggleModalEl.checked = true;
  },
  openOcServer: function() {
    let serverUrl = this.getServerUrl();
    if (serverUrl != '' && serverUrl !== '/') {
      window.open(this.getServerUrl());
    }
  },
  saveAndCloseOcUploadSettings: function(e) {
    // save data to localStorage
    localStorage.setItem('ocUploadSettingsServerURL', this.serverURLEl.value);
    localStorage.setItem('ocUploadSettingsWorkflowId', this.workflowIdEl.value);
    localStorage.setItem('ocUploadSettingsLoginName', this.loginNameEl.value);
    localStorage.setItem('ocUploadSettingsLoginPassword', this.loginPasswordEl.value);

    this.toggleModalEl.checked = false;
  },
  getServerUrl: function() {
    let server_url = this.serverURLEl.value;
    return server_url.endsWith('/') ? server_url : server_url + '/';
  },
  getWorkflowId: function() {
    let workflow_id = this.workflowIdEl.value;
    return workflow_id;
  },
  getLoginName: function() {
    let loginName = this.loginNameEl.value;
    return loginName;
  },
  getLoginPassword: function() {
    let loginPassword = this.loginPasswordEl.value;
    return loginPassword;
  }
};

export { OpencastUploader, OpencastUploaderSettingsDialog };
