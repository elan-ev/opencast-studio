function OpencastUploader() {
  this.server_url = "https://develop.opencast.org/"
}

OpencastUploader.prototype = {
  constructor: OpencastUploader,
  uploadFromAnchor: function(anchors, onsuccess, onerror) {
    this.getApiVersion()
      .then(api_version_json => {
        let api_version = JSON.parse(api_version_json); // TODO used to test if logged out

        return this.getMediaPackage();
      })
      .then(mp => {
        let dc = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                 "<dublincore xmlns=\"http://www.opencastproject.org/xsd/1.0/dublincore/\"" +
                 "            xmlns:dcterms=\"http://purl.org/dc/terms/\"" +
                 "            xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
                 "  <dcterms:created xsi:type=\"dcterms:W3CDTF\">2017-05-24T15:28Z</dcterms:created>" +
                 "  <dcterms:creator>Test Creator</dcterms:creator>" +
                 "  <dcterms:extent xsi:type=\"dcterms:ISO8601\">PT5.568S</dcterms:extent>" +
                 "  <dcterms:title>Test Title</dcterms:title>" +
                 "</dublincore>";
        return this.addDCCatalog(mp, dc, "dublincore/episode");
      })
      .then(mp => {
        return this.retrieve_blob(anchors[0].href)
          .then(blob => { return { mp: mp, blob: blob }; });
      })
      .then(data => {
        return this.addTrack(data.mp, data.blob, "track.webm", "presenter/source", "");
      })
      .then(mp => {
        return this.ingest(mp, "fast");
      })
      .then(console.log) // DEBUG
      .catch(e => { console.log(e); onerror(); throw e; }) // TODO better error seperation
      .then(() => { onsuccess(); })
  },
  getApiVersion: function() {
    return this.cred_xhr(this.server_url + "api/version");
  },
  getMediaPackage: function() {
    return this.cred_xhr(this.server_url + "ingest/createMediaPackage");
  },
  addDCCatalog: function(mp, dc, flavor) {
    let data = new FormData();
    data.append("mediaPackage", mp);
    data.append("dublinCore", dc);
    data.append("flavor", flavor);

    return this.cred_xhr(this.server_url + "ingest/addDCCatalog", "POST", data);
  },
  addTrack: function(mp, track, track_filename, flavor, tags) {
    let data = new FormData();
    data.append("mediaPackage", mp);
    data.append("flavor", flavor);
    data.append("tags", tags);
    data.append("BODY", track, track_filename)

    return this.cred_xhr(this.server_url + "ingest/addTrack", "POST", data);
  },
  ingest: function(mp, workflowId) {
    let data = new FormData();
    data.append("mediaPackage", mp);
    data.append("workflowDefinitionId", workflowId);

    return this.cred_xhr(this.server_url + "ingest/ingest", "POST", data);
  },
  cred_xhr: function(url, type, data) {
    let opts = {
      properties: {
        withCredentials: true,
        responseType: "text"
      }
    };

    opts.type = type;
    opts.data = data;

    return utils.xhr(url, opts);
  },
  retrieve_blob: function(blob_url) {
    return utils.xhr(blob_url, {
      properties: {
        responseType: "blob"
      }
    })
  },
}