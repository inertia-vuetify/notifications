import { router as g } from "@inertiajs/vue3";
import { inject as x, ref as C, defineComponent as V, openBlock as d, createBlock as y, unref as r, isRef as _, withCtx as h, createElementBlock as v, Fragment as M, renderList as S, createTextVNode as j, toDisplayString as I, createCommentVNode as N, mergeProps as T } from "vue";
import { VSnackbarQueue as E, VBtn as A } from "vuetify/components";
function F(n) {
  return "name" in n && typeof n.name == "string";
}
function O(n) {
  return "url" in n && "method" in n;
}
const k = /* @__PURE__ */ Symbol("inertia-vuetify-notifications"), m = {
  flashKeys: ["success", "error", "warning", "info", "notification"],
  defaults: {
    timeout: 5e3,
    closable: !0,
    location: "top",
    totalVisible: 1,
    displayStrategy: "hold",
    gap: 8
  },
  actions: {},
  colorMap: {
    success: "success",
    error: "error",
    warning: "warning",
    info: "info"
  }
};
function B(n = {}) {
  const i = {
    ...m,
    ...n,
    defaults: { ...m.defaults, ...n.defaults },
    colorMap: { ...m.colorMap, ...n.colorMap },
    actions: { ...n.actions }
  }, s = C([]), o = /* @__PURE__ */ new Map();
  for (const [t, e] of Object.entries(i.actions))
    o.set(t, e);
  function f(t, e) {
    if (typeof t == "string")
      return {
        text: t,
        color: e ? i.colorMap[e] : void 0,
        timeout: i.defaults.timeout,
        closable: i.defaults.closable
      };
    const u = t.type ? i.colorMap[t.type] || t.type : e ? i.colorMap[e] : void 0;
    return {
      text: t.message,
      color: u,
      timeout: t.timeout ?? i.defaults.timeout,
      closable: t.closable ?? i.defaults.closable,
      actions: t.actions
    };
  }
  function l(t, e) {
    const u = f(t, e);
    s.value.push(u);
  }
  function c(t, e) {
    o.set(t, e);
  }
  function p(t) {
    o.delete(t);
  }
  async function a(t) {
    if (F(t)) {
      const e = o.get(t.name);
      e ? await e(t.payload) : console.warn(`[inertia-vuetify-notifications] No handler registered for action: ${t.name}`);
    } else if (O(t)) {
      const e = t.method.toLowerCase();
      g.visit(t.url, {
        method: e,
        data: t.data
      });
    }
  }
  return {
    queue: s,
    notify: l,
    registerAction: c,
    unregisterAction: p,
    executeAction: a,
    options: i
  };
}
function D() {
  const n = x(k);
  if (!n)
    throw new Error(
      "[inertia-vuetify-notifications] useNotifications() must be used within a component tree that has the notification plugin installed. Did you forget to call app.use(inertiaVuetifyNotifications())?"
    );
  return n;
}
function L(n, i) {
  for (const s of i.options.flashKeys) {
    const o = n[s];
    o != null && i.notify(o, s);
  }
}
function K(n = {}) {
  return {
    install(i) {
      const s = B(n);
      i.provide(k, s);
      let o = null;
      g.on("before", () => {
        o = null;
      }), g.on("flash", (f) => {
        const l = f.detail.flash;
        if (!l || typeof l != "object" || Object.keys(l).length === 0) return;
        const c = JSON.stringify(l);
        c !== o && (o = c, L(l, s));
      });
    }
  };
}
const R = /* @__PURE__ */ V({
  __name: "NotificationProvider",
  setup(n) {
    const { queue: i, executeAction: s, options: o } = D();
    function f(a) {
      return typeof a == "object" && a !== null && "actions" in a && Array.isArray(a.actions) && a.actions.length > 0;
    }
    function l(a) {
      return a.label;
    }
    async function c(a, t) {
      await s(a), t();
    }
    function p(a) {
      return typeof a == "string" ? !0 : typeof a == "object" && a !== null && "closable" in a ? a.closable !== !1 : !0;
    }
    return (a, t) => (d(), y(r(E), {
      modelValue: r(i),
      "onUpdate:modelValue": t[0] || (t[0] = (e) => _(i) ? i.value = e : null),
      location: r(o).defaults.location,
      closable: r(o).defaults.closable,
      timeout: r(o).defaults.timeout,
      "total-visible": r(o).defaults.totalVisible,
      "display-strategy": r(o).defaults.displayStrategy,
      gap: r(o).defaults.gap
    }, {
      actions: h(({ item: e, props: u }) => [
        f(e) ? (d(!0), v(M, { key: 0 }, S(e.actions, (b, w) => (d(), y(r(A), {
          key: w,
          variant: "text",
          size: "small",
          onClick: (P) => c(b, u.onClick)
        }, {
          default: h(() => [
            j(I(l(b)), 1)
          ]),
          _: 2
        }, 1032, ["onClick"]))), 128)) : N("", !0),
        p(e) ? (d(), y(r(A), T({ key: 1 }, u, { icon: "mdi-close" }), null, 16)) : N("", !0)
      ]),
      _: 1
    }, 8, ["modelValue", "location", "closable", "timeout", "total-visible", "display-strategy", "gap"]));
  }
});
export {
  R as NotificationProvider,
  K as inertiaVuetifyNotifications,
  F as isNamedAction,
  O as isUrlAction,
  D as useNotifications
};
