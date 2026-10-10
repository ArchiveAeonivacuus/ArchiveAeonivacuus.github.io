// node_modules/.pnpm/delegate-it@6.4.0/node_modules/delegate-it/delegate.js
var ledger = /* @__PURE__ */ new WeakMap();
function editLedger(wanted, baseElement, callback, setup) {
  if (!wanted && !ledger.has(baseElement)) {
    return false;
  }
  const elementMap = ledger.get(baseElement) ?? /* @__PURE__ */ new WeakMap();
  ledger.set(baseElement, elementMap);
  const setups = elementMap.get(callback) ?? /* @__PURE__ */ new Set();
  elementMap.set(callback, setups);
  const existed = setups.has(setup);
  if (wanted) {
    setups.add(setup);
  } else {
    setups.delete(setup);
  }
  return existed && wanted;
}
function safeClosest(event, selector) {
  let target = event.target;
  if (target instanceof Text) {
    target = target.parentElement;
  }
  if (target instanceof Element && event.currentTarget instanceof Node) {
    const closest = target.closest(selector);
    if (closest && event.currentTarget.contains(closest)) {
      return closest;
    }
  }
}
function delegate(selector, type, callback, options = {}) {
  if (Array.isArray(type)) {
    for (const t of type) {
      delegate(selector, t, callback, options);
    }
    return;
  }
  const singleType = type;
  const { signal, base = document } = options;
  if (signal?.aborted) {
    return;
  }
  const { once, ...nativeListenerOptions } = options;
  const baseElement = base instanceof Document ? base.documentElement : base;
  const capture = Boolean(typeof options === "object" ? options.capture : options);
  const listenerFunction = (event) => {
    const delegateTarget = safeClosest(event, String(selector));
    if (delegateTarget) {
      const delegateEvent = Object.assign(event, { delegateTarget });
      callback.call(baseElement, delegateEvent);
      if (once) {
        baseElement.removeEventListener(singleType, listenerFunction, nativeListenerOptions);
        editLedger(false, baseElement, callback, setup);
      }
    }
  };
  const setup = JSON.stringify({ selector, type: singleType, capture });
  const isAlreadyListening = editLedger(true, baseElement, callback, setup);
  if (!isAlreadyListening) {
    baseElement.addEventListener(singleType, listenerFunction, nativeListenerOptions);
  }
  signal?.addEventListener("abort", () => {
    editLedger(false, baseElement, callback, setup);
  });
}
var delegate_default = delegate;

// node_modules/.pnpm/swup@4.10.0/node_modules/swup/dist/Swup.modern.js
function i() {
  return i = Object.assign ? Object.assign.bind() : function(t) {
    for (var e = 1; e < arguments.length; e++) {
      var i2 = arguments[e];
      for (var s2 in i2) ({}).hasOwnProperty.call(i2, s2) && (t[s2] = i2[s2]);
    }
    return t;
  }, i.apply(null, arguments);
}
var s = (t, e) => String(t).toLowerCase().replace(/[\s/_.]+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-").replace(/^-+|-+$/g, "") || e || "";
var n = ({ hash: t } = {}) => window.location.pathname + window.location.search + (t ? window.location.hash : "");
var o = (t, e = {}) => {
  const s2 = i({ url: t = t || n({ hash: true }), random: Math.random(), source: "swup" }, e);
  window.history.pushState(s2, "", t);
};
var r = (t = null, e = {}) => {
  t = t || n({ hash: true });
  const s2 = i({}, window.history.state || {}, { url: t, random: Math.random(), source: "swup" }, e);
  window.history.replaceState(s2, "", t);
};
var a = (e, s2, n2, o2) => {
  const r2 = new AbortController();
  return o2 = i({}, o2, { signal: r2.signal }), delegate_default(e, s2, n2, o2), { destroy: () => r2.abort() };
};
var l = class _l extends URL {
  constructor(t, e = document.baseURI) {
    super(t.toString(), e), Object.setPrototypeOf(this, _l.prototype);
  }
  get url() {
    return this.pathname + this.search;
  }
  static fromElement(t) {
    const e = t.getAttribute("href") || t.getAttribute("xlink:href") || "";
    return new _l(e);
  }
  static fromUrl(t) {
    return new _l(t);
  }
};
var c = class extends Error {
  constructor(t, e) {
    super(t), this.url = void 0, this.status = void 0, this.aborted = void 0, this.timedOut = void 0, this.name = "FetchError", this.url = e.url, this.status = e.status, this.aborted = e.aborted || false, this.timedOut = e.timedOut || false;
  }
};
async function u(t, e = {}) {
  var s2;
  t = l.fromUrl(t).url;
  const { visit: n2 = this.visit } = e, o2 = i({}, this.options.requestHeaders, e.headers), r2 = null != (s2 = e.timeout) ? s2 : this.options.timeout, a2 = new AbortController(), { signal: h } = a2;
  e = i({}, e, { headers: o2, signal: h });
  let u2, d2 = false, p2 = null;
  r2 && r2 > 0 && (p2 = setTimeout(() => {
    d2 = true, a2.abort("timeout");
  }, r2));
  try {
    u2 = await this.hooks.call("fetch:request", n2, { url: t, options: e }, (t2, { url: e2, options: i2 }) => fetch(e2, i2)), p2 && clearTimeout(p2);
  } catch (e2) {
    if (d2) throw this.hooks.call("fetch:timeout", n2, { url: t }), new c(`Request timed out: ${t}`, { url: t, timedOut: d2 });
    if ("AbortError" === (null == e2 ? void 0 : e2.name) || h.aborted) throw new c(`Request aborted: ${t}`, { url: t, aborted: true });
    throw e2;
  }
  const { status: m2, url: w2 } = u2, g2 = await u2.text();
  if (500 === m2) throw this.hooks.call("fetch:error", n2, { status: m2, response: u2, url: w2 }), new c(`Server error: ${w2}`, { status: m2, url: w2 });
  if (!g2) throw new c(`Empty response: ${w2}`, { status: m2, url: w2 });
  const { url: f2 } = l.fromUrl(w2), v = { url: f2, html: g2 };
  return !n2.cache.write || e.method && "GET" !== e.method || t !== f2 || this.cache.set(v.url, v), v;
}
var d = class {
  constructor(t) {
    this.swup = void 0, this.pages = /* @__PURE__ */ new Map(), this.swup = t;
  }
  get size() {
    return this.pages.size;
  }
  get all() {
    const t = /* @__PURE__ */ new Map();
    return this.pages.forEach((e, s2) => {
      t.set(s2, i({}, e));
    }), t;
  }
  has(t) {
    return this.pages.has(this.resolve(t));
  }
  get(t) {
    const e = this.pages.get(this.resolve(t));
    return e ? i({}, e) : e;
  }
  set(t, e) {
    e = i({}, e, { url: t = this.resolve(t) }), this.pages.set(t, e), this.swup.hooks.callSync("cache:set", void 0, { page: e });
  }
  update(t, e) {
    t = this.resolve(t);
    const s2 = i({}, this.get(t), e, { url: t });
    this.pages.set(t, s2);
  }
  delete(t) {
    this.pages.delete(this.resolve(t));
  }
  clear() {
    this.pages.clear(), this.swup.hooks.callSync("cache:clear", void 0, void 0);
  }
  prune(t) {
    this.pages.forEach((e, i2) => {
      t(i2, e) && this.delete(i2);
    });
  }
  resolve(t) {
    const { url: e } = l.fromUrl(t);
    return this.swup.resolveUrl(e);
  }
};
var p = (t, e = document) => e.querySelector(t);
var m = (t, e = document) => Array.from(e.querySelectorAll(t));
var w = () => new Promise((t) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      t();
    });
  });
});
function g(t) {
  return !!t && ("object" == typeof t || "function" == typeof t) && "function" == typeof t.then;
}
function f(t, e = []) {
  return new Promise((i2, s2) => {
    const n2 = t(...e);
    g(n2) ? n2.then(i2, s2) : i2(n2);
  });
}
function y(t, e) {
  const i2 = null == t ? void 0 : t.closest(`[${e}]`);
  return null != i2 && i2.hasAttribute(e) ? (null == i2 ? void 0 : i2.getAttribute(e)) || true : void 0;
}
var k = class {
  constructor(t) {
    this.swup = void 0, this.swupClasses = ["to-", "is-changing", "is-rendering", "is-popstate", "is-animating", "is-leaving"], this.swup = t;
  }
  get selectors() {
    const { scope: t } = this.swup.visit.animation;
    return "containers" === t ? this.swup.visit.containers : "html" === t ? ["html"] : Array.isArray(t) ? t : [];
  }
  get selector() {
    return this.selectors.join(",");
  }
  get targets() {
    return this.selector.trim() ? m(this.selector) : [];
  }
  add(...t) {
    this.targets.forEach((e) => e.classList.add(...t));
  }
  remove(...t) {
    this.targets.forEach((e) => e.classList.remove(...t));
  }
  clear() {
    this.targets.forEach((t) => {
      const e = t.className.split(" ").filter((t2) => this.isSwupClass(t2));
      t.classList.remove(...e);
    });
  }
  isSwupClass(t) {
    return this.swupClasses.some((e) => t.startsWith(e));
  }
};
var b = class {
  constructor(t, e) {
    this.id = void 0, this.state = void 0, this.from = void 0, this.to = void 0, this.containers = void 0, this.animation = void 0, this.trigger = void 0, this.cache = void 0, this.history = void 0, this.scroll = void 0, this.meta = void 0;
    const { to: i2, from: s2, hash: n2, el: o2, event: r2 } = e;
    this.id = Math.random(), this.state = 1, this.from = { url: null != s2 ? s2 : t.location.url, hash: t.location.hash }, this.to = { url: i2, hash: n2 }, this.containers = t.options.containers, this.animation = { animate: true, wait: false, name: void 0, native: t.options.native, scope: t.options.animationScope, selector: t.options.animationSelector }, this.trigger = { el: o2, event: r2 }, this.cache = { read: t.options.cache, write: t.options.cache }, this.history = { action: "push", popstate: false, direction: void 0 }, this.scroll = { reset: true, target: void 0 }, this.meta = {};
  }
  advance(t) {
    this.state < t && (this.state = t);
  }
  abort() {
    this.state = 8;
  }
  ignore() {
    this.state = 10;
  }
  get done() {
    return this.state >= 7;
  }
  get ignored() {
    return 10 === this.state;
  }
};
function S(t) {
  return new b(this, t);
}
var E = class {
  constructor(t) {
    this.swup = void 0, this.registry = /* @__PURE__ */ new Map(), this.hooks = ["animation:out:start", "animation:out:await", "animation:out:end", "animation:in:start", "animation:in:await", "animation:in:end", "animation:skip", "cache:clear", "cache:set", "content:replace", "content:scroll", "enable", "disable", "fetch:request", "fetch:error", "fetch:timeout", "history:popstate", "link:click", "link:self", "link:anchor", "link:newtab", "page:load", "page:view", "scroll:top", "scroll:anchor", "visit:start", "visit:transition", "visit:abort", "visit:end", "visit:fail"], this.nextHookId = 0, this.swup = t, this.init();
  }
  init() {
    this.hooks.forEach((t) => this.create(t));
  }
  create(t) {
    this.registry.has(t) || this.registry.set(t, /* @__PURE__ */ new Map());
  }
  exists(t) {
    return this.registry.has(t);
  }
  get(t) {
    const e = this.registry.get(t);
    if (e) return e;
    console.error(`Unknown hook '${t}'`);
  }
  clear() {
    this.registry.forEach((t) => t.clear());
  }
  on(t, e, s2 = {}) {
    const n2 = this.get(t);
    if (!n2) return console.warn(`Hook '${t}' not found.`), () => {
    };
    const o2 = i({}, s2, { id: ++this.nextHookId, hook: t, handler: e });
    return n2.set(e, o2), () => this.off(t, e);
  }
  before(t, e, s2 = {}) {
    return this.on(t, e, i({}, s2, { before: true }));
  }
  replace(t, e, s2 = {}) {
    return this.on(t, e, i({}, s2, { replace: true }));
  }
  once(t, e, s2 = {}) {
    return this.on(t, e, i({}, s2, { once: true }));
  }
  off(t, e) {
    const i2 = this.get(t);
    i2 && e ? i2.delete(e) || console.warn(`Handler for hook '${t}' not found.`) : i2 && i2.clear();
  }
  async call(t, e, i2, s2) {
    const [n2, o2, r2] = this.parseCallArgs(t, e, i2, s2), { before: a2, handler: l2, after: h } = this.getHandlers(t, r2);
    await this.run(a2, n2, o2);
    const [c2] = await this.run(l2, n2, o2, true);
    return await this.run(h, n2, o2), this.dispatchDomEvent(t, n2, o2), c2;
  }
  callSync(t, e, i2, s2) {
    const [n2, o2, r2] = this.parseCallArgs(t, e, i2, s2), { before: a2, handler: l2, after: h } = this.getHandlers(t, r2);
    this.runSync(a2, n2, o2);
    const [c2] = this.runSync(l2, n2, o2, true);
    return this.runSync(h, n2, o2), this.dispatchDomEvent(t, n2, o2), c2;
  }
  parseCallArgs(t, e, i2, s2) {
    return e instanceof b || "object" != typeof e && "function" != typeof i2 ? [e, i2, s2] : [void 0, e, i2];
  }
  async run(t, e = this.swup.visit, i2, s2 = false) {
    const n2 = [];
    for (const { hook: o2, handler: r2, defaultHandler: a2, once: l2 } of t) if (null == e || !e.done) {
      l2 && this.off(o2, r2);
      try {
        const t2 = await f(r2, [e, i2, a2]);
        n2.push(t2);
      } catch (t2) {
        if (s2) throw t2;
        console.error(`Error in hook '${o2}':`, t2);
      }
    }
    return n2;
  }
  runSync(t, e = this.swup.visit, i2, s2 = false) {
    const n2 = [];
    for (const { hook: o2, handler: r2, defaultHandler: a2, once: l2 } of t) if (null == e || !e.done) {
      l2 && this.off(o2, r2);
      try {
        const t2 = r2(e, i2, a2);
        n2.push(t2), g(t2) && console.warn(`Swup will not await Promises in handler for synchronous hook '${o2}'.`);
      } catch (t2) {
        if (s2) throw t2;
        console.error(`Error in hook '${o2}':`, t2);
      }
    }
    return n2;
  }
  getHandlers(t, e) {
    const i2 = this.get(t);
    if (!i2) return { found: false, before: [], handler: [], after: [], replaced: false };
    const s2 = Array.from(i2.values()), n2 = this.sortRegistrations, o2 = s2.filter(({ before: t2, replace: e2 }) => t2 && !e2).sort(n2), r2 = s2.filter(({ replace: t2 }) => t2).filter((t2) => true).sort(n2), a2 = s2.filter(({ before: t2, replace: e2 }) => !t2 && !e2).sort(n2), l2 = r2.length > 0;
    let h = [];
    if (e && (h = [{ id: 0, hook: t, handler: e }], l2)) {
      const i3 = r2.length - 1, { handler: s3, once: n3 } = r2[i3], o3 = (t2) => {
        const i4 = r2[t2 - 1];
        return i4 ? (e2, s4) => i4.handler(e2, s4, o3(t2 - 1)) : e;
      };
      h = [{ id: 0, hook: t, once: n3, handler: s3, defaultHandler: o3(i3) }];
    }
    return { found: true, before: o2, handler: h, after: a2, replaced: l2 };
  }
  sortRegistrations(t, e) {
    var i2, s2;
    return (null != (i2 = t.priority) ? i2 : 0) - (null != (s2 = e.priority) ? s2 : 0) || t.id - e.id || 0;
  }
  dispatchDomEvent(t, e, i2) {
    if (null != e && e.done) return;
    const s2 = { hook: t, args: i2, visit: e || this.swup.visit };
    document.dispatchEvent(new CustomEvent("swup:any", { detail: s2, bubbles: true })), document.dispatchEvent(new CustomEvent(`swup:${t}`, { detail: s2, bubbles: true }));
  }
  parseName(t) {
    const [e, ...s2] = t.split(".");
    return [e, s2.reduce((t2, e2) => i({}, t2, { [e2]: true }), {})];
  }
};
var C = (t) => {
  if (t && "#" === t.charAt(0) && (t = t.substring(1)), !t) return null;
  const e = decodeURIComponent(t);
  let i2 = document.getElementById(t) || document.getElementById(e) || p(`a[name='${CSS.escape(t)}']`) || p(`a[name='${CSS.escape(e)}']`);
  return i2 || "top" !== t || (i2 = document.body), i2;
};
var U = "transition";
var $ = "animation";
async function P({ selector: t, elements: e }) {
  if (false === t && !e) return;
  let i2 = [];
  if (e) i2 = Array.from(e);
  else if (t && (i2 = m(t, document.body), !i2.length)) return void console.warn(`[swup] No elements found matching animationSelector \`${t}\``);
  const s2 = i2.map((t2) => (function(t3) {
    const { type: e2, timeout: i3, propCount: s3 } = (function(t4) {
      const e3 = window.getComputedStyle(t4), i4 = x(e3, `${U}Delay`), s4 = x(e3, `${U}Duration`), n2 = A(i4, s4), o2 = x(e3, `${$}Delay`), r2 = x(e3, `${$}Duration`), a2 = A(o2, r2), l2 = Math.max(n2, a2), h = l2 > 0 ? n2 > a2 ? U : $ : null;
      return { type: h, timeout: l2, propCount: h ? h === U ? s4.length : r2.length : 0 };
    })(t3);
    return !(!e2 || !i3) && new Promise((n2) => {
      const o2 = `${e2}end`, r2 = performance.now();
      let a2 = 0;
      const l2 = () => {
        t3.removeEventListener(o2, h), n2();
      }, h = (e3) => {
        e3.target === t3 && ((performance.now() - r2) / 1e3 < e3.elapsedTime || ++a2 >= s3 && l2());
      };
      setTimeout(() => {
        a2 < s3 && l2();
      }, i3 + 1), t3.addEventListener(o2, h);
    });
  })(t2)).filter((t2) => false !== t2);
  s2.length ? await Promise.all(s2) : t && console.warn(`[swup] No CSS animation duration defined on elements matching \`${t}\``);
}
function x(t, e) {
  return (t[e] || "").split(", ");
}
function A(t, e) {
  for (; t.length < e.length; ) t = t.concat(t);
  return Math.max(...e.map((e2, i2) => H(e2) + H(t[i2])));
}
function H(t) {
  return 1e3 * parseFloat(t);
}
function V(t, e = {}, s2 = {}) {
  if ("string" != typeof t) throw new Error("swup.navigate() requires a URL parameter");
  if (this.shouldIgnoreVisit(t, { el: s2.el, event: s2.event })) return void window.location.assign(t);
  const { url: n2, hash: o2 } = l.fromUrl(t), r2 = this.createVisit(i({}, s2, { to: n2, hash: o2 }));
  this.performNavigation(r2, e);
}
async function I(t, e = {}) {
  if (this.navigating) {
    if (this.visit.state >= 6) return t.state = 2, void (this.onVisitEnd = () => this.performNavigation(t, e));
    await this.hooks.call("visit:abort", this.visit, void 0), delete this.visit.to.document, this.visit.state = 8;
  }
  this.navigating = true, this.visit = t;
  const { el: i2 } = t.trigger;
  e.referrer = e.referrer || this.location.url, false === e.animate && (t.animation.animate = false), t.animation.animate || this.classes.clear();
  const n2 = e.history || y(i2, "data-swup-history");
  "string" == typeof n2 && ["push", "replace"].includes(n2) && (t.history.action = n2);
  const a2 = e.animation || y(i2, "data-swup-animation");
  var h, c2;
  "string" == typeof a2 && (t.animation.name = a2), t.meta = e.meta || {}, "object" == typeof e.cache ? (t.cache.read = null != (h = e.cache.read) ? h : t.cache.read, t.cache.write = null != (c2 = e.cache.write) ? c2 : t.cache.write) : void 0 !== e.cache && (t.cache = { read: !!e.cache, write: !!e.cache }), delete e.cache;
  try {
    await this.hooks.call("visit:start", t, void 0), t.state = 3;
    const i3 = this.hooks.call("page:load", t, { options: e }, async (t2, e2) => {
      let i4;
      return t2.cache.read && (i4 = this.cache.get(t2.to.url)), e2.page = i4 || await this.fetchPage(t2.to.url, e2.options), e2.cache = !!i4, e2.page;
    });
    i3.then(({ html: e2 }) => {
      t.advance(5), t.to.html = e2, t.to.document = new DOMParser().parseFromString(e2, "text/html");
    });
    const n3 = t.to.url + t.to.hash;
    if (t.history.popstate || ("replace" === t.history.action || t.to.url === this.location.url ? r(n3) : (this.currentHistoryIndex++, o(n3, { index: this.currentHistoryIndex }))), this.location = l.fromUrl(n3), t.history.popstate && this.classes.add("is-popstate"), t.animation.name && this.classes.add(`to-${s(t.animation.name)}`), t.animation.wait && await i3, t.ignored) throw new Error(`Visit to ${t.to.url} manually ignored`);
    if (t.done) return;
    if (await this.hooks.call("visit:transition", t, void 0, async () => {
      if (!t.animation.animate) return await this.hooks.call("animation:skip", void 0), void await this.renderPage(t, await i3);
      t.advance(4), await this.animatePageOut(t), t.animation.native && document.startViewTransition ? await document.startViewTransition(async () => await this.renderPage(t, await i3)).finished : await this.renderPage(t, await i3), await this.animatePageIn(t);
    }), t.done) return;
    await this.hooks.call("visit:end", t, void 0, () => this.classes.clear()), t.state = 7, this.navigating = false, this.onVisitEnd && (this.onVisitEnd(), this.onVisitEnd = void 0);
  } catch (e2) {
    if (!e2 || null != e2 && e2.aborted) return void t.advance(8);
    if (t.ignored) return void L.call(this, t);
    await this.hooks.call("visit:fail", t, { error: e2 }, (t2, { error: e3 }) => {
      console.error(e3), L.call(this, t2);
    }), t.advance(9);
  } finally {
    delete t.to.document, this.visit === t && (this.navigating = false);
  }
}
function L(t) {
  const e = t.to.url + t.to.hash;
  n() === t.to.url ? (window.removeEventListener("popstate", this.handlePopState), window.addEventListener("popstate", () => window.location.assign(e), { once: true }), window.history.back()) : window.location.assign(e);
}
var T = async function(t) {
  await this.hooks.call("animation:out:start", t, void 0, () => {
    this.classes.add("is-changing", "is-animating", "is-leaving");
  }), await this.hooks.call("animation:out:await", t, { skip: false }, (t2, { skip: e }) => {
    if (!e) return this.awaitAnimations({ selector: t2.animation.selector });
  }), await this.hooks.call("animation:out:end", t, void 0);
};
var q = function(t) {
  var e;
  const i2 = t.to.document;
  if (!i2) return false;
  const s2 = (null == (e = i2.querySelector("title")) ? void 0 : e.innerText) || "";
  document.title = s2;
  const n2 = m('[data-swup-persist]:not([data-swup-persist=""])'), o2 = t.containers.map((t2) => {
    const e2 = document.querySelector(t2), s3 = i2.querySelector(t2);
    return e2 && s3 ? (e2.replaceWith(s3.cloneNode(true)), true) : (e2 || console.warn(`[swup] Container missing in current document: ${t2}`), s3 || console.warn(`[swup] Container missing in incoming document: ${t2}`), false);
  }).filter(Boolean);
  return n2.forEach((t2) => {
    const e2 = t2.getAttribute("data-swup-persist"), i3 = p(`[data-swup-persist="${e2}"]`);
    i3 && i3 !== t2 && i3.replaceWith(t2);
  }), o2.length === t.containers.length;
};
var R = function(t) {
  const e = { behavior: "auto" }, { target: s2, reset: n2 } = t.scroll, o2 = null != s2 ? s2 : t.to.hash;
  let r2 = false;
  return o2 && (r2 = this.hooks.callSync("scroll:anchor", t, { hash: o2, options: e }, (t2, { hash: e2, options: i2 }) => {
    const s3 = this.getAnchorElement(e2);
    return s3 && s3.scrollIntoView(i2), !!s3;
  })), n2 && !r2 && (r2 = this.hooks.callSync("scroll:top", t, { options: e }, (t2, { options: e2 }) => (window.scrollTo(i({ top: 0, left: 0 }, e2)), true))), r2;
};
var N = async function(t) {
  if (t.done) return;
  const e = this.hooks.call("animation:in:await", t, { skip: false }, (t2, { skip: e2 }) => {
    if (!e2) return this.awaitAnimations({ selector: t2.animation.selector });
  });
  await w(), await this.hooks.call("animation:in:start", t, void 0, () => {
    this.classes.remove("is-animating");
  }), await e, await this.hooks.call("animation:in:end", t, void 0);
};
var O = async function(t, e) {
  if (t.done) return;
  t.advance(6);
  const { url: i2 } = e;
  this.isSameResolvedUrl(n(), i2) || (r(i2), this.location = l.fromUrl(i2), t.to.url = this.location.url, t.to.hash = this.location.hash), await this.hooks.call("content:replace", t, { page: e }, (t2, {}) => {
    if (this.classes.remove("is-leaving"), t2.animation.animate && this.classes.add("is-rendering"), !this.replaceContent(t2)) throw new Error("[swup] Container mismatch, aborting");
    t2.animation.animate && (this.classes.add("is-changing", "is-animating", "is-rendering"), t2.animation.name && this.classes.add(`to-${s(t2.animation.name)}`));
  }), await this.hooks.call("content:scroll", t, void 0, () => this.scrollToContent(t)), await this.hooks.call("page:view", t, { url: this.location.url, title: document.title });
};
var D = function(t) {
  var e;
  if (e = t, Boolean(null == e ? void 0 : e.isSwupPlugin)) {
    if (t.swup = this, !t._checkRequirements || t._checkRequirements()) return t._beforeMount && t._beforeMount(), t.mount(), this.plugins.push(t), this.plugins;
  } else console.error("Not a swup plugin instance", t);
};
function M(t) {
  const e = this.findPlugin(t);
  if (e) return e.unmount(), e._afterUnmount && e._afterUnmount(), this.plugins = this.plugins.filter((t2) => t2 !== e), this.plugins;
  console.error("No such plugin", e);
}
function W(t) {
  return this.plugins.find((e) => "string" == typeof t ? [`Swup${t}`, t].includes(e.name) : e === t);
}
function j(t) {
  if ("function" != typeof this.options.resolveUrl) return console.warn("[swup] options.resolveUrl expects a callback function."), t;
  const e = this.options.resolveUrl(t);
  return e && "string" == typeof e ? e.startsWith("//") || e.startsWith("http") ? (console.warn("[swup] options.resolveUrl needs to return a relative url"), t) : e : (console.warn("[swup] options.resolveUrl needs to return a url"), t);
}
function B(t, e) {
  return this.resolveUrl(t) === this.resolveUrl(e);
}
var _ = { animateHistoryBrowsing: false, animationSelector: '[class*="transition-"]', animationScope: "html", cache: true, containers: ["#swup"], hooks: {}, ignoreVisit: (t, { el: e } = {}) => !(null == e || !e.closest("[data-no-swup]")), linkSelector: "a[href]", linkToSelf: "scroll", native: false, plugins: [], resolveUrl: (t) => t, requestHeaders: { "X-Requested-With": "swup", Accept: "text/html, application/xhtml+xml" }, skipPopStateHandling: (t) => {
  var e;
  return "swup" !== (null == (e = t.state) ? void 0 : e.source);
}, timeout: 0 };
var F = class {
  get currentPageUrl() {
    return this.location.url;
  }
  constructor(t = {}) {
    var e, s2;
    this.version = "4.10.0", this.options = void 0, this.defaults = _, this.plugins = [], this.visit = void 0, this.cache = void 0, this.hooks = void 0, this.classes = void 0, this.location = l.fromUrl(window.location.href), this.currentHistoryIndex = void 0, this.clickDelegate = void 0, this.navigating = false, this.onVisitEnd = void 0, this.use = D, this.unuse = M, this.findPlugin = W, this.log = () => {
    }, this.navigate = V, this.performNavigation = I, this.createVisit = S, this.delegateEvent = a, this.fetchPage = u, this.awaitAnimations = P, this.renderPage = O, this.replaceContent = q, this.animatePageIn = N, this.animatePageOut = T, this.scrollToContent = R, this.getAnchorElement = C, this.getCurrentUrl = n, this.resolveUrl = j, this.isSameResolvedUrl = B, this.options = i({}, this.defaults, t), this.handleLinkClick = this.handleLinkClick.bind(this), this.handlePopState = this.handlePopState.bind(this), this.cache = new d(this), this.classes = new k(this), this.hooks = new E(this), this.visit = this.createVisit({ to: "" }), this.currentHistoryIndex = null != (e = null == (s2 = window.history.state) ? void 0 : s2.index) ? e : 1, this.enable();
  }
  async enable() {
    var t;
    const { linkSelector: e } = this.options;
    this.clickDelegate = this.delegateEvent(e, "click", this.handleLinkClick), window.addEventListener("popstate", this.handlePopState), this.options.animateHistoryBrowsing && (window.history.scrollRestoration = "manual"), this.options.native = this.options.native && !!document.startViewTransition, this.options.plugins.forEach((t2) => this.use(t2));
    for (const [t2, e2] of Object.entries(this.options.hooks)) {
      const [i2, s2] = this.hooks.parseName(t2);
      this.hooks.on(i2, e2, s2);
    }
    "swup" !== (null == (t = window.history.state) ? void 0 : t.source) && r(null, { index: this.currentHistoryIndex }), await w(), await this.hooks.call("enable", void 0, void 0, () => {
      const t2 = document.documentElement;
      t2.classList.add("swup-enabled"), t2.classList.toggle("swup-native", this.options.native);
    });
  }
  async destroy() {
    this.clickDelegate.destroy(), window.removeEventListener("popstate", this.handlePopState), this.cache.clear(), this.plugins.forEach((t) => this.unuse(t)), await this.hooks.call("disable", void 0, void 0, () => {
      const t = document.documentElement;
      t.classList.remove("swup-enabled"), t.classList.remove("swup-native");
    }), this.hooks.clear();
  }
  shouldIgnoreVisit(t, { el: e, event: i2 } = {}) {
    const { origin: s2, url: n2, hash: o2 } = l.fromUrl(t);
    return s2 !== window.location.origin || !(!e || !this.triggerWillOpenNewWindow(e)) || !!this.options.ignoreVisit(n2 + o2, { el: e, event: i2 });
  }
  handleLinkClick(t) {
    const e = t.delegateTarget, { href: i2, url: s2, hash: n2 } = l.fromElement(e);
    if (this.shouldIgnoreVisit(i2, { el: e, event: t })) return;
    if (this.navigating && s2 === this.visit.to.url) return void t.preventDefault();
    const o2 = this.createVisit({ to: s2, hash: n2, el: e, event: t });
    t.metaKey || t.ctrlKey || t.shiftKey || t.altKey ? this.hooks.callSync("link:newtab", o2, { href: i2 }) : 0 === t.button && this.hooks.callSync("link:click", o2, { el: e, event: t }, () => {
      var e2;
      const i3 = null != (e2 = o2.from.url) ? e2 : "";
      t.preventDefault(), s2 && s2 !== i3 ? this.isSameResolvedUrl(s2, i3) || this.performNavigation(o2) : n2 ? this.hooks.callSync("link:anchor", o2, { hash: n2 }, () => {
        r(s2 + n2), this.scrollToContent(o2);
      }) : this.hooks.callSync("link:self", o2, void 0, () => {
        "navigate" === this.options.linkToSelf ? this.performNavigation(o2) : (r(s2), this.scrollToContent(o2));
      });
    });
  }
  handlePopState(t) {
    var e, i2, s2, o2;
    const r2 = null != (e = null == (i2 = t.state) ? void 0 : i2.url) ? e : window.location.href;
    if (this.options.skipPopStateHandling(t)) return;
    if (this.isSameResolvedUrl(n(), this.location.url)) return;
    const { url: a2, hash: h } = l.fromUrl(r2), c2 = this.createVisit({ to: a2, hash: h, event: t });
    c2.history.popstate = true;
    const u2 = null != (s2 = null == (o2 = t.state) ? void 0 : o2.index) ? s2 : 0;
    u2 && u2 !== this.currentHistoryIndex && (c2.history.direction = u2 - this.currentHistoryIndex > 0 ? "forwards" : "backwards", this.currentHistoryIndex = u2), c2.animation.animate = false, c2.scroll.reset = false, c2.scroll.target = false, this.options.animateHistoryBrowsing && !t.hasUAVisualTransition && (c2.animation.animate = true, c2.scroll.reset = true), this.hooks.callSync("history:popstate", c2, { event: t }, () => {
      this.performNavigation(c2);
    });
  }
  triggerWillOpenNewWindow(t) {
    return !!t.matches('[download], [target="_blank"]');
  }
};

// assets/scripts/settings.ts
var root = document.documentElement;
var media = window.matchMedia("(prefers-color-scheme: dark)");
var themeSequence = ["light", "dark", "auto"];
var storage = {
  get(key, fallback) {
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
    }
  }
};
var theme = storage.get("theme", "auto");
if (!themeSequence.includes(theme)) theme = "auto";
function isDark() {
  return root.classList.contains("dark");
}
function applyTheme(value) {
  root.classList.toggle("dark", value === "dark" || value === "auto" && media.matches);
  root.dataset.theme = value;
  const button = document.querySelector("#theme-toggle");
  if (button) button.title = `\u4E3B\u9898\uFF1A${value}`;
  window.dispatchEvent(new Event("themechange"));
}
function closePanels(except) {
  document.querySelectorAll(".float-panel").forEach((panel) => {
    if (panel !== except) panel.classList.add("is-closed");
  });
  document.querySelectorAll("[aria-expanded]").forEach((button) => {
    const controlled = button.id === "search-switch" ? "search-panel" : button.id === "display-settings-switch" ? "display-setting" : button.id === "nav-menu-switch" ? "nav-menu-panel" : "";
    if (!except || controlled !== except.id) button.setAttribute("aria-expanded", "false");
  });
}
function bindPanel(buttonSelector, panelSelector, focusSelector) {
  const button = document.querySelector(buttonSelector);
  const panel = document.querySelector(panelSelector);
  if (!button || !panel) return;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = panel.classList.contains("is-closed");
    closePanels(willOpen ? panel : void 0);
    panel.classList.toggle("is-closed", !willOpen);
    button.setAttribute("aria-expanded", String(willOpen));
    if (willOpen && focusSelector) document.querySelector(focusSelector)?.focus();
  });
  panel.addEventListener("click", (event) => event.stopPropagation());
}
var mounted = false;
function mountSettings() {
  applyTheme(theme);
  media.addEventListener("change", () => {
    if (theme === "auto") applyTheme(theme);
  });
  if (mounted) return;
  mounted = true;
  document.querySelector("#theme-toggle")?.addEventListener("click", () => {
    theme = themeSequence[(themeSequence.indexOf(theme) + 1) % themeSequence.length] ?? "auto";
    storage.set("theme", theme);
    applyTheme(theme);
  });
  const slider = document.querySelector("#color-slider");
  const hue = storage.get("hue", "265");
  root.style.setProperty("--hue", hue);
  if (slider) {
    slider.value = hue;
    slider.addEventListener("input", () => {
      root.style.setProperty("--hue", slider.value);
      storage.set("hue", slider.value);
    });
  }
  bindPanel("#display-settings-switch", "#display-setting");
  bindPanel("#search-switch", "#search-panel", "#search-input");
  bindPanel("#nav-menu-switch", "#nav-menu-panel");
  document.addEventListener("click", () => closePanels());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePanels();
  });
}

// assets/scripts/search.ts
var pagefindPromise = null;
async function getPagefind() {
  if (!pagefindPromise) {
    pagefindPromise = (async () => {
      try {
        const url = "/pagefind/pagefind.js";
        const module = await import(
          /* @vite-ignore */
          url
        );
        await module.options?.({ excerptLength: 30 });
        return module;
      } catch {
        return null;
      }
    })();
  }
  return pagefindPromise;
}
function appendResult(container, title, href, excerpt) {
  const link = document.createElement("a");
  link.className = "search-result";
  link.href = href;
  const strong = document.createElement("strong");
  strong.textContent = title;
  link.append(strong);
  if (excerpt) {
    const small = document.createElement("small");
    small.innerHTML = excerpt;
    link.append(small);
  }
  container.append(link);
}
function mountSearch() {
  const input = document.querySelector("#search-input");
  const desktopInput = document.querySelector("#desktop-search-input");
  const results = document.querySelector("#search-results");
  if (!input || !results) return;
  const panel = document.querySelector("#search-panel");
  let sequence = 0;
  let timer;
  const run = async (source) => {
    if (source !== input) input.value = source.value;
    const query = source.value.trim();
    const current = ++sequence;
    results.replaceChildren();
    if (!query) return;
    const pagefind = await getPagefind();
    if (pagefind) {
      try {
        const response = await pagefind.search(query);
        const data2 = await Promise.all(response.results.slice(0, 8).map((item) => item.data()));
        if (current !== sequence) return;
        for (const item of data2) appendResult(results, item.meta.title ?? item.url, item.url, item.excerpt);
        if (results.childElementCount > 0) panel?.classList.remove("is-closed");
        return;
      } catch {
      }
    }
    const links = Array.from(document.querySelectorAll(".post-card h2 a"));
    for (const link of links.filter((item) => item.textContent?.toLocaleLowerCase().includes(query.toLocaleLowerCase())).slice(0, 8)) {
      appendResult(results, link.textContent?.trim() ?? link.href, link.href);
    }
    if (results.childElementCount > 0) panel?.classList.remove("is-closed");
  };
  const schedule = (source) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      void run(source);
    }, 200);
  };
  input.addEventListener("input", () => schedule(input));
  desktopInput?.addEventListener("input", () => schedule(desktopInput));
  desktopInput?.addEventListener("focus", () => {
    if (desktopInput.value.trim()) panel?.classList.remove("is-closed");
  });
  panel?.addEventListener("click", (event) => {
    if (event.target.closest(".search-result")) panel.classList.add("is-closed");
  });
}

// assets/scripts/scroll.ts
function bannerPageHeight() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--banner-page").trim();
  const value = Number.parseFloat(raw);
  return raw.includes("vh") ? window.innerHeight * value / 100 : value;
}
function mountScroll() {
  const topButton = document.querySelector("#back-to-top-btn");
  const navbar = document.querySelector("#navbar-wrapper");
  const update = () => {
    const visibleBanner = bannerPageHeight();
    topButton?.classList.toggle("hide", window.scrollY < visibleBanner);
    navbar?.classList.toggle("navbar-hidden", window.scrollY > Math.max(80, visibleBanner - 120));
    document.querySelector("#toc.toc-wrapper")?.classList.toggle("toc-hide", window.scrollY < visibleBanner);
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  topButton?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  update();
}

// assets/scripts/lifecycle.ts
var cleanups = [];
function register(cleanup) {
  cleanups.push(cleanup);
}
function cleanupPage() {
  while (cleanups.length > 0) {
    const cleanup = cleanups.pop();
    try {
      cleanup?.();
    } catch {
    }
  }
}

// assets/scripts/toc.ts
var MAX_LEVELS = 2;
function slugify(text) {
  return text.trim().toLocaleLowerCase().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}_-]+/gu, "").replace(/^-+|-+$/g, "");
}
function mountToc() {
  const wrapper = document.querySelector("#toc");
  const list = document.querySelector("#toc .toc-list");
  if (!wrapper || !list) return;
  const headings = Array.from(
    document.querySelectorAll(".markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4")
  ).filter((heading) => (heading.textContent ?? "").trim() !== "");
  list.replaceChildren();
  if (headings.length === 0) {
    wrapper.classList.add("toc-empty");
    return;
  }
  wrapper.classList.remove("toc-empty");
  const minLevel = Math.min(...headings.map((heading) => Number(heading.tagName.slice(1))));
  const used = /* @__PURE__ */ new Set();
  const entries = [];
  let topLevelIndex = 0;
  for (const heading of headings) {
    const depth = Number(heading.tagName.slice(1));
    if (depth >= minLevel + MAX_LEVELS) continue;
    const base = heading.id || slugify(heading.textContent ?? "") || "section";
    let id = base;
    let counter = 1;
    while (used.has(id)) id = `${base}-${counter++}`;
    used.add(id);
    heading.id = id;
    const level = Math.min(3, depth - minLevel + 1);
    const link = document.createElement("a");
    link.href = `#${id}`;
    link.className = `toc-link toc-level-${level}`;
    const badge = document.createElement("div");
    badge.className = `toc-badge toc-badge-${level}`;
    if (level === 1) badge.textContent = String(++topLevelIndex);
    const label = document.createElement("div");
    label.className = "toc-label";
    label.textContent = (heading.textContent ?? "").trim();
    link.append(badge, label);
    list.append(link);
    entries.push({ el: heading, link });
  }
  const indicator = document.createElement("div");
  indicator.className = "toc-indicator";
  list.prepend(indicator);
  const scroller = list.parentElement;
  const update = () => {
    let activeIndex = -1;
    for (let i2 = 0; i2 < entries.length; i2++) {
      const candidate = entries[i2];
      if (candidate && candidate.el.getBoundingClientRect().top <= window.innerHeight * 0.28) activeIndex = i2;
    }
    if (activeIndex < 0) {
      indicator.style.opacity = "0";
      return;
    }
    const entry = entries[activeIndex];
    if (!entry) {
      indicator.style.opacity = "0";
      return;
    }
    const { link } = entry;
    indicator.style.opacity = "1";
    indicator.style.top = `${link.offsetTop}px`;
    indicator.style.height = `${link.offsetHeight}px`;
    if (!scroller) return;
    const top = link.offsetTop;
    const bottom = top + link.offsetHeight;
    const viewTop = scroller.scrollTop;
    const viewBottom = viewTop + scroller.clientHeight;
    if (top < viewTop + 16) scroller.scrollTo({ top: Math.max(0, top - 16), behavior: "smooth" });
    else if (bottom > viewBottom - 16) scroller.scrollTo({ top: bottom - scroller.clientHeight + 16, behavior: "smooth" });
  };
  const observer = new IntersectionObserver(update, { rootMargin: "-20% 0px -65% 0px" });
  entries.forEach((entry) => observer.observe(entry.el));
  update();
  register(() => observer.disconnect());
  window.dispatchEvent(new Event("scroll"));
}

// assets/scripts/comments.ts
var REPO = "ArchiveAeonivacuus/ArchiveAeonivacuus.github.io";
var REPO_ID = "R_kgDOQb_VFw";
var CATEGORY = "Announcements";
var CATEGORY_ID = "DIC_kwDOQb_VF84Cy0te";
function giscusTheme() {
  return isDark() ? "dark" : "light";
}
function updateCommentsTheme() {
  const frame = document.querySelector("iframe.giscus-frame");
  frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme: giscusTheme() } } }, "https://giscus.app");
}
var themeObserver = null;
function observeTheme() {
  if (themeObserver) return;
  themeObserver = new MutationObserver(updateCommentsTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("themechange", updateCommentsTheme);
}
function mountComments() {
  observeTheme();
  const container = document.querySelector("#comments");
  if (!container) return;
  container.querySelector("script[src*='giscus']")?.remove();
  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", REPO);
  script.setAttribute("data-repo-id", REPO_ID);
  script.setAttribute("data-category", CATEGORY);
  script.setAttribute("data-category-id", CATEGORY_ID);
  script.setAttribute("data-mapping", "title");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "top");
  script.setAttribute("data-theme", giscusTheme());
  script.setAttribute("data-lang", "zh-CN");
  script.setAttribute("data-loading", "lazy");
  container.append(script);
}

// node_modules/.pnpm/photoswipe@5.4.4/node_modules/photoswipe/dist/photoswipe.esm.js
function createElement(className, tagName, appendToEl) {
  const el = document.createElement(tagName);
  if (className) {
    el.className = className;
  }
  if (appendToEl) {
    appendToEl.appendChild(el);
  }
  return el;
}
function equalizePoints(p1, p2) {
  p1.x = p2.x;
  p1.y = p2.y;
  if (p2.id !== void 0) {
    p1.id = p2.id;
  }
  return p1;
}
function roundPoint(p2) {
  p2.x = Math.round(p2.x);
  p2.y = Math.round(p2.y);
}
function getDistanceBetween(p1, p2) {
  const x2 = Math.abs(p1.x - p2.x);
  const y2 = Math.abs(p1.y - p2.y);
  return Math.sqrt(x2 * x2 + y2 * y2);
}
function pointsEqual(p1, p2) {
  return p1.x === p2.x && p1.y === p2.y;
}
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
function toTransformString(x2, y2, scale) {
  let propValue = `translate3d(${x2}px,${y2 || 0}px,0)`;
  if (scale !== void 0) {
    propValue += ` scale3d(${scale},${scale},1)`;
  }
  return propValue;
}
function setTransform(el, x2, y2, scale) {
  el.style.transform = toTransformString(x2, y2, scale);
}
var defaultCSSEasing = "cubic-bezier(.4,0,.22,1)";
function setTransitionStyle(el, prop, duration, ease) {
  el.style.transition = prop ? `${prop} ${duration}ms ${ease || defaultCSSEasing}` : "none";
}
function setWidthHeight(el, w2, h) {
  el.style.width = typeof w2 === "number" ? `${w2}px` : w2;
  el.style.height = typeof h === "number" ? `${h}px` : h;
}
function removeTransitionStyle(el) {
  setTransitionStyle(el);
}
function decodeImage(img) {
  if ("decode" in img) {
    return img.decode().catch(() => {
    });
  }
  if (img.complete) {
    return Promise.resolve(img);
  }
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}
var LOAD_STATE = {
  IDLE: "idle",
  LOADING: "loading",
  LOADED: "loaded",
  ERROR: "error"
};
function specialKeyUsed(e) {
  return "button" in e && e.button === 1 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;
}
function getElementsFromOption(option, legacySelector, parent = document) {
  let elements = [];
  if (option instanceof Element) {
    elements = [option];
  } else if (option instanceof NodeList || Array.isArray(option)) {
    elements = Array.from(option);
  } else {
    const selector = typeof option === "string" ? option : legacySelector;
    if (selector) {
      elements = Array.from(parent.querySelectorAll(selector));
    }
  }
  return elements;
}
function isSafari() {
  return !!(navigator.vendor && navigator.vendor.match(/apple/i));
}
var supportsPassive = false;
try {
  window.addEventListener("test", null, Object.defineProperty({}, "passive", {
    get: () => {
      supportsPassive = true;
    }
  }));
} catch (e) {
}
var DOMEvents = class {
  constructor() {
    this._pool = [];
  }
  /**
   * Adds event listeners
   *
   * @param {PoolItem['target']} target
   * @param {PoolItem['type']} type Can be multiple, separated by space.
   * @param {PoolItem['listener']} listener
   * @param {PoolItem['passive']} [passive]
   */
  add(target, type, listener, passive) {
    this._toggleListener(target, type, listener, passive);
  }
  /**
   * Removes event listeners
   *
   * @param {PoolItem['target']} target
   * @param {PoolItem['type']} type
   * @param {PoolItem['listener']} listener
   * @param {PoolItem['passive']} [passive]
   */
  remove(target, type, listener, passive) {
    this._toggleListener(target, type, listener, passive, true);
  }
  /**
   * Removes all bound events
   */
  removeAll() {
    this._pool.forEach((poolItem) => {
      this._toggleListener(poolItem.target, poolItem.type, poolItem.listener, poolItem.passive, true, true);
    });
    this._pool = [];
  }
  /**
   * Adds or removes event
   *
   * @private
   * @param {PoolItem['target']} target
   * @param {PoolItem['type']} type
   * @param {PoolItem['listener']} listener
   * @param {PoolItem['passive']} [passive]
   * @param {boolean} [unbind] Whether the event should be added or removed
   * @param {boolean} [skipPool] Whether events pool should be skipped
   */
  _toggleListener(target, type, listener, passive, unbind, skipPool) {
    if (!target) {
      return;
    }
    const methodName = unbind ? "removeEventListener" : "addEventListener";
    const types = type.split(" ");
    types.forEach((eType) => {
      if (eType) {
        if (!skipPool) {
          if (unbind) {
            this._pool = this._pool.filter((poolItem) => {
              return poolItem.type !== eType || poolItem.listener !== listener || poolItem.target !== target;
            });
          } else {
            this._pool.push({
              target,
              type: eType,
              listener,
              passive
            });
          }
        }
        const eventOptions = supportsPassive ? {
          passive: passive || false
        } : false;
        target[methodName](eType, listener, eventOptions);
      }
    });
  }
};
function getViewportSize(options, pswp) {
  if (options.getViewportSizeFn) {
    const newViewportSize = options.getViewportSizeFn(options, pswp);
    if (newViewportSize) {
      return newViewportSize;
    }
  }
  return {
    x: document.documentElement.clientWidth,
    // TODO: height on mobile is very incosistent due to toolbar
    // find a way to improve this
    //
    // document.documentElement.clientHeight - doesn't seem to work well
    y: window.innerHeight
  };
}
function parsePaddingOption(prop, options, viewportSize, itemData, index) {
  let paddingValue = 0;
  if (options.paddingFn) {
    paddingValue = options.paddingFn(viewportSize, itemData, index)[prop];
  } else if (options.padding) {
    paddingValue = options.padding[prop];
  } else {
    const legacyPropName = "padding" + prop[0].toUpperCase() + prop.slice(1);
    if (options[legacyPropName]) {
      paddingValue = options[legacyPropName];
    }
  }
  return Number(paddingValue) || 0;
}
function getPanAreaSize(options, viewportSize, itemData, index) {
  return {
    x: viewportSize.x - parsePaddingOption("left", options, viewportSize, itemData, index) - parsePaddingOption("right", options, viewportSize, itemData, index),
    y: viewportSize.y - parsePaddingOption("top", options, viewportSize, itemData, index) - parsePaddingOption("bottom", options, viewportSize, itemData, index)
  };
}
var PanBounds = class {
  /**
   * @param {Slide} slide
   */
  constructor(slide) {
    this.slide = slide;
    this.currZoomLevel = 1;
    this.center = /** @type {Point} */
    {
      x: 0,
      y: 0
    };
    this.max = /** @type {Point} */
    {
      x: 0,
      y: 0
    };
    this.min = /** @type {Point} */
    {
      x: 0,
      y: 0
    };
  }
  /**
   * _getItemBounds
   *
   * @param {number} currZoomLevel
   */
  update(currZoomLevel) {
    this.currZoomLevel = currZoomLevel;
    if (!this.slide.width) {
      this.reset();
    } else {
      this._updateAxis("x");
      this._updateAxis("y");
      this.slide.pswp.dispatch("calcBounds", {
        slide: this.slide
      });
    }
  }
  /**
   * _calculateItemBoundsForAxis
   *
   * @param {Axis} axis
   */
  _updateAxis(axis) {
    const {
      pswp
    } = this.slide;
    const elSize = this.slide[axis === "x" ? "width" : "height"] * this.currZoomLevel;
    const paddingProp = axis === "x" ? "left" : "top";
    const padding = parsePaddingOption(paddingProp, pswp.options, pswp.viewportSize, this.slide.data, this.slide.index);
    const panAreaSize = this.slide.panAreaSize[axis];
    this.center[axis] = Math.round((panAreaSize - elSize) / 2) + padding;
    this.max[axis] = elSize > panAreaSize ? Math.round(panAreaSize - elSize) + padding : this.center[axis];
    this.min[axis] = elSize > panAreaSize ? padding : this.center[axis];
  }
  // _getZeroBounds
  reset() {
    this.center.x = 0;
    this.center.y = 0;
    this.max.x = 0;
    this.max.y = 0;
    this.min.x = 0;
    this.min.y = 0;
  }
  /**
   * Correct pan position if it's beyond the bounds
   *
   * @param {Axis} axis x or y
   * @param {number} panOffset
   * @returns {number}
   */
  correctPan(axis, panOffset) {
    return clamp(panOffset, this.max[axis], this.min[axis]);
  }
};
var MAX_IMAGE_WIDTH = 4e3;
var ZoomLevel = class {
  /**
   * @param {PhotoSwipeOptions} options PhotoSwipe options
   * @param {SlideData} itemData Slide data
   * @param {number} index Slide index
   * @param {PhotoSwipe} [pswp] PhotoSwipe instance, can be undefined if not initialized yet
   */
  constructor(options, itemData, index, pswp) {
    this.pswp = pswp;
    this.options = options;
    this.itemData = itemData;
    this.index = index;
    this.panAreaSize = null;
    this.elementSize = null;
    this.fit = 1;
    this.fill = 1;
    this.vFill = 1;
    this.initial = 1;
    this.secondary = 1;
    this.max = 1;
    this.min = 1;
  }
  /**
   * Calculate initial, secondary and maximum zoom level for the specified slide.
   *
   * It should be called when either image or viewport size changes.
   *
   * @param {number} maxWidth
   * @param {number} maxHeight
   * @param {Point} panAreaSize
   */
  update(maxWidth, maxHeight, panAreaSize) {
    const elementSize = {
      x: maxWidth,
      y: maxHeight
    };
    this.elementSize = elementSize;
    this.panAreaSize = panAreaSize;
    const hRatio = panAreaSize.x / elementSize.x;
    const vRatio = panAreaSize.y / elementSize.y;
    this.fit = Math.min(1, hRatio < vRatio ? hRatio : vRatio);
    this.fill = Math.min(1, hRatio > vRatio ? hRatio : vRatio);
    this.vFill = Math.min(1, vRatio);
    this.initial = this._getInitial();
    this.secondary = this._getSecondary();
    this.max = Math.max(this.initial, this.secondary, this._getMax());
    this.min = Math.min(this.fit, this.initial, this.secondary);
    if (this.pswp) {
      this.pswp.dispatch("zoomLevelsUpdate", {
        zoomLevels: this,
        slideData: this.itemData
      });
    }
  }
  /**
   * Parses user-defined zoom option.
   *
   * @private
   * @param {'initial' | 'secondary' | 'max'} optionPrefix Zoom level option prefix (initial, secondary, max)
   * @returns { number | undefined }
   */
  _parseZoomLevelOption(optionPrefix) {
    const optionName = (
      /** @type {'initialZoomLevel' | 'secondaryZoomLevel' | 'maxZoomLevel'} */
      optionPrefix + "ZoomLevel"
    );
    const optionValue = this.options[optionName];
    if (!optionValue) {
      return;
    }
    if (typeof optionValue === "function") {
      return optionValue(this);
    }
    if (optionValue === "fill") {
      return this.fill;
    }
    if (optionValue === "fit") {
      return this.fit;
    }
    return Number(optionValue);
  }
  /**
   * Get zoom level to which image will be zoomed after double-tap gesture,
   * or when user clicks on zoom icon,
   * or mouse-click on image itself.
   * If you return 1 image will be zoomed to its original size.
   *
   * @private
   * @return {number}
   */
  _getSecondary() {
    let currZoomLevel = this._parseZoomLevelOption("secondary");
    if (currZoomLevel) {
      return currZoomLevel;
    }
    currZoomLevel = Math.min(1, this.fit * 3);
    if (this.elementSize && currZoomLevel * this.elementSize.x > MAX_IMAGE_WIDTH) {
      currZoomLevel = MAX_IMAGE_WIDTH / this.elementSize.x;
    }
    return currZoomLevel;
  }
  /**
   * Get initial image zoom level.
   *
   * @private
   * @return {number}
   */
  _getInitial() {
    return this._parseZoomLevelOption("initial") || this.fit;
  }
  /**
   * Maximum zoom level when user zooms
   * via zoom/pinch gesture,
   * via cmd/ctrl-wheel or via trackpad.
   *
   * @private
   * @return {number}
   */
  _getMax() {
    return this._parseZoomLevelOption("max") || Math.max(1, this.fit * 4);
  }
};
var Slide = class {
  /**
   * @param {SlideData} data
   * @param {number} index
   * @param {PhotoSwipe} pswp
   */
  constructor(data2, index, pswp) {
    this.data = data2;
    this.index = index;
    this.pswp = pswp;
    this.isActive = index === pswp.currIndex;
    this.currentResolution = 0;
    this.panAreaSize = {
      x: 0,
      y: 0
    };
    this.pan = {
      x: 0,
      y: 0
    };
    this.isFirstSlide = this.isActive && !pswp.opener.isOpen;
    this.zoomLevels = new ZoomLevel(pswp.options, data2, index, pswp);
    this.pswp.dispatch("gettingData", {
      slide: this,
      data: this.data,
      index
    });
    this.content = this.pswp.contentLoader.getContentBySlide(this);
    this.container = createElement("pswp__zoom-wrap", "div");
    this.holderElement = null;
    this.currZoomLevel = 1;
    this.width = this.content.width;
    this.height = this.content.height;
    this.heavyAppended = false;
    this.bounds = new PanBounds(this);
    this.prevDisplayedWidth = -1;
    this.prevDisplayedHeight = -1;
    this.pswp.dispatch("slideInit", {
      slide: this
    });
  }
  /**
   * If this slide is active/current/visible
   *
   * @param {boolean} isActive
   */
  setIsActive(isActive) {
    if (isActive && !this.isActive) {
      this.activate();
    } else if (!isActive && this.isActive) {
      this.deactivate();
    }
  }
  /**
   * Appends slide content to DOM
   *
   * @param {HTMLElement} holderElement
   */
  append(holderElement) {
    this.holderElement = holderElement;
    this.container.style.transformOrigin = "0 0";
    if (!this.data) {
      return;
    }
    this.calculateSize();
    this.load();
    this.updateContentSize();
    this.appendHeavy();
    this.holderElement.appendChild(this.container);
    this.zoomAndPanToInitial();
    this.pswp.dispatch("firstZoomPan", {
      slide: this
    });
    this.applyCurrentZoomPan();
    this.pswp.dispatch("afterSetContent", {
      slide: this
    });
    if (this.isActive) {
      this.activate();
    }
  }
  load() {
    this.content.load(false);
    this.pswp.dispatch("slideLoad", {
      slide: this
    });
  }
  /**
   * Append "heavy" DOM elements
   *
   * This may depend on a type of slide,
   * but generally these are large images.
   */
  appendHeavy() {
    const {
      pswp
    } = this;
    const appendHeavyNearby = true;
    if (this.heavyAppended || !pswp.opener.isOpen || pswp.mainScroll.isShifted() || !this.isActive && !appendHeavyNearby) {
      return;
    }
    if (this.pswp.dispatch("appendHeavy", {
      slide: this
    }).defaultPrevented) {
      return;
    }
    this.heavyAppended = true;
    this.content.append();
    this.pswp.dispatch("appendHeavyContent", {
      slide: this
    });
  }
  /**
   * Triggered when this slide is active (selected).
   *
   * If it's part of opening/closing transition -
   * activate() will trigger after the transition is ended.
   */
  activate() {
    this.isActive = true;
    this.appendHeavy();
    this.content.activate();
    this.pswp.dispatch("slideActivate", {
      slide: this
    });
  }
  /**
   * Triggered when this slide becomes inactive.
   *
   * Slide can become inactive only after it was active.
   */
  deactivate() {
    this.isActive = false;
    this.content.deactivate();
    if (this.currZoomLevel !== this.zoomLevels.initial) {
      this.calculateSize();
    }
    this.currentResolution = 0;
    this.zoomAndPanToInitial();
    this.applyCurrentZoomPan();
    this.updateContentSize();
    this.pswp.dispatch("slideDeactivate", {
      slide: this
    });
  }
  /**
   * The slide should destroy itself, it will never be used again.
   * (unbind all events and destroy internal components)
   */
  destroy() {
    this.content.hasSlide = false;
    this.content.remove();
    this.container.remove();
    this.pswp.dispatch("slideDestroy", {
      slide: this
    });
  }
  resize() {
    if (this.currZoomLevel === this.zoomLevels.initial || !this.isActive) {
      this.calculateSize();
      this.currentResolution = 0;
      this.zoomAndPanToInitial();
      this.applyCurrentZoomPan();
      this.updateContentSize();
    } else {
      this.calculateSize();
      this.bounds.update(this.currZoomLevel);
      this.panTo(this.pan.x, this.pan.y);
    }
  }
  /**
   * Apply size to current slide content,
   * based on the current resolution and scale.
   *
   * @param {boolean} [force] if size should be updated even if dimensions weren't changed
   */
  updateContentSize(force) {
    const scaleMultiplier = this.currentResolution || this.zoomLevels.initial;
    if (!scaleMultiplier) {
      return;
    }
    const width = Math.round(this.width * scaleMultiplier) || this.pswp.viewportSize.x;
    const height = Math.round(this.height * scaleMultiplier) || this.pswp.viewportSize.y;
    if (!this.sizeChanged(width, height) && !force) {
      return;
    }
    this.content.setDisplayedSize(width, height);
  }
  /**
   * @param {number} width
   * @param {number} height
   */
  sizeChanged(width, height) {
    if (width !== this.prevDisplayedWidth || height !== this.prevDisplayedHeight) {
      this.prevDisplayedWidth = width;
      this.prevDisplayedHeight = height;
      return true;
    }
    return false;
  }
  /** @returns {HTMLImageElement | HTMLDivElement | null | undefined} */
  getPlaceholderElement() {
    var _this$content$placeho;
    return (_this$content$placeho = this.content.placeholder) === null || _this$content$placeho === void 0 ? void 0 : _this$content$placeho.element;
  }
  /**
   * Zoom current slide image to...
   *
   * @param {number} destZoomLevel Destination zoom level.
   * @param {Point} [centerPoint]
   * Transform origin center point, or false if viewport center should be used.
   * @param {number | false} [transitionDuration] Transition duration, may be set to 0.
   * @param {boolean} [ignoreBounds] Minimum and maximum zoom levels will be ignored.
   */
  zoomTo(destZoomLevel, centerPoint, transitionDuration, ignoreBounds) {
    const {
      pswp
    } = this;
    if (!this.isZoomable() || pswp.mainScroll.isShifted()) {
      return;
    }
    pswp.dispatch("beforeZoomTo", {
      destZoomLevel,
      centerPoint,
      transitionDuration
    });
    pswp.animations.stopAllPan();
    const prevZoomLevel = this.currZoomLevel;
    if (!ignoreBounds) {
      destZoomLevel = clamp(destZoomLevel, this.zoomLevels.min, this.zoomLevels.max);
    }
    this.setZoomLevel(destZoomLevel);
    this.pan.x = this.calculateZoomToPanOffset("x", centerPoint, prevZoomLevel);
    this.pan.y = this.calculateZoomToPanOffset("y", centerPoint, prevZoomLevel);
    roundPoint(this.pan);
    const finishTransition = () => {
      this._setResolution(destZoomLevel);
      this.applyCurrentZoomPan();
    };
    if (!transitionDuration) {
      finishTransition();
    } else {
      pswp.animations.startTransition({
        isPan: true,
        name: "zoomTo",
        target: this.container,
        transform: this.getCurrentTransform(),
        onComplete: finishTransition,
        duration: transitionDuration,
        easing: pswp.options.easing
      });
    }
  }
  /**
   * @param {Point} [centerPoint]
   */
  toggleZoom(centerPoint) {
    this.zoomTo(this.currZoomLevel === this.zoomLevels.initial ? this.zoomLevels.secondary : this.zoomLevels.initial, centerPoint, this.pswp.options.zoomAnimationDuration);
  }
  /**
   * Updates zoom level property and recalculates new pan bounds,
   * unlike zoomTo it does not apply transform (use applyCurrentZoomPan)
   *
   * @param {number} currZoomLevel
   */
  setZoomLevel(currZoomLevel) {
    this.currZoomLevel = currZoomLevel;
    this.bounds.update(this.currZoomLevel);
  }
  /**
   * Get pan position after zoom at a given `point`.
   *
   * Always call setZoomLevel(newZoomLevel) beforehand to recalculate
   * pan bounds according to the new zoom level.
   *
   * @param {'x' | 'y'} axis
   * @param {Point} [point]
   * point based on which zoom is performed, usually refers to the current mouse position,
   * if false - viewport center will be used.
   * @param {number} [prevZoomLevel] Zoom level before new zoom was applied.
   * @returns {number}
   */
  calculateZoomToPanOffset(axis, point, prevZoomLevel) {
    const totalPanDistance = this.bounds.max[axis] - this.bounds.min[axis];
    if (totalPanDistance === 0) {
      return this.bounds.center[axis];
    }
    if (!point) {
      point = this.pswp.getViewportCenterPoint();
    }
    if (!prevZoomLevel) {
      prevZoomLevel = this.zoomLevels.initial;
    }
    const zoomFactor = this.currZoomLevel / prevZoomLevel;
    return this.bounds.correctPan(axis, (this.pan[axis] - point[axis]) * zoomFactor + point[axis]);
  }
  /**
   * Apply pan and keep it within bounds.
   *
   * @param {number} panX
   * @param {number} panY
   */
  panTo(panX, panY) {
    this.pan.x = this.bounds.correctPan("x", panX);
    this.pan.y = this.bounds.correctPan("y", panY);
    this.applyCurrentZoomPan();
  }
  /**
   * If the slide in the current state can be panned by the user
   * @returns {boolean}
   */
  isPannable() {
    return Boolean(this.width) && this.currZoomLevel > this.zoomLevels.fit;
  }
  /**
   * If the slide can be zoomed
   * @returns {boolean}
   */
  isZoomable() {
    return Boolean(this.width) && this.content.isZoomable();
  }
  /**
   * Apply transform and scale based on
   * the current pan position (this.pan) and zoom level (this.currZoomLevel)
   */
  applyCurrentZoomPan() {
    this._applyZoomTransform(this.pan.x, this.pan.y, this.currZoomLevel);
    if (this === this.pswp.currSlide) {
      this.pswp.dispatch("zoomPanUpdate", {
        slide: this
      });
    }
  }
  zoomAndPanToInitial() {
    this.currZoomLevel = this.zoomLevels.initial;
    this.bounds.update(this.currZoomLevel);
    equalizePoints(this.pan, this.bounds.center);
    this.pswp.dispatch("initialZoomPan", {
      slide: this
    });
  }
  /**
   * Set translate and scale based on current resolution
   *
   * @param {number} x
   * @param {number} y
   * @param {number} zoom
   * @private
   */
  _applyZoomTransform(x2, y2, zoom) {
    zoom /= this.currentResolution || this.zoomLevels.initial;
    setTransform(this.container, x2, y2, zoom);
  }
  calculateSize() {
    const {
      pswp
    } = this;
    equalizePoints(this.panAreaSize, getPanAreaSize(pswp.options, pswp.viewportSize, this.data, this.index));
    this.zoomLevels.update(this.width, this.height, this.panAreaSize);
    pswp.dispatch("calcSlideSize", {
      slide: this
    });
  }
  /** @returns {string} */
  getCurrentTransform() {
    const scale = this.currZoomLevel / (this.currentResolution || this.zoomLevels.initial);
    return toTransformString(this.pan.x, this.pan.y, scale);
  }
  /**
   * Set resolution and re-render the image.
   *
   * For example, if the real image size is 2000x1500,
   * and resolution is 0.5 - it will be rendered as 1000x750.
   *
   * Image with zoom level 2 and resolution 0.5 is
   * the same as image with zoom level 1 and resolution 1.
   *
   * Used to optimize animations and make
   * sure that browser renders image in the highest quality.
   * Also used by responsive images to load the correct one.
   *
   * @param {number} newResolution
   */
  _setResolution(newResolution) {
    if (newResolution === this.currentResolution) {
      return;
    }
    this.currentResolution = newResolution;
    this.updateContentSize();
    this.pswp.dispatch("resolutionChanged");
  }
};
var PAN_END_FRICTION = 0.35;
var VERTICAL_DRAG_FRICTION = 0.6;
var MIN_RATIO_TO_CLOSE = 0.4;
var MIN_NEXT_SLIDE_SPEED = 0.5;
function project(initialVelocity, decelerationRate) {
  return initialVelocity * decelerationRate / (1 - decelerationRate);
}
var DragHandler = class {
  /**
   * @param {Gestures} gestures
   */
  constructor(gestures) {
    this.gestures = gestures;
    this.pswp = gestures.pswp;
    this.startPan = {
      x: 0,
      y: 0
    };
  }
  start() {
    if (this.pswp.currSlide) {
      equalizePoints(this.startPan, this.pswp.currSlide.pan);
    }
    this.pswp.animations.stopAll();
  }
  change() {
    const {
      p1,
      prevP1,
      dragAxis
    } = this.gestures;
    const {
      currSlide
    } = this.pswp;
    if (dragAxis === "y" && this.pswp.options.closeOnVerticalDrag && currSlide && currSlide.currZoomLevel <= currSlide.zoomLevels.fit && !this.gestures.isMultitouch) {
      const panY = currSlide.pan.y + (p1.y - prevP1.y);
      if (!this.pswp.dispatch("verticalDrag", {
        panY
      }).defaultPrevented) {
        this._setPanWithFriction("y", panY, VERTICAL_DRAG_FRICTION);
        const bgOpacity = 1 - Math.abs(this._getVerticalDragRatio(currSlide.pan.y));
        this.pswp.applyBgOpacity(bgOpacity);
        currSlide.applyCurrentZoomPan();
      }
    } else {
      const mainScrollChanged = this._panOrMoveMainScroll("x");
      if (!mainScrollChanged) {
        this._panOrMoveMainScroll("y");
        if (currSlide) {
          roundPoint(currSlide.pan);
          currSlide.applyCurrentZoomPan();
        }
      }
    }
  }
  end() {
    const {
      velocity
    } = this.gestures;
    const {
      mainScroll,
      currSlide
    } = this.pswp;
    let indexDiff = 0;
    this.pswp.animations.stopAll();
    if (mainScroll.isShifted()) {
      const mainScrollShiftDiff = mainScroll.x - mainScroll.getCurrSlideX();
      const currentSlideVisibilityRatio = mainScrollShiftDiff / this.pswp.viewportSize.x;
      if (velocity.x < -MIN_NEXT_SLIDE_SPEED && currentSlideVisibilityRatio < 0 || velocity.x < 0.1 && currentSlideVisibilityRatio < -0.5) {
        indexDiff = 1;
        velocity.x = Math.min(velocity.x, 0);
      } else if (velocity.x > MIN_NEXT_SLIDE_SPEED && currentSlideVisibilityRatio > 0 || velocity.x > -0.1 && currentSlideVisibilityRatio > 0.5) {
        indexDiff = -1;
        velocity.x = Math.max(velocity.x, 0);
      }
      mainScroll.moveIndexBy(indexDiff, true, velocity.x);
    }
    if (currSlide && currSlide.currZoomLevel > currSlide.zoomLevels.max || this.gestures.isMultitouch) {
      this.gestures.zoomLevels.correctZoomPan(true);
    } else {
      this._finishPanGestureForAxis("x");
      this._finishPanGestureForAxis("y");
    }
  }
  /**
   * @private
   * @param {'x' | 'y'} axis
   */
  _finishPanGestureForAxis(axis) {
    const {
      velocity
    } = this.gestures;
    const {
      currSlide
    } = this.pswp;
    if (!currSlide) {
      return;
    }
    const {
      pan,
      bounds
    } = currSlide;
    const panPos = pan[axis];
    const restoreBgOpacity = this.pswp.bgOpacity < 1 && axis === "y";
    const decelerationRate = 0.995;
    const projectedPosition = panPos + project(velocity[axis], decelerationRate);
    if (restoreBgOpacity) {
      const vDragRatio = this._getVerticalDragRatio(panPos);
      const projectedVDragRatio = this._getVerticalDragRatio(projectedPosition);
      if (vDragRatio < 0 && projectedVDragRatio < -MIN_RATIO_TO_CLOSE || vDragRatio > 0 && projectedVDragRatio > MIN_RATIO_TO_CLOSE) {
        this.pswp.close();
        return;
      }
    }
    const correctedPanPosition = bounds.correctPan(axis, projectedPosition);
    if (panPos === correctedPanPosition) {
      return;
    }
    const dampingRatio = correctedPanPosition === projectedPosition ? 1 : 0.82;
    const initialBgOpacity = this.pswp.bgOpacity;
    const totalPanDist = correctedPanPosition - panPos;
    this.pswp.animations.startSpring({
      name: "panGesture" + axis,
      isPan: true,
      start: panPos,
      end: correctedPanPosition,
      velocity: velocity[axis],
      dampingRatio,
      onUpdate: (pos) => {
        if (restoreBgOpacity && this.pswp.bgOpacity < 1) {
          const animationProgressRatio = 1 - (correctedPanPosition - pos) / totalPanDist;
          this.pswp.applyBgOpacity(clamp(initialBgOpacity + (1 - initialBgOpacity) * animationProgressRatio, 0, 1));
        }
        pan[axis] = Math.floor(pos);
        currSlide.applyCurrentZoomPan();
      }
    });
  }
  /**
   * Update position of the main scroll,
   * or/and update pan position of the current slide.
   *
   * Should return true if it changes (or can change) main scroll.
   *
   * @private
   * @param {'x' | 'y'} axis
   * @returns {boolean}
   */
  _panOrMoveMainScroll(axis) {
    const {
      p1,
      dragAxis,
      prevP1,
      isMultitouch
    } = this.gestures;
    const {
      currSlide,
      mainScroll
    } = this.pswp;
    const delta = p1[axis] - prevP1[axis];
    const newMainScrollX = mainScroll.x + delta;
    if (!delta || !currSlide) {
      return false;
    }
    if (axis === "x" && !currSlide.isPannable() && !isMultitouch) {
      mainScroll.moveTo(newMainScrollX, true);
      return true;
    }
    const {
      bounds
    } = currSlide;
    const newPan = currSlide.pan[axis] + delta;
    if (this.pswp.options.allowPanToNext && dragAxis === "x" && axis === "x" && !isMultitouch) {
      const currSlideMainScrollX = mainScroll.getCurrSlideX();
      const mainScrollShiftDiff = mainScroll.x - currSlideMainScrollX;
      const isLeftToRight = delta > 0;
      const isRightToLeft = !isLeftToRight;
      if (newPan > bounds.min[axis] && isLeftToRight) {
        const wasAtMinPanPosition = bounds.min[axis] <= this.startPan[axis];
        if (wasAtMinPanPosition) {
          mainScroll.moveTo(newMainScrollX, true);
          return true;
        } else {
          this._setPanWithFriction(axis, newPan);
        }
      } else if (newPan < bounds.max[axis] && isRightToLeft) {
        const wasAtMaxPanPosition = this.startPan[axis] <= bounds.max[axis];
        if (wasAtMaxPanPosition) {
          mainScroll.moveTo(newMainScrollX, true);
          return true;
        } else {
          this._setPanWithFriction(axis, newPan);
        }
      } else {
        if (mainScrollShiftDiff !== 0) {
          if (mainScrollShiftDiff > 0) {
            mainScroll.moveTo(Math.max(newMainScrollX, currSlideMainScrollX), true);
            return true;
          } else if (mainScrollShiftDiff < 0) {
            mainScroll.moveTo(Math.min(newMainScrollX, currSlideMainScrollX), true);
            return true;
          }
        } else {
          this._setPanWithFriction(axis, newPan);
        }
      }
    } else {
      if (axis === "y") {
        if (!mainScroll.isShifted() && bounds.min.y !== bounds.max.y) {
          this._setPanWithFriction(axis, newPan);
        }
      } else {
        this._setPanWithFriction(axis, newPan);
      }
    }
    return false;
  }
  // If we move above - the ratio is negative
  // If we move below the ratio is positive
  /**
   * Relation between pan Y position and third of viewport height.
   *
   * When we are at initial position (center bounds) - the ratio is 0,
   * if position is shifted upwards - the ratio is negative,
   * if position is shifted downwards - the ratio is positive.
   *
   * @private
   * @param {number} panY The current pan Y position.
   * @returns {number}
   */
  _getVerticalDragRatio(panY) {
    var _this$pswp$currSlide$, _this$pswp$currSlide;
    return (panY - ((_this$pswp$currSlide$ = (_this$pswp$currSlide = this.pswp.currSlide) === null || _this$pswp$currSlide === void 0 ? void 0 : _this$pswp$currSlide.bounds.center.y) !== null && _this$pswp$currSlide$ !== void 0 ? _this$pswp$currSlide$ : 0)) / (this.pswp.viewportSize.y / 3);
  }
  /**
   * Set pan position of the current slide.
   * Apply friction if the position is beyond the pan bounds,
   * or if custom friction is defined.
   *
   * @private
   * @param {'x' | 'y'} axis
   * @param {number} potentialPan
   * @param {number} [customFriction] (0.1 - 1)
   */
  _setPanWithFriction(axis, potentialPan, customFriction) {
    const {
      currSlide
    } = this.pswp;
    if (!currSlide) {
      return;
    }
    const {
      pan,
      bounds
    } = currSlide;
    const correctedPan = bounds.correctPan(axis, potentialPan);
    if (correctedPan !== potentialPan || customFriction) {
      const delta = Math.round(potentialPan - pan[axis]);
      pan[axis] += delta * (customFriction || PAN_END_FRICTION);
    } else {
      pan[axis] = potentialPan;
    }
  }
};
var UPPER_ZOOM_FRICTION = 0.05;
var LOWER_ZOOM_FRICTION = 0.15;
function getZoomPointsCenter(p2, p1, p22) {
  p2.x = (p1.x + p22.x) / 2;
  p2.y = (p1.y + p22.y) / 2;
  return p2;
}
var ZoomHandler = class {
  /**
   * @param {Gestures} gestures
   */
  constructor(gestures) {
    this.gestures = gestures;
    this._startPan = {
      x: 0,
      y: 0
    };
    this._startZoomPoint = {
      x: 0,
      y: 0
    };
    this._zoomPoint = {
      x: 0,
      y: 0
    };
    this._wasOverFitZoomLevel = false;
    this._startZoomLevel = 1;
  }
  start() {
    const {
      currSlide
    } = this.gestures.pswp;
    if (currSlide) {
      this._startZoomLevel = currSlide.currZoomLevel;
      equalizePoints(this._startPan, currSlide.pan);
    }
    this.gestures.pswp.animations.stopAllPan();
    this._wasOverFitZoomLevel = false;
  }
  change() {
    const {
      p1,
      startP1,
      p2,
      startP2,
      pswp
    } = this.gestures;
    const {
      currSlide
    } = pswp;
    if (!currSlide) {
      return;
    }
    const minZoomLevel = currSlide.zoomLevels.min;
    const maxZoomLevel = currSlide.zoomLevels.max;
    if (!currSlide.isZoomable() || pswp.mainScroll.isShifted()) {
      return;
    }
    getZoomPointsCenter(this._startZoomPoint, startP1, startP2);
    getZoomPointsCenter(this._zoomPoint, p1, p2);
    let currZoomLevel = 1 / getDistanceBetween(startP1, startP2) * getDistanceBetween(p1, p2) * this._startZoomLevel;
    if (currZoomLevel > currSlide.zoomLevels.initial + currSlide.zoomLevels.initial / 15) {
      this._wasOverFitZoomLevel = true;
    }
    if (currZoomLevel < minZoomLevel) {
      if (pswp.options.pinchToClose && !this._wasOverFitZoomLevel && this._startZoomLevel <= currSlide.zoomLevels.initial) {
        const bgOpacity = 1 - (minZoomLevel - currZoomLevel) / (minZoomLevel / 1.2);
        if (!pswp.dispatch("pinchClose", {
          bgOpacity
        }).defaultPrevented) {
          pswp.applyBgOpacity(bgOpacity);
        }
      } else {
        currZoomLevel = minZoomLevel - (minZoomLevel - currZoomLevel) * LOWER_ZOOM_FRICTION;
      }
    } else if (currZoomLevel > maxZoomLevel) {
      currZoomLevel = maxZoomLevel + (currZoomLevel - maxZoomLevel) * UPPER_ZOOM_FRICTION;
    }
    currSlide.pan.x = this._calculatePanForZoomLevel("x", currZoomLevel);
    currSlide.pan.y = this._calculatePanForZoomLevel("y", currZoomLevel);
    currSlide.setZoomLevel(currZoomLevel);
    currSlide.applyCurrentZoomPan();
  }
  end() {
    const {
      pswp
    } = this.gestures;
    const {
      currSlide
    } = pswp;
    if ((!currSlide || currSlide.currZoomLevel < currSlide.zoomLevels.initial) && !this._wasOverFitZoomLevel && pswp.options.pinchToClose) {
      pswp.close();
    } else {
      this.correctZoomPan();
    }
  }
  /**
   * @private
   * @param {'x' | 'y'} axis
   * @param {number} currZoomLevel
   * @returns {number}
   */
  _calculatePanForZoomLevel(axis, currZoomLevel) {
    const zoomFactor = currZoomLevel / this._startZoomLevel;
    return this._zoomPoint[axis] - (this._startZoomPoint[axis] - this._startPan[axis]) * zoomFactor;
  }
  /**
   * Correct currZoomLevel and pan if they are
   * beyond minimum or maximum values.
   * With animation.
   *
   * @param {boolean} [ignoreGesture]
   * Wether gesture coordinates should be ignored when calculating destination pan position.
   */
  correctZoomPan(ignoreGesture) {
    const {
      pswp
    } = this.gestures;
    const {
      currSlide
    } = pswp;
    if (!(currSlide !== null && currSlide !== void 0 && currSlide.isZoomable())) {
      return;
    }
    if (this._zoomPoint.x === 0) {
      ignoreGesture = true;
    }
    const prevZoomLevel = currSlide.currZoomLevel;
    let destinationZoomLevel;
    let currZoomLevelNeedsChange = true;
    if (prevZoomLevel < currSlide.zoomLevels.initial) {
      destinationZoomLevel = currSlide.zoomLevels.initial;
    } else if (prevZoomLevel > currSlide.zoomLevels.max) {
      destinationZoomLevel = currSlide.zoomLevels.max;
    } else {
      currZoomLevelNeedsChange = false;
      destinationZoomLevel = prevZoomLevel;
    }
    const initialBgOpacity = pswp.bgOpacity;
    const restoreBgOpacity = pswp.bgOpacity < 1;
    const initialPan = equalizePoints({
      x: 0,
      y: 0
    }, currSlide.pan);
    let destinationPan = equalizePoints({
      x: 0,
      y: 0
    }, initialPan);
    if (ignoreGesture) {
      this._zoomPoint.x = 0;
      this._zoomPoint.y = 0;
      this._startZoomPoint.x = 0;
      this._startZoomPoint.y = 0;
      this._startZoomLevel = prevZoomLevel;
      equalizePoints(this._startPan, initialPan);
    }
    if (currZoomLevelNeedsChange) {
      destinationPan = {
        x: this._calculatePanForZoomLevel("x", destinationZoomLevel),
        y: this._calculatePanForZoomLevel("y", destinationZoomLevel)
      };
    }
    currSlide.setZoomLevel(destinationZoomLevel);
    destinationPan = {
      x: currSlide.bounds.correctPan("x", destinationPan.x),
      y: currSlide.bounds.correctPan("y", destinationPan.y)
    };
    currSlide.setZoomLevel(prevZoomLevel);
    const panNeedsChange = !pointsEqual(destinationPan, initialPan);
    if (!panNeedsChange && !currZoomLevelNeedsChange && !restoreBgOpacity) {
      currSlide._setResolution(destinationZoomLevel);
      currSlide.applyCurrentZoomPan();
      return;
    }
    pswp.animations.stopAllPan();
    pswp.animations.startSpring({
      isPan: true,
      start: 0,
      end: 1e3,
      velocity: 0,
      dampingRatio: 1,
      naturalFrequency: 40,
      onUpdate: (now) => {
        now /= 1e3;
        if (panNeedsChange || currZoomLevelNeedsChange) {
          if (panNeedsChange) {
            currSlide.pan.x = initialPan.x + (destinationPan.x - initialPan.x) * now;
            currSlide.pan.y = initialPan.y + (destinationPan.y - initialPan.y) * now;
          }
          if (currZoomLevelNeedsChange) {
            const newZoomLevel = prevZoomLevel + (destinationZoomLevel - prevZoomLevel) * now;
            currSlide.setZoomLevel(newZoomLevel);
          }
          currSlide.applyCurrentZoomPan();
        }
        if (restoreBgOpacity && pswp.bgOpacity < 1) {
          pswp.applyBgOpacity(clamp(initialBgOpacity + (1 - initialBgOpacity) * now, 0, 1));
        }
      },
      onComplete: () => {
        currSlide._setResolution(destinationZoomLevel);
        currSlide.applyCurrentZoomPan();
      }
    });
  }
};
function didTapOnMainContent(event) {
  return !!/** @type {HTMLElement} */
  event.target.closest(".pswp__container");
}
var TapHandler = class {
  /**
   * @param {Gestures} gestures
   */
  constructor(gestures) {
    this.gestures = gestures;
  }
  /**
   * @param {Point} point
   * @param {PointerEvent} originalEvent
   */
  click(point, originalEvent) {
    const targetClassList = (
      /** @type {HTMLElement} */
      originalEvent.target.classList
    );
    const isImageClick = targetClassList.contains("pswp__img");
    const isBackgroundClick = targetClassList.contains("pswp__item") || targetClassList.contains("pswp__zoom-wrap");
    if (isImageClick) {
      this._doClickOrTapAction("imageClick", point, originalEvent);
    } else if (isBackgroundClick) {
      this._doClickOrTapAction("bgClick", point, originalEvent);
    }
  }
  /**
   * @param {Point} point
   * @param {PointerEvent} originalEvent
   */
  tap(point, originalEvent) {
    if (didTapOnMainContent(originalEvent)) {
      this._doClickOrTapAction("tap", point, originalEvent);
    }
  }
  /**
   * @param {Point} point
   * @param {PointerEvent} originalEvent
   */
  doubleTap(point, originalEvent) {
    if (didTapOnMainContent(originalEvent)) {
      this._doClickOrTapAction("doubleTap", point, originalEvent);
    }
  }
  /**
   * @private
   * @param {Actions} actionName
   * @param {Point} point
   * @param {PointerEvent} originalEvent
   */
  _doClickOrTapAction(actionName, point, originalEvent) {
    var _this$gestures$pswp$e;
    const {
      pswp
    } = this.gestures;
    const {
      currSlide
    } = pswp;
    const actionFullName = (
      /** @type {AddPostfix<Actions, 'Action'>} */
      actionName + "Action"
    );
    const optionValue = pswp.options[actionFullName];
    if (pswp.dispatch(actionFullName, {
      point,
      originalEvent
    }).defaultPrevented) {
      return;
    }
    if (typeof optionValue === "function") {
      optionValue.call(pswp, point, originalEvent);
      return;
    }
    switch (optionValue) {
      case "close":
      case "next":
        pswp[optionValue]();
        break;
      case "zoom":
        currSlide === null || currSlide === void 0 || currSlide.toggleZoom(point);
        break;
      case "zoom-or-close":
        if (currSlide !== null && currSlide !== void 0 && currSlide.isZoomable() && currSlide.zoomLevels.secondary !== currSlide.zoomLevels.initial) {
          currSlide.toggleZoom(point);
        } else if (pswp.options.clickToCloseNonZoomable) {
          pswp.close();
        }
        break;
      case "toggle-controls":
        (_this$gestures$pswp$e = this.gestures.pswp.element) === null || _this$gestures$pswp$e === void 0 || _this$gestures$pswp$e.classList.toggle("pswp--ui-visible");
        break;
    }
  }
};
var AXIS_SWIPE_HYSTERISIS = 10;
var DOUBLE_TAP_DELAY = 300;
var MIN_TAP_DISTANCE = 25;
var Gestures = class {
  /**
   * @param {PhotoSwipe} pswp
   */
  constructor(pswp) {
    this.pswp = pswp;
    this.dragAxis = null;
    this.p1 = {
      x: 0,
      y: 0
    };
    this.p2 = {
      x: 0,
      y: 0
    };
    this.prevP1 = {
      x: 0,
      y: 0
    };
    this.prevP2 = {
      x: 0,
      y: 0
    };
    this.startP1 = {
      x: 0,
      y: 0
    };
    this.startP2 = {
      x: 0,
      y: 0
    };
    this.velocity = {
      x: 0,
      y: 0
    };
    this._lastStartP1 = {
      x: 0,
      y: 0
    };
    this._intervalP1 = {
      x: 0,
      y: 0
    };
    this._numActivePoints = 0;
    this._ongoingPointers = [];
    this._touchEventEnabled = "ontouchstart" in window;
    this._pointerEventEnabled = !!window.PointerEvent;
    this.supportsTouch = this._touchEventEnabled || this._pointerEventEnabled && navigator.maxTouchPoints > 1;
    this._numActivePoints = 0;
    this._intervalTime = 0;
    this._velocityCalculated = false;
    this.isMultitouch = false;
    this.isDragging = false;
    this.isZooming = false;
    this.raf = null;
    this._tapTimer = null;
    if (!this.supportsTouch) {
      pswp.options.allowPanToNext = false;
    }
    this.drag = new DragHandler(this);
    this.zoomLevels = new ZoomHandler(this);
    this.tapHandler = new TapHandler(this);
    pswp.on("bindEvents", () => {
      pswp.events.add(
        pswp.scrollWrap,
        "click",
        /** @type EventListener */
        this._onClick.bind(this)
      );
      if (this._pointerEventEnabled) {
        this._bindEvents("pointer", "down", "up", "cancel");
      } else if (this._touchEventEnabled) {
        this._bindEvents("touch", "start", "end", "cancel");
        if (pswp.scrollWrap) {
          pswp.scrollWrap.ontouchmove = () => {
          };
          pswp.scrollWrap.ontouchend = () => {
          };
        }
      } else {
        this._bindEvents("mouse", "down", "up");
      }
    });
  }
  /**
   * @private
   * @param {'mouse' | 'touch' | 'pointer'} pref
   * @param {'down' | 'start'} down
   * @param {'up' | 'end'} up
   * @param {'cancel'} [cancel]
   */
  _bindEvents(pref, down, up, cancel) {
    const {
      pswp
    } = this;
    const {
      events
    } = pswp;
    const cancelEvent = cancel ? pref + cancel : "";
    events.add(
      pswp.scrollWrap,
      pref + down,
      /** @type EventListener */
      this.onPointerDown.bind(this)
    );
    events.add(
      window,
      pref + "move",
      /** @type EventListener */
      this.onPointerMove.bind(this)
    );
    events.add(
      window,
      pref + up,
      /** @type EventListener */
      this.onPointerUp.bind(this)
    );
    if (cancelEvent) {
      events.add(
        pswp.scrollWrap,
        cancelEvent,
        /** @type EventListener */
        this.onPointerUp.bind(this)
      );
    }
  }
  /**
   * @param {PointerEvent} e
   */
  onPointerDown(e) {
    const isMousePointer = e.type === "mousedown" || e.pointerType === "mouse";
    if (isMousePointer && e.button > 0) {
      return;
    }
    const {
      pswp
    } = this;
    if (!pswp.opener.isOpen) {
      e.preventDefault();
      return;
    }
    if (pswp.dispatch("pointerDown", {
      originalEvent: e
    }).defaultPrevented) {
      return;
    }
    if (isMousePointer) {
      pswp.mouseDetected();
      this._preventPointerEventBehaviour(e, "down");
    }
    pswp.animations.stopAll();
    this._updatePoints(e, "down");
    if (this._numActivePoints === 1) {
      this.dragAxis = null;
      equalizePoints(this.startP1, this.p1);
    }
    if (this._numActivePoints > 1) {
      this._clearTapTimer();
      this.isMultitouch = true;
    } else {
      this.isMultitouch = false;
    }
  }
  /**
   * @param {PointerEvent} e
   */
  onPointerMove(e) {
    this._preventPointerEventBehaviour(e, "move");
    if (!this._numActivePoints) {
      return;
    }
    this._updatePoints(e, "move");
    if (this.pswp.dispatch("pointerMove", {
      originalEvent: e
    }).defaultPrevented) {
      return;
    }
    if (this._numActivePoints === 1 && !this.isDragging) {
      if (!this.dragAxis) {
        this._calculateDragDirection();
      }
      if (this.dragAxis && !this.isDragging) {
        if (this.isZooming) {
          this.isZooming = false;
          this.zoomLevels.end();
        }
        this.isDragging = true;
        this._clearTapTimer();
        this._updateStartPoints();
        this._intervalTime = Date.now();
        this._velocityCalculated = false;
        equalizePoints(this._intervalP1, this.p1);
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.drag.start();
        this._rafStopLoop();
        this._rafRenderLoop();
      }
    } else if (this._numActivePoints > 1 && !this.isZooming) {
      this._finishDrag();
      this.isZooming = true;
      this._updateStartPoints();
      this.zoomLevels.start();
      this._rafStopLoop();
      this._rafRenderLoop();
    }
  }
  /**
   * @private
   */
  _finishDrag() {
    if (this.isDragging) {
      this.isDragging = false;
      if (!this._velocityCalculated) {
        this._updateVelocity(true);
      }
      this.drag.end();
      this.dragAxis = null;
    }
  }
  /**
   * @param {PointerEvent} e
   */
  onPointerUp(e) {
    if (!this._numActivePoints) {
      return;
    }
    this._updatePoints(e, "up");
    if (this.pswp.dispatch("pointerUp", {
      originalEvent: e
    }).defaultPrevented) {
      return;
    }
    if (this._numActivePoints === 0) {
      this._rafStopLoop();
      if (this.isDragging) {
        this._finishDrag();
      } else if (!this.isZooming && !this.isMultitouch) {
        this._finishTap(e);
      }
    }
    if (this._numActivePoints < 2 && this.isZooming) {
      this.isZooming = false;
      this.zoomLevels.end();
      if (this._numActivePoints === 1) {
        this.dragAxis = null;
        this._updateStartPoints();
      }
    }
  }
  /**
   * @private
   */
  _rafRenderLoop() {
    if (this.isDragging || this.isZooming) {
      this._updateVelocity();
      if (this.isDragging) {
        if (!pointsEqual(this.p1, this.prevP1)) {
          this.drag.change();
        }
      } else {
        if (!pointsEqual(this.p1, this.prevP1) || !pointsEqual(this.p2, this.prevP2)) {
          this.zoomLevels.change();
        }
      }
      this._updatePrevPoints();
      this.raf = requestAnimationFrame(this._rafRenderLoop.bind(this));
    }
  }
  /**
   * Update velocity at 50ms interval
   *
   * @private
   * @param {boolean} [force]
   */
  _updateVelocity(force) {
    const time = Date.now();
    const duration = time - this._intervalTime;
    if (duration < 50 && !force) {
      return;
    }
    this.velocity.x = this._getVelocity("x", duration);
    this.velocity.y = this._getVelocity("y", duration);
    this._intervalTime = time;
    equalizePoints(this._intervalP1, this.p1);
    this._velocityCalculated = true;
  }
  /**
   * @private
   * @param {PointerEvent} e
   */
  _finishTap(e) {
    const {
      mainScroll
    } = this.pswp;
    if (mainScroll.isShifted()) {
      mainScroll.moveIndexBy(0, true);
      return;
    }
    if (e.type.indexOf("cancel") > 0) {
      return;
    }
    if (e.type === "mouseup" || e.pointerType === "mouse") {
      this.tapHandler.click(this.startP1, e);
      return;
    }
    const tapDelay = this.pswp.options.doubleTapAction ? DOUBLE_TAP_DELAY : 0;
    if (this._tapTimer) {
      this._clearTapTimer();
      if (getDistanceBetween(this._lastStartP1, this.startP1) < MIN_TAP_DISTANCE) {
        this.tapHandler.doubleTap(this.startP1, e);
      }
    } else {
      equalizePoints(this._lastStartP1, this.startP1);
      this._tapTimer = setTimeout(() => {
        this.tapHandler.tap(this.startP1, e);
        this._clearTapTimer();
      }, tapDelay);
    }
  }
  /**
   * @private
   */
  _clearTapTimer() {
    if (this._tapTimer) {
      clearTimeout(this._tapTimer);
      this._tapTimer = null;
    }
  }
  /**
   * Get velocity for axis
   *
   * @private
   * @param {'x' | 'y'} axis
   * @param {number} duration
   * @returns {number}
   */
  _getVelocity(axis, duration) {
    const displacement = this.p1[axis] - this._intervalP1[axis];
    if (Math.abs(displacement) > 1 && duration > 5) {
      return displacement / duration;
    }
    return 0;
  }
  /**
   * @private
   */
  _rafStopLoop() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }
  /**
   * @private
   * @param {PointerEvent} e
   * @param {'up' | 'down' | 'move'} pointerType Normalized pointer type
   */
  _preventPointerEventBehaviour(e, pointerType) {
    const preventPointerEvent = this.pswp.applyFilters("preventPointerEvent", true, e, pointerType);
    if (preventPointerEvent) {
      e.preventDefault();
    }
  }
  /**
   * Parses and normalizes points from the touch, mouse or pointer event.
   * Updates p1 and p2.
   *
   * @private
   * @param {PointerEvent | TouchEvent} e
   * @param {'up' | 'down' | 'move'} pointerType Normalized pointer type
   */
  _updatePoints(e, pointerType) {
    if (this._pointerEventEnabled) {
      const pointerEvent = (
        /** @type {PointerEvent} */
        e
      );
      const pointerIndex = this._ongoingPointers.findIndex((ongoingPointer) => {
        return ongoingPointer.id === pointerEvent.pointerId;
      });
      if (pointerType === "up" && pointerIndex > -1) {
        this._ongoingPointers.splice(pointerIndex, 1);
      } else if (pointerType === "down" && pointerIndex === -1) {
        this._ongoingPointers.push(this._convertEventPosToPoint(pointerEvent, {
          x: 0,
          y: 0
        }));
      } else if (pointerIndex > -1) {
        this._convertEventPosToPoint(pointerEvent, this._ongoingPointers[pointerIndex]);
      }
      this._numActivePoints = this._ongoingPointers.length;
      if (this._numActivePoints > 0) {
        equalizePoints(this.p1, this._ongoingPointers[0]);
      }
      if (this._numActivePoints > 1) {
        equalizePoints(this.p2, this._ongoingPointers[1]);
      }
    } else {
      const touchEvent = (
        /** @type {TouchEvent} */
        e
      );
      this._numActivePoints = 0;
      if (touchEvent.type.indexOf("touch") > -1) {
        if (touchEvent.touches && touchEvent.touches.length > 0) {
          this._convertEventPosToPoint(touchEvent.touches[0], this.p1);
          this._numActivePoints++;
          if (touchEvent.touches.length > 1) {
            this._convertEventPosToPoint(touchEvent.touches[1], this.p2);
            this._numActivePoints++;
          }
        }
      } else {
        this._convertEventPosToPoint(
          /** @type {PointerEvent} */
          e,
          this.p1
        );
        if (pointerType === "up") {
          this._numActivePoints = 0;
        } else {
          this._numActivePoints++;
        }
      }
    }
  }
  /** update points that were used during previous rAF tick
   * @private
   */
  _updatePrevPoints() {
    equalizePoints(this.prevP1, this.p1);
    equalizePoints(this.prevP2, this.p2);
  }
  /** update points at the start of gesture
   * @private
   */
  _updateStartPoints() {
    equalizePoints(this.startP1, this.p1);
    equalizePoints(this.startP2, this.p2);
    this._updatePrevPoints();
  }
  /** @private */
  _calculateDragDirection() {
    if (this.pswp.mainScroll.isShifted()) {
      this.dragAxis = "x";
    } else {
      const diff = Math.abs(this.p1.x - this.startP1.x) - Math.abs(this.p1.y - this.startP1.y);
      if (diff !== 0) {
        const axisToCheck = diff > 0 ? "x" : "y";
        if (Math.abs(this.p1[axisToCheck] - this.startP1[axisToCheck]) >= AXIS_SWIPE_HYSTERISIS) {
          this.dragAxis = axisToCheck;
        }
      }
    }
  }
  /**
   * Converts touch, pointer or mouse event
   * to PhotoSwipe point.
   *
   * @private
   * @param {Touch | PointerEvent} e
   * @param {Point} p
   * @returns {Point}
   */
  _convertEventPosToPoint(e, p2) {
    p2.x = e.pageX - this.pswp.offset.x;
    p2.y = e.pageY - this.pswp.offset.y;
    if ("pointerId" in e) {
      p2.id = e.pointerId;
    } else if (e.identifier !== void 0) {
      p2.id = e.identifier;
    }
    return p2;
  }
  /**
   * @private
   * @param {PointerEvent} e
   */
  _onClick(e) {
    if (this.pswp.mainScroll.isShifted()) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
};
var MAIN_SCROLL_END_FRICTION = 0.35;
var MainScroll = class {
  /**
   * @param {PhotoSwipe} pswp
   */
  constructor(pswp) {
    this.pswp = pswp;
    this.x = 0;
    this.slideWidth = 0;
    this._currPositionIndex = 0;
    this._prevPositionIndex = 0;
    this._containerShiftIndex = -1;
    this.itemHolders = [];
  }
  /**
   * Position the scroller and slide containers
   * according to viewport size.
   *
   * @param {boolean} [resizeSlides] Whether slides content should resized
   */
  resize(resizeSlides) {
    const {
      pswp
    } = this;
    const newSlideWidth = Math.round(pswp.viewportSize.x + pswp.viewportSize.x * pswp.options.spacing);
    const slideWidthChanged = newSlideWidth !== this.slideWidth;
    if (slideWidthChanged) {
      this.slideWidth = newSlideWidth;
      this.moveTo(this.getCurrSlideX());
    }
    this.itemHolders.forEach((itemHolder, index) => {
      if (slideWidthChanged) {
        setTransform(itemHolder.el, (index + this._containerShiftIndex) * this.slideWidth);
      }
      if (resizeSlides && itemHolder.slide) {
        itemHolder.slide.resize();
      }
    });
  }
  /**
   * Reset X position of the main scroller to zero
   */
  resetPosition() {
    this._currPositionIndex = 0;
    this._prevPositionIndex = 0;
    this.slideWidth = 0;
    this._containerShiftIndex = -1;
  }
  /**
   * Create and append array of three items
   * that hold data about slides in DOM
   */
  appendHolders() {
    this.itemHolders = [];
    for (let i2 = 0; i2 < 3; i2++) {
      const el = createElement("pswp__item", "div", this.pswp.container);
      el.setAttribute("role", "group");
      el.setAttribute("aria-roledescription", "slide");
      el.setAttribute("aria-hidden", "true");
      el.style.display = i2 === 1 ? "block" : "none";
      this.itemHolders.push({
        el
        //index: -1
      });
    }
  }
  /**
   * Whether the main scroll can be horizontally swiped to the next or previous slide.
   * @returns {boolean}
   */
  canBeSwiped() {
    return this.pswp.getNumItems() > 1;
  }
  /**
   * Move main scroll by X amount of slides.
   * For example:
   *   `-1` will move to the previous slide,
   *    `0` will reset the scroll position of the current slide,
   *    `3` will move three slides forward
   *
   * If loop option is enabled - index will be automatically looped too,
   * (for example `-1` will move to the last slide of the gallery).
   *
   * @param {number} diff
   * @param {boolean} [animate]
   * @param {number} [velocityX]
   * @returns {boolean} whether index was changed or not
   */
  moveIndexBy(diff, animate, velocityX) {
    const {
      pswp
    } = this;
    let newIndex = pswp.potentialIndex + diff;
    const numSlides = pswp.getNumItems();
    if (pswp.canLoop()) {
      newIndex = pswp.getLoopedIndex(newIndex);
      const distance = (diff + numSlides) % numSlides;
      if (distance <= numSlides / 2) {
        diff = distance;
      } else {
        diff = distance - numSlides;
      }
    } else {
      if (newIndex < 0) {
        newIndex = 0;
      } else if (newIndex >= numSlides) {
        newIndex = numSlides - 1;
      }
      diff = newIndex - pswp.potentialIndex;
    }
    pswp.potentialIndex = newIndex;
    this._currPositionIndex -= diff;
    pswp.animations.stopMainScroll();
    const destinationX = this.getCurrSlideX();
    if (!animate) {
      this.moveTo(destinationX);
      this.updateCurrItem();
    } else {
      pswp.animations.startSpring({
        isMainScroll: true,
        start: this.x,
        end: destinationX,
        velocity: velocityX || 0,
        naturalFrequency: 30,
        dampingRatio: 1,
        //0.7,
        onUpdate: (x2) => {
          this.moveTo(x2);
        },
        onComplete: () => {
          this.updateCurrItem();
          pswp.appendHeavy();
        }
      });
      let currDiff = pswp.potentialIndex - pswp.currIndex;
      if (pswp.canLoop()) {
        const currDistance = (currDiff + numSlides) % numSlides;
        if (currDistance <= numSlides / 2) {
          currDiff = currDistance;
        } else {
          currDiff = currDistance - numSlides;
        }
      }
      if (Math.abs(currDiff) > 1) {
        this.updateCurrItem();
      }
    }
    return Boolean(diff);
  }
  /**
   * X position of the main scroll for the current slide
   * (ignores position during dragging)
   * @returns {number}
   */
  getCurrSlideX() {
    return this.slideWidth * this._currPositionIndex;
  }
  /**
   * Whether scroll position is shifted.
   * For example, it will return true if the scroll is being dragged or animated.
   * @returns {boolean}
   */
  isShifted() {
    return this.x !== this.getCurrSlideX();
  }
  /**
   * Update slides X positions and set their content
   */
  updateCurrItem() {
    var _this$itemHolders$;
    const {
      pswp
    } = this;
    const positionDifference = this._prevPositionIndex - this._currPositionIndex;
    if (!positionDifference) {
      return;
    }
    this._prevPositionIndex = this._currPositionIndex;
    pswp.currIndex = pswp.potentialIndex;
    let diffAbs = Math.abs(positionDifference);
    let tempHolder;
    if (diffAbs >= 3) {
      this._containerShiftIndex += positionDifference + (positionDifference > 0 ? -3 : 3);
      diffAbs = 3;
      this.itemHolders.forEach((itemHolder) => {
        var _itemHolder$slide;
        (_itemHolder$slide = itemHolder.slide) === null || _itemHolder$slide === void 0 || _itemHolder$slide.destroy();
        itemHolder.slide = void 0;
      });
    }
    for (let i2 = 0; i2 < diffAbs; i2++) {
      if (positionDifference > 0) {
        tempHolder = this.itemHolders.shift();
        if (tempHolder) {
          this.itemHolders[2] = tempHolder;
          this._containerShiftIndex++;
          setTransform(tempHolder.el, (this._containerShiftIndex + 2) * this.slideWidth);
          pswp.setContent(tempHolder, pswp.currIndex - diffAbs + i2 + 2);
        }
      } else {
        tempHolder = this.itemHolders.pop();
        if (tempHolder) {
          this.itemHolders.unshift(tempHolder);
          this._containerShiftIndex--;
          setTransform(tempHolder.el, this._containerShiftIndex * this.slideWidth);
          pswp.setContent(tempHolder, pswp.currIndex + diffAbs - i2 - 2);
        }
      }
    }
    if (Math.abs(this._containerShiftIndex) > 50 && !this.isShifted()) {
      this.resetPosition();
      this.resize();
    }
    pswp.animations.stopAllPan();
    this.itemHolders.forEach((itemHolder, i2) => {
      if (itemHolder.slide) {
        itemHolder.slide.setIsActive(i2 === 1);
      }
    });
    pswp.currSlide = (_this$itemHolders$ = this.itemHolders[1]) === null || _this$itemHolders$ === void 0 ? void 0 : _this$itemHolders$.slide;
    pswp.contentLoader.updateLazy(positionDifference);
    if (pswp.currSlide) {
      pswp.currSlide.applyCurrentZoomPan();
    }
    pswp.dispatch("change");
  }
  /**
   * Move the X position of the main scroll container
   *
   * @param {number} x
   * @param {boolean} [dragging]
   */
  moveTo(x2, dragging) {
    if (!this.pswp.canLoop() && dragging) {
      let newSlideIndexOffset = (this.slideWidth * this._currPositionIndex - x2) / this.slideWidth;
      newSlideIndexOffset += this.pswp.currIndex;
      const delta = Math.round(x2 - this.x);
      if (newSlideIndexOffset < 0 && delta > 0 || newSlideIndexOffset >= this.pswp.getNumItems() - 1 && delta < 0) {
        x2 = this.x + delta * MAIN_SCROLL_END_FRICTION;
      }
    }
    this.x = x2;
    if (this.pswp.container) {
      setTransform(this.pswp.container, x2);
    }
    this.pswp.dispatch("moveMainScroll", {
      x: x2,
      dragging: dragging !== null && dragging !== void 0 ? dragging : false
    });
  }
};
var KeyboardKeyCodesMap = {
  Escape: 27,
  z: 90,
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
  Tab: 9
};
var getKeyboardEventKey = (key, isKeySupported) => {
  return isKeySupported ? key : KeyboardKeyCodesMap[key];
};
var Keyboard = class {
  /**
   * @param {PhotoSwipe} pswp
   */
  constructor(pswp) {
    this.pswp = pswp;
    this._wasFocused = false;
    pswp.on("bindEvents", () => {
      if (pswp.options.trapFocus) {
        if (!pswp.options.initialPointerPos) {
          this._focusRoot();
        }
        pswp.events.add(
          document,
          "focusin",
          /** @type EventListener */
          this._onFocusIn.bind(this)
        );
      }
      pswp.events.add(
        document,
        "keydown",
        /** @type EventListener */
        this._onKeyDown.bind(this)
      );
    });
    const lastActiveElement = (
      /** @type {HTMLElement} */
      document.activeElement
    );
    pswp.on("destroy", () => {
      if (pswp.options.returnFocus && lastActiveElement && this._wasFocused) {
        lastActiveElement.focus();
      }
    });
  }
  /** @private */
  _focusRoot() {
    if (!this._wasFocused && this.pswp.element) {
      this.pswp.element.focus();
      this._wasFocused = true;
    }
  }
  /**
   * @private
   * @param {KeyboardEvent} e
   */
  _onKeyDown(e) {
    const {
      pswp
    } = this;
    if (pswp.dispatch("keydown", {
      originalEvent: e
    }).defaultPrevented) {
      return;
    }
    if (specialKeyUsed(e)) {
      return;
    }
    let keydownAction;
    let axis;
    let isForward = false;
    const isKeySupported = "key" in e;
    switch (isKeySupported ? e.key : e.keyCode) {
      case getKeyboardEventKey("Escape", isKeySupported):
        if (pswp.options.escKey) {
          keydownAction = "close";
        }
        break;
      case getKeyboardEventKey("z", isKeySupported):
        keydownAction = "toggleZoom";
        break;
      case getKeyboardEventKey("ArrowLeft", isKeySupported):
        axis = "x";
        break;
      case getKeyboardEventKey("ArrowUp", isKeySupported):
        axis = "y";
        break;
      case getKeyboardEventKey("ArrowRight", isKeySupported):
        axis = "x";
        isForward = true;
        break;
      case getKeyboardEventKey("ArrowDown", isKeySupported):
        isForward = true;
        axis = "y";
        break;
      case getKeyboardEventKey("Tab", isKeySupported):
        this._focusRoot();
        break;
    }
    if (axis) {
      e.preventDefault();
      const {
        currSlide
      } = pswp;
      if (pswp.options.arrowKeys && axis === "x" && pswp.getNumItems() > 1) {
        keydownAction = isForward ? "next" : "prev";
      } else if (currSlide && currSlide.currZoomLevel > currSlide.zoomLevels.fit) {
        currSlide.pan[axis] += isForward ? -80 : 80;
        currSlide.panTo(currSlide.pan.x, currSlide.pan.y);
      }
    }
    if (keydownAction) {
      e.preventDefault();
      pswp[keydownAction]();
    }
  }
  /**
   * Trap focus inside photoswipe
   *
   * @private
   * @param {FocusEvent} e
   */
  _onFocusIn(e) {
    const {
      template
    } = this.pswp;
    if (template && document !== e.target && template !== e.target && !template.contains(
      /** @type {Node} */
      e.target
    )) {
      template.focus();
    }
  }
};
var DEFAULT_EASING = "cubic-bezier(.4,0,.22,1)";
var CSSAnimation = class {
  /**
   * onComplete can be unpredictable, be careful about current state
   *
   * @param {CssAnimationProps} props
   */
  constructor(props) {
    var _props$prop;
    this.props = props;
    const {
      target,
      onComplete,
      transform,
      onFinish = () => {
      },
      duration = 333,
      easing = DEFAULT_EASING
    } = props;
    this.onFinish = onFinish;
    const prop = transform ? "transform" : "opacity";
    const propValue = (_props$prop = props[prop]) !== null && _props$prop !== void 0 ? _props$prop : "";
    this._target = target;
    this._onComplete = onComplete;
    this._finished = false;
    this._onTransitionEnd = this._onTransitionEnd.bind(this);
    this._helperTimeout = setTimeout(() => {
      setTransitionStyle(target, prop, duration, easing);
      this._helperTimeout = setTimeout(() => {
        target.addEventListener("transitionend", this._onTransitionEnd, false);
        target.addEventListener("transitioncancel", this._onTransitionEnd, false);
        this._helperTimeout = setTimeout(() => {
          this._finalizeAnimation();
        }, duration + 500);
        target.style[prop] = propValue;
      }, 30);
    }, 0);
  }
  /**
   * @private
   * @param {TransitionEvent} e
   */
  _onTransitionEnd(e) {
    if (e.target === this._target) {
      this._finalizeAnimation();
    }
  }
  /**
   * @private
   */
  _finalizeAnimation() {
    if (!this._finished) {
      this._finished = true;
      this.onFinish();
      if (this._onComplete) {
        this._onComplete();
      }
    }
  }
  // Destroy is called automatically onFinish
  destroy() {
    if (this._helperTimeout) {
      clearTimeout(this._helperTimeout);
    }
    removeTransitionStyle(this._target);
    this._target.removeEventListener("transitionend", this._onTransitionEnd, false);
    this._target.removeEventListener("transitioncancel", this._onTransitionEnd, false);
    if (!this._finished) {
      this._finalizeAnimation();
    }
  }
};
var DEFAULT_NATURAL_FREQUENCY = 12;
var DEFAULT_DAMPING_RATIO = 0.75;
var SpringEaser = class {
  /**
   * @param {number} initialVelocity Initial velocity, px per ms.
   *
   * @param {number} [dampingRatio]
   * Determines how bouncy animation will be.
   * From 0 to 1, 0 - always overshoot, 1 - do not overshoot.
   * "overshoot" refers to part of animation that
   * goes beyond the final value.
   *
   * @param {number} [naturalFrequency]
   * Determines how fast animation will slow down.
   * The higher value - the stiffer the transition will be,
   * and the faster it will slow down.
   * Recommended value from 10 to 50
   */
  constructor(initialVelocity, dampingRatio, naturalFrequency) {
    this.velocity = initialVelocity * 1e3;
    this._dampingRatio = dampingRatio || DEFAULT_DAMPING_RATIO;
    this._naturalFrequency = naturalFrequency || DEFAULT_NATURAL_FREQUENCY;
    this._dampedFrequency = this._naturalFrequency;
    if (this._dampingRatio < 1) {
      this._dampedFrequency *= Math.sqrt(1 - this._dampingRatio * this._dampingRatio);
    }
  }
  /**
   * @param {number} deltaPosition Difference between current and end position of the animation
   * @param {number} deltaTime Frame duration in milliseconds
   *
   * @returns {number} Displacement, relative to the end position.
   */
  easeFrame(deltaPosition, deltaTime) {
    let displacement = 0;
    let coeff;
    deltaTime /= 1e3;
    const naturalDumpingPow = Math.E ** (-this._dampingRatio * this._naturalFrequency * deltaTime);
    if (this._dampingRatio === 1) {
      coeff = this.velocity + this._naturalFrequency * deltaPosition;
      displacement = (deltaPosition + coeff * deltaTime) * naturalDumpingPow;
      this.velocity = displacement * -this._naturalFrequency + coeff * naturalDumpingPow;
    } else if (this._dampingRatio < 1) {
      coeff = 1 / this._dampedFrequency * (this._dampingRatio * this._naturalFrequency * deltaPosition + this.velocity);
      const dumpedFCos = Math.cos(this._dampedFrequency * deltaTime);
      const dumpedFSin = Math.sin(this._dampedFrequency * deltaTime);
      displacement = naturalDumpingPow * (deltaPosition * dumpedFCos + coeff * dumpedFSin);
      this.velocity = displacement * -this._naturalFrequency * this._dampingRatio + naturalDumpingPow * (-this._dampedFrequency * deltaPosition * dumpedFSin + this._dampedFrequency * coeff * dumpedFCos);
    }
    return displacement;
  }
};
var SpringAnimation = class {
  /**
   * @param {SpringAnimationProps} props
   */
  constructor(props) {
    this.props = props;
    this._raf = 0;
    const {
      start,
      end,
      velocity,
      onUpdate,
      onComplete,
      onFinish = () => {
      },
      dampingRatio,
      naturalFrequency
    } = props;
    this.onFinish = onFinish;
    const easer = new SpringEaser(velocity, dampingRatio, naturalFrequency);
    let prevTime = Date.now();
    let deltaPosition = start - end;
    const animationLoop = () => {
      if (this._raf) {
        deltaPosition = easer.easeFrame(deltaPosition, Date.now() - prevTime);
        if (Math.abs(deltaPosition) < 1 && Math.abs(easer.velocity) < 50) {
          onUpdate(end);
          if (onComplete) {
            onComplete();
          }
          this.onFinish();
        } else {
          prevTime = Date.now();
          onUpdate(deltaPosition + end);
          this._raf = requestAnimationFrame(animationLoop);
        }
      }
    };
    this._raf = requestAnimationFrame(animationLoop);
  }
  // Destroy is called automatically onFinish
  destroy() {
    if (this._raf >= 0) {
      cancelAnimationFrame(this._raf);
    }
    this._raf = 0;
  }
};
var Animations = class {
  constructor() {
    this.activeAnimations = [];
  }
  /**
   * @param {SpringAnimationProps} props
   */
  startSpring(props) {
    this._start(props, true);
  }
  /**
   * @param {CssAnimationProps} props
   */
  startTransition(props) {
    this._start(props);
  }
  /**
   * @private
   * @param {AnimationProps} props
   * @param {boolean} [isSpring]
   * @returns {Animation}
   */
  _start(props, isSpring) {
    const animation = isSpring ? new SpringAnimation(
      /** @type SpringAnimationProps */
      props
    ) : new CSSAnimation(
      /** @type CssAnimationProps */
      props
    );
    this.activeAnimations.push(animation);
    animation.onFinish = () => this.stop(animation);
    return animation;
  }
  /**
   * @param {Animation} animation
   */
  stop(animation) {
    animation.destroy();
    const index = this.activeAnimations.indexOf(animation);
    if (index > -1) {
      this.activeAnimations.splice(index, 1);
    }
  }
  stopAll() {
    this.activeAnimations.forEach((animation) => {
      animation.destroy();
    });
    this.activeAnimations = [];
  }
  /**
   * Stop all pan or zoom transitions
   */
  stopAllPan() {
    this.activeAnimations = this.activeAnimations.filter((animation) => {
      if (animation.props.isPan) {
        animation.destroy();
        return false;
      }
      return true;
    });
  }
  stopMainScroll() {
    this.activeAnimations = this.activeAnimations.filter((animation) => {
      if (animation.props.isMainScroll) {
        animation.destroy();
        return false;
      }
      return true;
    });
  }
  /**
   * Returns true if main scroll transition is running
   */
  // isMainScrollRunning() {
  //   return this.activeAnimations.some((animation) => {
  //     return animation.props.isMainScroll;
  //   });
  // }
  /**
   * Returns true if any pan or zoom transition is running
   */
  isPanRunning() {
    return this.activeAnimations.some((animation) => {
      return animation.props.isPan;
    });
  }
};
var ScrollWheel = class {
  /**
   * @param {PhotoSwipe} pswp
   */
  constructor(pswp) {
    this.pswp = pswp;
    pswp.events.add(
      pswp.element,
      "wheel",
      /** @type EventListener */
      this._onWheel.bind(this)
    );
  }
  /**
   * @private
   * @param {WheelEvent} e
   */
  _onWheel(e) {
    e.preventDefault();
    const {
      currSlide
    } = this.pswp;
    let {
      deltaX,
      deltaY
    } = e;
    if (!currSlide) {
      return;
    }
    if (this.pswp.dispatch("wheel", {
      originalEvent: e
    }).defaultPrevented) {
      return;
    }
    if (e.ctrlKey || this.pswp.options.wheelToZoom) {
      if (currSlide.isZoomable()) {
        let zoomFactor = -deltaY;
        if (e.deltaMode === 1) {
          zoomFactor *= 0.05;
        } else {
          zoomFactor *= e.deltaMode ? 1 : 2e-3;
        }
        zoomFactor = 2 ** zoomFactor;
        const destZoomLevel = currSlide.currZoomLevel * zoomFactor;
        currSlide.zoomTo(destZoomLevel, {
          x: e.clientX,
          y: e.clientY
        });
      }
    } else {
      if (currSlide.isPannable()) {
        if (e.deltaMode === 1) {
          deltaX *= 18;
          deltaY *= 18;
        }
        currSlide.panTo(currSlide.pan.x - deltaX, currSlide.pan.y - deltaY);
      }
    }
  }
};
function addElementHTML(htmlData) {
  if (typeof htmlData === "string") {
    return htmlData;
  }
  if (!htmlData || !htmlData.isCustomSVG) {
    return "";
  }
  const svgData = htmlData;
  let out = '<svg aria-hidden="true" class="pswp__icn" viewBox="0 0 %d %d" width="%d" height="%d">';
  out = out.split("%d").join(
    /** @type {string} */
    svgData.size || 32
  );
  if (svgData.outlineID) {
    out += '<use class="pswp__icn-shadow" xlink:href="#' + svgData.outlineID + '"/>';
  }
  out += svgData.inner;
  out += "</svg>";
  return out;
}
var UIElement = class {
  /**
   * @param {PhotoSwipe} pswp
   * @param {UIElementData} data
   */
  constructor(pswp, data2) {
    var _container;
    const name = data2.name || data2.className;
    let elementHTML = data2.html;
    if (pswp.options[name] === false) {
      return;
    }
    if (typeof pswp.options[name + "SVG"] === "string") {
      elementHTML = pswp.options[name + "SVG"];
    }
    pswp.dispatch("uiElementCreate", {
      data: data2
    });
    let className = "";
    if (data2.isButton) {
      className += "pswp__button ";
      className += data2.className || `pswp__button--${data2.name}`;
    } else {
      className += data2.className || `pswp__${data2.name}`;
    }
    let tagName = data2.isButton ? data2.tagName || "button" : data2.tagName || "div";
    tagName = /** @type {keyof HTMLElementTagNameMap} */
    tagName.toLowerCase();
    const element = createElement(className, tagName);
    if (data2.isButton) {
      if (tagName === "button") {
        element.type = "button";
      }
      let {
        title
      } = data2;
      const {
        ariaLabel
      } = data2;
      if (typeof pswp.options[name + "Title"] === "string") {
        title = pswp.options[name + "Title"];
      }
      if (title) {
        element.title = title;
      }
      const ariaText = ariaLabel || title;
      if (ariaText) {
        element.setAttribute("aria-label", ariaText);
      }
    }
    element.innerHTML = addElementHTML(elementHTML);
    if (data2.onInit) {
      data2.onInit(element, pswp);
    }
    if (data2.onClick) {
      element.onclick = (e) => {
        if (typeof data2.onClick === "string") {
          pswp[data2.onClick]();
        } else if (typeof data2.onClick === "function") {
          data2.onClick(e, element, pswp);
        }
      };
    }
    const appendTo = data2.appendTo || "bar";
    let container = pswp.element;
    if (appendTo === "bar") {
      if (!pswp.topBar) {
        pswp.topBar = createElement("pswp__top-bar pswp__hide-on-close", "div", pswp.scrollWrap);
      }
      container = pswp.topBar;
    } else {
      element.classList.add("pswp__hide-on-close");
      if (appendTo === "wrapper") {
        container = pswp.scrollWrap;
      }
    }
    (_container = container) === null || _container === void 0 || _container.appendChild(pswp.applyFilters("uiElement", element, data2));
  }
};
function initArrowButton(element, pswp, isNextButton) {
  element.classList.add("pswp__button--arrow");
  element.setAttribute("aria-controls", "pswp__items");
  pswp.on("change", () => {
    if (!pswp.options.loop) {
      if (isNextButton) {
        element.disabled = !(pswp.currIndex < pswp.getNumItems() - 1);
      } else {
        element.disabled = !(pswp.currIndex > 0);
      }
    }
  });
}
var arrowPrev = {
  name: "arrowPrev",
  className: "pswp__button--arrow--prev",
  title: "Previous",
  order: 10,
  isButton: true,
  appendTo: "wrapper",
  html: {
    isCustomSVG: true,
    size: 60,
    inner: '<path d="M29 43l-3 3-16-16 16-16 3 3-13 13 13 13z" id="pswp__icn-arrow"/>',
    outlineID: "pswp__icn-arrow"
  },
  onClick: "prev",
  onInit: initArrowButton
};
var arrowNext = {
  name: "arrowNext",
  className: "pswp__button--arrow--next",
  title: "Next",
  order: 11,
  isButton: true,
  appendTo: "wrapper",
  html: {
    isCustomSVG: true,
    size: 60,
    inner: '<use xlink:href="#pswp__icn-arrow"/>',
    outlineID: "pswp__icn-arrow"
  },
  onClick: "next",
  onInit: (el, pswp) => {
    initArrowButton(el, pswp, true);
  }
};
var closeButton = {
  name: "close",
  title: "Close",
  order: 20,
  isButton: true,
  html: {
    isCustomSVG: true,
    inner: '<path d="M24 10l-2-2-6 6-6-6-2 2 6 6-6 6 2 2 6-6 6 6 2-2-6-6z" id="pswp__icn-close"/>',
    outlineID: "pswp__icn-close"
  },
  onClick: "close"
};
var zoomButton = {
  name: "zoom",
  title: "Zoom",
  order: 10,
  isButton: true,
  html: {
    isCustomSVG: true,
    // eslint-disable-next-line max-len
    inner: '<path d="M17.426 19.926a6 6 0 1 1 1.5-1.5L23 22.5 21.5 24l-4.074-4.074z" id="pswp__icn-zoom"/><path fill="currentColor" class="pswp__zoom-icn-bar-h" d="M11 16v-2h6v2z"/><path fill="currentColor" class="pswp__zoom-icn-bar-v" d="M13 12h2v6h-2z"/>',
    outlineID: "pswp__icn-zoom"
  },
  onClick: "toggleZoom"
};
var loadingIndicator = {
  name: "preloader",
  appendTo: "bar",
  order: 7,
  html: {
    isCustomSVG: true,
    // eslint-disable-next-line max-len
    inner: '<path fill-rule="evenodd" clip-rule="evenodd" d="M21.2 16a5.2 5.2 0 1 1-5.2-5.2V8a8 8 0 1 0 8 8h-2.8Z" id="pswp__icn-loading"/>',
    outlineID: "pswp__icn-loading"
  },
  onInit: (indicatorElement, pswp) => {
    let isVisible;
    let delayTimeout = null;
    const toggleIndicatorClass = (className, add) => {
      indicatorElement.classList.toggle("pswp__preloader--" + className, add);
    };
    const setIndicatorVisibility = (visible) => {
      if (isVisible !== visible) {
        isVisible = visible;
        toggleIndicatorClass("active", visible);
      }
    };
    const updatePreloaderVisibility = () => {
      var _pswp$currSlide;
      if (!((_pswp$currSlide = pswp.currSlide) !== null && _pswp$currSlide !== void 0 && _pswp$currSlide.content.isLoading())) {
        setIndicatorVisibility(false);
        if (delayTimeout) {
          clearTimeout(delayTimeout);
          delayTimeout = null;
        }
        return;
      }
      if (!delayTimeout) {
        delayTimeout = setTimeout(() => {
          var _pswp$currSlide2;
          setIndicatorVisibility(Boolean((_pswp$currSlide2 = pswp.currSlide) === null || _pswp$currSlide2 === void 0 ? void 0 : _pswp$currSlide2.content.isLoading()));
          delayTimeout = null;
        }, pswp.options.preloaderDelay);
      }
    };
    pswp.on("change", updatePreloaderVisibility);
    pswp.on("loadComplete", (e) => {
      if (pswp.currSlide === e.slide) {
        updatePreloaderVisibility();
      }
    });
    if (pswp.ui) {
      pswp.ui.updatePreloaderVisibility = updatePreloaderVisibility;
    }
  }
};
var counterIndicator = {
  name: "counter",
  order: 5,
  onInit: (counterElement, pswp) => {
    pswp.on("change", () => {
      counterElement.innerText = pswp.currIndex + 1 + pswp.options.indexIndicatorSep + pswp.getNumItems();
    });
  }
};
function setZoomedIn(el, isZoomedIn) {
  el.classList.toggle("pswp--zoomed-in", isZoomedIn);
}
var UI = class {
  /**
   * @param {PhotoSwipe} pswp
   */
  constructor(pswp) {
    this.pswp = pswp;
    this.isRegistered = false;
    this.uiElementsData = [];
    this.items = [];
    this.updatePreloaderVisibility = () => {
    };
    this._lastUpdatedZoomLevel = void 0;
  }
  init() {
    const {
      pswp
    } = this;
    this.isRegistered = false;
    this.uiElementsData = [closeButton, arrowPrev, arrowNext, zoomButton, loadingIndicator, counterIndicator];
    pswp.dispatch("uiRegister");
    this.uiElementsData.sort((a2, b2) => {
      return (a2.order || 0) - (b2.order || 0);
    });
    this.items = [];
    this.isRegistered = true;
    this.uiElementsData.forEach((uiElementData) => {
      this.registerElement(uiElementData);
    });
    pswp.on("change", () => {
      var _pswp$element;
      (_pswp$element = pswp.element) === null || _pswp$element === void 0 || _pswp$element.classList.toggle("pswp--one-slide", pswp.getNumItems() === 1);
    });
    pswp.on("zoomPanUpdate", () => this._onZoomPanUpdate());
  }
  /**
   * @param {UIElementData} elementData
   */
  registerElement(elementData) {
    if (this.isRegistered) {
      this.items.push(new UIElement(this.pswp, elementData));
    } else {
      this.uiElementsData.push(elementData);
    }
  }
  /**
   * Fired each time zoom or pan position is changed.
   * Update classes that control visibility of zoom button and cursor icon.
   *
   * @private
   */
  _onZoomPanUpdate() {
    const {
      template,
      currSlide,
      options
    } = this.pswp;
    if (this.pswp.opener.isClosing || !template || !currSlide) {
      return;
    }
    let {
      currZoomLevel
    } = currSlide;
    if (!this.pswp.opener.isOpen) {
      currZoomLevel = currSlide.zoomLevels.initial;
    }
    if (currZoomLevel === this._lastUpdatedZoomLevel) {
      return;
    }
    this._lastUpdatedZoomLevel = currZoomLevel;
    const currZoomLevelDiff = currSlide.zoomLevels.initial - currSlide.zoomLevels.secondary;
    if (Math.abs(currZoomLevelDiff) < 0.01 || !currSlide.isZoomable()) {
      setZoomedIn(template, false);
      template.classList.remove("pswp--zoom-allowed");
      return;
    }
    template.classList.add("pswp--zoom-allowed");
    const potentialZoomLevel = currZoomLevel === currSlide.zoomLevels.initial ? currSlide.zoomLevels.secondary : currSlide.zoomLevels.initial;
    setZoomedIn(template, potentialZoomLevel <= currZoomLevel);
    if (options.imageClickAction === "zoom" || options.imageClickAction === "zoom-or-close") {
      template.classList.add("pswp--click-to-zoom");
    }
  }
};
function getBoundsByElement(el) {
  const thumbAreaRect = el.getBoundingClientRect();
  return {
    x: thumbAreaRect.left,
    y: thumbAreaRect.top,
    w: thumbAreaRect.width
  };
}
function getCroppedBoundsByElement(el, imageWidth, imageHeight) {
  const thumbAreaRect = el.getBoundingClientRect();
  const hRatio = thumbAreaRect.width / imageWidth;
  const vRatio = thumbAreaRect.height / imageHeight;
  const fillZoomLevel = hRatio > vRatio ? hRatio : vRatio;
  const offsetX = (thumbAreaRect.width - imageWidth * fillZoomLevel) / 2;
  const offsetY = (thumbAreaRect.height - imageHeight * fillZoomLevel) / 2;
  const bounds = {
    x: thumbAreaRect.left + offsetX,
    y: thumbAreaRect.top + offsetY,
    w: imageWidth * fillZoomLevel
  };
  bounds.innerRect = {
    w: thumbAreaRect.width,
    h: thumbAreaRect.height,
    x: offsetX,
    y: offsetY
  };
  return bounds;
}
function getThumbBounds(index, itemData, instance) {
  const event = instance.dispatch("thumbBounds", {
    index,
    itemData,
    instance
  });
  if (event.thumbBounds) {
    return event.thumbBounds;
  }
  const {
    element
  } = itemData;
  let thumbBounds;
  let thumbnail;
  if (element && instance.options.thumbSelector !== false) {
    const thumbSelector = instance.options.thumbSelector || "img";
    thumbnail = element.matches(thumbSelector) ? element : (
      /** @type {HTMLElement | null} */
      element.querySelector(thumbSelector)
    );
  }
  thumbnail = instance.applyFilters("thumbEl", thumbnail, itemData, index);
  if (thumbnail) {
    if (!itemData.thumbCropped) {
      thumbBounds = getBoundsByElement(thumbnail);
    } else {
      thumbBounds = getCroppedBoundsByElement(thumbnail, itemData.width || itemData.w || 0, itemData.height || itemData.h || 0);
    }
  }
  return instance.applyFilters("thumbBounds", thumbBounds, itemData, index);
}
var PhotoSwipeEvent = class {
  /**
   * @param {T} type
   * @param {PhotoSwipeEventsMap[T]} [details]
   */
  constructor(type, details) {
    this.type = type;
    this.defaultPrevented = false;
    if (details) {
      Object.assign(this, details);
    }
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
};
var Eventable = class {
  constructor() {
    this._listeners = {};
    this._filters = {};
    this.pswp = void 0;
    this.options = void 0;
  }
  /**
   * @template {keyof PhotoSwipeFiltersMap} T
   * @param {T} name
   * @param {PhotoSwipeFiltersMap[T]} fn
   * @param {number} priority
   */
  addFilter(name, fn, priority = 100) {
    var _this$_filters$name, _this$_filters$name2, _this$pswp;
    if (!this._filters[name]) {
      this._filters[name] = [];
    }
    (_this$_filters$name = this._filters[name]) === null || _this$_filters$name === void 0 || _this$_filters$name.push({
      fn,
      priority
    });
    (_this$_filters$name2 = this._filters[name]) === null || _this$_filters$name2 === void 0 || _this$_filters$name2.sort((f1, f2) => f1.priority - f2.priority);
    (_this$pswp = this.pswp) === null || _this$pswp === void 0 || _this$pswp.addFilter(name, fn, priority);
  }
  /**
   * @template {keyof PhotoSwipeFiltersMap} T
   * @param {T} name
   * @param {PhotoSwipeFiltersMap[T]} fn
   */
  removeFilter(name, fn) {
    if (this._filters[name]) {
      this._filters[name] = this._filters[name].filter((filter) => filter.fn !== fn);
    }
    if (this.pswp) {
      this.pswp.removeFilter(name, fn);
    }
  }
  /**
   * @template {keyof PhotoSwipeFiltersMap} T
   * @param {T} name
   * @param {Parameters<PhotoSwipeFiltersMap[T]>} args
   * @returns {Parameters<PhotoSwipeFiltersMap[T]>[0]}
   */
  applyFilters(name, ...args) {
    var _this$_filters$name3;
    (_this$_filters$name3 = this._filters[name]) === null || _this$_filters$name3 === void 0 || _this$_filters$name3.forEach((filter) => {
      args[0] = filter.fn.apply(this, args);
    });
    return args[0];
  }
  /**
   * @template {keyof PhotoSwipeEventsMap} T
   * @param {T} name
   * @param {EventCallback<T>} fn
   */
  on(name, fn) {
    var _this$_listeners$name, _this$pswp2;
    if (!this._listeners[name]) {
      this._listeners[name] = [];
    }
    (_this$_listeners$name = this._listeners[name]) === null || _this$_listeners$name === void 0 || _this$_listeners$name.push(fn);
    (_this$pswp2 = this.pswp) === null || _this$pswp2 === void 0 || _this$pswp2.on(name, fn);
  }
  /**
   * @template {keyof PhotoSwipeEventsMap} T
   * @param {T} name
   * @param {EventCallback<T>} fn
   */
  off(name, fn) {
    var _this$pswp3;
    if (this._listeners[name]) {
      this._listeners[name] = this._listeners[name].filter((listener) => fn !== listener);
    }
    (_this$pswp3 = this.pswp) === null || _this$pswp3 === void 0 || _this$pswp3.off(name, fn);
  }
  /**
   * @template {keyof PhotoSwipeEventsMap} T
   * @param {T} name
   * @param {PhotoSwipeEventsMap[T]} [details]
   * @returns {AugmentedEvent<T>}
   */
  dispatch(name, details) {
    var _this$_listeners$name2;
    if (this.pswp) {
      return this.pswp.dispatch(name, details);
    }
    const event = (
      /** @type {AugmentedEvent<T>} */
      new PhotoSwipeEvent(name, details)
    );
    (_this$_listeners$name2 = this._listeners[name]) === null || _this$_listeners$name2 === void 0 || _this$_listeners$name2.forEach((listener) => {
      listener.call(this, event);
    });
    return event;
  }
};
var Placeholder = class {
  /**
   * @param {string | false} imageSrc
   * @param {HTMLElement} container
   */
  constructor(imageSrc, container) {
    this.element = createElement("pswp__img pswp__img--placeholder", imageSrc ? "img" : "div", container);
    if (imageSrc) {
      const imgEl = (
        /** @type {HTMLImageElement} */
        this.element
      );
      imgEl.decoding = "async";
      imgEl.alt = "";
      imgEl.src = imageSrc;
      imgEl.setAttribute("role", "presentation");
    }
    this.element.setAttribute("aria-hidden", "true");
  }
  /**
   * @param {number} width
   * @param {number} height
   */
  setDisplayedSize(width, height) {
    if (!this.element) {
      return;
    }
    if (this.element.tagName === "IMG") {
      setWidthHeight(this.element, 250, "auto");
      this.element.style.transformOrigin = "0 0";
      this.element.style.transform = toTransformString(0, 0, width / 250);
    } else {
      setWidthHeight(this.element, width, height);
    }
  }
  destroy() {
    var _this$element;
    if ((_this$element = this.element) !== null && _this$element !== void 0 && _this$element.parentNode) {
      this.element.remove();
    }
    this.element = null;
  }
};
var Content = class {
  /**
   * @param {SlideData} itemData Slide data
   * @param {PhotoSwipeBase} instance PhotoSwipe or PhotoSwipeLightbox instance
   * @param {number} index
   */
  constructor(itemData, instance, index) {
    this.instance = instance;
    this.data = itemData;
    this.index = index;
    this.element = void 0;
    this.placeholder = void 0;
    this.slide = void 0;
    this.displayedImageWidth = 0;
    this.displayedImageHeight = 0;
    this.width = Number(this.data.w) || Number(this.data.width) || 0;
    this.height = Number(this.data.h) || Number(this.data.height) || 0;
    this.isAttached = false;
    this.hasSlide = false;
    this.isDecoding = false;
    this.state = LOAD_STATE.IDLE;
    if (this.data.type) {
      this.type = this.data.type;
    } else if (this.data.src) {
      this.type = "image";
    } else {
      this.type = "html";
    }
    this.instance.dispatch("contentInit", {
      content: this
    });
  }
  removePlaceholder() {
    if (this.placeholder && !this.keepPlaceholder()) {
      setTimeout(() => {
        if (this.placeholder) {
          this.placeholder.destroy();
          this.placeholder = void 0;
        }
      }, 1e3);
    }
  }
  /**
   * Preload content
   *
   * @param {boolean} isLazy
   * @param {boolean} [reload]
   */
  load(isLazy, reload) {
    if (this.slide && this.usePlaceholder()) {
      if (!this.placeholder) {
        const placeholderSrc = this.instance.applyFilters(
          "placeholderSrc",
          // use  image-based placeholder only for the first slide,
          // as rendering (even small stretched thumbnail) is an expensive operation
          this.data.msrc && this.slide.isFirstSlide ? this.data.msrc : false,
          this
        );
        this.placeholder = new Placeholder(placeholderSrc, this.slide.container);
      } else {
        const placeholderEl = this.placeholder.element;
        if (placeholderEl && !placeholderEl.parentElement) {
          this.slide.container.prepend(placeholderEl);
        }
      }
    }
    if (this.element && !reload) {
      return;
    }
    if (this.instance.dispatch("contentLoad", {
      content: this,
      isLazy
    }).defaultPrevented) {
      return;
    }
    if (this.isImageContent()) {
      this.element = createElement("pswp__img", "img");
      if (this.displayedImageWidth) {
        this.loadImage(isLazy);
      }
    } else {
      this.element = createElement("pswp__content", "div");
      this.element.innerHTML = this.data.html || "";
    }
    if (reload && this.slide) {
      this.slide.updateContentSize(true);
    }
  }
  /**
   * Preload image
   *
   * @param {boolean} isLazy
   */
  loadImage(isLazy) {
    var _this$data$src, _this$data$alt;
    if (!this.isImageContent() || !this.element || this.instance.dispatch("contentLoadImage", {
      content: this,
      isLazy
    }).defaultPrevented) {
      return;
    }
    const imageElement = (
      /** @type HTMLImageElement */
      this.element
    );
    this.updateSrcsetSizes();
    if (this.data.srcset) {
      imageElement.srcset = this.data.srcset;
    }
    imageElement.src = (_this$data$src = this.data.src) !== null && _this$data$src !== void 0 ? _this$data$src : "";
    imageElement.alt = (_this$data$alt = this.data.alt) !== null && _this$data$alt !== void 0 ? _this$data$alt : "";
    this.state = LOAD_STATE.LOADING;
    if (imageElement.complete) {
      this.onLoaded();
    } else {
      imageElement.onload = () => {
        this.onLoaded();
      };
      imageElement.onerror = () => {
        this.onError();
      };
    }
  }
  /**
   * Assign slide to content
   *
   * @param {Slide} slide
   */
  setSlide(slide) {
    this.slide = slide;
    this.hasSlide = true;
    this.instance = slide.pswp;
  }
  /**
   * Content load success handler
   */
  onLoaded() {
    this.state = LOAD_STATE.LOADED;
    if (this.slide && this.element) {
      this.instance.dispatch("loadComplete", {
        slide: this.slide,
        content: this
      });
      if (this.slide.isActive && this.slide.heavyAppended && !this.element.parentNode) {
        this.append();
        this.slide.updateContentSize(true);
      }
      if (this.state === LOAD_STATE.LOADED || this.state === LOAD_STATE.ERROR) {
        this.removePlaceholder();
      }
    }
  }
  /**
   * Content load error handler
   */
  onError() {
    this.state = LOAD_STATE.ERROR;
    if (this.slide) {
      this.displayError();
      this.instance.dispatch("loadComplete", {
        slide: this.slide,
        isError: true,
        content: this
      });
      this.instance.dispatch("loadError", {
        slide: this.slide,
        content: this
      });
    }
  }
  /**
   * @returns {Boolean} If the content is currently loading
   */
  isLoading() {
    return this.instance.applyFilters("isContentLoading", this.state === LOAD_STATE.LOADING, this);
  }
  /**
   * @returns {Boolean} If the content is in error state
   */
  isError() {
    return this.state === LOAD_STATE.ERROR;
  }
  /**
   * @returns {boolean} If the content is image
   */
  isImageContent() {
    return this.type === "image";
  }
  /**
   * Update content size
   *
   * @param {Number} width
   * @param {Number} height
   */
  setDisplayedSize(width, height) {
    if (!this.element) {
      return;
    }
    if (this.placeholder) {
      this.placeholder.setDisplayedSize(width, height);
    }
    if (this.instance.dispatch("contentResize", {
      content: this,
      width,
      height
    }).defaultPrevented) {
      return;
    }
    setWidthHeight(this.element, width, height);
    if (this.isImageContent() && !this.isError()) {
      const isInitialSizeUpdate = !this.displayedImageWidth && width;
      this.displayedImageWidth = width;
      this.displayedImageHeight = height;
      if (isInitialSizeUpdate) {
        this.loadImage(false);
      } else {
        this.updateSrcsetSizes();
      }
      if (this.slide) {
        this.instance.dispatch("imageSizeChange", {
          slide: this.slide,
          width,
          height,
          content: this
        });
      }
    }
  }
  /**
   * @returns {boolean} If the content can be zoomed
   */
  isZoomable() {
    return this.instance.applyFilters("isContentZoomable", this.isImageContent() && this.state !== LOAD_STATE.ERROR, this);
  }
  /**
   * Update image srcset sizes attribute based on width and height
   */
  updateSrcsetSizes() {
    if (!this.isImageContent() || !this.element || !this.data.srcset) {
      return;
    }
    const image = (
      /** @type HTMLImageElement */
      this.element
    );
    const sizesWidth = this.instance.applyFilters("srcsetSizesWidth", this.displayedImageWidth, this);
    if (!image.dataset.largestUsedSize || sizesWidth > parseInt(image.dataset.largestUsedSize, 10)) {
      image.sizes = sizesWidth + "px";
      image.dataset.largestUsedSize = String(sizesWidth);
    }
  }
  /**
   * @returns {boolean} If content should use a placeholder (from msrc by default)
   */
  usePlaceholder() {
    return this.instance.applyFilters("useContentPlaceholder", this.isImageContent(), this);
  }
  /**
   * Preload content with lazy-loading param
   */
  lazyLoad() {
    if (this.instance.dispatch("contentLazyLoad", {
      content: this
    }).defaultPrevented) {
      return;
    }
    this.load(true);
  }
  /**
   * @returns {boolean} If placeholder should be kept after content is loaded
   */
  keepPlaceholder() {
    return this.instance.applyFilters("isKeepingPlaceholder", this.isLoading(), this);
  }
  /**
   * Destroy the content
   */
  destroy() {
    this.hasSlide = false;
    this.slide = void 0;
    if (this.instance.dispatch("contentDestroy", {
      content: this
    }).defaultPrevented) {
      return;
    }
    this.remove();
    if (this.placeholder) {
      this.placeholder.destroy();
      this.placeholder = void 0;
    }
    if (this.isImageContent() && this.element) {
      this.element.onload = null;
      this.element.onerror = null;
      this.element = void 0;
    }
  }
  /**
   * Display error message
   */
  displayError() {
    if (this.slide) {
      var _this$instance$option, _this$instance$option2;
      let errorMsgEl = createElement("pswp__error-msg", "div");
      errorMsgEl.innerText = (_this$instance$option = (_this$instance$option2 = this.instance.options) === null || _this$instance$option2 === void 0 ? void 0 : _this$instance$option2.errorMsg) !== null && _this$instance$option !== void 0 ? _this$instance$option : "";
      errorMsgEl = /** @type {HTMLDivElement} */
      this.instance.applyFilters("contentErrorElement", errorMsgEl, this);
      this.element = createElement("pswp__content pswp__error-msg-container", "div");
      this.element.appendChild(errorMsgEl);
      this.slide.container.innerText = "";
      this.slide.container.appendChild(this.element);
      this.slide.updateContentSize(true);
      this.removePlaceholder();
    }
  }
  /**
   * Append the content
   */
  append() {
    if (this.isAttached || !this.element) {
      return;
    }
    this.isAttached = true;
    if (this.state === LOAD_STATE.ERROR) {
      this.displayError();
      return;
    }
    if (this.instance.dispatch("contentAppend", {
      content: this
    }).defaultPrevented) {
      return;
    }
    const supportsDecode = "decode" in this.element;
    if (this.isImageContent()) {
      if (supportsDecode && this.slide && (!this.slide.isActive || isSafari())) {
        this.isDecoding = true;
        this.element.decode().catch(() => {
        }).finally(() => {
          this.isDecoding = false;
          this.appendImage();
        });
      } else {
        this.appendImage();
      }
    } else if (this.slide && !this.element.parentNode) {
      this.slide.container.appendChild(this.element);
    }
  }
  /**
   * Activate the slide,
   * active slide is generally the current one,
   * meaning the user can see it.
   */
  activate() {
    if (this.instance.dispatch("contentActivate", {
      content: this
    }).defaultPrevented || !this.slide) {
      return;
    }
    if (this.isImageContent() && this.isDecoding && !isSafari()) {
      this.appendImage();
    } else if (this.isError()) {
      this.load(false, true);
    }
    if (this.slide.holderElement) {
      this.slide.holderElement.setAttribute("aria-hidden", "false");
    }
  }
  /**
   * Deactivate the content
   */
  deactivate() {
    this.instance.dispatch("contentDeactivate", {
      content: this
    });
    if (this.slide && this.slide.holderElement) {
      this.slide.holderElement.setAttribute("aria-hidden", "true");
    }
  }
  /**
   * Remove the content from DOM
   */
  remove() {
    this.isAttached = false;
    if (this.instance.dispatch("contentRemove", {
      content: this
    }).defaultPrevented) {
      return;
    }
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
    if (this.placeholder && this.placeholder.element) {
      this.placeholder.element.remove();
    }
  }
  /**
   * Append the image content to slide container
   */
  appendImage() {
    if (!this.isAttached) {
      return;
    }
    if (this.instance.dispatch("contentAppendImage", {
      content: this
    }).defaultPrevented) {
      return;
    }
    if (this.slide && this.element && !this.element.parentNode) {
      this.slide.container.appendChild(this.element);
    }
    if (this.state === LOAD_STATE.LOADED || this.state === LOAD_STATE.ERROR) {
      this.removePlaceholder();
    }
  }
};
var MIN_SLIDES_TO_CACHE = 5;
function lazyLoadData(itemData, instance, index) {
  const content = instance.createContentFromData(itemData, index);
  let zoomLevel;
  const {
    options
  } = instance;
  if (options) {
    zoomLevel = new ZoomLevel(options, itemData, -1);
    let viewportSize;
    if (instance.pswp) {
      viewportSize = instance.pswp.viewportSize;
    } else {
      viewportSize = getViewportSize(options, instance);
    }
    const panAreaSize = getPanAreaSize(options, viewportSize, itemData, index);
    zoomLevel.update(content.width, content.height, panAreaSize);
  }
  content.lazyLoad();
  if (zoomLevel) {
    content.setDisplayedSize(Math.ceil(content.width * zoomLevel.initial), Math.ceil(content.height * zoomLevel.initial));
  }
  return content;
}
function lazyLoadSlide(index, instance) {
  const itemData = instance.getItemData(index);
  if (instance.dispatch("lazyLoadSlide", {
    index,
    itemData
  }).defaultPrevented) {
    return;
  }
  return lazyLoadData(itemData, instance, index);
}
var ContentLoader = class {
  /**
   * @param {PhotoSwipe} pswp
   */
  constructor(pswp) {
    this.pswp = pswp;
    this.limit = Math.max(pswp.options.preload[0] + pswp.options.preload[1] + 1, MIN_SLIDES_TO_CACHE);
    this._cachedItems = [];
  }
  /**
   * Lazy load nearby slides based on `preload` option.
   *
   * @param {number} [diff] Difference between slide indexes that was changed recently, or 0.
   */
  updateLazy(diff) {
    const {
      pswp
    } = this;
    if (pswp.dispatch("lazyLoad").defaultPrevented) {
      return;
    }
    const {
      preload
    } = pswp.options;
    const isForward = diff === void 0 ? true : diff >= 0;
    let i2;
    for (i2 = 0; i2 <= preload[1]; i2++) {
      this.loadSlideByIndex(pswp.currIndex + (isForward ? i2 : -i2));
    }
    for (i2 = 1; i2 <= preload[0]; i2++) {
      this.loadSlideByIndex(pswp.currIndex + (isForward ? -i2 : i2));
    }
  }
  /**
   * @param {number} initialIndex
   */
  loadSlideByIndex(initialIndex) {
    const index = this.pswp.getLoopedIndex(initialIndex);
    let content = this.getContentByIndex(index);
    if (!content) {
      content = lazyLoadSlide(index, this.pswp);
      if (content) {
        this.addToCache(content);
      }
    }
  }
  /**
   * @param {Slide} slide
   * @returns {Content}
   */
  getContentBySlide(slide) {
    let content = this.getContentByIndex(slide.index);
    if (!content) {
      content = this.pswp.createContentFromData(slide.data, slide.index);
      this.addToCache(content);
    }
    content.setSlide(slide);
    return content;
  }
  /**
   * @param {Content} content
   */
  addToCache(content) {
    this.removeByIndex(content.index);
    this._cachedItems.push(content);
    if (this._cachedItems.length > this.limit) {
      const indexToRemove = this._cachedItems.findIndex((item) => {
        return !item.isAttached && !item.hasSlide;
      });
      if (indexToRemove !== -1) {
        const removedItem = this._cachedItems.splice(indexToRemove, 1)[0];
        removedItem.destroy();
      }
    }
  }
  /**
   * Removes an image from cache, does not destroy() it, just removes.
   *
   * @param {number} index
   */
  removeByIndex(index) {
    const indexToRemove = this._cachedItems.findIndex((item) => item.index === index);
    if (indexToRemove !== -1) {
      this._cachedItems.splice(indexToRemove, 1);
    }
  }
  /**
   * @param {number} index
   * @returns {Content | undefined}
   */
  getContentByIndex(index) {
    return this._cachedItems.find((content) => content.index === index);
  }
  destroy() {
    this._cachedItems.forEach((content) => content.destroy());
    this._cachedItems = [];
  }
};
var PhotoSwipeBase = class extends Eventable {
  /**
   * Get total number of slides
   *
   * @returns {number}
   */
  getNumItems() {
    var _this$options;
    let numItems = 0;
    const dataSource = (_this$options = this.options) === null || _this$options === void 0 ? void 0 : _this$options.dataSource;
    if (dataSource && "length" in dataSource) {
      numItems = dataSource.length;
    } else if (dataSource && "gallery" in dataSource) {
      if (!dataSource.items) {
        dataSource.items = this._getGalleryDOMElements(dataSource.gallery);
      }
      if (dataSource.items) {
        numItems = dataSource.items.length;
      }
    }
    const event = this.dispatch("numItems", {
      dataSource,
      numItems
    });
    return this.applyFilters("numItems", event.numItems, dataSource);
  }
  /**
   * @param {SlideData} slideData
   * @param {number} index
   * @returns {Content}
   */
  createContentFromData(slideData, index) {
    return new Content(slideData, this, index);
  }
  /**
   * Get item data by index.
   *
   * "item data" should contain normalized information that PhotoSwipe needs to generate a slide.
   * For example, it may contain properties like
   * `src`, `srcset`, `w`, `h`, which will be used to generate a slide with image.
   *
   * @param {number} index
   * @returns {SlideData}
   */
  getItemData(index) {
    var _this$options2;
    const dataSource = (_this$options2 = this.options) === null || _this$options2 === void 0 ? void 0 : _this$options2.dataSource;
    let dataSourceItem = {};
    if (Array.isArray(dataSource)) {
      dataSourceItem = dataSource[index];
    } else if (dataSource && "gallery" in dataSource) {
      if (!dataSource.items) {
        dataSource.items = this._getGalleryDOMElements(dataSource.gallery);
      }
      dataSourceItem = dataSource.items[index];
    }
    let itemData = dataSourceItem;
    if (itemData instanceof Element) {
      itemData = this._domElementToItemData(itemData);
    }
    const event = this.dispatch("itemData", {
      itemData: itemData || {},
      index
    });
    return this.applyFilters("itemData", event.itemData, index);
  }
  /**
   * Get array of gallery DOM elements,
   * based on childSelector and gallery element.
   *
   * @param {HTMLElement} galleryElement
   * @returns {HTMLElement[]}
   */
  _getGalleryDOMElements(galleryElement) {
    var _this$options3, _this$options4;
    if ((_this$options3 = this.options) !== null && _this$options3 !== void 0 && _this$options3.children || (_this$options4 = this.options) !== null && _this$options4 !== void 0 && _this$options4.childSelector) {
      return getElementsFromOption(this.options.children, this.options.childSelector, galleryElement) || [];
    }
    return [galleryElement];
  }
  /**
   * Converts DOM element to item data object.
   *
   * @param {HTMLElement} element DOM element
   * @returns {SlideData}
   */
  _domElementToItemData(element) {
    const itemData = {
      element
    };
    const linkEl = (
      /** @type {HTMLAnchorElement} */
      element.tagName === "A" ? element : element.querySelector("a")
    );
    if (linkEl) {
      itemData.src = linkEl.dataset.pswpSrc || linkEl.href;
      if (linkEl.dataset.pswpSrcset) {
        itemData.srcset = linkEl.dataset.pswpSrcset;
      }
      itemData.width = linkEl.dataset.pswpWidth ? parseInt(linkEl.dataset.pswpWidth, 10) : 0;
      itemData.height = linkEl.dataset.pswpHeight ? parseInt(linkEl.dataset.pswpHeight, 10) : 0;
      itemData.w = itemData.width;
      itemData.h = itemData.height;
      if (linkEl.dataset.pswpType) {
        itemData.type = linkEl.dataset.pswpType;
      }
      const thumbnailEl = element.querySelector("img");
      if (thumbnailEl) {
        var _thumbnailEl$getAttri;
        itemData.msrc = thumbnailEl.currentSrc || thumbnailEl.src;
        itemData.alt = (_thumbnailEl$getAttri = thumbnailEl.getAttribute("alt")) !== null && _thumbnailEl$getAttri !== void 0 ? _thumbnailEl$getAttri : "";
      }
      if (linkEl.dataset.pswpCropped || linkEl.dataset.cropped) {
        itemData.thumbCropped = true;
      }
    }
    return this.applyFilters("domItemData", itemData, element, linkEl);
  }
  /**
   * Lazy-load by slide data
   *
   * @param {SlideData} itemData Data about the slide
   * @param {number} index
   * @returns {Content} Image that is being decoded or false.
   */
  lazyLoadData(itemData, index) {
    return lazyLoadData(itemData, this, index);
  }
};
var MIN_OPACITY = 3e-3;
var Opener = class {
  /**
   * @param {PhotoSwipe} pswp
   */
  constructor(pswp) {
    this.pswp = pswp;
    this.isClosed = true;
    this.isOpen = false;
    this.isClosing = false;
    this.isOpening = false;
    this._duration = void 0;
    this._useAnimation = false;
    this._croppedZoom = false;
    this._animateRootOpacity = false;
    this._animateBgOpacity = false;
    this._placeholder = void 0;
    this._opacityElement = void 0;
    this._cropContainer1 = void 0;
    this._cropContainer2 = void 0;
    this._thumbBounds = void 0;
    this._prepareOpen = this._prepareOpen.bind(this);
    pswp.on("firstZoomPan", this._prepareOpen);
  }
  open() {
    this._prepareOpen();
    this._start();
  }
  close() {
    if (this.isClosed || this.isClosing || this.isOpening) {
      return;
    }
    const slide = this.pswp.currSlide;
    this.isOpen = false;
    this.isOpening = false;
    this.isClosing = true;
    this._duration = this.pswp.options.hideAnimationDuration;
    if (slide && slide.currZoomLevel * slide.width >= this.pswp.options.maxWidthToAnimate) {
      this._duration = 0;
    }
    this._applyStartProps();
    setTimeout(() => {
      this._start();
    }, this._croppedZoom ? 30 : 0);
  }
  /** @private */
  _prepareOpen() {
    this.pswp.off("firstZoomPan", this._prepareOpen);
    if (!this.isOpening) {
      const slide = this.pswp.currSlide;
      this.isOpening = true;
      this.isClosing = false;
      this._duration = this.pswp.options.showAnimationDuration;
      if (slide && slide.zoomLevels.initial * slide.width >= this.pswp.options.maxWidthToAnimate) {
        this._duration = 0;
      }
      this._applyStartProps();
    }
  }
  /** @private */
  _applyStartProps() {
    const {
      pswp
    } = this;
    const slide = this.pswp.currSlide;
    const {
      options
    } = pswp;
    if (options.showHideAnimationType === "fade") {
      options.showHideOpacity = true;
      this._thumbBounds = void 0;
    } else if (options.showHideAnimationType === "none") {
      options.showHideOpacity = false;
      this._duration = 0;
      this._thumbBounds = void 0;
    } else if (this.isOpening && pswp._initialThumbBounds) {
      this._thumbBounds = pswp._initialThumbBounds;
    } else {
      this._thumbBounds = this.pswp.getThumbBounds();
    }
    this._placeholder = slide === null || slide === void 0 ? void 0 : slide.getPlaceholderElement();
    pswp.animations.stopAll();
    this._useAnimation = Boolean(this._duration && this._duration > 50);
    this._animateZoom = Boolean(this._thumbBounds) && (slide === null || slide === void 0 ? void 0 : slide.content.usePlaceholder()) && (!this.isClosing || !pswp.mainScroll.isShifted());
    if (!this._animateZoom) {
      this._animateRootOpacity = true;
      if (this.isOpening && slide) {
        slide.zoomAndPanToInitial();
        slide.applyCurrentZoomPan();
      }
    } else {
      var _options$showHideOpac;
      this._animateRootOpacity = (_options$showHideOpac = options.showHideOpacity) !== null && _options$showHideOpac !== void 0 ? _options$showHideOpac : false;
    }
    this._animateBgOpacity = !this._animateRootOpacity && this.pswp.options.bgOpacity > MIN_OPACITY;
    this._opacityElement = this._animateRootOpacity ? pswp.element : pswp.bg;
    if (!this._useAnimation) {
      this._duration = 0;
      this._animateZoom = false;
      this._animateBgOpacity = false;
      this._animateRootOpacity = true;
      if (this.isOpening) {
        if (pswp.element) {
          pswp.element.style.opacity = String(MIN_OPACITY);
        }
        pswp.applyBgOpacity(1);
      }
      return;
    }
    if (this._animateZoom && this._thumbBounds && this._thumbBounds.innerRect) {
      var _this$pswp$currSlide;
      this._croppedZoom = true;
      this._cropContainer1 = this.pswp.container;
      this._cropContainer2 = (_this$pswp$currSlide = this.pswp.currSlide) === null || _this$pswp$currSlide === void 0 ? void 0 : _this$pswp$currSlide.holderElement;
      if (pswp.container) {
        pswp.container.style.overflow = "hidden";
        pswp.container.style.width = pswp.viewportSize.x + "px";
      }
    } else {
      this._croppedZoom = false;
    }
    if (this.isOpening) {
      if (this._animateRootOpacity) {
        if (pswp.element) {
          pswp.element.style.opacity = String(MIN_OPACITY);
        }
        pswp.applyBgOpacity(1);
      } else {
        if (this._animateBgOpacity && pswp.bg) {
          pswp.bg.style.opacity = String(MIN_OPACITY);
        }
        if (pswp.element) {
          pswp.element.style.opacity = "1";
        }
      }
      if (this._animateZoom) {
        this._setClosedStateZoomPan();
        if (this._placeholder) {
          this._placeholder.style.willChange = "transform";
          this._placeholder.style.opacity = String(MIN_OPACITY);
        }
      }
    } else if (this.isClosing) {
      if (pswp.mainScroll.itemHolders[0]) {
        pswp.mainScroll.itemHolders[0].el.style.display = "none";
      }
      if (pswp.mainScroll.itemHolders[2]) {
        pswp.mainScroll.itemHolders[2].el.style.display = "none";
      }
      if (this._croppedZoom) {
        if (pswp.mainScroll.x !== 0) {
          pswp.mainScroll.resetPosition();
          pswp.mainScroll.resize();
        }
      }
    }
  }
  /** @private */
  _start() {
    if (this.isOpening && this._useAnimation && this._placeholder && this._placeholder.tagName === "IMG") {
      new Promise((resolve) => {
        let decoded = false;
        let isDelaying = true;
        decodeImage(
          /** @type {HTMLImageElement} */
          this._placeholder
        ).finally(() => {
          decoded = true;
          if (!isDelaying) {
            resolve(true);
          }
        });
        setTimeout(() => {
          isDelaying = false;
          if (decoded) {
            resolve(true);
          }
        }, 50);
        setTimeout(resolve, 250);
      }).finally(() => this._initiate());
    } else {
      this._initiate();
    }
  }
  /** @private */
  _initiate() {
    var _this$pswp$element, _this$pswp$element2;
    (_this$pswp$element = this.pswp.element) === null || _this$pswp$element === void 0 || _this$pswp$element.style.setProperty("--pswp-transition-duration", this._duration + "ms");
    this.pswp.dispatch(this.isOpening ? "openingAnimationStart" : "closingAnimationStart");
    this.pswp.dispatch(
      /** @type {'initialZoomIn' | 'initialZoomOut'} */
      "initialZoom" + (this.isOpening ? "In" : "Out")
    );
    (_this$pswp$element2 = this.pswp.element) === null || _this$pswp$element2 === void 0 || _this$pswp$element2.classList.toggle("pswp--ui-visible", this.isOpening);
    if (this.isOpening) {
      if (this._placeholder) {
        this._placeholder.style.opacity = "1";
      }
      this._animateToOpenState();
    } else if (this.isClosing) {
      this._animateToClosedState();
    }
    if (!this._useAnimation) {
      this._onAnimationComplete();
    }
  }
  /** @private */
  _onAnimationComplete() {
    const {
      pswp
    } = this;
    this.isOpen = this.isOpening;
    this.isClosed = this.isClosing;
    this.isOpening = false;
    this.isClosing = false;
    pswp.dispatch(this.isOpen ? "openingAnimationEnd" : "closingAnimationEnd");
    pswp.dispatch(
      /** @type {'initialZoomInEnd' | 'initialZoomOutEnd'} */
      "initialZoom" + (this.isOpen ? "InEnd" : "OutEnd")
    );
    if (this.isClosed) {
      pswp.destroy();
    } else if (this.isOpen) {
      var _pswp$currSlide;
      if (this._animateZoom && pswp.container) {
        pswp.container.style.overflow = "visible";
        pswp.container.style.width = "100%";
      }
      (_pswp$currSlide = pswp.currSlide) === null || _pswp$currSlide === void 0 || _pswp$currSlide.applyCurrentZoomPan();
    }
  }
  /** @private */
  _animateToOpenState() {
    const {
      pswp
    } = this;
    if (this._animateZoom) {
      if (this._croppedZoom && this._cropContainer1 && this._cropContainer2) {
        this._animateTo(this._cropContainer1, "transform", "translate3d(0,0,0)");
        this._animateTo(this._cropContainer2, "transform", "none");
      }
      if (pswp.currSlide) {
        pswp.currSlide.zoomAndPanToInitial();
        this._animateTo(pswp.currSlide.container, "transform", pswp.currSlide.getCurrentTransform());
      }
    }
    if (this._animateBgOpacity && pswp.bg) {
      this._animateTo(pswp.bg, "opacity", String(pswp.options.bgOpacity));
    }
    if (this._animateRootOpacity && pswp.element) {
      this._animateTo(pswp.element, "opacity", "1");
    }
  }
  /** @private */
  _animateToClosedState() {
    const {
      pswp
    } = this;
    if (this._animateZoom) {
      this._setClosedStateZoomPan(true);
    }
    if (this._animateBgOpacity && pswp.bgOpacity > 0.01 && pswp.bg) {
      this._animateTo(pswp.bg, "opacity", "0");
    }
    if (this._animateRootOpacity && pswp.element) {
      this._animateTo(pswp.element, "opacity", "0");
    }
  }
  /**
   * @private
   * @param {boolean} [animate]
   */
  _setClosedStateZoomPan(animate) {
    if (!this._thumbBounds) return;
    const {
      pswp
    } = this;
    const {
      innerRect
    } = this._thumbBounds;
    const {
      currSlide,
      viewportSize
    } = pswp;
    if (this._croppedZoom && innerRect && this._cropContainer1 && this._cropContainer2) {
      const containerOnePanX = -viewportSize.x + (this._thumbBounds.x - innerRect.x) + innerRect.w;
      const containerOnePanY = -viewportSize.y + (this._thumbBounds.y - innerRect.y) + innerRect.h;
      const containerTwoPanX = viewportSize.x - innerRect.w;
      const containerTwoPanY = viewportSize.y - innerRect.h;
      if (animate) {
        this._animateTo(this._cropContainer1, "transform", toTransformString(containerOnePanX, containerOnePanY));
        this._animateTo(this._cropContainer2, "transform", toTransformString(containerTwoPanX, containerTwoPanY));
      } else {
        setTransform(this._cropContainer1, containerOnePanX, containerOnePanY);
        setTransform(this._cropContainer2, containerTwoPanX, containerTwoPanY);
      }
    }
    if (currSlide) {
      equalizePoints(currSlide.pan, innerRect || this._thumbBounds);
      currSlide.currZoomLevel = this._thumbBounds.w / currSlide.width;
      if (animate) {
        this._animateTo(currSlide.container, "transform", currSlide.getCurrentTransform());
      } else {
        currSlide.applyCurrentZoomPan();
      }
    }
  }
  /**
   * @private
   * @param {HTMLElement} target
   * @param {'transform' | 'opacity'} prop
   * @param {string} propValue
   */
  _animateTo(target, prop, propValue) {
    if (!this._duration) {
      target.style[prop] = propValue;
      return;
    }
    const {
      animations
    } = this.pswp;
    const animProps = {
      duration: this._duration,
      easing: this.pswp.options.easing,
      onComplete: () => {
        if (!animations.activeAnimations.length) {
          this._onAnimationComplete();
        }
      },
      target
    };
    animProps[prop] = propValue;
    animations.startTransition(animProps);
  }
};
var defaultOptions = {
  allowPanToNext: true,
  spacing: 0.1,
  loop: true,
  pinchToClose: true,
  closeOnVerticalDrag: true,
  hideAnimationDuration: 333,
  showAnimationDuration: 333,
  zoomAnimationDuration: 333,
  escKey: true,
  arrowKeys: true,
  trapFocus: true,
  returnFocus: true,
  maxWidthToAnimate: 4e3,
  clickToCloseNonZoomable: true,
  imageClickAction: "zoom-or-close",
  bgClickAction: "close",
  tapAction: "toggle-controls",
  doubleTapAction: "zoom",
  indexIndicatorSep: " / ",
  preloaderDelay: 2e3,
  bgOpacity: 0.8,
  index: 0,
  errorMsg: "The image cannot be loaded",
  preload: [1, 2],
  easing: "cubic-bezier(.4,0,.22,1)"
};
var PhotoSwipe = class extends PhotoSwipeBase {
  /**
   * @param {PhotoSwipeOptions} [options]
   */
  constructor(options) {
    super();
    this.options = this._prepareOptions(options || {});
    this.offset = {
      x: 0,
      y: 0
    };
    this._prevViewportSize = {
      x: 0,
      y: 0
    };
    this.viewportSize = {
      x: 0,
      y: 0
    };
    this.bgOpacity = 1;
    this.currIndex = 0;
    this.potentialIndex = 0;
    this.isOpen = false;
    this.isDestroying = false;
    this.hasMouse = false;
    this._initialItemData = {};
    this._initialThumbBounds = void 0;
    this.topBar = void 0;
    this.element = void 0;
    this.template = void 0;
    this.container = void 0;
    this.scrollWrap = void 0;
    this.currSlide = void 0;
    this.events = new DOMEvents();
    this.animations = new Animations();
    this.mainScroll = new MainScroll(this);
    this.gestures = new Gestures(this);
    this.opener = new Opener(this);
    this.keyboard = new Keyboard(this);
    this.contentLoader = new ContentLoader(this);
  }
  /** @returns {boolean} */
  init() {
    if (this.isOpen || this.isDestroying) {
      return false;
    }
    this.isOpen = true;
    this.dispatch("init");
    this.dispatch("beforeOpen");
    this._createMainStructure();
    let rootClasses = "pswp--open";
    if (this.gestures.supportsTouch) {
      rootClasses += " pswp--touch";
    }
    if (this.options.mainClass) {
      rootClasses += " " + this.options.mainClass;
    }
    if (this.element) {
      this.element.className += " " + rootClasses;
    }
    this.currIndex = this.options.index || 0;
    this.potentialIndex = this.currIndex;
    this.dispatch("firstUpdate");
    this.scrollWheel = new ScrollWheel(this);
    if (Number.isNaN(this.currIndex) || this.currIndex < 0 || this.currIndex >= this.getNumItems()) {
      this.currIndex = 0;
    }
    if (!this.gestures.supportsTouch) {
      this.mouseDetected();
    }
    this.updateSize();
    this.offset.y = window.pageYOffset;
    this._initialItemData = this.getItemData(this.currIndex);
    this.dispatch("gettingData", {
      index: this.currIndex,
      data: this._initialItemData,
      slide: void 0
    });
    this._initialThumbBounds = this.getThumbBounds();
    this.dispatch("initialLayout");
    this.on("openingAnimationEnd", () => {
      const {
        itemHolders
      } = this.mainScroll;
      if (itemHolders[0]) {
        itemHolders[0].el.style.display = "block";
        this.setContent(itemHolders[0], this.currIndex - 1);
      }
      if (itemHolders[2]) {
        itemHolders[2].el.style.display = "block";
        this.setContent(itemHolders[2], this.currIndex + 1);
      }
      this.appendHeavy();
      this.contentLoader.updateLazy();
      this.events.add(window, "resize", this._handlePageResize.bind(this));
      this.events.add(window, "scroll", this._updatePageScrollOffset.bind(this));
      this.dispatch("bindEvents");
    });
    if (this.mainScroll.itemHolders[1]) {
      this.setContent(this.mainScroll.itemHolders[1], this.currIndex);
    }
    this.dispatch("change");
    this.opener.open();
    this.dispatch("afterInit");
    return true;
  }
  /**
   * Get looped slide index
   * (for example, -1 will return the last slide)
   *
   * @param {number} index
   * @returns {number}
   */
  getLoopedIndex(index) {
    const numSlides = this.getNumItems();
    if (this.options.loop) {
      if (index > numSlides - 1) {
        index -= numSlides;
      }
      if (index < 0) {
        index += numSlides;
      }
    }
    return clamp(index, 0, numSlides - 1);
  }
  appendHeavy() {
    this.mainScroll.itemHolders.forEach((itemHolder) => {
      var _itemHolder$slide;
      (_itemHolder$slide = itemHolder.slide) === null || _itemHolder$slide === void 0 || _itemHolder$slide.appendHeavy();
    });
  }
  /**
   * Change the slide
   * @param {number} index New index
   */
  goTo(index) {
    this.mainScroll.moveIndexBy(this.getLoopedIndex(index) - this.potentialIndex);
  }
  /**
   * Go to the next slide.
   */
  next() {
    this.goTo(this.potentialIndex + 1);
  }
  /**
   * Go to the previous slide.
   */
  prev() {
    this.goTo(this.potentialIndex - 1);
  }
  /**
   * @see slide/slide.js zoomTo
   *
   * @param {Parameters<Slide['zoomTo']>} args
   */
  zoomTo(...args) {
    var _this$currSlide;
    (_this$currSlide = this.currSlide) === null || _this$currSlide === void 0 || _this$currSlide.zoomTo(...args);
  }
  /**
   * @see slide/slide.js toggleZoom
   */
  toggleZoom() {
    var _this$currSlide2;
    (_this$currSlide2 = this.currSlide) === null || _this$currSlide2 === void 0 || _this$currSlide2.toggleZoom();
  }
  /**
   * Close the gallery.
   * After closing transition ends - destroy it
   */
  close() {
    if (!this.opener.isOpen || this.isDestroying) {
      return;
    }
    this.isDestroying = true;
    this.dispatch("close");
    this.events.removeAll();
    this.opener.close();
  }
  /**
   * Destroys the gallery:
   * - instantly closes the gallery
   * - unbinds events,
   * - cleans intervals and timeouts
   * - removes elements from DOM
   */
  destroy() {
    var _this$element;
    if (!this.isDestroying) {
      this.options.showHideAnimationType = "none";
      this.close();
      return;
    }
    this.dispatch("destroy");
    this._listeners = {};
    if (this.scrollWrap) {
      this.scrollWrap.ontouchmove = null;
      this.scrollWrap.ontouchend = null;
    }
    (_this$element = this.element) === null || _this$element === void 0 || _this$element.remove();
    this.mainScroll.itemHolders.forEach((itemHolder) => {
      var _itemHolder$slide2;
      (_itemHolder$slide2 = itemHolder.slide) === null || _itemHolder$slide2 === void 0 || _itemHolder$slide2.destroy();
    });
    this.contentLoader.destroy();
    this.events.removeAll();
  }
  /**
   * Refresh/reload content of a slide by its index
   *
   * @param {number} slideIndex
   */
  refreshSlideContent(slideIndex) {
    this.contentLoader.removeByIndex(slideIndex);
    this.mainScroll.itemHolders.forEach((itemHolder, i2) => {
      var _this$currSlide$index, _this$currSlide3;
      let potentialHolderIndex = ((_this$currSlide$index = (_this$currSlide3 = this.currSlide) === null || _this$currSlide3 === void 0 ? void 0 : _this$currSlide3.index) !== null && _this$currSlide$index !== void 0 ? _this$currSlide$index : 0) - 1 + i2;
      if (this.canLoop()) {
        potentialHolderIndex = this.getLoopedIndex(potentialHolderIndex);
      }
      if (potentialHolderIndex === slideIndex) {
        this.setContent(itemHolder, slideIndex, true);
        if (i2 === 1) {
          var _itemHolder$slide3;
          this.currSlide = itemHolder.slide;
          (_itemHolder$slide3 = itemHolder.slide) === null || _itemHolder$slide3 === void 0 || _itemHolder$slide3.setIsActive(true);
        }
      }
    });
    this.dispatch("change");
  }
  /**
   * Set slide content
   *
   * @param {ItemHolder} holder mainScroll.itemHolders array item
   * @param {number} index Slide index
   * @param {boolean} [force] If content should be set even if index wasn't changed
   */
  setContent(holder, index, force) {
    if (this.canLoop()) {
      index = this.getLoopedIndex(index);
    }
    if (holder.slide) {
      if (holder.slide.index === index && !force) {
        return;
      }
      holder.slide.destroy();
      holder.slide = void 0;
    }
    if (!this.canLoop() && (index < 0 || index >= this.getNumItems())) {
      return;
    }
    const itemData = this.getItemData(index);
    holder.slide = new Slide(itemData, index, this);
    if (index === this.currIndex) {
      this.currSlide = holder.slide;
    }
    holder.slide.append(holder.el);
  }
  /** @returns {Point} */
  getViewportCenterPoint() {
    return {
      x: this.viewportSize.x / 2,
      y: this.viewportSize.y / 2
    };
  }
  /**
   * Update size of all elements.
   * Executed on init and on page resize.
   *
   * @param {boolean} [force] Update size even if size of viewport was not changed.
   */
  updateSize(force) {
    if (this.isDestroying) {
      return;
    }
    const newViewportSize = getViewportSize(this.options, this);
    if (!force && pointsEqual(newViewportSize, this._prevViewportSize)) {
      return;
    }
    equalizePoints(this._prevViewportSize, newViewportSize);
    this.dispatch("beforeResize");
    equalizePoints(this.viewportSize, this._prevViewportSize);
    this._updatePageScrollOffset();
    this.dispatch("viewportSize");
    this.mainScroll.resize(this.opener.isOpen);
    if (!this.hasMouse && window.matchMedia("(any-hover: hover)").matches) {
      this.mouseDetected();
    }
    this.dispatch("resize");
  }
  /**
   * @param {number} opacity
   */
  applyBgOpacity(opacity) {
    this.bgOpacity = Math.max(opacity, 0);
    if (this.bg) {
      this.bg.style.opacity = String(this.bgOpacity * this.options.bgOpacity);
    }
  }
  /**
   * Whether mouse is detected
   */
  mouseDetected() {
    if (!this.hasMouse) {
      var _this$element2;
      this.hasMouse = true;
      (_this$element2 = this.element) === null || _this$element2 === void 0 || _this$element2.classList.add("pswp--has_mouse");
    }
  }
  /**
   * Page resize event handler
   *
   * @private
   */
  _handlePageResize() {
    this.updateSize();
    if (/iPhone|iPad|iPod/i.test(window.navigator.userAgent)) {
      setTimeout(() => {
        this.updateSize();
      }, 500);
    }
  }
  /**
   * Page scroll offset is used
   * to get correct coordinates
   * relative to PhotoSwipe viewport.
   *
   * @private
   */
  _updatePageScrollOffset() {
    this.setScrollOffset(0, window.pageYOffset);
  }
  /**
   * @param {number} x
   * @param {number} y
   */
  setScrollOffset(x2, y2) {
    this.offset.x = x2;
    this.offset.y = y2;
    this.dispatch("updateScrollOffset");
  }
  /**
   * Create main HTML structure of PhotoSwipe,
   * and add it to DOM
   *
   * @private
   */
  _createMainStructure() {
    this.element = createElement("pswp", "div");
    this.element.setAttribute("tabindex", "-1");
    this.element.setAttribute("role", "dialog");
    this.template = this.element;
    this.bg = createElement("pswp__bg", "div", this.element);
    this.scrollWrap = createElement("pswp__scroll-wrap", "section", this.element);
    this.container = createElement("pswp__container", "div", this.scrollWrap);
    this.scrollWrap.setAttribute("aria-roledescription", "carousel");
    this.container.setAttribute("aria-live", "off");
    this.container.setAttribute("id", "pswp__items");
    this.mainScroll.appendHolders();
    this.ui = new UI(this);
    this.ui.init();
    (this.options.appendToEl || document.body).appendChild(this.element);
  }
  /**
   * Get position and dimensions of small thumbnail
   *   {x:,y:,w:}
   *
   * Height is optional (calculated based on the large image)
   *
   * @returns {Bounds | undefined}
   */
  getThumbBounds() {
    return getThumbBounds(this.currIndex, this.currSlide ? this.currSlide.data : this._initialItemData, this);
  }
  /**
   * If the PhotoSwipe can have continuous loop
   * @returns Boolean
   */
  canLoop() {
    return this.options.loop && this.getNumItems() > 2;
  }
  /**
   * @private
   * @param {PhotoSwipeOptions} options
   * @returns {PreparedPhotoSwipeOptions}
   */
  _prepareOptions(options) {
    if (window.matchMedia("(prefers-reduced-motion), (update: slow)").matches) {
      options.showHideAnimationType = "none";
      options.zoomAnimationDuration = 0;
    }
    return {
      ...defaultOptions,
      ...options
    };
  }
};

// node_modules/.pnpm/photoswipe@5.4.4/node_modules/photoswipe/dist/photoswipe-lightbox.esm.js
function createElement2(className, tagName, appendToEl) {
  const el = document.createElement(tagName);
  if (className) {
    el.className = className;
  }
  if (appendToEl) {
    appendToEl.appendChild(el);
  }
  return el;
}
function toTransformString2(x2, y2, scale) {
  let propValue = `translate3d(${x2}px,${y2 || 0}px,0)`;
  if (scale !== void 0) {
    propValue += ` scale3d(${scale},${scale},1)`;
  }
  return propValue;
}
function setWidthHeight2(el, w2, h) {
  el.style.width = typeof w2 === "number" ? `${w2}px` : w2;
  el.style.height = typeof h === "number" ? `${h}px` : h;
}
var LOAD_STATE2 = {
  IDLE: "idle",
  LOADING: "loading",
  LOADED: "loaded",
  ERROR: "error"
};
function specialKeyUsed2(e) {
  return "button" in e && e.button === 1 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;
}
function getElementsFromOption2(option, legacySelector, parent = document) {
  let elements = [];
  if (option instanceof Element) {
    elements = [option];
  } else if (option instanceof NodeList || Array.isArray(option)) {
    elements = Array.from(option);
  } else {
    const selector = typeof option === "string" ? option : legacySelector;
    if (selector) {
      elements = Array.from(parent.querySelectorAll(selector));
    }
  }
  return elements;
}
function isPswpClass(fn) {
  return typeof fn === "function" && fn.prototype && fn.prototype.goTo;
}
function isSafari2() {
  return !!(navigator.vendor && navigator.vendor.match(/apple/i));
}
var PhotoSwipeEvent2 = class {
  /**
   * @param {T} type
   * @param {PhotoSwipeEventsMap[T]} [details]
   */
  constructor(type, details) {
    this.type = type;
    this.defaultPrevented = false;
    if (details) {
      Object.assign(this, details);
    }
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
};
var Eventable2 = class {
  constructor() {
    this._listeners = {};
    this._filters = {};
    this.pswp = void 0;
    this.options = void 0;
  }
  /**
   * @template {keyof PhotoSwipeFiltersMap} T
   * @param {T} name
   * @param {PhotoSwipeFiltersMap[T]} fn
   * @param {number} priority
   */
  addFilter(name, fn, priority = 100) {
    var _this$_filters$name, _this$_filters$name2, _this$pswp;
    if (!this._filters[name]) {
      this._filters[name] = [];
    }
    (_this$_filters$name = this._filters[name]) === null || _this$_filters$name === void 0 || _this$_filters$name.push({
      fn,
      priority
    });
    (_this$_filters$name2 = this._filters[name]) === null || _this$_filters$name2 === void 0 || _this$_filters$name2.sort((f1, f2) => f1.priority - f2.priority);
    (_this$pswp = this.pswp) === null || _this$pswp === void 0 || _this$pswp.addFilter(name, fn, priority);
  }
  /**
   * @template {keyof PhotoSwipeFiltersMap} T
   * @param {T} name
   * @param {PhotoSwipeFiltersMap[T]} fn
   */
  removeFilter(name, fn) {
    if (this._filters[name]) {
      this._filters[name] = this._filters[name].filter((filter) => filter.fn !== fn);
    }
    if (this.pswp) {
      this.pswp.removeFilter(name, fn);
    }
  }
  /**
   * @template {keyof PhotoSwipeFiltersMap} T
   * @param {T} name
   * @param {Parameters<PhotoSwipeFiltersMap[T]>} args
   * @returns {Parameters<PhotoSwipeFiltersMap[T]>[0]}
   */
  applyFilters(name, ...args) {
    var _this$_filters$name3;
    (_this$_filters$name3 = this._filters[name]) === null || _this$_filters$name3 === void 0 || _this$_filters$name3.forEach((filter) => {
      args[0] = filter.fn.apply(this, args);
    });
    return args[0];
  }
  /**
   * @template {keyof PhotoSwipeEventsMap} T
   * @param {T} name
   * @param {EventCallback<T>} fn
   */
  on(name, fn) {
    var _this$_listeners$name, _this$pswp2;
    if (!this._listeners[name]) {
      this._listeners[name] = [];
    }
    (_this$_listeners$name = this._listeners[name]) === null || _this$_listeners$name === void 0 || _this$_listeners$name.push(fn);
    (_this$pswp2 = this.pswp) === null || _this$pswp2 === void 0 || _this$pswp2.on(name, fn);
  }
  /**
   * @template {keyof PhotoSwipeEventsMap} T
   * @param {T} name
   * @param {EventCallback<T>} fn
   */
  off(name, fn) {
    var _this$pswp3;
    if (this._listeners[name]) {
      this._listeners[name] = this._listeners[name].filter((listener) => fn !== listener);
    }
    (_this$pswp3 = this.pswp) === null || _this$pswp3 === void 0 || _this$pswp3.off(name, fn);
  }
  /**
   * @template {keyof PhotoSwipeEventsMap} T
   * @param {T} name
   * @param {PhotoSwipeEventsMap[T]} [details]
   * @returns {AugmentedEvent<T>}
   */
  dispatch(name, details) {
    var _this$_listeners$name2;
    if (this.pswp) {
      return this.pswp.dispatch(name, details);
    }
    const event = (
      /** @type {AugmentedEvent<T>} */
      new PhotoSwipeEvent2(name, details)
    );
    (_this$_listeners$name2 = this._listeners[name]) === null || _this$_listeners$name2 === void 0 || _this$_listeners$name2.forEach((listener) => {
      listener.call(this, event);
    });
    return event;
  }
};
var Placeholder2 = class {
  /**
   * @param {string | false} imageSrc
   * @param {HTMLElement} container
   */
  constructor(imageSrc, container) {
    this.element = createElement2("pswp__img pswp__img--placeholder", imageSrc ? "img" : "div", container);
    if (imageSrc) {
      const imgEl = (
        /** @type {HTMLImageElement} */
        this.element
      );
      imgEl.decoding = "async";
      imgEl.alt = "";
      imgEl.src = imageSrc;
      imgEl.setAttribute("role", "presentation");
    }
    this.element.setAttribute("aria-hidden", "true");
  }
  /**
   * @param {number} width
   * @param {number} height
   */
  setDisplayedSize(width, height) {
    if (!this.element) {
      return;
    }
    if (this.element.tagName === "IMG") {
      setWidthHeight2(this.element, 250, "auto");
      this.element.style.transformOrigin = "0 0";
      this.element.style.transform = toTransformString2(0, 0, width / 250);
    } else {
      setWidthHeight2(this.element, width, height);
    }
  }
  destroy() {
    var _this$element;
    if ((_this$element = this.element) !== null && _this$element !== void 0 && _this$element.parentNode) {
      this.element.remove();
    }
    this.element = null;
  }
};
var Content2 = class {
  /**
   * @param {SlideData} itemData Slide data
   * @param {PhotoSwipeBase} instance PhotoSwipe or PhotoSwipeLightbox instance
   * @param {number} index
   */
  constructor(itemData, instance, index) {
    this.instance = instance;
    this.data = itemData;
    this.index = index;
    this.element = void 0;
    this.placeholder = void 0;
    this.slide = void 0;
    this.displayedImageWidth = 0;
    this.displayedImageHeight = 0;
    this.width = Number(this.data.w) || Number(this.data.width) || 0;
    this.height = Number(this.data.h) || Number(this.data.height) || 0;
    this.isAttached = false;
    this.hasSlide = false;
    this.isDecoding = false;
    this.state = LOAD_STATE2.IDLE;
    if (this.data.type) {
      this.type = this.data.type;
    } else if (this.data.src) {
      this.type = "image";
    } else {
      this.type = "html";
    }
    this.instance.dispatch("contentInit", {
      content: this
    });
  }
  removePlaceholder() {
    if (this.placeholder && !this.keepPlaceholder()) {
      setTimeout(() => {
        if (this.placeholder) {
          this.placeholder.destroy();
          this.placeholder = void 0;
        }
      }, 1e3);
    }
  }
  /**
   * Preload content
   *
   * @param {boolean} isLazy
   * @param {boolean} [reload]
   */
  load(isLazy, reload) {
    if (this.slide && this.usePlaceholder()) {
      if (!this.placeholder) {
        const placeholderSrc = this.instance.applyFilters(
          "placeholderSrc",
          // use  image-based placeholder only for the first slide,
          // as rendering (even small stretched thumbnail) is an expensive operation
          this.data.msrc && this.slide.isFirstSlide ? this.data.msrc : false,
          this
        );
        this.placeholder = new Placeholder2(placeholderSrc, this.slide.container);
      } else {
        const placeholderEl = this.placeholder.element;
        if (placeholderEl && !placeholderEl.parentElement) {
          this.slide.container.prepend(placeholderEl);
        }
      }
    }
    if (this.element && !reload) {
      return;
    }
    if (this.instance.dispatch("contentLoad", {
      content: this,
      isLazy
    }).defaultPrevented) {
      return;
    }
    if (this.isImageContent()) {
      this.element = createElement2("pswp__img", "img");
      if (this.displayedImageWidth) {
        this.loadImage(isLazy);
      }
    } else {
      this.element = createElement2("pswp__content", "div");
      this.element.innerHTML = this.data.html || "";
    }
    if (reload && this.slide) {
      this.slide.updateContentSize(true);
    }
  }
  /**
   * Preload image
   *
   * @param {boolean} isLazy
   */
  loadImage(isLazy) {
    var _this$data$src, _this$data$alt;
    if (!this.isImageContent() || !this.element || this.instance.dispatch("contentLoadImage", {
      content: this,
      isLazy
    }).defaultPrevented) {
      return;
    }
    const imageElement = (
      /** @type HTMLImageElement */
      this.element
    );
    this.updateSrcsetSizes();
    if (this.data.srcset) {
      imageElement.srcset = this.data.srcset;
    }
    imageElement.src = (_this$data$src = this.data.src) !== null && _this$data$src !== void 0 ? _this$data$src : "";
    imageElement.alt = (_this$data$alt = this.data.alt) !== null && _this$data$alt !== void 0 ? _this$data$alt : "";
    this.state = LOAD_STATE2.LOADING;
    if (imageElement.complete) {
      this.onLoaded();
    } else {
      imageElement.onload = () => {
        this.onLoaded();
      };
      imageElement.onerror = () => {
        this.onError();
      };
    }
  }
  /**
   * Assign slide to content
   *
   * @param {Slide} slide
   */
  setSlide(slide) {
    this.slide = slide;
    this.hasSlide = true;
    this.instance = slide.pswp;
  }
  /**
   * Content load success handler
   */
  onLoaded() {
    this.state = LOAD_STATE2.LOADED;
    if (this.slide && this.element) {
      this.instance.dispatch("loadComplete", {
        slide: this.slide,
        content: this
      });
      if (this.slide.isActive && this.slide.heavyAppended && !this.element.parentNode) {
        this.append();
        this.slide.updateContentSize(true);
      }
      if (this.state === LOAD_STATE2.LOADED || this.state === LOAD_STATE2.ERROR) {
        this.removePlaceholder();
      }
    }
  }
  /**
   * Content load error handler
   */
  onError() {
    this.state = LOAD_STATE2.ERROR;
    if (this.slide) {
      this.displayError();
      this.instance.dispatch("loadComplete", {
        slide: this.slide,
        isError: true,
        content: this
      });
      this.instance.dispatch("loadError", {
        slide: this.slide,
        content: this
      });
    }
  }
  /**
   * @returns {Boolean} If the content is currently loading
   */
  isLoading() {
    return this.instance.applyFilters("isContentLoading", this.state === LOAD_STATE2.LOADING, this);
  }
  /**
   * @returns {Boolean} If the content is in error state
   */
  isError() {
    return this.state === LOAD_STATE2.ERROR;
  }
  /**
   * @returns {boolean} If the content is image
   */
  isImageContent() {
    return this.type === "image";
  }
  /**
   * Update content size
   *
   * @param {Number} width
   * @param {Number} height
   */
  setDisplayedSize(width, height) {
    if (!this.element) {
      return;
    }
    if (this.placeholder) {
      this.placeholder.setDisplayedSize(width, height);
    }
    if (this.instance.dispatch("contentResize", {
      content: this,
      width,
      height
    }).defaultPrevented) {
      return;
    }
    setWidthHeight2(this.element, width, height);
    if (this.isImageContent() && !this.isError()) {
      const isInitialSizeUpdate = !this.displayedImageWidth && width;
      this.displayedImageWidth = width;
      this.displayedImageHeight = height;
      if (isInitialSizeUpdate) {
        this.loadImage(false);
      } else {
        this.updateSrcsetSizes();
      }
      if (this.slide) {
        this.instance.dispatch("imageSizeChange", {
          slide: this.slide,
          width,
          height,
          content: this
        });
      }
    }
  }
  /**
   * @returns {boolean} If the content can be zoomed
   */
  isZoomable() {
    return this.instance.applyFilters("isContentZoomable", this.isImageContent() && this.state !== LOAD_STATE2.ERROR, this);
  }
  /**
   * Update image srcset sizes attribute based on width and height
   */
  updateSrcsetSizes() {
    if (!this.isImageContent() || !this.element || !this.data.srcset) {
      return;
    }
    const image = (
      /** @type HTMLImageElement */
      this.element
    );
    const sizesWidth = this.instance.applyFilters("srcsetSizesWidth", this.displayedImageWidth, this);
    if (!image.dataset.largestUsedSize || sizesWidth > parseInt(image.dataset.largestUsedSize, 10)) {
      image.sizes = sizesWidth + "px";
      image.dataset.largestUsedSize = String(sizesWidth);
    }
  }
  /**
   * @returns {boolean} If content should use a placeholder (from msrc by default)
   */
  usePlaceholder() {
    return this.instance.applyFilters("useContentPlaceholder", this.isImageContent(), this);
  }
  /**
   * Preload content with lazy-loading param
   */
  lazyLoad() {
    if (this.instance.dispatch("contentLazyLoad", {
      content: this
    }).defaultPrevented) {
      return;
    }
    this.load(true);
  }
  /**
   * @returns {boolean} If placeholder should be kept after content is loaded
   */
  keepPlaceholder() {
    return this.instance.applyFilters("isKeepingPlaceholder", this.isLoading(), this);
  }
  /**
   * Destroy the content
   */
  destroy() {
    this.hasSlide = false;
    this.slide = void 0;
    if (this.instance.dispatch("contentDestroy", {
      content: this
    }).defaultPrevented) {
      return;
    }
    this.remove();
    if (this.placeholder) {
      this.placeholder.destroy();
      this.placeholder = void 0;
    }
    if (this.isImageContent() && this.element) {
      this.element.onload = null;
      this.element.onerror = null;
      this.element = void 0;
    }
  }
  /**
   * Display error message
   */
  displayError() {
    if (this.slide) {
      var _this$instance$option, _this$instance$option2;
      let errorMsgEl = createElement2("pswp__error-msg", "div");
      errorMsgEl.innerText = (_this$instance$option = (_this$instance$option2 = this.instance.options) === null || _this$instance$option2 === void 0 ? void 0 : _this$instance$option2.errorMsg) !== null && _this$instance$option !== void 0 ? _this$instance$option : "";
      errorMsgEl = /** @type {HTMLDivElement} */
      this.instance.applyFilters("contentErrorElement", errorMsgEl, this);
      this.element = createElement2("pswp__content pswp__error-msg-container", "div");
      this.element.appendChild(errorMsgEl);
      this.slide.container.innerText = "";
      this.slide.container.appendChild(this.element);
      this.slide.updateContentSize(true);
      this.removePlaceholder();
    }
  }
  /**
   * Append the content
   */
  append() {
    if (this.isAttached || !this.element) {
      return;
    }
    this.isAttached = true;
    if (this.state === LOAD_STATE2.ERROR) {
      this.displayError();
      return;
    }
    if (this.instance.dispatch("contentAppend", {
      content: this
    }).defaultPrevented) {
      return;
    }
    const supportsDecode = "decode" in this.element;
    if (this.isImageContent()) {
      if (supportsDecode && this.slide && (!this.slide.isActive || isSafari2())) {
        this.isDecoding = true;
        this.element.decode().catch(() => {
        }).finally(() => {
          this.isDecoding = false;
          this.appendImage();
        });
      } else {
        this.appendImage();
      }
    } else if (this.slide && !this.element.parentNode) {
      this.slide.container.appendChild(this.element);
    }
  }
  /**
   * Activate the slide,
   * active slide is generally the current one,
   * meaning the user can see it.
   */
  activate() {
    if (this.instance.dispatch("contentActivate", {
      content: this
    }).defaultPrevented || !this.slide) {
      return;
    }
    if (this.isImageContent() && this.isDecoding && !isSafari2()) {
      this.appendImage();
    } else if (this.isError()) {
      this.load(false, true);
    }
    if (this.slide.holderElement) {
      this.slide.holderElement.setAttribute("aria-hidden", "false");
    }
  }
  /**
   * Deactivate the content
   */
  deactivate() {
    this.instance.dispatch("contentDeactivate", {
      content: this
    });
    if (this.slide && this.slide.holderElement) {
      this.slide.holderElement.setAttribute("aria-hidden", "true");
    }
  }
  /**
   * Remove the content from DOM
   */
  remove() {
    this.isAttached = false;
    if (this.instance.dispatch("contentRemove", {
      content: this
    }).defaultPrevented) {
      return;
    }
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
    if (this.placeholder && this.placeholder.element) {
      this.placeholder.element.remove();
    }
  }
  /**
   * Append the image content to slide container
   */
  appendImage() {
    if (!this.isAttached) {
      return;
    }
    if (this.instance.dispatch("contentAppendImage", {
      content: this
    }).defaultPrevented) {
      return;
    }
    if (this.slide && this.element && !this.element.parentNode) {
      this.slide.container.appendChild(this.element);
    }
    if (this.state === LOAD_STATE2.LOADED || this.state === LOAD_STATE2.ERROR) {
      this.removePlaceholder();
    }
  }
};
function getViewportSize2(options, pswp) {
  if (options.getViewportSizeFn) {
    const newViewportSize = options.getViewportSizeFn(options, pswp);
    if (newViewportSize) {
      return newViewportSize;
    }
  }
  return {
    x: document.documentElement.clientWidth,
    // TODO: height on mobile is very incosistent due to toolbar
    // find a way to improve this
    //
    // document.documentElement.clientHeight - doesn't seem to work well
    y: window.innerHeight
  };
}
function parsePaddingOption2(prop, options, viewportSize, itemData, index) {
  let paddingValue = 0;
  if (options.paddingFn) {
    paddingValue = options.paddingFn(viewportSize, itemData, index)[prop];
  } else if (options.padding) {
    paddingValue = options.padding[prop];
  } else {
    const legacyPropName = "padding" + prop[0].toUpperCase() + prop.slice(1);
    if (options[legacyPropName]) {
      paddingValue = options[legacyPropName];
    }
  }
  return Number(paddingValue) || 0;
}
function getPanAreaSize2(options, viewportSize, itemData, index) {
  return {
    x: viewportSize.x - parsePaddingOption2("left", options, viewportSize, itemData, index) - parsePaddingOption2("right", options, viewportSize, itemData, index),
    y: viewportSize.y - parsePaddingOption2("top", options, viewportSize, itemData, index) - parsePaddingOption2("bottom", options, viewportSize, itemData, index)
  };
}
var MAX_IMAGE_WIDTH2 = 4e3;
var ZoomLevel2 = class {
  /**
   * @param {PhotoSwipeOptions} options PhotoSwipe options
   * @param {SlideData} itemData Slide data
   * @param {number} index Slide index
   * @param {PhotoSwipe} [pswp] PhotoSwipe instance, can be undefined if not initialized yet
   */
  constructor(options, itemData, index, pswp) {
    this.pswp = pswp;
    this.options = options;
    this.itemData = itemData;
    this.index = index;
    this.panAreaSize = null;
    this.elementSize = null;
    this.fit = 1;
    this.fill = 1;
    this.vFill = 1;
    this.initial = 1;
    this.secondary = 1;
    this.max = 1;
    this.min = 1;
  }
  /**
   * Calculate initial, secondary and maximum zoom level for the specified slide.
   *
   * It should be called when either image or viewport size changes.
   *
   * @param {number} maxWidth
   * @param {number} maxHeight
   * @param {Point} panAreaSize
   */
  update(maxWidth, maxHeight, panAreaSize) {
    const elementSize = {
      x: maxWidth,
      y: maxHeight
    };
    this.elementSize = elementSize;
    this.panAreaSize = panAreaSize;
    const hRatio = panAreaSize.x / elementSize.x;
    const vRatio = panAreaSize.y / elementSize.y;
    this.fit = Math.min(1, hRatio < vRatio ? hRatio : vRatio);
    this.fill = Math.min(1, hRatio > vRatio ? hRatio : vRatio);
    this.vFill = Math.min(1, vRatio);
    this.initial = this._getInitial();
    this.secondary = this._getSecondary();
    this.max = Math.max(this.initial, this.secondary, this._getMax());
    this.min = Math.min(this.fit, this.initial, this.secondary);
    if (this.pswp) {
      this.pswp.dispatch("zoomLevelsUpdate", {
        zoomLevels: this,
        slideData: this.itemData
      });
    }
  }
  /**
   * Parses user-defined zoom option.
   *
   * @private
   * @param {'initial' | 'secondary' | 'max'} optionPrefix Zoom level option prefix (initial, secondary, max)
   * @returns { number | undefined }
   */
  _parseZoomLevelOption(optionPrefix) {
    const optionName = (
      /** @type {'initialZoomLevel' | 'secondaryZoomLevel' | 'maxZoomLevel'} */
      optionPrefix + "ZoomLevel"
    );
    const optionValue = this.options[optionName];
    if (!optionValue) {
      return;
    }
    if (typeof optionValue === "function") {
      return optionValue(this);
    }
    if (optionValue === "fill") {
      return this.fill;
    }
    if (optionValue === "fit") {
      return this.fit;
    }
    return Number(optionValue);
  }
  /**
   * Get zoom level to which image will be zoomed after double-tap gesture,
   * or when user clicks on zoom icon,
   * or mouse-click on image itself.
   * If you return 1 image will be zoomed to its original size.
   *
   * @private
   * @return {number}
   */
  _getSecondary() {
    let currZoomLevel = this._parseZoomLevelOption("secondary");
    if (currZoomLevel) {
      return currZoomLevel;
    }
    currZoomLevel = Math.min(1, this.fit * 3);
    if (this.elementSize && currZoomLevel * this.elementSize.x > MAX_IMAGE_WIDTH2) {
      currZoomLevel = MAX_IMAGE_WIDTH2 / this.elementSize.x;
    }
    return currZoomLevel;
  }
  /**
   * Get initial image zoom level.
   *
   * @private
   * @return {number}
   */
  _getInitial() {
    return this._parseZoomLevelOption("initial") || this.fit;
  }
  /**
   * Maximum zoom level when user zooms
   * via zoom/pinch gesture,
   * via cmd/ctrl-wheel or via trackpad.
   *
   * @private
   * @return {number}
   */
  _getMax() {
    return this._parseZoomLevelOption("max") || Math.max(1, this.fit * 4);
  }
};
function lazyLoadData2(itemData, instance, index) {
  const content = instance.createContentFromData(itemData, index);
  let zoomLevel;
  const {
    options
  } = instance;
  if (options) {
    zoomLevel = new ZoomLevel2(options, itemData, -1);
    let viewportSize;
    if (instance.pswp) {
      viewportSize = instance.pswp.viewportSize;
    } else {
      viewportSize = getViewportSize2(options, instance);
    }
    const panAreaSize = getPanAreaSize2(options, viewportSize, itemData, index);
    zoomLevel.update(content.width, content.height, panAreaSize);
  }
  content.lazyLoad();
  if (zoomLevel) {
    content.setDisplayedSize(Math.ceil(content.width * zoomLevel.initial), Math.ceil(content.height * zoomLevel.initial));
  }
  return content;
}
function lazyLoadSlide2(index, instance) {
  const itemData = instance.getItemData(index);
  if (instance.dispatch("lazyLoadSlide", {
    index,
    itemData
  }).defaultPrevented) {
    return;
  }
  return lazyLoadData2(itemData, instance, index);
}
var PhotoSwipeBase2 = class extends Eventable2 {
  /**
   * Get total number of slides
   *
   * @returns {number}
   */
  getNumItems() {
    var _this$options;
    let numItems = 0;
    const dataSource = (_this$options = this.options) === null || _this$options === void 0 ? void 0 : _this$options.dataSource;
    if (dataSource && "length" in dataSource) {
      numItems = dataSource.length;
    } else if (dataSource && "gallery" in dataSource) {
      if (!dataSource.items) {
        dataSource.items = this._getGalleryDOMElements(dataSource.gallery);
      }
      if (dataSource.items) {
        numItems = dataSource.items.length;
      }
    }
    const event = this.dispatch("numItems", {
      dataSource,
      numItems
    });
    return this.applyFilters("numItems", event.numItems, dataSource);
  }
  /**
   * @param {SlideData} slideData
   * @param {number} index
   * @returns {Content}
   */
  createContentFromData(slideData, index) {
    return new Content2(slideData, this, index);
  }
  /**
   * Get item data by index.
   *
   * "item data" should contain normalized information that PhotoSwipe needs to generate a slide.
   * For example, it may contain properties like
   * `src`, `srcset`, `w`, `h`, which will be used to generate a slide with image.
   *
   * @param {number} index
   * @returns {SlideData}
   */
  getItemData(index) {
    var _this$options2;
    const dataSource = (_this$options2 = this.options) === null || _this$options2 === void 0 ? void 0 : _this$options2.dataSource;
    let dataSourceItem = {};
    if (Array.isArray(dataSource)) {
      dataSourceItem = dataSource[index];
    } else if (dataSource && "gallery" in dataSource) {
      if (!dataSource.items) {
        dataSource.items = this._getGalleryDOMElements(dataSource.gallery);
      }
      dataSourceItem = dataSource.items[index];
    }
    let itemData = dataSourceItem;
    if (itemData instanceof Element) {
      itemData = this._domElementToItemData(itemData);
    }
    const event = this.dispatch("itemData", {
      itemData: itemData || {},
      index
    });
    return this.applyFilters("itemData", event.itemData, index);
  }
  /**
   * Get array of gallery DOM elements,
   * based on childSelector and gallery element.
   *
   * @param {HTMLElement} galleryElement
   * @returns {HTMLElement[]}
   */
  _getGalleryDOMElements(galleryElement) {
    var _this$options3, _this$options4;
    if ((_this$options3 = this.options) !== null && _this$options3 !== void 0 && _this$options3.children || (_this$options4 = this.options) !== null && _this$options4 !== void 0 && _this$options4.childSelector) {
      return getElementsFromOption2(this.options.children, this.options.childSelector, galleryElement) || [];
    }
    return [galleryElement];
  }
  /**
   * Converts DOM element to item data object.
   *
   * @param {HTMLElement} element DOM element
   * @returns {SlideData}
   */
  _domElementToItemData(element) {
    const itemData = {
      element
    };
    const linkEl = (
      /** @type {HTMLAnchorElement} */
      element.tagName === "A" ? element : element.querySelector("a")
    );
    if (linkEl) {
      itemData.src = linkEl.dataset.pswpSrc || linkEl.href;
      if (linkEl.dataset.pswpSrcset) {
        itemData.srcset = linkEl.dataset.pswpSrcset;
      }
      itemData.width = linkEl.dataset.pswpWidth ? parseInt(linkEl.dataset.pswpWidth, 10) : 0;
      itemData.height = linkEl.dataset.pswpHeight ? parseInt(linkEl.dataset.pswpHeight, 10) : 0;
      itemData.w = itemData.width;
      itemData.h = itemData.height;
      if (linkEl.dataset.pswpType) {
        itemData.type = linkEl.dataset.pswpType;
      }
      const thumbnailEl = element.querySelector("img");
      if (thumbnailEl) {
        var _thumbnailEl$getAttri;
        itemData.msrc = thumbnailEl.currentSrc || thumbnailEl.src;
        itemData.alt = (_thumbnailEl$getAttri = thumbnailEl.getAttribute("alt")) !== null && _thumbnailEl$getAttri !== void 0 ? _thumbnailEl$getAttri : "";
      }
      if (linkEl.dataset.pswpCropped || linkEl.dataset.cropped) {
        itemData.thumbCropped = true;
      }
    }
    return this.applyFilters("domItemData", itemData, element, linkEl);
  }
  /**
   * Lazy-load by slide data
   *
   * @param {SlideData} itemData Data about the slide
   * @param {number} index
   * @returns {Content} Image that is being decoded or false.
   */
  lazyLoadData(itemData, index) {
    return lazyLoadData2(itemData, this, index);
  }
};
var PhotoSwipeLightbox = class extends PhotoSwipeBase2 {
  /**
   * @param {PhotoSwipeOptions} [options]
   */
  constructor(options) {
    super();
    this.options = options || {};
    this._uid = 0;
    this.shouldOpen = false;
    this._preloadedContent = void 0;
    this.onThumbnailsClick = this.onThumbnailsClick.bind(this);
  }
  /**
   * Initialize lightbox, should be called only once.
   * It's not included in the main constructor, so you may bind events before it.
   */
  init() {
    getElementsFromOption2(this.options.gallery, this.options.gallerySelector).forEach((galleryElement) => {
      galleryElement.addEventListener("click", this.onThumbnailsClick, false);
    });
  }
  /**
   * @param {MouseEvent} e
   */
  onThumbnailsClick(e) {
    if (specialKeyUsed2(e) || window.pswp) {
      return;
    }
    let initialPoint = {
      x: e.clientX,
      y: e.clientY
    };
    if (!initialPoint.x && !initialPoint.y) {
      initialPoint = null;
    }
    let clickedIndex = this.getClickedIndex(e);
    clickedIndex = this.applyFilters("clickedIndex", clickedIndex, e, this);
    const dataSource = {
      gallery: (
        /** @type {HTMLElement} */
        e.currentTarget
      )
    };
    if (clickedIndex >= 0) {
      e.preventDefault();
      this.loadAndOpen(clickedIndex, dataSource, initialPoint);
    }
  }
  /**
   * Get index of gallery item that was clicked.
   *
   * @param {MouseEvent} e click event
   * @returns {number}
   */
  getClickedIndex(e) {
    if (this.options.getClickedIndexFn) {
      return this.options.getClickedIndexFn.call(this, e);
    }
    const clickedTarget = (
      /** @type {HTMLElement} */
      e.target
    );
    const childElements = getElementsFromOption2(
      this.options.children,
      this.options.childSelector,
      /** @type {HTMLElement} */
      e.currentTarget
    );
    const clickedChildIndex = childElements.findIndex((child) => child === clickedTarget || child.contains(clickedTarget));
    if (clickedChildIndex !== -1) {
      return clickedChildIndex;
    } else if (this.options.children || this.options.childSelector) {
      return -1;
    }
    return 0;
  }
  /**
   * Load and open PhotoSwipe
   *
   * @param {number} index
   * @param {DataSource} [dataSource]
   * @param {Point | null} [initialPoint]
   * @returns {boolean}
   */
  loadAndOpen(index, dataSource, initialPoint) {
    if (window.pswp || !this.options) {
      return false;
    }
    if (!dataSource && this.options.gallery && this.options.children) {
      const galleryElements = getElementsFromOption2(this.options.gallery);
      if (galleryElements[0]) {
        dataSource = {
          gallery: galleryElements[0]
        };
      }
    }
    this.options.index = index;
    this.options.initialPointerPos = initialPoint;
    this.shouldOpen = true;
    this.preload(index, dataSource);
    return true;
  }
  /**
   * Load the main module and the slide content by index
   *
   * @param {number} index
   * @param {DataSource} [dataSource]
   */
  preload(index, dataSource) {
    const {
      options
    } = this;
    if (dataSource) {
      options.dataSource = dataSource;
    }
    const promiseArray = [];
    const pswpModuleType = typeof options.pswpModule;
    if (isPswpClass(options.pswpModule)) {
      promiseArray.push(Promise.resolve(
        /** @type {Type<PhotoSwipe>} */
        options.pswpModule
      ));
    } else if (pswpModuleType === "string") {
      throw new Error("pswpModule as string is no longer supported");
    } else if (pswpModuleType === "function") {
      promiseArray.push(
        /** @type {() => Promise<Type<PhotoSwipe>>} */
        options.pswpModule()
      );
    } else {
      throw new Error("pswpModule is not valid");
    }
    if (typeof options.openPromise === "function") {
      promiseArray.push(options.openPromise());
    }
    if (options.preloadFirstSlide !== false && index >= 0) {
      this._preloadedContent = lazyLoadSlide2(index, this);
    }
    const uid = ++this._uid;
    Promise.all(promiseArray).then((iterableModules) => {
      if (this.shouldOpen) {
        const mainModule = iterableModules[0];
        this._openPhotoswipe(mainModule, uid);
      }
    });
  }
  /**
   * @private
   * @param {Type<PhotoSwipe> | { default: Type<PhotoSwipe> }} module
   * @param {number} uid
   */
  _openPhotoswipe(module, uid) {
    if (uid !== this._uid && this.shouldOpen) {
      return;
    }
    this.shouldOpen = false;
    if (window.pswp) {
      return;
    }
    const pswp = typeof module === "object" ? new module.default(this.options) : new module(this.options);
    this.pswp = pswp;
    window.pswp = pswp;
    Object.keys(this._listeners).forEach((name) => {
      var _this$_listeners$name;
      (_this$_listeners$name = this._listeners[name]) === null || _this$_listeners$name === void 0 || _this$_listeners$name.forEach((fn) => {
        pswp.on(
          name,
          /** @type {EventCallback<typeof name>} */
          fn
        );
      });
    });
    Object.keys(this._filters).forEach((name) => {
      var _this$_filters$name;
      (_this$_filters$name = this._filters[name]) === null || _this$_filters$name === void 0 || _this$_filters$name.forEach((filter) => {
        pswp.addFilter(name, filter.fn, filter.priority);
      });
    });
    if (this._preloadedContent) {
      pswp.contentLoader.addToCache(this._preloadedContent);
      this._preloadedContent = void 0;
    }
    pswp.on("destroy", () => {
      this.pswp = void 0;
      delete window.pswp;
    });
    pswp.init();
  }
  /**
   * Unbinds all events, closes PhotoSwipe if it's open.
   */
  destroy() {
    var _this$pswp;
    (_this$pswp = this.pswp) === null || _this$pswp === void 0 || _this$pswp.destroy();
    this.shouldOpen = false;
    this._listeners = {};
    getElementsFromOption2(this.options.gallery, this.options.gallerySelector).forEach((galleryElement) => {
      galleryElement.removeEventListener("click", this.onThumbnailsClick, false);
    });
  }
};

// assets/scripts/lightbox.ts
function mountLightbox() {
  const images = document.querySelectorAll(".markdown-content img, #post-cover");
  if (images.length === 0) return;
  const lightbox = new PhotoSwipeLightbox({
    gallery: ".post-container",
    children: "img",
    pswpModule: () => Promise.resolve({ default: PhotoSwipe }),
    padding: { top: 24, bottom: 24, left: 24, right: 24 },
    wheelToZoom: true,
    arrowPrev: false,
    arrowNext: false,
    imageClickAction: "close",
    tapAction: "close",
    doubleTapAction: "zoom",
    bgOpacity: 0.9
  });
  lightbox.addFilter("domItemData", (itemData, element) => {
    if (element instanceof HTMLImageElement) {
      itemData.src = element.currentSrc || element.src;
      itemData.w = Number(element.naturalWidth || window.innerWidth);
      itemData.h = Number(element.naturalHeight || window.innerHeight);
      itemData.msrc = itemData.src;
      itemData.alt = element.alt;
    }
    return itemData;
  });
  lightbox.init();
  register(() => lightbox.destroy());
}

// assets/scripts/copy.ts
var COPY_LABEL = "\u590D\u5236";
var DONE_LABEL = "\u5DF2\u590D\u5236";
function mountCodeCopy() {
  const blocks = Array.from(document.querySelectorAll(".markdown-content pre:not(.mermaid)"));
  if (blocks.length === 0) return;
  const cleanups2 = [];
  for (const pre of blocks) {
    if (pre.dataset.copyReady === "true") continue;
    pre.dataset.copyReady = "true";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-btn";
    button.setAttribute("aria-label", COPY_LABEL);
    const label = document.createElement("span");
    label.className = "copy-label";
    label.textContent = COPY_LABEL;
    button.append(label);
    let timer;
    const onClick = async () => {
      const code = pre.querySelector("code")?.textContent ?? "";
      try {
        await navigator.clipboard.writeText(code);
      } catch {
      }
      button.classList.add("success");
      label.textContent = DONE_LABEL;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.classList.remove("success");
        label.textContent = COPY_LABEL;
      }, 1200);
    };
    button.addEventListener("click", onClick);
    pre.append(button);
    cleanups2.push(() => {
      window.clearTimeout(timer);
      button.removeEventListener("click", onClick);
      button.remove();
    });
  }
  register(() => cleanups2.forEach((cleanup) => cleanup()));
}

// assets/scripts/filter.ts
function mountArchiveFilter() {
  const page = document.querySelector(".archive-page");
  if (!page) return;
  const params = new URLSearchParams(location.search);
  const tags = params.getAll("tag");
  const categories = params.getAll("category");
  const uncategorized = params.has("uncategorized");
  const isFiltered = tags.length > 0 || categories.length > 0 || uncategorized;
  const items = Array.from(page.querySelectorAll(".archive-item"));
  for (const item of items) {
    const itemTags = (item.dataset.tags ?? "").split(" ").filter(Boolean);
    const itemCategory = item.dataset.category ?? "";
    let show = true;
    if (tags.length > 0) show = tags.some((tag) => itemTags.includes(tag));
    if (show && categories.length > 0) show = categories.includes(itemCategory);
    if (show && uncategorized) show = itemCategory === "";
    item.classList.toggle("is-hidden", !show);
  }
  for (const group of Array.from(page.querySelectorAll(".archive-group"))) {
    const visible = group.querySelectorAll(".archive-item:not(.is-hidden)").length;
    group.classList.toggle("is-hidden", visible === 0);
    const count = group.querySelector(".archive-count");
    if (count) count.textContent = `${visible} \u7BC7\u6587\u7AE0`;
  }
  page.querySelector(".archive-filter")?.remove();
  if (isFiltered) {
    const bar = document.createElement("div");
    bar.className = "archive-filter";
    const label = document.createElement("span");
    label.textContent = `\u7B5B\u9009\uFF1A${[...tags.map((tag) => `#${tag}`), ...categories, uncategorized ? "\u672A\u5206\u7C7B" : ""].filter(Boolean).join(" ")}`;
    const clear = document.createElement("a");
    clear.href = "/archive/";
    clear.textContent = "\u6E05\u9664";
    bar.append(label, clear);
    page.prepend(bar);
  }
}

// assets/scripts/links.ts
function syncDataHrefs() {
  document.querySelectorAll("a[data-href]").forEach((link) => {
    const target = link.dataset.href;
    if (target) link.setAttribute("href", target);
  });
}

// assets/scripts/github.ts
function compact(value) {
  return new Intl.NumberFormat("en-us", { notation: "compact", maximumFractionDigits: 1 }).format(value ?? 0).replace(/\u202f/g, "");
}
function mountGithubCards() {
  const cards = Array.from(document.querySelectorAll(".card-github[data-repo]"));
  for (const card of cards) {
    if (card.dataset.state === "loading" || card.dataset.state === "loaded") continue;
    const repo = card.dataset.repo;
    if (!repo) continue;
    card.dataset.state = "loading";
    card.classList.add("fetch-waiting");
    fetch(`https://api.github.com/repos/${repo}`, { referrerPolicy: "no-referrer" }).then((response) => response.ok ? response.json() : Promise.reject(new Error(String(response.status)))).then((data2) => {
      const description = card.querySelector(".gc-description");
      if (description) description.textContent = (data2.description ?? "").replace(/:[a-zA-Z0-9_]+:/g, "") || "Description not set";
      const language = card.querySelector(".gc-language");
      if (language) language.textContent = data2.language ?? "";
      const stars = card.querySelector(".gc-stars");
      if (stars) stars.textContent = compact(data2.stargazers_count);
      const forks = card.querySelector(".gc-forks");
      if (forks) forks.textContent = compact(data2.forks);
      const license = card.querySelector(".gc-license");
      if (license) license.textContent = data2.license?.spdx_id ?? "no-license";
      const avatar = card.querySelector(".gc-avatar");
      if (avatar && data2.owner?.avatar_url) {
        avatar.style.backgroundImage = `url('${data2.owner.avatar_url}')`;
        avatar.style.backgroundColor = "transparent";
      }
      card.classList.remove("fetch-waiting");
      card.dataset.state = "loaded";
    }).catch(() => {
      card.classList.remove("fetch-waiting");
      card.classList.add("fetch-error");
      card.dataset.state = "error";
    });
  }
}

// templates/i18n.json
var i18n_default = {
  A_ong: {
    home: "H\u014Dm",
    about: "An d\u0131 Sa\u0131to",
    archive: "\xC1rc\u0131ve",
    search: "S\u0113con",
    tags: "Taggs",
    categories: "Categ\xF3r\u0131en",
    recentPosts: "Laetos Posts",
    comments: "Regardon",
    untitled: "Non-Theman",
    uncategorized: "Non-Categ\xF3r\u0131en",
    noTags: "Non-Taggs",
    wordCount: "\u01BFord",
    wordsCount: "\u01BFords",
    minuteCount: "m\xEDnute",
    minutesCount: "m\xEDnuten",
    postCount: "post",
    postsCount: "posts",
    themeColor: "Dyon des Thema",
    lightMode: "L\u0131ct",
    darkMode: "Darc",
    systemMode: "sub Syst\xE9m",
    more: "m\u0153r",
    author: "Scrippor",
    publishedAt: "gapubl\u0131schde an",
    license: "L\u0131sens",
    friends: "Fr\u0153nds"
  },
  A_zh_iang: {
    home: "\u6249\u8449",
    about: "\u8FF0\u8981",
    archive: "\u5165\u6863",
    search: "\u691C\u7D22",
    tags: "\u6A19\u8B58",
    categories: "\u9580\u985E",
    recentPosts: "\u65B0\u7BC7",
    comments: "\u8A55\u4FA1",
    untitled: "\u7121\u984C",
    uncategorized: "\u9580\u985E\u672A\u5165",
    noTags: "\u7121\u6A19\u8B58",
    wordCount: "\u5B57",
    wordsCount: "\u5B57",
    minuteCount: "\u6D0B\u5206",
    minutesCount: "\u6D0B\u5206",
    postCount: "\u7BC7",
    postsCount: "\u7BC7",
    themeColor: "\u4E3B\u8272",
    lightMode: "\u660E",
    darkMode: "\u6697",
    systemMode: "\u5F93\u5E38",
    more: "\u4F59\u8005",
    author: "\u4F5C\u8005",
    publishedAt: "\u8F09\u65BC",
    license: "\u8A31\u53EF\u79D1\u6761",
    friends: "\u53CB\u9396"
  },
  en: {
    home: "Home",
    about: "About",
    archive: "Archive",
    search: "Search",
    tags: "Tags",
    categories: "Categories",
    recentPosts: "Recent Posts",
    comments: "Comments",
    untitled: "Untitled",
    uncategorized: "Uncategorized",
    noTags: "No Tags",
    wordCount: "word",
    wordsCount: "words",
    minuteCount: "minute",
    minutesCount: "minutes",
    postCount: "post",
    postsCount: "posts",
    themeColor: "Theme Color",
    lightMode: "Light",
    darkMode: "Dark",
    systemMode: "System",
    more: "More",
    author: "Author",
    publishedAt: "Published at",
    license: "License",
    friends: "Friends"
  },
  es: {
    home: "Inicio",
    about: "Sobre m\xED",
    archive: "Archivo",
    search: "Buscar",
    tags: "Etiquetas",
    categories: "Categor\xEDas",
    recentPosts: "Publicaciones recientes",
    comments: "Comentarios",
    untitled: "Sin t\xEDtulo",
    uncategorized: "Sin categor\xEDa",
    noTags: "Sin etiquetas",
    wordCount: "palabra",
    wordsCount: "palabras",
    minuteCount: "minuto",
    minutesCount: "minutos",
    postCount: "publicaci\xF3n",
    postsCount: "publicaciones",
    themeColor: "Color del tema",
    lightMode: "Claro",
    darkMode: "Oscuro",
    systemMode: "Sistema",
    more: "M\xE1s",
    author: "Autor",
    publishedAt: "Publicado el",
    license: "Licencia",
    friends: "Amigos"
  },
  id: {
    home: "Beranda",
    about: "Tentang",
    archive: "Arsip",
    search: "Cari",
    tags: "Tag",
    categories: "Kategori",
    recentPosts: "Postingan Terbaru",
    comments: "Komentar",
    untitled: "Tanpa Judul",
    uncategorized: "Tanpa Kategori",
    noTags: "Tanpa Tag",
    wordCount: "kata",
    wordsCount: "kata",
    minuteCount: "menit",
    minutesCount: "menit",
    postCount: "postingan",
    postsCount: "postingan",
    themeColor: "Warna Tema",
    lightMode: "Terang",
    darkMode: "Gelap",
    systemMode: "Sistem",
    more: "Lainnya",
    author: "Penulis",
    publishedAt: "Diterbitkan pada",
    license: "Lisensi",
    friends: "Teman-teman"
  },
  ja: {
    home: "\u30DB\u30FC\u30E0",
    about: "\u6982\u8981",
    archive: "\u30A2\u30FC\u30AB\u30A4\u30D6",
    search: "\u691C\u7D22",
    tags: "\u30BF\u30B0",
    categories: "\u30AB\u30C6\u30B4\u30EA",
    recentPosts: "\u6700\u8FD1\u306E\u6295\u7A3F",
    comments: "\u30B3\u30E1\u30F3\u30C8",
    untitled: "\u30BF\u30A4\u30C8\u30EB\u306A\u3057",
    uncategorized: "\u30AB\u30C6\u30B4\u30EA\u306A\u3057",
    noTags: "\u30BF\u30B0\u306A\u3057",
    wordCount: "\u6587\u5B57",
    wordsCount: "\u6587\u5B57",
    minuteCount: "\u5206",
    minutesCount: "\u5206",
    postCount: "\u4EF6\u306E\u6295\u7A3F",
    postsCount: "\u4EF6\u306E\u6295\u7A3F",
    themeColor: "\u30C6\u30FC\u30DE\u30AB\u30E9\u30FC",
    lightMode: "\u30E9\u30A4\u30C8",
    darkMode: "\u30C0\u30FC\u30AF",
    systemMode: "\u30B7\u30B9\u30C6\u30E0",
    more: "\u3082\u3063\u3068",
    author: "\u4F5C\u8005",
    publishedAt: "\u516C\u958B\u65E5",
    license: "\u30E9\u30A4\u30BB\u30F3\u30B9",
    friends: "\u304A\u53CB\u9054"
  },
  ko: {
    home: "\uD648",
    about: "\uC18C\uAC1C",
    archive: "\uC544\uCE74\uC774\uBE0C",
    search: "\uAC80\uC0C9",
    tags: "\uD0DC\uADF8",
    categories: "\uCE74\uD14C\uACE0\uB9AC",
    recentPosts: "\uCD5C\uADFC \uAC8C\uC2DC\uBB3C",
    comments: "\uB313\uAE00",
    untitled: "\uC81C\uBAA9 \uC5C6\uC74C",
    uncategorized: "\uBD84\uB958\uB418\uC9C0 \uC54A\uC74C",
    noTags: "\uD0DC\uADF8 \uC5C6\uC74C",
    wordCount: "\uB2E8\uC5B4",
    wordsCount: "\uB2E8\uC5B4",
    minuteCount: "\uBD84",
    minutesCount: "\uBD84",
    postCount: "\uAC8C\uC2DC\uBB3C",
    postsCount: "\uAC8C\uC2DC\uBB3C",
    themeColor: "\uD14C\uB9C8 \uC0C9\uC0C1",
    lightMode: "\uBC1D\uC740 \uBAA8\uB4DC",
    darkMode: "\uC5B4\uB450\uC6B4 \uBAA8\uB4DC",
    systemMode: "\uC2DC\uC2A4\uD15C \uBAA8\uB4DC",
    more: "\uB354 \uBCF4\uAE30",
    author: "\uC800\uC790",
    publishedAt: "\uAC8C\uC2DC\uC77C",
    license: "\uB77C\uC774\uC120\uC2A4",
    friends: "\uCE5C\uAD6C\uB4E4"
  },
  th: {
    home: "\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E23\u0E01",
    about: "\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E01\u0E31\u0E1A",
    archive: "\u0E04\u0E25\u0E31\u0E07",
    search: "\u0E04\u0E49\u0E19\u0E2B\u0E32",
    tags: "\u0E1B\u0E49\u0E32\u0E22\u0E01\u0E33\u0E01\u0E31\u0E1A",
    categories: "\u0E2B\u0E21\u0E27\u0E14\u0E2B\u0E21\u0E39\u0E48",
    recentPosts: "\u0E42\u0E1E\u0E2A\u0E15\u0E4C\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14",
    comments: "\u0E04\u0E27\u0E32\u0E21\u0E04\u0E34\u0E14\u0E40\u0E2B\u0E47\u0E19",
    untitled: "\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E15\u0E31\u0E49\u0E07\u0E0A\u0E37\u0E48\u0E2D",
    uncategorized: "\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E08\u0E31\u0E14\u0E2B\u0E21\u0E27\u0E14\u0E2B\u0E21\u0E39\u0E48",
    noTags: "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1B\u0E49\u0E32\u0E22\u0E01\u0E33\u0E01\u0E31\u0E1A",
    wordCount: "\u0E04\u0E33",
    wordsCount: "\u0E04\u0E33",
    minuteCount: "\u0E19\u0E32\u0E17\u0E35",
    minutesCount: "\u0E19\u0E32\u0E17\u0E35",
    postCount: "\u0E42\u0E1E\u0E2A\u0E15\u0E4C",
    postsCount: "\u0E42\u0E1E\u0E2A\u0E15\u0E4C",
    themeColor: "\u0E2A\u0E35\u0E02\u0E2D\u0E07\u0E18\u0E35\u0E21",
    lightMode: "\u0E2A\u0E27\u0E48\u0E32\u0E07",
    darkMode: "\u0E21\u0E37\u0E14",
    systemMode: "\u0E15\u0E32\u0E21\u0E23\u0E30\u0E1A\u0E1A",
    more: "\u0E14\u0E39\u0E40\u0E1E\u0E34\u0E48\u0E21",
    author: "\u0E1C\u0E39\u0E49\u0E40\u0E02\u0E35\u0E22\u0E19",
    publishedAt: "\u0E40\u0E1C\u0E22\u0E41\u0E1E\u0E23\u0E48\u0E40\u0E21\u0E37\u0E48\u0E2D",
    license: "\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E2D\u0E19\u0E38\u0E0D\u0E32\u0E15",
    friends: "\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E19\u0E46"
  },
  tr: {
    home: "Anasayfa",
    about: "Hakk\u0131nda",
    archive: "Ar\u015Fiv",
    search: "Ara",
    tags: "Taglar",
    categories: "Katagoriler",
    recentPosts: "Son Payla\u015F\u0131mlar",
    comments: "Yorumlar",
    untitled: "Ba\u015Fl\u0131ks\u0131z",
    uncategorized: "Katagorisiz",
    noTags: "Tag Bulunamad\u0131",
    wordCount: "kelime",
    wordsCount: "kelime",
    minuteCount: "dakika",
    minutesCount: "dakika",
    postCount: "g\xF6nderi",
    postsCount: "g\xF6nderiler",
    themeColor: "Tema Rengi",
    lightMode: "Ayd\u0131nl\u0131k",
    darkMode: "Koyu",
    systemMode: "Sistem",
    more: "Daha Fazla",
    author: "Yazar",
    publishedAt: "Yay\u0131nlanma:",
    license: "Lisans",
    friends: "Arkada\u015Flar"
  },
  vi: {
    home: "Trang ch\u1EE7",
    about: "Gi\u1EDBi thi\u1EC7u",
    archive: "Kho b\xE0i",
    search: "T\xECm ki\u1EBFm",
    tags: "Th\u1EBB",
    categories: "Danh m\u1EE5c",
    recentPosts: "B\xE0i vi\u1EBFt m\u1EDBi nh\u1EA5t",
    comments: "B\xECnh lu\u1EADn",
    untitled: "Kh\xF4ng ti\xEAu \u0111\u1EC1",
    uncategorized: "Ch\u01B0a ph\xE2n lo\u1EA1i",
    noTags: "Ch\u01B0a c\xF3 th\u1EBB",
    wordCount: "t\u1EEB",
    wordsCount: "t\u1EEB",
    minuteCount: "ph\xFAt \u0111\u1ECDc",
    minutesCount: "ph\xFAt \u0111\u1ECDc",
    postCount: "b\xE0i vi\u1EBFt",
    postsCount: "b\xE0i vi\u1EBFt",
    themeColor: "M\xE0u giao di\u1EC7n",
    lightMode: "S\xE1ng",
    darkMode: "T\u1ED1i",
    systemMode: "H\u1EC7 th\u1ED1ng",
    more: "Th\xEAm",
    author: "T\xE1c gi\u1EA3",
    publishedAt: "\u0110\u0103ng v\xE0o l\xFAc",
    license: "Gi\u1EA5y ph\xE9p b\u1EA3n quy\u1EC1n",
    friends: "B\u1EA1n"
  },
  zh_CN: {
    home: "\u4E3B\u9875",
    about: "\u5173\u4E8E",
    archive: "\u5F52\u6863",
    search: "\u641C\u7D22",
    tags: "\u6807\u7B7E",
    categories: "\u5206\u7C7B",
    recentPosts: "\u6700\u65B0\u6587\u7AE0",
    comments: "\u8BC4\u8BBA",
    untitled: "\u65E0\u6807\u9898",
    uncategorized: "\u672A\u5206\u7C7B",
    noTags: "\u65E0\u6807\u7B7E",
    wordCount: "\u5B57",
    wordsCount: "\u5B57",
    minuteCount: "\u5206\u949F",
    minutesCount: "\u5206\u949F",
    postCount: "\u7BC7\u6587\u7AE0",
    postsCount: "\u7BC7\u6587\u7AE0",
    themeColor: "\u4E3B\u9898\u8272",
    lightMode: "\u4EAE\u8272",
    darkMode: "\u6697\u8272",
    systemMode: "\u8DDF\u968F\u7CFB\u7EDF",
    more: "\u66F4\u591A",
    author: "\u4F5C\u8005",
    publishedAt: "\u53D1\u5E03\u4E8E",
    license: "\u8BB8\u53EF\u534F\u8BAE",
    friends: "\u53CB\u94FE"
  },
  zh_TW: {
    home: "\u9996\u9801",
    about: "\u95DC\u65BC",
    archive: "\u5F59\u6574",
    search: "\u641C\u5C0B",
    tags: "\u6A19\u7C64",
    categories: "\u5206\u985E",
    recentPosts: "\u6700\u65B0\u6587\u7AE0",
    comments: "\u8A55\u8AD6",
    untitled: "\u7121\u6A19\u984C",
    uncategorized: "\u672A\u5206\u985E",
    noTags: "\u7121\u6A19\u7C64",
    wordCount: "\u5B57",
    wordsCount: "\u5B57",
    minuteCount: "\u5206\u9418",
    minutesCount: "\u5206\u9418",
    postCount: "\u7BC7\u6587\u7AE0",
    postsCount: "\u7BC7\u6587\u7AE0",
    themeColor: "\u4E3B\u984C\u8272",
    lightMode: "\u4EAE\u8272",
    darkMode: "\u6697\u8272",
    systemMode: "\u8DDF\u96A8\u7CFB\u7D71",
    more: "\u66F4\u591A",
    author: "\u4F5C\u8005",
    publishedAt: "\u767C\u4F48\u65BC",
    license: "\u8A31\u53EF\u5354\u8B70",
    friends: "\u53CB\u93C8"
  }
};

// templates/words.json
var words_default = {
  \u6211\u4E0E\u661F\u5149\u540C\u884C: {
    zh_CN: "\u6211\u4E0E\u661F\u5149\u540C\u884C",
    ja: "\u661F\u306E\u5149\u3068\u5171\u306B\u5F81\u304F",
    en: "With Astrolight"
  },
  \u7AF9\u53D6\u62FE\u9057\u7269\u8BED: {
    zh_CN: "\u7AF9\u53D6\u62FE\u9057\u7269\u8BED",
    ja: "\u7AF9\u53D6\u62FE\u907A\u7269\u8A9E",
    en: "Later Collection of Tales from the Bamboo Cutter"
  },
  \u701B\u5BF0: {
    zh_CN: "\u701B\u5BF0",
    ja: "<ruby>\u701B\u5BF0<rt>\u3048\u3044\u304B\u3093</rt></ruby>",
    en: "Aeonivacuum"
  },
  \u65BC\u7559\u6839: {
    zh_CN: "\u65BC\u7559\u6839",
    ja: "<ruby>\u65BC\u7559\u6839<rt>\u30AA\u30EB\u30B1\u30F3</rt></ruby>",
    en: "Orken"
  },
  \u8BC3\u53E4\u68F1: {
    zh_CN: "\u8BC3\u53E4\u68F1",
    ja: "<ruby>\u8A36\u53E4\u7A1C<rt>\u30CF\u30B3\u30ED\u30F3</rt></ruby>",
    en: "Hacorum"
  },
  \u8840\u5996: {
    zh_CN: "\u8840\u5996",
    ja: "\u8840\u5996",
    en: "Homines Sanguinei"
  },
  \u6545\u4E8B: {
    zh_CN: "\u6545\u4E8B",
    ja: "\u7269\u8A9E",
    en: "Story"
  },
  \u540C\u4EBA: {
    zh_CN: "\u540C\u4EBA",
    ja: "\u4E8C\u6B21\u5275\u4F5C",
    en: "Fanfiction"
  },
  \u602A\u7269\u730E\u4EBA: {
    zh_CN: "\u602A\u7269\u730E\u4EBA",
    ja: "\u30E2\u30F3\u30B9\u30BF\u30FC\u30CF\u30F3\u30BF\u30FC",
    en: "Monster Hunter"
  },
  \u5916\u4F20: {
    zh_CN: "\u5916\u4F20",
    ja: "\u5916\u4F1D",
    en: "Sidestory"
  },
  \u4E1C\u65B9: {
    zh_CN: "\u4E1C\u65B9",
    ja: "\u6771\u65B9",
    en: "Touhou"
  },
  \u6708\u90FD: {
    zh_CN: "\u6708\u90FD",
    ja: "\u6708\u306E\u90FD",
    en: "Moon Capital"
  },
  \u84EC\u83B1\u5C71\u8F89\u591C: {
    zh_CN: "\u84EC\u83B1\u5C71\u8F89\u591C",
    ja: "\u84EC\u83B1\u5C71\u8F1D\u591C",
    en: "Houraisan Kaguya"
  },
  \u8BBE\u5B9A: {
    zh_CN: "\u8BBE\u5B9A",
    ja: "\u8A2D\u5B9A",
    en: "Setting"
  },
  \u592E\u989D\u5217: {
    zh_CN: "\u592E\u989D\u5217",
    ja: "<ruby>\u592E\u984D\u5217<rt>\u30AA\u30F3\u30B0\u30EA\u30B7</rt></ruby>",
    en: "Ongland"
  },
  \u606F\u5F8B: {
    zh_CN: "\u606F\u5F8B",
    ja: "<ruby>\u606F\u5F8B<rt>\u305D\u304F\u308A\u3061</rt></ruby>",
    en: "Sihrut"
  },
  \u4E16\u754C\u6A21\u578B: {
    zh_CN: "\u4E16\u754C\u6A21\u578B",
    ja: "\u4E16\u754C\u30E2\u30C7\u30EB",
    en: "World Model"
  },
  \u6811\u4E0A\u8424\u706B\u866B: {
    zh_CN: "\u6811\u4E0A\u8424\u706B\u866B",
    ja: "\u6A39\u4E0A\u306E\u86CD",
    en: "Fireflies on Tree"
  },
  \u701B\u6D32: {
    zh_CN: "\u701B\u6D32",
    ja: "<ruby>\u701B\u6D32<rt>\u3048\u3044\u3057\u3085\u3046</rt></ruby>",
    en: "Iangdom Continent"
  },
  \u5927\u701B: {
    zh_CN: "\u5927\u701B",
    ja: "<ruby>\u5927\u701B<rt>\u305F\u3044\u3048\u3044</rt></ruby>",
    en: "Iangdom"
  },
  \u51A5\u754C: {
    zh_CN: "\u51A5\u754C",
    ja: "\u51A5\u754C",
    en: "Netherworld"
  },
  \u5929\u7A7A\u57CE: {
    zh_CN: "\u5929\u7A7A\u57CE",
    ja: "\u5929\u7A7A\u57CE",
    en: "Sky City"
  },
  \u53E4\u4EE3\u6587\u660E: {
    zh_CN: "\u53E4\u4EE3\u6587\u660E",
    ja: "\u53E4\u4EE3\u6587\u660E",
    en: "Ancient Civilization"
  },
  \u5F02\u76F8: {
    zh_CN: "\u5F02\u76F8",
    ja: "\u7570\u76F8",
    en: "Allophases"
  },
  \u571F\u884C\u5996: {
    zh_CN: "\u571F\u884C\u5996",
    ja: "<ruby>\u571F\u884C<rt>\u3064\u3061\u3086\u304F</rt></ruby><ruby>\u5996<rt>\u3042\u3084\u304B\u3057</rt></ruby>",
    en: "Homines Terrirepentes"
  },
  \u6218\u4E89: {
    zh_CN: "\u6218\u4E89",
    ja: "\u6226\u4E89",
    en: "War"
  },
  \u91C7\u82B1\u5996: {
    zh_CN: "\u91C7\u82B1\u5996",
    ja: "<ruby>\u82B1\u6458<rt>\u306F\u306A\u3064\u3080</rt></ruby><ruby>\u5996<rt>\u3042\u3084\u304B\u3057</rt></ruby>",
    en: "Homines Meridiani"
  },
  \u6B7B\u7075\u6A31: {
    zh_CN: "\u6B7B\u7075\u6A31",
    ja: "<ruby>\u6B7B\u970A<rt>\u3057\u308A\u3087\u3046</rt></ruby><ruby>\u685C<rt>\u3056\u304F\u3089</rt></ruby>",
    en: "Sakura Necromorphae"
  },
  \u77B1\u82B1: {
    zh_CN: "\u77B1\u82B1",
    ja: "<ruby>\u77B1<rt>\u3072\u304B\u3059</rt></ruby>",
    en: "Hiwhasue"
  },
  \u4EBA\u9020\u8BED\u8A00: {
    zh_CN: "\u4EBA\u9020\u8BED\u8A00",
    ja: "\u4EBA\u5DE5\u8A00\u8A9E",
    en: "Constructed Language"
  }
};

// assets/scripts/i18n.ts
var data = i18n_default;
var wordData = words_default;
var aliases = {
  zh: "zh_CN",
  "zh-hans": "zh_CN",
  "zh-cn": "zh_CN",
  "zh-tw": "zh_TW",
  en_us: "en",
  en_gb: "en",
  ong: "A_ong",
  "a-ong": "A_ong",
  a_zh_iang: "A_zh_iang",
  "a-zh-iang": "A_zh_iang",
  "a-zh_iang": "A_zh_iang",
  zh_iang: "A_zh_iang"
};
function resolveKey(lang) {
  const raw = lang && lang.trim() !== "" ? lang : "zh_CN";
  return aliases[raw] ?? raw;
}
function applyI18n() {
  const main = document.querySelector("#swup-container");
  const shell = document.querySelector(".site-shell");
  if (shell) shell.dataset.lang = main?.dataset.pageLang ?? "";
  const key = resolveKey(main?.dataset.pageLang);
  const t = data[key] ?? data.zh_CN ?? {};
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const id = el.dataset.i18n;
    if (id && t[id]) el.textContent = t[id];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const id = el.dataset.i18nPlaceholder;
    if (id && t[id]) el.placeholder = t[id];
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const id = el.dataset.i18nAria;
    if (id && t[id]) el.setAttribute("aria-label", t[id]);
  });
  document.querySelectorAll("[data-word]").forEach((el) => {
    const term = el.dataset.word;
    if (!term) return;
    const entry = wordData[term];
    const html = entry ? entry[key] ?? entry.zh_CN : void 0;
    if (html) el.innerHTML = html;
  });
}

// assets/scripts/mermaid.ts
var initialized = false;
function isDark2() {
  return document.documentElement.classList.contains("dark");
}
function mountMermaid() {
  const mermaid = window.mermaid;
  if (!mermaid) return;
  const nodes = Array.from(document.querySelectorAll(".markdown-content pre.mermaid"));
  if (nodes.length === 0) return;
  if (!initialized) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: isDark2() ? "dark" : "default",
      flowchart: { useMaxWidth: false, htmlLabels: true, diagramPadding: 240 }
    });
    initialized = true;
  }
  mermaid.run({ nodes });
}

// assets/scripts/fuwari.ts
function syncBodyState() {
  document.documentElement.classList.toggle("is-home", location.pathname === "/" || location.pathname === "");
  document.querySelector("#navbar-wrapper")?.classList.remove("navbar-hidden");
  document.querySelector("#back-to-top-btn")?.classList.add("hide");
}
function mountPage() {
  syncBodyState();
  syncDataHrefs();
  applyI18n();
  mountToc();
  mountCodeCopy();
  mountLightbox();
  mountComments();
  mountArchiveFilter();
  mountGithubCards();
  mountMermaid();
}
function mountGlobal() {
  document.querySelector("#banner")?.classList.add("is-ready");
  syncDataHrefs();
  mountSettings();
  mountSearch();
  mountScroll();
}
function setupSwup() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  let swup;
  try {
    swup = new F({
      containers: ["#swup-container", "#toc"],
      animateHistoryBrowsing: true
    });
  } catch {
    return;
  }
  swup.hooks.on("visit:start", () => {
    document.documentElement.style.setProperty("--content-delay", "0ms");
    closePanels();
    cleanupPage();
  });
  swup.hooks.on("page:view", () => {
    mountPage();
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    mountGlobal();
    mountPage();
    setupSwup();
  }, { once: true });
} else {
  mountGlobal();
  mountPage();
  setupSwup();
}
/*! Bundled license information:

photoswipe/dist/photoswipe.esm.js:
  (*!
    * PhotoSwipe 5.4.4 - https://photoswipe.com
    * (c) 2024 Dmytro Semenov
    *)

photoswipe/dist/photoswipe-lightbox.esm.js:
  (*!
    * PhotoSwipe Lightbox 5.4.4 - https://photoswipe.com
    * (c) 2024 Dmytro Semenov
    *)
*/
