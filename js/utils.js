const utils = {
  xhr: (url, opts) => {
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
        if (req.status == 200) {
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
  },
  createElement: (type, params) => {
    if (typeof type != 'string') {
      return null;
    }

    let el = document.createElement(type);
    if (!params) {
      return el;
    }

    if (params.text) {
      el.innerText = params.text;
    }
    if (params.html) {
      el.innerHTML = params.html;
    }
    if (params.id) {
      el.id = params.id;
    }
    if (params.class || params.className) {
      el.className = params.class || params.className;
    }
    if (params.type) {
      el.type = params.type;
    }
    if (params.name) {
      el.name = params.name;
    }
    if (params.value) {
      el.value = params.value;
    }
    if (params.for) {
      el.setAttribute('for', params.for);
    }
    if (params.data) {
      for (let key in params.data) {
        el.setAttribute(`data-${key}`, params.data[key]);
      }
    }
    if (params.style) {
      for (let key in params.style) {
        el.style[key] = params.style[key];
      }
    }
    if (params.prop) {
      for (let key in params.prop) {
        el[key] = params.prop[key];
      }
    }
    if (params.attrib) {
      for (let key in params.attrib) {
        el.setAttribute(key, params.attrib[key]);
      }
    }
    return el;
  },
  getParameters: () => {
    return (window.location.href.split('?')[1] || '')
      .split('&')
      .map(paramStr => paramStr.split('='))
      .filter(param => param.length === 2)
      .reduce((params, param) => {
        params[param[0]] = param[1];
        return params;
      }, {});
  },
  log: logItem => {
    if (utils.getParameters().debug && utils.getParameters().debug === 'true') {
      console.log(logItem);
    }
  }
};

export default utils;
