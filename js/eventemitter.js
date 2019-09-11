class EventEmitter {
  constructor() {
    let _completeFns = {};
    let _onceFns = {};

    Object.defineProperty(this, 'completeFns', {
      get: function() {
        return _completeFns;
      }
    });

    Object.defineProperty(this, 'onceFns', {
      get: function() {
        return _onceFns;
      }
    });
  }

  on(ev, fnObj) {
    if (!this.completeFns[ev]) {
      this.completeFns[ev] = {};
    }

    let token = null;
    do {
      token = (Math.random() + 1).toString(36).substring(2, 10);
    } while (Object.keys(this.completeFns).indexOf(token) > -1);

    fnObj = typeof fnObj === 'function' ? { fn: fnObj, scope: null } : fnObj;
    this.completeFns[ev][token] = {
      scope: fnObj.scope,
      fn: fnObj.fn
    };

    return token;
  }

  once(ev, fnObj) {
    if (!this.onceFns[ev]) {
      this.onceFns[ev] = {};
    }

    let token = null;
    do {
      token = (Math.random() + 1).toString(36).substring(2, 10);
    } while (Object.keys(this.completeFns).indexOf(token) > -1);

    fnObj = typeof fnObj === 'function' ? { fn: fnObj, scope: null } : fnObj;
    this.onceFns[ev][token] = {
      scope: fnObj.scope,
      fn: fnObj.fn
    };
  }

  off(ev, token) {
    if (!ev || !token) {
      return false;
    }

    if (this.completeFns[ev] && this.completeFns[ev][token]) {
      delete this.completeFns[ev][token];
      return true;
    }

    return false;
  }

  emit(ev, val) {
    let args = Array.prototype.slice.call(arguments);
    ev = args[0];
    val = args.slice(1);
    ['completeFns', 'onceFns'].forEach(fnType => {
      if (this[fnType][ev]) {
        for (let key in this[fnType][ev]) {
          let scope = this[fnType][ev][key].scope;
          let fn = this[fnType][ev][key].fn;
          (function() {
            fn.apply(scope, val);
          }.bind(scope)());
        }
      }
    });

    if (this.onceFns[ev]) {
      delete this.onceFns[ev];
    }
  }
}

export default EventEmitter;
