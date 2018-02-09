const RAFLoop = function RAFLoop() {
  this.subscriptions = {};
  this.loop();
}

RAFLoop.prototype = {
  constructor: RAFLoop,
  loop: function(timestamp) {
    for (let key in this.subscriptions) {
      let fn = this.subscriptions[key].fn;
      let scope = this.subscriptions[key].scope;
      fn.call(scope, timestamp);
    }
    requestAnimationFrame(ts => this.loop(ts));
  },
  subscribe: function(sub, cb) {
    if (sub.fn && typeof sub.fn == 'function') {
      let subToken = null;
      do {
        subToken = (Math.random() + 1).toString(36).substring(2, 10);
      } while (Object.keys(this.subscriptions).indexOf(subToken) > -1);

      this.subscriptions[subToken] = {
        fn: sub.fn,
        scope: sub.scope
      }

      if (cb && typeof cb == 'function') {
        cb.call(sub.scope, subToken);
      }

      return subToken;
    }
  },
  unsubscribe: function(subToken, cb) {
    let result = false;
    if (this.subscriptions.hasOwnProperty(subToken)) {
      delete this.subscriptions[subToken];
      result = true;
    }

    if (cb && typeof cb == 'function') {
      cb(result);
    }

    return result;
  }
}
