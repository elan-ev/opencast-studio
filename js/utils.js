const utils = {
  xhr: function() {
  },
  createElement: function(type, params) {
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
  }
}
