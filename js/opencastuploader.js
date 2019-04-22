function OpencastUploader() {
  this.server_url = "https://develop.opencast.org/"
}

OpencastUploader.prototype = {
  constructor: OpencastUploader,
  uploadFromAnchor: function(anchors) {
    this.getMediaPackage()
      .then(console.log)
    /*
    anchors.forEach(anchor => {
      console.log(anchor.href);
      utils.xhr(anchor.href)
        .then(index => console.log(index));
    });
    */
  },
  getMediaPackage: function() {
    return this.cred_xhr(this.server_url + "ingest/createMediaPackage");
  },
  /*
  addDCCatalog: function(mp, dc, flavor) {
    return this.cred_xhr(this.server_url + "ingest/addDCCatalog",
      "mediaPackage=" + mp +
      "&dublinCore=" + dc +
      "&flavor=" + flavor);
  },
  */
  cred_xhr: function(url, data) {
    let opts = {
      properties: {
        withCredentials: true
      }
    };

    opts.data = data;

    return utils.xhr(url, opts);
  },
}