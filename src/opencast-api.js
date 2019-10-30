import axios from 'axios';

class OpencastAPI {
  constructor(settings) {
    this.server_url = settings.serverUrl.endsWith('/')
      ? settings.serverUrl.slice(0, -1)
      : settings.serverUrl;
    this.workflow_id = settings.workflowId;

    this.username = settings.loginName;
    this.password = settings.loginPassword;
  }

  async checkConnection() {
    try {
      await this.login();
      return !!(await this.validateState());
    } catch (error) {
      return false;
    }
  }

  async loginAndUpload(
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

        return this.addDCCatalog(
          mp.data,
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

        mp = await this.addTrack(mp.data, media, downloadName, trackFlavor, '');
      }

      await this.ingest(mp.data, this.workflow_id);
    } catch (err) {
      // Inet failed (while transmitting) or not enough permission
      oninetorpermfailed(err);
      return;
    }

    onsuccess();
  }

  async validateState() {
    const me_info_json = await this.getMeInfo();
    const me_info = me_info_json.data;

    return me_info['user']['username'] !== 'anonymous';
    // OnError: Couldn't connect to server: inet failed / is not a Opencast Api / CORS not allowed
  }

  login() {
    const data = `j_username=${this.username}&j_password=${this.password}&_spring_security_remember_me=on`;
    const url = `${this.server_url}/admin_ng/j_spring_security_check`;
    return axios({ url, method: 'post', data, withCredentials: true });
  }

  getMeInfo() {
    const url = `${this.server_url}/info/me.json`;
    return axios.get(url, { responseType: 'text', withCredentials: true });
  }

  getMediaPackage() {
    const url = `${this.server_url}/ingest/createMediaPackage`;
    return axios.get(url, { responseType: 'text', withCredentials: true });
  }

  addDCCatalog(mp, dc, flavor) {
    const data = new FormData();
    data.append('mediaPackage', mp);
    data.append('dublinCore', dc);
    data.append('flavor', flavor);

    const url = `${this.server_url}/ingest/addDCCatalog`;
    return axios({ url, method: 'post', data, responseType: 'text', withCredentials: true });
  }

  addTrack(mp, track, track_filename, flavor, tags) {
    const data = new FormData();
    data.append('mediaPackage', mp);
    data.append('flavor', flavor);
    data.append('tags', tags);
    data.append('BODY', track, track_filename);
    const url = `${this.server_url}/ingest/addTrack`;

    return axios({ url, method: 'post', data, responseType: 'text', withCredentials: true });
  }

  ingest(mp, workflowId) {
    const data = new FormData();
    data.append('mediaPackage', mp);
    data.append('workflowDefinitionId', workflowId);
    const url = `${this.server_url}/ingest/ingest`;

    return axios({ url, method: 'post', data, responseType: 'text', withCredentials: true });
  }
}

export default OpencastAPI;
