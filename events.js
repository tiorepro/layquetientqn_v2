// events.js
var __LAST_CHART = null;

var ChartEvents = {
  _listeners: {},
  on: function (event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  },
  off: function (event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(function (f) { return f !== fn; });
  },
  emit: function (event, data) {
    var fns = this._listeners[event] || [];
    for (var i = 0; i < fns.length; i++) {
      try { fns[i](data); }
      catch (e) { console.error('[ChartEvents] listener error:', e); }
    }
  }
};
