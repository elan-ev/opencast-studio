function xhr(url, opts) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject('no url');
      return;
    }

    const req = new XMLHttpRequest();
    const reqType = (opts ? opts.type || 'GET' : 'GET').toUpperCase();
    req.open(reqType, url, true);
    if (opts && opts.hasOwnProperty('attributes')) {
      for (let key in opts.attributes) {
        req.setAttribute(key, opts.attributes[key]);
      }
    }

    if (opts && opts.hasOwnProperty('properties')) {
      for (let key in opts.properties) {
        req[key] = opts.properties[key];
      }
    }

    if (opts && opts.hasOwnProperty('requestHeaders')) {
      for (let key in opts.requestHeaders) {
        req.setRequestHeader(key, opts.requestHeaders[key]);
      }
    }

    req.onload = e => {
      if (req.status === 200) {
        resolve(req.response);
      } else {
        reject(e);
      }
    };

    req.onerror = e => {
      reject(e);
    };

    req.send(opts && opts.data ? opts.data : null);
  });
}

class OpencastUploader {
  constructor(settings) {
    this.server_url = settings.serverUrl;
    this.workflow_id = settings.workflowId;

    this.login_name = settings.loginName;
    this.login_password = settings.loginPassword;
  }

  async loginAndUploadFromAnchor(
    recordings,
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
      debugger;
      onserverunreachable(e);
      return;
    }

    if (!isLoggedIn) {
      await this.login();
    }

    this.uploadFromRecordings(
      recordings,
      onsuccess,
      onloginfailed,
      onserverunreachable,
      oninetorpermfailed,
      title,
      creator
    );
  }
  async uploadFromRecordings(
    recordings,
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

      for (const { deviceType, media } of recordings.filter(Boolean)) {
        let trackFlavor = 'presentation/source';
        if (deviceType === 'desktop') {
          trackFlavor = 'presentation/source';
        } else if (deviceType === 'video') {
          trackFlavor = 'presenter/source';
        }

        // TODO(mel)
        const type = 'video';

        const flavor = deviceType === 'desktop' ? 'Presentation' : 'Presenter';
        const downloadName = `${flavor} ${type} - ${title || 'Recording'}.webm`;

        mp = await this.addTrack(mp, media, downloadName, trackFlavor, '');
      }

      mp = await this.ingest(mp, this.workflow_id);
    } catch (err) {
      // Inet failed (while transmitting) or not enough permission
      oninetorpermfailed(err);
      debugger;
      return;
    }

    onsuccess();

    return;
  }

  async validateState() {
    let me_info_json = await this.getMeInfo();
    let me_info = JSON.parse(me_info_json);

    // ret isLoggedIn
    return me_info['user']['username'] !== 'anonymous';
    // OnError: Couldn't connect to server: inet failed / is not a Opencast Api / CORS not allowed
  }

  login() {
    let data =
      'j_username=' +
      this.login_name +
      '&j_password=' +
      this.login_password +
      '&_spring_security_remember_me=on';

    return this.cred_xhr(this.server_url + 'admin_ng/j_spring_security_check', 'POST', data, true);
  }
  getMeInfo() {
    return this.cred_xhr(this.server_url + 'info/me.json');
  }
  getMediaPackage() {
    return this.cred_xhr(this.server_url + 'ingest/createMediaPackage');
  }
  addDCCatalog(mp, dc, flavor) {
    let data = new FormData();
    data.append('mediaPackage', mp);
    data.append('dublinCore', dc);
    data.append('flavor', flavor);

    return this.cred_xhr(this.server_url + 'ingest/addDCCatalog', 'POST', data);
  }
  addTrack(mp, track, track_filename, flavor, tags) {
    let data = new FormData();
    data.append('mediaPackage', mp);
    data.append('flavor', flavor);
    data.append('tags', tags);
    data.append('BODY', track, track_filename);

    return this.cred_xhr(this.server_url + 'ingest/addTrack', 'POST', data);
  }
  ingest(mp, workflowId) {
    let data = new FormData();
    data.append('mediaPackage', mp);
    data.append('workflowDefinitionId', workflowId);

    return this.cred_xhr(this.server_url + 'ingest/ingest', 'POST', data);
  }
  cred_xhr(url, type, data, isUrlencoded) {
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

    return xhr(url, opts);
  }
  retrieve(blob_url) {
    return xhr(blob_url, {
      properties: {
        responseType: 'blob'
      }
    });
  }
}

export default OpencastUploader;
