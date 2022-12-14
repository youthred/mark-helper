/*!
 * mdui.jq 2.0.0 (https://github.com/zdhxiong/mdui.jq#readme)
 * Copyright 2018-2020 zdhxiong
 * Licensed under MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.JQ = factory());
}(this, (function () { 'use strict';

  !function(){try{return new MouseEvent("test")}catch(e$1){}var e=function(e,t){t=t||{bubbles:!1,cancelable:!1};var n=document.createEvent("MouseEvent");return n.initMouseEvent(e,t.bubbles,t.cancelable,window,0,t.screenX||0,t.screenY||0,t.clientX||0,t.clientY||0,t.ctrlKey||!1,t.altKey||!1,t.shiftKey||!1,t.metaKey||!1,t.button||0,t.relatedTarget||null),n};e.prototype=Event.prototype,window.MouseEvent=e;}();

  !function(){function t(t,e){e=e||{bubbles:!1,cancelable:!1,detail:void 0};var n=document.createEvent("CustomEvent");return n.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),n}"function"!=typeof window.CustomEvent&&(t.prototype=window.Event.prototype,window.CustomEvent=t);}();

  /**
   * @this {Promise}
   */
  function finallyConstructor(callback) {
    var constructor = this.constructor;
    return this.then(
      function(value) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function() {
          return value;
        });
      },
      function(reason) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function() {
          // @ts-ignore
          return constructor.reject(reason);
        });
      }
    );
  }

  function allSettled(arr) {
    var P = this;
    return new P(function(resolve, reject) {
      if (!(arr && typeof arr.length !== 'undefined')) {
        return reject(
          new TypeError(
            typeof arr +
              ' ' +
              arr +
              ' is not iterable(cannot read property Symbol(Symbol.iterator))'
          )
        );
      }
      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) { return resolve([]); }
      var remaining = args.length;

      function res(i, val) {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              function(e) {
                args[i] = { status: 'rejected', reason: e };
                if (--remaining === 0) {
                  resolve(args);
                }
              }
            );
            return;
          }
        }
        args[i] = { status: 'fulfilled', value: val };
        if (--remaining === 0) {
          resolve(args);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  }

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function isArray(x) {
    return Boolean(x && typeof x.length !== 'undefined');
  }

  function noop() {}

  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function() {
      fn.apply(thisArg, arguments);
    };
  }

  /**
   * @constructor
   * @param {Function} fn
   */
  function Promise$1(fn) {
    if (!(this instanceof Promise$1))
      { throw new TypeError('Promises must be constructed via new'); }
    if (typeof fn !== 'function') { throw new TypeError('not a function'); }
    /** @type {!number} */
    this._state = 0;
    /** @type {!boolean} */
    this._handled = false;
    /** @type {Promise|undefined} */
    this._value = undefined;
    /** @type {!Array<!Function>} */
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise$1._immediateFn(function() {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self)
        { throw new TypeError('A promise cannot be resolved with itself.'); }
      if (
        newValue &&
        (typeof newValue === 'object' || typeof newValue === 'function')
      ) {
        var then = newValue.then;
        if (newValue instanceof Promise$1) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise$1._immediateFn(function() {
        if (!self._handled) {
          Promise$1._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  /**
   * @constructor
   */
  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(
        function(value) {
          if (done) { return; }
          done = true;
          resolve(self, value);
        },
        function(reason) {
          if (done) { return; }
          done = true;
          reject(self, reason);
        }
      );
    } catch (ex) {
      if (done) { return; }
      done = true;
      reject(self, ex);
    }
  }

  Promise$1.prototype['catch'] = function(onRejected) {
    return this.then(null, onRejected);
  };

  Promise$1.prototype.then = function(onFulfilled, onRejected) {
    // @ts-ignore
    var prom = new this.constructor(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise$1.prototype['finally'] = finallyConstructor;

  Promise$1.all = function(arr) {
    return new Promise$1(function(resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.all accepts an array'));
      }

      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) { return resolve([]); }
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(
                val,
                function(val) {
                  res(i, val);
                },
                reject
              );
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise$1.allSettled = allSettled;

  Promise$1.resolve = function(value) {
    if (value && typeof value === 'object' && value.constructor === Promise$1) {
      return value;
    }

    return new Promise$1(function(resolve) {
      resolve(value);
    });
  };

  Promise$1.reject = function(value) {
    return new Promise$1(function(resolve, reject) {
      reject(value);
    });
  };

  Promise$1.race = function(arr) {
    return new Promise$1(function(resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.race accepts an array'));
      }

      for (var i = 0, len = arr.length; i < len; i++) {
        Promise$1.resolve(arr[i]).then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise$1._immediateFn =
    // @ts-ignore
    (typeof setImmediate === 'function' &&
      function(fn) {
        // @ts-ignore
        setImmediate(fn);
      }) ||
    function(fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /** @suppress {undefinedVars} */
  var globalNS = (function() {
    // the only reliable means to get the global object is
    // `Function('return this')()`
    // However, this causes CSP violations in Chrome apps.
    if (typeof self !== 'undefined') {
      return self;
    }
    if (typeof window !== 'undefined') {
      return window;
    }
    if (typeof global !== 'undefined') {
      return global;
    }
    throw new Error('unable to locate global object');
  })();

  // Expose the polyfill if Promise is undefined or set to a
  // non-function value. The latter can be due to a named HTMLElement
  // being exposed by browsers for legacy reasons.
  // https://github.com/taylorhakes/promise-polyfill/issues/114
  if (typeof globalNS['Promise'] !== 'function') {
    globalNS['Promise'] = Promise$1;
  } else if (!globalNS.Promise.prototype['finally']) {
    globalNS.Promise.prototype['finally'] = finallyConstructor;
  } else if (!globalNS.Promise.allSettled) {
    globalNS.Promise.allSettled = allSettled;
  }

  function isFunction(target) {
      return typeof target === 'function';
  }
  function isString(target) {
      return typeof target === 'string';
  }
  function isNumber(target) {
      return typeof target === 'number';
  }
  function isBoolean(target) {
      return typeof target === 'boolean';
  }
  function isUndefined(target) {
      return typeof target === 'undefined';
  }
  function isNull(target) {
      return target === null;
  }
  function isWindow(target) {
      return target instanceof Window;
  }
  function isDocument(target) {
      return target instanceof Document;
  }
  function isElement(target) {
      return target instanceof Element;
  }
  function isNode(target) {
      return target instanceof Node;
  }
  /**
   * ????????? IE ?????????
   */
  function isIE() {
      // @ts-ignore
      return !!window.document.documentMode;
  }
  function isArrayLike(target) {
      if (isFunction(target) || isWindow(target)) {
          return false;
      }
      return isNumber(target.length);
  }
  function isObjectLike(target) {
      return typeof target === 'object' && target !== null;
  }
  function toElement(target) {
      return isDocument(target) ? target.documentElement : target;
  }
  /**
   * ?????? - ???????????????????????????????????? box-sizing ????????? boxSizing???
   * @param string
   */
  function toCamelCase(string) {
      return string
          .replace(/^-ms-/, 'ms-')
          .replace(/-([a-z])/g, function (_, letter) { return letter.toUpperCase(); });
  }
  /**
   * ????????????????????? - ???????????????????????? boxSizing ????????? box-sizing???
   * @param string
   */
  function toKebabCase(string) {
      return string.replace(/[A-Z]/g, function (replacer) { return '-' + replacer.toLowerCase(); });
  }
  /**
   * ????????????????????????
   * @param element
   * @param name
   */
  function getComputedStyleValue(element, name) {
      return window.getComputedStyle(element).getPropertyValue(toKebabCase(name));
  }
  /**
   * ??????????????? box-sizing ????????? border-box
   * @param element
   */
  function isBorderBox(element) {
      return getComputedStyleValue(element, 'box-sizing') === 'border-box';
  }
  /**
   * ??????????????? padding, border, margin ???????????????????????????????????????px???
   * @param element
   * @param direction
   * @param extra
   */
  function getExtraWidth(element, direction, extra) {
      var position = direction === 'width' ? ['Left', 'Right'] : ['Top', 'Bottom'];
      return [0, 1].reduce(function (prev, _, index) {
          var prop = extra + position[index];
          if (extra === 'border') {
              prop += 'Width';
          }
          return prev + parseFloat(getComputedStyleValue(element, prop) || '0');
      }, 0);
  }
  /**
   * ?????????????????????????????? width ??? height ???????????????
   * @param element
   * @param name
   */
  function getStyle(element, name) {
      // width???height ???????????? getComputedStyle ???????????????????????????????????? getBoundingClientRect ??????
      if (name === 'width' || name === 'height') {
          var valueNumber = element.getBoundingClientRect()[name];
          if (isBorderBox(element)) {
              return (valueNumber + "px");
          }
          return ((valueNumber -
              getExtraWidth(element, name, 'border') -
              getExtraWidth(element, name, 'padding')) + "px");
      }
      return getComputedStyleValue(element, name);
  }
  /**
   * ??????????????????????????????
   * @param target
   * @param parent
   */
  function getChildNodesArray(target, parent) {
      var tempParent = document.createElement(parent);
      tempParent.innerHTML = target;
      return [].slice.call(tempParent.childNodes);
  }
  /**
   * ???????????? false ?????????
   */
  function returnFalse() {
      return false;
  }
  /**
   * ??????????????? CSS ??????
   */
  var cssNumber = [
      'animationIterationCount',
      'columnCount',
      'fillOpacity',
      'flexGrow',
      'flexShrink',
      'fontWeight',
      'gridArea',
      'gridColumn',
      'gridColumnEnd',
      'gridColumnStart',
      'gridRow',
      'gridRowEnd',
      'gridRowStart',
      'lineHeight',
      'opacity',
      'order',
      'orphans',
      'widows',
      'zIndex',
      'zoom' ];

  function each(target, callback) {
      if (isArrayLike(target)) {
          for (var i = 0; i < target.length; i += 1) {
              if (callback.call(target[i], i, target[i]) === false) {
                  return target;
              }
          }
      }
      else {
          var keys = Object.keys(target);
          for (var i$1 = 0; i$1 < keys.length; i$1 += 1) {
              if (callback.call(target[keys[i$1]], keys[i$1], target[keys[i$1]]) === false) {
                  return target;
              }
          }
      }
      return target;
  }

  /**
   * ?????????????????????????????????????????????????????????
   */
  var JQ = function JQ(arr) {
      var this$1 = this;

      this.length = 0;
      if (!arr) {
          return this;
      }
      each(arr, function (i, item) {
          // @ts-ignore
          this$1[i] = item;
      });
      this.length = arr.length;
      return this;
  };

  function get$() {
      var $ = function (selector) {
          if (!selector) {
              return new JQ();
          }
          // JQ
          if (selector instanceof JQ) {
              return selector;
          }
          // function
          if (isFunction(selector)) {
              if (/complete|loaded|interactive/.test(document.readyState) &&
                  document.body) {
                  selector.call(document, $);
              }
              else {
                  document.addEventListener('DOMContentLoaded', function () { return selector.call(document, $); }, false);
              }
              return new JQ([document]);
          }
          // String
          if (isString(selector)) {
              var html = selector.trim();
              // ?????? HTML ??????????????? JQ ??????
              if (html[0] === '<' && html[html.length - 1] === '>') {
                  var toCreate = 'div';
                  var tags = {
                      li: 'ul',
                      tr: 'tbody',
                      td: 'tr',
                      th: 'tr',
                      tbody: 'table',
                      option: 'select',
                  };
                  each(tags, function (childTag, parentTag) {
                      if (html.indexOf(("<" + childTag)) === 0) {
                          toCreate = parentTag;
                          return false;
                      }
                      return;
                  });
                  return new JQ(getChildNodesArray(html, toCreate));
              }
              // ?????? CSS ??????????????? JQ ??????
              var isIdSelector = selector[0] === '#' && !selector.match(/[ .<>:~]/);
              if (!isIdSelector) {
                  return new JQ(document.querySelectorAll(selector));
              }
              var element = document.getElementById(selector.slice(1));
              if (element) {
                  return new JQ([element]);
              }
              return new JQ();
          }
          if (isArrayLike(selector) && !isNode(selector)) {
              return new JQ(selector);
          }
          return new JQ([selector]);
      };
      $.fn = JQ.prototype;
      return $;
  }
  var $ = get$();

  $.fn.each = function (callback) {
      return each(this, callback);
  };

  /**
   * ?????? container ????????????????????? contains ??????
   * @param container ?????????
   * @param contains ?????????
   * @example
  ```js
  contains( document, document.body ); // true
  contains( document.getElementById('test'), document ); // false
  contains( $('.container').get(0), $('.contains').get(0) ); // false
  ```
   */
  function contains(container, contains) {
      return container !== contains && toElement(container).contains(contains);
  }

  /**
   * ????????????????????????????????????????????????????????????????????????????????????
   * @param first ???????????????
   * @param second ???????????????????????????????????????????????????
   * @example
  ```js
  merge( [ 0, 1, 2 ], [ 2, 3, 4 ] )
  // [ 0, 1, 2, 2, 3, 4 ]
  ```
   */
  function merge(first, second) {
      each(second, function (_, value) {
          first.push(value);
      });
      return first;
  }

  $.fn.get = function (index) {
      return index === undefined
          ? [].slice.call(this)
          : this[index >= 0 ? index : index + this.length];
  };

  $.fn.find = function (selector) {
      var foundElements = [];
      this.each(function (_, element) {
          merge(foundElements, $(element.querySelectorAll(selector)).get());
      });
      return new JQ(foundElements);
  };

  // ????????????
  var handlers = {};
  // ??????ID
  var mduiElementId = 1;
  /**
   * ??????????????????????????????ID
   */
  function getElementId(element) {
      var key = '_mduiEventId';
      // @ts-ignore
      if (!element[key]) {
          // @ts-ignore
          element[key] = ++mduiElementId;
      }
      // @ts-ignore
      return element[key];
  }
  /**
   * ?????????????????????????????????
   */
  function parse(type) {
      var parts = type.split('.');
      return {
          type: parts[0],
          ns: parts.slice(1).sort().join(' '),
      };
  }
  /**
   * ????????????????????????
   */
  function matcherFor(ns) {
      return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
  }
  /**
   * ?????????????????????
   * @param element
   * @param type
   * @param func
   * @param selector
   */
  function getHandlers(element, type, func, selector) {
      var event = parse(type);
      return (handlers[getElementId(element)] || []).filter(function (handler) { return handler &&
          (!event.type || handler.type === event.type) &&
          (!event.ns || matcherFor(event.ns).test(handler.ns)) &&
          (!func || getElementId(handler.func) === getElementId(func)) &&
          (!selector || handler.selector === selector); });
  }
  /**
   * ??????????????????
   * @param element
   * @param types
   * @param func
   * @param data
   * @param selector
   */
  function add(element, types, func, data, selector) {
      var elementId = getElementId(element);
      if (!handlers[elementId]) {
          handlers[elementId] = [];
      }
      // ?????? data.useCapture ????????? useCapture: true
      var useCapture = false;
      if (isObjectLike(data) && data.useCapture) {
          useCapture = true;
      }
      types.split(' ').forEach(function (type) {
          if (!type) {
              return;
          }
          var event = parse(type);
          function callFn(e, elem) {
              // ????????????????????????????????? detail ?????????????????????????????? e._detail ???????????????
              var result = func.apply(elem, 
              // @ts-ignore
              e._detail === undefined ? [e] : [e].concat(e._detail));
              if (result === false) {
                  e.preventDefault();
                  e.stopPropagation();
              }
          }
          function proxyFn(e) {
              // @ts-ignore
              if (e._ns && !matcherFor(e._ns).test(event.ns)) {
                  return;
              }
              // @ts-ignore
              e._data = data;
              if (selector) {
                  // ????????????
                  $(element)
                      .find(selector)
                      .get()
                      .reverse()
                      .forEach(function (elem) {
                      if (elem === e.target ||
                          contains(elem, e.target)) {
                          callFn(e, elem);
                      }
                  });
              }
              else {
                  // ?????????????????????
                  callFn(e, element);
              }
          }
          var handler = {
              type: event.type,
              ns: event.ns,
              func: func,
              selector: selector,
              id: handlers[elementId].length,
              proxy: proxyFn,
          };
          handlers[elementId].push(handler);
          element.addEventListener(handler.type, proxyFn, useCapture);
      });
  }
  /**
   * ??????????????????
   * @param element
   * @param types
   * @param func
   * @param selector
   */
  function remove(element, types, func, selector) {
      var handlersInElement = handlers[getElementId(element)] || [];
      var removeEvent = function (handler) {
          delete handlersInElement[handler.id];
          element.removeEventListener(handler.type, handler.proxy, false);
      };
      if (!types) {
          handlersInElement.forEach(function (handler) { return removeEvent(handler); });
      }
      else {
          types.split(' ').forEach(function (type) {
              if (type) {
                  getHandlers(element, type, func, selector).forEach(function (handler) { return removeEvent(handler); });
              }
          });
      }
  }

  $.fn.trigger = function (type, extraParameters) {
      var event = parse(type);
      var eventObject;
      var eventParams = {
          bubbles: true,
          cancelable: true,
      };
      var isMouseEvent = ['click', 'mousedown', 'mouseup', 'mousemove'].indexOf(event.type) > -1;
      if (isMouseEvent) {
          // Note: MouseEvent ???????????? detail ??????
          eventObject = new MouseEvent(event.type, eventParams);
      }
      else {
          eventParams.detail = extraParameters;
          eventObject = new CustomEvent(event.type, eventParams);
      }
      // @ts-ignore
      eventObject._detail = extraParameters;
      // @ts-ignore
      eventObject._ns = event.ns;
      return this.each(function () {
          this.dispatchEvent(eventObject);
      });
  };

  function extend(target, object1) {
      var objectN = [], len = arguments.length - 2;
      while ( len-- > 0 ) objectN[ len ] = arguments[ len + 2 ];

      objectN.unshift(object1);
      each(objectN, function (_, object) {
          each(object, function (prop, value) {
              if (!isUndefined(value)) {
                  target[prop] = value;
              }
          });
      });
      return target;
  }

  /**
   * ??????????????????????????????????????????????????????????????? URL ?????????????????????
   *
   * ???????????????????????????????????? serializeArray ????????????????????????
   * @param obj ???????????????
   * @example
  ```js
  param({ width: 1680, height: 1050 });
  // width=1680&height=1050
  ```
   * @example
  ```js
  param({ foo: { one: 1, two: 2 }})
  // foo[one]=1&foo[two]=2
  ```
   * @example
  ```js
  param({ids: [1, 2, 3]})
  // ids[]=1&ids[]=2&ids[]=3
  ```
   * @example
  ```js
  param([
    {"name":"name","value":"mdui"},
    {"name":"password","value":"123456"}
  ])
  // name=mdui&password=123456
  ```
   */
  function param(obj) {
      if (!isObjectLike(obj) && !Array.isArray(obj)) {
          return '';
      }
      var args = [];
      function destructure(key, value) {
          var keyTmp;
          if (isObjectLike(value)) {
              each(value, function (i, v) {
                  if (Array.isArray(value) && !isObjectLike(v)) {
                      keyTmp = '';
                  }
                  else {
                      keyTmp = i;
                  }
                  destructure((key + "[" + keyTmp + "]"), v);
              });
          }
          else {
              if (value == null || value === '') {
                  keyTmp = '=';
              }
              else {
                  keyTmp = "=" + (encodeURIComponent(value));
              }
              args.push(encodeURIComponent(key) + keyTmp);
          }
      }
      if (Array.isArray(obj)) {
          each(obj, function () {
              destructure(this.name, this.value);
          });
      }
      else {
          each(obj, destructure);
      }
      return args.join('&');
  }

  // ??????????????????
  var globalOptions = {};
  // ???????????????
  var ajaxEvents = {
      ajaxStart: 'start.mdui.ajax',
      ajaxSuccess: 'success.mdui.ajax',
      ajaxError: 'error.mdui.ajax',
      ajaxComplete: 'complete.mdui.ajax',
  };

  /**
   * ????????????????????????????????????????????????????????????
   * @param method ?????????????????????
   */
  function isQueryStringData(method) {
      return ['GET', 'HEAD'].indexOf(method) >= 0;
  }
  /**
   * ??????????????? URL ????????? URL ???????????? ? ???????????????????????? & ????????? ?
   * @param url
   * @param query
   */
  function appendQuery(url, query) {
      return (url + "&" + query).replace(/[&?]{1,2}/, '?');
  }
  /**
   * ???????????????????????????????????????options > globalOptions > defaults
   * @param options
   */
  function mergeOptions(options) {
      // ????????????
      var defaults = {
          url: '',
          method: 'GET',
          data: '',
          processData: true,
          async: true,
          cache: true,
          username: '',
          password: '',
          headers: {},
          xhrFields: {},
          statusCode: {},
          dataType: 'text',
          contentType: 'application/x-www-form-urlencoded',
          timeout: 0,
          global: true,
      };
      // globalOptions ???????????????????????????
      each(globalOptions, function (key, value) {
          var callbacks = [
              'beforeSend',
              'success',
              'error',
              'complete',
              'statusCode' ];
          // @ts-ignore
          if (callbacks.indexOf(key) < 0 && !isUndefined(value)) {
              defaults[key] = value;
          }
      });
      return extend({}, defaults, options);
  }
  /**
   * ?????? ajax ??????
   * @param options
   * @example
  ```js
  ajax({
    method: "POST",
    url: "some.php",
    data: { name: "John", location: "Boston" }
  }).then(function( msg ) {
    alert( "Data Saved: " + msg );
  });
  ```
   */
  function ajax(options) {
      // ?????????????????????
      var isCanceled = false;
      // ????????????
      var eventParams = {};
      // ????????????
      var mergedOptions = mergeOptions(options);
      var url = mergedOptions.url || window.location.toString();
      var method = mergedOptions.method.toUpperCase();
      var data = mergedOptions.data;
      var processData = mergedOptions.processData;
      var async = mergedOptions.async;
      var cache = mergedOptions.cache;
      var username = mergedOptions.username;
      var password = mergedOptions.password;
      var headers = mergedOptions.headers;
      var xhrFields = mergedOptions.xhrFields;
      var statusCode = mergedOptions.statusCode;
      var dataType = mergedOptions.dataType;
      var contentType = mergedOptions.contentType;
      var timeout = mergedOptions.timeout;
      var global = mergedOptions.global;
      // ?????????????????????
      // GET/HEAD ????????? processData ??? true ????????????????????????????????????????????????????????????
      if (data &&
          (isQueryStringData(method) || processData) &&
          !isString(data) &&
          !(data instanceof ArrayBuffer) &&
          !(data instanceof Blob) &&
          !(data instanceof Document) &&
          !(data instanceof FormData)) {
          data = param(data);
      }
      // ?????? GET???HEAD ????????????????????? data ??????????????? URL ???
      if (data && isQueryStringData(method)) {
          // ???????????????????????? URL ???
          url = appendQuery(url, data);
          data = null;
      }
      /**
       * ???????????????????????????
       * @param event
       * @param params
       * @param callback
       * @param args
       */
      function trigger(event, params, callback) {
          var args = [], len = arguments.length - 3;
          while ( len-- > 0 ) args[ len ] = arguments[ len + 3 ];

          // ??????????????????
          if (global) {
              $(document).trigger(event, params);
          }
          // ?????? ajax ???????????????
          var result1;
          var result2;
          if (callback) {
              // ????????????
              if (callback in globalOptions) {
                  // @ts-ignore
                  result1 = globalOptions[callback].apply(globalOptions, args);
              }
              // ???????????????
              if (mergedOptions[callback]) {
                  // @ts-ignore
                  result2 = mergedOptions[callback].apply(mergedOptions, args);
              }
              // beforeSend ???????????? false ????????? ajax ??????
              if (callback === 'beforeSend' &&
                  (result1 === false || result2 === false)) {
                  isCanceled = true;
              }
          }
      }
      // XMLHttpRequest ??????
      function XHR() {
          var textStatus;
          return new Promise(function (resolve, reject) {
              // GET/HEAD ?????????????????????
              if (isQueryStringData(method) && !cache) {
                  url = appendQuery(url, ("_=" + (Date.now())));
              }
              // ?????? XHR
              var xhr = new XMLHttpRequest();
              xhr.open(method, url, async, username, password);
              if (contentType ||
                  (data && !isQueryStringData(method) && contentType !== false)) {
                  xhr.setRequestHeader('Content-Type', contentType);
              }
              // ?????? Accept
              if (dataType === 'json') {
                  xhr.setRequestHeader('Accept', 'application/json, text/javascript');
              }
              // ?????? headers
              if (headers) {
                  each(headers, function (key, value) {
                      // undefined ???????????????string ??? null ????????????
                      if (!isUndefined(value)) {
                          xhr.setRequestHeader(key, value + ''); // ??? null ??????????????????
                      }
                  });
              }
              // ?????????????????????????????????????????????????????? X-Requested-With
              var crossDomain = /^([\w-]+:)?\/\/([^/]+)/.test(url) &&
                  RegExp.$2 !== window.location.host;
              if (!crossDomain) {
                  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
              }
              if (xhrFields) {
                  each(xhrFields, function (key, value) {
                      // @ts-ignore
                      xhr[key] = value;
                  });
              }
              eventParams.xhr = xhr;
              eventParams.options = mergedOptions;
              var xhrTimeout;
              xhr.onload = function () {
                  if (xhrTimeout) {
                      clearTimeout(xhrTimeout);
                  }
                  // AJAX ????????? HTTP ???????????????????????????
                  var isHttpStatusSuccess = (xhr.status >= 200 && xhr.status < 300) ||
                      xhr.status === 304 ||
                      xhr.status === 0;
                  var responseData;
                  if (isHttpStatusSuccess) {
                      if (xhr.status === 204 || method === 'HEAD') {
                          textStatus = 'nocontent';
                      }
                      else if (xhr.status === 304) {
                          textStatus = 'notmodified';
                      }
                      else {
                          textStatus = 'success';
                      }
                      if (dataType === 'json') {
                          try {
                              responseData =
                                  method === 'HEAD' ? undefined : JSON.parse(xhr.responseText);
                              eventParams.data = responseData;
                          }
                          catch (err) {
                              textStatus = 'parsererror';
                              trigger(ajaxEvents.ajaxError, eventParams, 'error', xhr, textStatus);
                              reject(new Error(textStatus));
                          }
                          if (textStatus !== 'parsererror') {
                              trigger(ajaxEvents.ajaxSuccess, eventParams, 'success', responseData, textStatus, xhr);
                              resolve(responseData);
                          }
                      }
                      else {
                          responseData =
                              method === 'HEAD'
                                  ? undefined
                                  : xhr.responseType === 'text' || xhr.responseType === ''
                                      ? xhr.responseText
                                      : xhr.response;
                          eventParams.data = responseData;
                          trigger(ajaxEvents.ajaxSuccess, eventParams, 'success', responseData, textStatus, xhr);
                          resolve(responseData);
                      }
                  }
                  else {
                      textStatus = 'error';
                      trigger(ajaxEvents.ajaxError, eventParams, 'error', xhr, textStatus);
                      reject(new Error(textStatus));
                  }
                  // statusCode
                  each([globalOptions.statusCode, statusCode], function (_, func) {
                      if (func && func[xhr.status]) {
                          if (isHttpStatusSuccess) {
                              func[xhr.status](responseData, textStatus, xhr);
                          }
                          else {
                              func[xhr.status](xhr, textStatus);
                          }
                      }
                  });
                  trigger(ajaxEvents.ajaxComplete, eventParams, 'complete', xhr, textStatus);
              };
              xhr.onerror = function () {
                  if (xhrTimeout) {
                      clearTimeout(xhrTimeout);
                  }
                  trigger(ajaxEvents.ajaxError, eventParams, 'error', xhr, xhr.statusText);
                  trigger(ajaxEvents.ajaxComplete, eventParams, 'complete', xhr, 'error');
                  reject(new Error(xhr.statusText));
              };
              xhr.onabort = function () {
                  var statusText = 'abort';
                  if (xhrTimeout) {
                      statusText = 'timeout';
                      clearTimeout(xhrTimeout);
                  }
                  trigger(ajaxEvents.ajaxError, eventParams, 'error', xhr, statusText);
                  trigger(ajaxEvents.ajaxComplete, eventParams, 'complete', xhr, statusText);
                  reject(new Error(statusText));
              };
              // ajax start ??????
              trigger(ajaxEvents.ajaxStart, eventParams, 'beforeSend', xhr);
              if (isCanceled) {
                  reject(new Error('cancel'));
                  return;
              }
              // Timeout
              if (timeout > 0) {
                  xhrTimeout = setTimeout(function () {
                      xhr.abort();
                  }, timeout);
              }
              // ?????? XHR
              xhr.send(data);
          });
      }
      return XHR();
  }

  $.ajax = ajax;

  /**
   * ??? Ajax ??????????????????????????????
   * @param options ???????????????
   * @example
  ```js
  ajaxSetup({
    dataType: 'json',
    method: 'POST',
  });
  ```
   */
  function ajaxSetup(options) {
      return extend(globalOptions, options);
  }

  $.ajaxSetup = ajaxSetup;

  $.contains = contains;

  var dataNS = '_mduiElementDataStorage';

  /**
   * ?????????????????????????????????
   * @param element
   * @param object
   */
  function setObjectToElement(element, object) {
      // @ts-ignore
      if (!element[dataNS]) {
          // @ts-ignore
          element[dataNS] = {};
      }
      each(object, function (key, value) {
          // @ts-ignore
          element[dataNS][toCamelCase(key)] = value;
      });
  }
  function data(element, key, value) {
      var obj;

      // ????????????????????????
      // data(element, { 'key' : 'value' })
      if (isObjectLike(key)) {
          setObjectToElement(element, key);
          return key;
      }
      // ?????? key???value ?????????
      // data(element, 'key', 'value')
      if (!isUndefined(value)) {
          setObjectToElement(element, ( obj = {}, obj[key] = value, obj ));
          return value;
      }
      // ???????????????
      // data(element)
      if (isUndefined(key)) {
          // @ts-ignore
          return element[dataNS] ? element[dataNS] : {};
      }
      // ??? dataNS ??????????????????
      // data(element, 'key')
      key = toCamelCase(key);
      // @ts-ignore
      if (element[dataNS] && key in element[dataNS]) {
          // @ts-ignore
          return element[dataNS][key];
      }
      return undefined;
  }

  $.data = data;

  $.each = each;

  $.extend = function () {
      var this$1 = this;
      var objectN = [], len = arguments.length;
      while ( len-- ) objectN[ len ] = arguments[ len ];

      if (objectN.length === 1) {
          each(objectN[0], function (prop, value) {
              this$1[prop] = value;
          });
          return this;
      }
      return extend.apply(void 0, [ objectN.shift(), objectN.shift() ].concat( objectN ));
  };

  function map(elements, callback) {
      var ref;

      var value;
      var ret = [];
      each(elements, function (i, element) {
          value = callback.call(window, element, i);
          if (value != null) {
              ret.push(value);
          }
      });
      return (ref = []).concat.apply(ref, ret);
  }

  $.map = map;

  $.merge = merge;

  $.param = param;

  /**
   * ????????????????????????????????????
   * @param element ?????????????????????
   * @param name
   * ????????????
   *
   * ???????????????????????????????????????????????????
   *
   * ?????????????????????????????????????????????????????????????????????
    @example
  ```js
  // ???????????????????????? name ?????????
  removeData(document.body, 'name');
  ```
   * @example
  ```js
  // ???????????????????????? name1 ??? name2 ?????????
  removeData(document.body, 'name1 name2');
  ```
   * @example
  ```js
  // ???????????????????????? name1 ??? name2 ?????????
  removeData(document.body, ['name1', 'name2']);
  ```
   * @example
  ```js
  // ???????????????????????????
  removeData(document.body);
  ```
   */
  function removeData(element, name) {
      // @ts-ignore
      if (!element[dataNS]) {
          return;
      }
      var remove = function (nameItem) {
          nameItem = toCamelCase(nameItem);
          // @ts-ignore
          if (element[dataNS][nameItem]) {
              // @ts-ignore
              element[dataNS][nameItem] = null;
              // @ts-ignore
              delete element[dataNS][nameItem];
          }
      };
      if (isUndefined(name)) {
          // @ts-ignore
          element[dataNS] = null;
          // @ts-ignore
          delete element[dataNS];
          // @ts-ignore
      }
      else if (isString(name)) {
          name
              .split(' ')
              .filter(function (nameItem) { return nameItem; })
              .forEach(function (nameItem) { return remove(nameItem); });
      }
      else {
          each(name, function (_, nameItem) { return remove(nameItem); });
      }
  }

  $.removeData = removeData;

  /**
   * ?????????????????????????????????
   * @param arr ??????
   * @example
  ```js
  unique([1, 2, 12, 3, 2, 1, 2, 1, 1]);
  // [1, 2, 12, 3]
  ```
   */
  function unique(arr) {
      var result = [];
      each(arr, function (_, val) {
          if (result.indexOf(val) === -1) {
              result.push(val);
          }
      });
      return result;
  }

  $.unique = unique;

  $.fn.add = function (selector) {
      return new JQ(unique(merge(this.get(), $(selector).get())));
  };

  each(['add', 'remove', 'toggle'], function (_, name) {
      $.fn[(name + "Class")] = function (className) {
          if (name === 'remove' && !arguments.length) {
              return this.each(function (_, element) {
                  element.setAttribute('class', '');
              });
          }
          return this.each(function (i, element) {
              if (!isElement(element)) {
                  return;
              }
              var classes = (isFunction(className)
                  ? className.call(element, i, element.getAttribute('class') || '')
                  : className)
                  .split(' ')
                  .filter(function (name) { return name; });
              each(classes, function (_, cls) {
                  element.classList[name](cls);
              });
          });
      };
  });

  each(['insertBefore', 'insertAfter'], function (nameIndex, name) {
      $.fn[name] = function (target) {
          var $element = nameIndex ? $(this.get().reverse()) : this; // ????????? jQuery ????????????
          var $target = $(target);
          var result = [];
          $target.each(function (index, target) {
              if (!target.parentNode) {
                  return;
              }
              $element.each(function (_, element) {
                  var newItem = index
                      ? element.cloneNode(true)
                      : element;
                  var existingItem = nameIndex ? target.nextSibling : target;
                  result.push(newItem);
                  target.parentNode.insertBefore(newItem, existingItem);
              });
          });
          return $(nameIndex ? result.reverse() : result);
      };
  });

  /**
   * ???????????? HTML ????????????????????? <> ??????
   * @param target
   */
  function isPlainText(target) {
      return (isString(target) && (target[0] !== '<' || target[target.length - 1] !== '>'));
  }
  each(['before', 'after'], function (nameIndex, name) {
      $.fn[name] = function () {
          var args = [], len = arguments.length;
          while ( len-- ) args[ len ] = arguments[ len ];

          // after ?????????????????????????????????????????????????????????????????????????????????????????????????????????
          if (nameIndex === 1) {
              args = args.reverse();
          }
          return this.each(function (index, element) {
              var targets = isFunction(args[0])
                  ? [args[0].call(element, index, element.innerHTML)]
                  : args;
              each(targets, function (_, target) {
                  var $target;
                  if (isPlainText(target)) {
                      $target = $(getChildNodesArray(target, 'div'));
                  }
                  else if (index && isElement(target)) {
                      $target = $(target.cloneNode(true));
                  }
                  else {
                      $target = $(target);
                  }
                  $target[nameIndex ? 'insertAfter' : 'insertBefore'](element);
              });
          });
      };
  });

  $.fn.off = function (types, selector, callback) {
      var this$1 = this;

      // types ?????????
      if (isObjectLike(types)) {
          each(types, function (type, fn) {
              // this.off('click', undefined, function () {})
              // this.off('click', '.box', function () {})
              this$1.off(type, selector, fn);
          });
          return this;
      }
      // selector ?????????
      if (selector === false || isFunction(selector)) {
          callback = selector;
          selector = undefined;
          // this.off('click', undefined, function () {})
      }
      // callback ?????? `false`???????????? `return false`
      if (callback === false) {
          callback = returnFalse;
      }
      return this.each(function () {
          remove(this, types, callback, selector);
      });
  };

  $.fn.on = function (types, selector, data, callback, one) {
      var this$1 = this;

      // types ????????? type/func ??????
      if (isObjectLike(types)) {
          // (types-Object, selector, data)
          if (!isString(selector)) {
              // (types-Object, data)
              data = data || selector;
              selector = undefined;
          }
          each(types, function (type, fn) {
              // selector ??? data ???????????? undefined
              // @ts-ignore
              this$1.on(type, selector, data, fn, one);
          });
          return this;
      }
      if (data == null && callback == null) {
          // (types, fn)
          callback = selector;
          data = selector = undefined;
      }
      else if (callback == null) {
          if (isString(selector)) {
              // (types, selector, fn)
              callback = data;
              data = undefined;
          }
          else {
              // (types, data, fn)
              callback = data;
              data = selector;
              selector = undefined;
          }
      }
      if (callback === false) {
          callback = returnFalse;
      }
      else if (!callback) {
          return this;
      }
      // $().one()
      if (one) {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          var _this = this;
          var origCallback = callback;
          callback = function (event) {
              _this.off(event.type, selector, callback);
              // eslint-disable-next-line prefer-rest-params
              return origCallback.apply(this, arguments);
          };
      }
      return this.each(function () {
          add(this, types, callback, data, selector);
      });
  };

  each(ajaxEvents, function (name, eventName) {
      $.fn[name] = function (fn) {
          return this.on(eventName, function (e, params) {
              fn(e, params.xhr, params.options, params.data);
          });
      };
  });

  $.fn.map = function (callback) {
      return new JQ(map(this, function (element, i) { return callback.call(element, i, element); }));
  };

  $.fn.clone = function () {
      return this.map(function () {
          return this.cloneNode(true);
      });
  };

  $.fn.is = function (selector) {
      var isMatched = false;
      if (isFunction(selector)) {
          this.each(function (index, element) {
              if (selector.call(element, index, element)) {
                  isMatched = true;
              }
          });
          return isMatched;
      }
      if (isString(selector)) {
          this.each(function (_, element) {
              if (isDocument(element) || isWindow(element)) {
                  return;
              }
              // @ts-ignore
              var matches = element.matches || element.msMatchesSelector;
              if (matches.call(element, selector)) {
                  isMatched = true;
              }
          });
          return isMatched;
      }
      var $compareWith = $(selector);
      this.each(function (_, element) {
          $compareWith.each(function (_, compare) {
              if (element === compare) {
                  isMatched = true;
              }
          });
      });
      return isMatched;
  };

  $.fn.remove = function (selector) {
      return this.each(function (_, element) {
          if (element.parentNode && (!selector || $(element).is(selector))) {
              element.parentNode.removeChild(element);
          }
      });
  };

  each(['prepend', 'append'], function (nameIndex, name) {
      $.fn[name] = function () {
          var args = [], len = arguments.length;
          while ( len-- ) args[ len ] = arguments[ len ];

          return this.each(function (index, element) {
              var ref;

              var childNodes = element.childNodes;
              var childLength = childNodes.length;
              var child = childLength
                  ? childNodes[nameIndex ? childLength - 1 : 0]
                  : document.createElement('div');
              if (!childLength) {
                  element.appendChild(child);
              }
              var contents = isFunction(args[0])
                  ? [args[0].call(element, index, element.innerHTML)]
                  : args;
              // ??????????????????????????????????????????????????????????????????????????????????????????????????????
              if (index) {
                  contents = contents.map(function (content) {
                      return isString(content) ? content : $(content).clone();
                  });
              }
              (ref = $(child))[nameIndex ? 'after' : 'before'].apply(ref, contents);
              if (!childLength) {
                  element.removeChild(child);
              }
          });
      };
  });

  each(['appendTo', 'prependTo'], function (nameIndex, name) {
      $.fn[name] = function (target) {
          var extraChilds = [];
          var $target = $(target).map(function (_, element) {
              var childNodes = element.childNodes;
              var childLength = childNodes.length;
              if (childLength) {
                  return childNodes[nameIndex ? 0 : childLength - 1];
              }
              var child = document.createElement('div');
              element.appendChild(child);
              extraChilds.push(child);
              return child;
          });
          var $result = this[nameIndex ? 'insertBefore' : 'insertAfter']($target);
          $(extraChilds).remove();
          return $result;
      };
  });

  each(['attr', 'prop', 'css'], function (nameIndex, name) {
      function set(element, key, value) {
          // ?????? undefined ???????????????
          if (isUndefined(value)) {
              return;
          }
          switch (nameIndex) {
              // attr
              case 0:
                  if (isNull(value)) {
                      element.removeAttribute(key);
                  }
                  else {
                      element.setAttribute(key, value);
                  }
                  break;
              // prop
              case 1:
                  // @ts-ignore
                  element[key] = value;
                  break;
              // css
              default:
                  key = toCamelCase(key);
                  // @ts-ignore
                  element.style[key] = isNumber(value)
                      ? ("" + value + (cssNumber.indexOf(key) > -1 ? '' : 'px'))
                      : value;
                  break;
          }
      }
      function get(element, key) {
          switch (nameIndex) {
              // attr
              case 0:
                  // ??????????????????????????? getAttribute ???????????? null?????? jquery ?????? undefined???????????? jquery ????????????
                  var value = element.getAttribute(key);
                  return isNull(value) ? undefined : value;
              // prop
              case 1:
                  // @ts-ignore
                  return element[key];
              // css
              default:
                  return getStyle(element, key);
          }
      }
      $.fn[name] = function (key, value) {
          var this$1 = this;

          if (isObjectLike(key)) {
              each(key, function (k, v) {
                  // @ts-ignore
                  this$1[name](k, v);
              });
              return this;
          }
          if (arguments.length === 1) {
              var element = this[0];
              return isElement(element) ? get(element, key) : undefined;
          }
          return this.each(function (i, element) {
              set(element, key, isFunction(value) ? value.call(element, i, get(element, key)) : value);
          });
      };
  });

  $.fn.children = function (selector) {
      var children = [];
      this.each(function (_, element) {
          each(element.childNodes, function (__, childNode) {
              if (!isElement(childNode)) {
                  return;
              }
              if (!selector || $(childNode).is(selector)) {
                  children.push(childNode);
              }
          });
      });
      return new JQ(unique(children));
  };

  $.fn.slice = function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return new JQ([].slice.apply(this, args));
  };

  $.fn.eq = function (index) {
      var ret = index === -1 ? this.slice(index) : this.slice(index, +index + 1);
      return new JQ(ret);
  };

  function dir($elements, nameIndex, node, selector, filter) {
      var ret = [];
      var target;
      $elements.each(function (_, element) {
          target = element[node];
          // ???????????????????????? document ??????
          while (target && isElement(target)) {
              // prevUntil, nextUntil, parentsUntil
              if (nameIndex === 2) {
                  if (selector && $(target).is(selector)) {
                      break;
                  }
                  if (!filter || $(target).is(filter)) {
                      ret.push(target);
                  }
              }
              // prev, next, parent
              else if (nameIndex === 0) {
                  if (!selector || $(target).is(selector)) {
                      ret.push(target);
                  }
                  break;
              }
              // prevAll, nextAll, parents
              else {
                  if (!selector || $(target).is(selector)) {
                      ret.push(target);
                  }
              }
              // @ts-ignore
              target = target[node];
          }
      });
      return new JQ(unique(ret));
  }

  each(['', 's', 'sUntil'], function (nameIndex, name) {
      $.fn[("parent" + name)] = function (selector, filter) {
          // parents???parentsUntil ???????????????????????????????????????????????? jQuery ???????????????
          var $nodes = !nameIndex ? this : $(this.get().reverse());
          return dir($nodes, nameIndex, 'parentNode', selector, filter);
      };
  });

  $.fn.closest = function (selector) {
      if (this.is(selector)) {
          return this;
      }
      var matched = [];
      this.parents().each(function (_, element) {
          if ($(element).is(selector)) {
              matched.push(element);
              return false;
          }
      });
      return new JQ(matched);
  };

  var rbrace = /^(?:{[\w\W]*\}|\[[\w\W]*\])$/;
  // ??? `data-*` ?????????????????????????????????????????????
  function getData(value) {
      if (value === 'true') {
          return true;
      }
      if (value === 'false') {
          return false;
      }
      if (value === 'null') {
          return null;
      }
      if (value === +value + '') {
          return +value;
      }
      if (rbrace.test(value)) {
          return JSON.parse(value);
      }
      return value;
  }
  // ??? value ?????????????????? `data-*` ????????????
  function dataAttr(element, key, value) {
      if (isUndefined(value) && element.nodeType === 1) {
          var name = 'data-' + toKebabCase(key);
          value = element.getAttribute(name);
          if (isString(value)) {
              try {
                  value = getData(value);
              }
              catch (e) { }
          }
          else {
              value = undefined;
          }
      }
      return value;
  }
  $.fn.data = function (key, value) {
      // ???????????????
      if (isUndefined(key)) {
          if (!this.length) {
              return undefined;
          }
          var element = this[0];
          var resultData = data(element);
          // window, document ???????????? `data-*` ??????
          if (element.nodeType !== 1) {
              return resultData;
          }
          // ??? `data-*` ????????????
          var attrs = element.attributes;
          var i = attrs.length;
          while (i--) {
              if (attrs[i]) {
                  var name = attrs[i].name;
                  if (name.indexOf('data-') === 0) {
                      name = toCamelCase(name.slice(5));
                      resultData[name] = dataAttr(element, name, resultData[name]);
                  }
              }
          }
          return resultData;
      }
      // ?????????????????????
      if (isObjectLike(key)) {
          return this.each(function () {
              data(this, key);
          });
      }
      // value ????????? undefined
      if (arguments.length === 2 && isUndefined(value)) {
          return this;
      }
      // ?????????
      if (!isUndefined(value)) {
          return this.each(function () {
              data(this, key, value);
          });
      }
      // ?????????
      if (!this.length) {
          return undefined;
      }
      return dataAttr(this[0], key, data(this[0], key));
  };

  $.fn.empty = function () {
      return this.each(function () {
          this.innerHTML = '';
      });
  };

  $.fn.extend = function (obj) {
      each(obj, function (prop, value) {
          // ??? JQ ????????????????????????????????????????????? typescript ???????????????
          $.fn[prop] = value;
      });
      return this;
  };

  $.fn.filter = function (selector) {
      if (isFunction(selector)) {
          return this.map(function (index, element) { return selector.call(element, index, element) ? element : undefined; });
      }
      if (isString(selector)) {
          return this.map(function (_, element) { return $(element).is(selector) ? element : undefined; });
      }
      var $selector = $(selector);
      return this.map(function (_, element) { return $selector.get().indexOf(element) > -1 ? element : undefined; });
  };

  $.fn.first = function () {
      return this.eq(0);
  };

  $.fn.has = function (selector) {
      var $targets = isString(selector) ? this.find(selector) : $(selector);
      var length = $targets.length;
      return this.map(function () {
          for (var i = 0; i < length; i += 1) {
              if (contains(this, $targets[i])) {
                  return this;
              }
          }
          return;
      });
  };

  $.fn.hasClass = function (className) {
      return this[0].classList.contains(className);
  };

  /**
   * ???????????? padding???border???margin ??????
   * @param element
   * @param name
   * @param value
   * @param funcIndex
   * @param includeMargin
   * @param multiply
   */
  function handleExtraWidth(element, name, value, funcIndex, includeMargin, multiply) {
      // ??????????????? padding, border, margin ??????????????????????????????
      var getExtraWidthValue = function (extra) {
          return (getExtraWidth(element, name.toLowerCase(), extra) *
              multiply);
      };
      if (funcIndex === 2 && includeMargin) {
          value += getExtraWidthValue('margin');
      }
      if (isBorderBox(element)) {
          // IE ??? box-sizing: border-box ???????????????????????? border ??? padding??????????????????
          // ???????????????????????????multiply === 1 ??? get
          if (isIE() && multiply === 1) {
              value += getExtraWidthValue('border');
              value += getExtraWidthValue('padding');
          }
          if (funcIndex === 0) {
              value -= getExtraWidthValue('border');
          }
          if (funcIndex === 1) {
              value -= getExtraWidthValue('border');
              value -= getExtraWidthValue('padding');
          }
      }
      else {
          if (funcIndex === 0) {
              value += getExtraWidthValue('padding');
          }
          if (funcIndex === 2) {
              value += getExtraWidthValue('border');
              value += getExtraWidthValue('padding');
          }
      }
      return value;
  }
  /**
   * ????????????????????????
   * @param element
   * @param name
   * @param funcIndex 0: innerWidth, innerHeight; 1: width, height; 2: outerWidth, outerHeight
   * @param includeMargin
   */
  function get(element, name, funcIndex, includeMargin) {
      var clientProp = "client" + name;
      var scrollProp = "scroll" + name;
      var offsetProp = "offset" + name;
      var innerProp = "inner" + name;
      // $(window).width()
      if (isWindow(element)) {
          // outerWidth, outerHeight ??????????????????????????????
          return funcIndex === 2
              ? element[innerProp]
              : toElement(document)[clientProp];
      }
      // $(document).width()
      if (isDocument(element)) {
          var doc = toElement(element);
          return Math.max(
          // @ts-ignore
          element.body[scrollProp], doc[scrollProp], 
          // @ts-ignore
          element.body[offsetProp], doc[offsetProp], doc[clientProp]);
      }
      var value = parseFloat(getComputedStyleValue(element, name.toLowerCase()) || '0');
      return handleExtraWidth(element, name, value, funcIndex, includeMargin, 1);
  }
  /**
   * ????????????????????????
   * @param element
   * @param elementIndex
   * @param name
   * @param funcIndex 0: innerWidth, innerHeight; 1: width, height; 2: outerWidth, outerHeight
   * @param includeMargin
   * @param value
   */
  function set(element, elementIndex, name, funcIndex, includeMargin, value) {
      var computedValue = isFunction(value)
          ? value.call(element, elementIndex, get(element, name, funcIndex, includeMargin))
          : value;
      if (computedValue == null) {
          return;
      }
      var $element = $(element);
      var dimension = name.toLowerCase();
      // ?????????????????????????????? padding???border???margin
      if (['auto', 'inherit', ''].indexOf(computedValue) > -1) {
          $element.css(dimension, computedValue);
          return;
      }
      // ?????????????????????????????????????????????????????? px ???????????????????????????????????????????????????
      var suffix = computedValue.toString().replace(/\b[0-9.]*/, '');
      var numerical = parseFloat(computedValue);
      computedValue =
          handleExtraWidth(element, name, numerical, funcIndex, includeMargin, -1) +
              (suffix || 'px');
      $element.css(dimension, computedValue);
  }
  each(['Width', 'Height'], function (_, name) {
      each([("inner" + name), name.toLowerCase(), ("outer" + name)], function (funcIndex, funcName) {
          $.fn[funcName] = function (margin, value) {
              // ?????????????????????
              var isSet = arguments.length && (funcIndex < 2 || !isBoolean(margin));
              var includeMargin = margin === true || value === true;
              // ???????????????????????????
              if (!isSet) {
                  return this.length
                      ? get(this[0], name, funcIndex, includeMargin)
                      : undefined;
              }
              // ????????????????????????
              return this.each(function (index, element) { return set(element, index, name, funcIndex, includeMargin, margin); });
          };
      });
  });

  $.fn.hide = function () {
      return this.each(function () {
          this.style.display = 'none';
      });
  };

  each(['val', 'html', 'text'], function (nameIndex, name) {
      var props = {
          0: 'value',
          1: 'innerHTML',
          2: 'textContent',
      };
      var propName = props[nameIndex];
      function get($elements) {
          // text() ???????????????????????????
          if (nameIndex === 2) {
              // @ts-ignore
              return map($elements, function (element) { return toElement(element)[propName]; }).join('');
          }
          // ???????????????val() ??? html() ?????? undefined
          if (!$elements.length) {
              return undefined;
          }
          // val() ??? html() ?????????????????????????????????
          var firstElement = $elements[0];
          // select multiple ????????????
          if (nameIndex === 0 && $(firstElement).is('select[multiple]')) {
              return map($(firstElement).find('option:checked'), function (element) { return element.value; });
          }
          // @ts-ignore
          return firstElement[propName];
      }
      function set(element, value) {
          // text() ??? html() ????????? undefined???????????????????????????
          // val() ????????? undefined ???????????????
          if (isUndefined(value)) {
              if (nameIndex !== 0) {
                  return;
              }
              value = '';
          }
          if (nameIndex === 1 && isElement(value)) {
              value = value.outerHTML;
          }
          // @ts-ignore
          element[propName] = value;
      }
      $.fn[name] = function (value) {
          // ?????????
          if (!arguments.length) {
              return get(this);
          }
          // ?????????
          return this.each(function (i, element) {
              var computedValue = isFunction(value)
                  ? value.call(element, i, get($(element)))
                  : value;
              // value ????????????????????????????????????????????????????????????????????????
              if (nameIndex === 0 && Array.isArray(computedValue)) {
                  // select[multiple]
                  if ($(element).is('select[multiple]')) {
                      map($(element).find('option'), function (option) { return (option.selected =
                          computedValue.indexOf(option.value) >
                              -1); });
                  }
                  // ?????? checkbox, radio ?????????
                  else {
                      element.checked =
                          computedValue.indexOf(element.value) > -1;
                  }
              }
              else {
                  set(element, computedValue);
              }
          });
      };
  });

  $.fn.index = function (selector) {
      if (!arguments.length) {
          return this.eq(0).parent().children().get().indexOf(this[0]);
      }
      if (isString(selector)) {
          return $(selector).get().indexOf(this[0]);
      }
      return this.get().indexOf($(selector)[0]);
  };

  $.fn.last = function () {
      return this.eq(-1);
  };

  each(['', 'All', 'Until'], function (nameIndex, name) {
      $.fn[("next" + name)] = function (selector, filter) {
          return dir(this, nameIndex, 'nextElementSibling', selector, filter);
      };
  });

  $.fn.not = function (selector) {
      var $excludes = this.filter(selector);
      return this.map(function (_, element) { return $excludes.index(element) > -1 ? undefined : element; });
  };

  /**
   * ???????????????????????????????????????
   */
  $.fn.offsetParent = function () {
      return this.map(function () {
          var offsetParent = this.offsetParent;
          while (offsetParent && $(offsetParent).css('position') === 'static') {
              offsetParent = offsetParent.offsetParent;
          }
          return offsetParent || document.documentElement;
      });
  };

  function floatStyle($element, name) {
      return parseFloat($element.css(name));
  }
  $.fn.position = function () {
      if (!this.length) {
          return undefined;
      }
      var $element = this.eq(0);
      var currentOffset;
      var parentOffset = {
          left: 0,
          top: 0,
      };
      if ($element.css('position') === 'fixed') {
          currentOffset = $element[0].getBoundingClientRect();
      }
      else {
          currentOffset = $element.offset();
          var $offsetParent = $element.offsetParent();
          parentOffset = $offsetParent.offset();
          parentOffset.top += floatStyle($offsetParent, 'border-top-width');
          parentOffset.left += floatStyle($offsetParent, 'border-left-width');
      }
      return {
          top: currentOffset.top - parentOffset.top - floatStyle($element, 'margin-top'),
          left: currentOffset.left -
              parentOffset.left -
              floatStyle($element, 'margin-left'),
      };
  };

  function get$1(element) {
      if (!element.getClientRects().length) {
          return { top: 0, left: 0 };
      }
      var rect = element.getBoundingClientRect();
      var win = element.ownerDocument.defaultView;
      return {
          top: rect.top + win.pageYOffset,
          left: rect.left + win.pageXOffset,
      };
  }
  function set$1(element, value, index) {
      var $element = $(element);
      var position = $element.css('position');
      if (position === 'static') {
          $element.css('position', 'relative');
      }
      var currentOffset = get$1(element);
      var currentTopString = $element.css('top');
      var currentLeftString = $element.css('left');
      var currentTop;
      var currentLeft;
      var calculatePosition = (position === 'absolute' || position === 'fixed') &&
          (currentTopString + currentLeftString).indexOf('auto') > -1;
      if (calculatePosition) {
          var currentPosition = $element.position();
          currentTop = currentPosition.top;
          currentLeft = currentPosition.left;
      }
      else {
          currentTop = parseFloat(currentTopString);
          currentLeft = parseFloat(currentLeftString);
      }
      var computedValue = isFunction(value)
          ? value.call(element, index, extend({}, currentOffset))
          : value;
      $element.css({
          top: computedValue.top != null
              ? computedValue.top - currentOffset.top + currentTop
              : undefined,
          left: computedValue.left != null
              ? computedValue.left - currentOffset.left + currentLeft
              : undefined,
      });
  }
  $.fn.offset = function (value) {
      // ????????????
      if (!arguments.length) {
          if (!this.length) {
              return undefined;
          }
          return get$1(this[0]);
      }
      // ????????????
      return this.each(function (index) {
          set$1(this, value, index);
      });
  };

  $.fn.one = function (types, selector, data, callback) {
      // @ts-ignore
      return this.on(types, selector, data, callback, true);
  };

  each(['', 'All', 'Until'], function (nameIndex, name) {
      $.fn[("prev" + name)] = function (selector, filter) {
          // prevAll???prevUntil ???????????????????????????????????????????????? jQuery ???????????????
          var $nodes = !nameIndex ? this : $(this.get().reverse());
          return dir($nodes, nameIndex, 'previousElementSibling', selector, filter);
      };
  });

  $.fn.removeAttr = function (attributeName) {
      var names = attributeName.split(' ').filter(function (name) { return name; });
      return this.each(function () {
          var this$1 = this;

          each(names, function (_, name) {
              this$1.removeAttribute(name);
          });
      });
  };

  $.fn.removeData = function (name) {
      return this.each(function () {
          removeData(this, name);
      });
  };

  $.fn.removeProp = function (name) {
      return this.each(function () {
          try {
              // @ts-ignore
              delete this[name];
          }
          catch (e) { }
      });
  };

  $.fn.replaceWith = function (newContent) {
      this.each(function (index, element) {
          var content = newContent;
          if (isFunction(content)) {
              content = content.call(element, index, element.innerHTML);
          }
          else if (index && !isString(content)) {
              content = $(content).clone();
          }
          $(element).before(content);
      });
      return this.remove();
  };

  $.fn.replaceAll = function (target) {
      var this$1 = this;

      return $(target).map(function (index, element) {
          $(element).replaceWith(index ? this$1.clone() : this$1);
          return this$1.get();
      });
  };

  /**
   * ?????????????????????????????????????????????
   * @returns {Array}
   */
  $.fn.serializeArray = function () {
      var result = [];
      this.each(function (_, element) {
          var elements = element instanceof HTMLFormElement ? element.elements : [element];
          $(elements).each(function (_, element) {
              var $element = $(element);
              var type = element.type;
              var nodeName = element.nodeName.toLowerCase();
              if (nodeName !== 'fieldset' &&
                  element.name &&
                  !element.disabled &&
                  ['input', 'select', 'textarea', 'keygen'].indexOf(nodeName) > -1 &&
                  ['submit', 'button', 'image', 'reset', 'file'].indexOf(type) === -1 &&
                  (['radio', 'checkbox'].indexOf(type) === -1 ||
                      element.checked)) {
                  var value = $element.val();
                  var valueArr = Array.isArray(value) ? value : [value];
                  valueArr.forEach(function (value) {
                      result.push({
                          name: element.name,
                          value: value,
                      });
                  });
              }
          });
      });
      return result;
  };

  $.fn.serialize = function () {
      return param(this.serializeArray());
  };

  var elementDisplay = {};
  /**
   * ????????????????????? display ???????????? .show() ??????
   * @param nodeName
   */
  function defaultDisplay(nodeName) {
      var element;
      var display;
      if (!elementDisplay[nodeName]) {
          element = document.createElement(nodeName);
          document.body.appendChild(element);
          display = getStyle(element, 'display');
          element.parentNode.removeChild(element);
          if (display === 'none') {
              display = 'block';
          }
          elementDisplay[nodeName] = display;
      }
      return elementDisplay[nodeName];
  }
  /**
   * ??????????????????
   * @returns {JQ}
   */
  $.fn.show = function () {
      return this.each(function () {
          if (this.style.display === 'none') {
              this.style.display = '';
          }
          if (getStyle(this, 'display') === 'none') {
              this.style.display = defaultDisplay(this.nodeName);
          }
      });
  };

  /**
   * ???????????????????????????
   * @param selector {String=}
   * @returns {JQ}
   */
  $.fn.siblings = function (selector) {
      return this.prevAll(selector).add(this.nextAll(selector));
  };

  /**
   * ???????????????????????????
   */
  $.fn.toggle = function () {
      return this.each(function () {
          getStyle(this, 'display') === 'none' ? $(this).show() : $(this).hide();
      });
  };

  return $;

})));
//# sourceMappingURL=jq.js.map
