import { Fragment as e, createBlock as t, createCommentVNode as n, createElementBlock as r, createTextVNode as i, defineComponent as a, getCurrentScope as o, inject as s, isRef as c, mergeProps as l, onScopeDispose as u, openBlock as d, ref as f, renderList as p, toDisplayString as m, unref as h, watch as g, withCtx as _ } from "vue";
import { router as v, usePage as y } from "@inertiajs/vue3";
import { useLocale as b } from "vuetify";
import { VBtn as x, VSnackbarQueue as S } from "vuetify/components";
// src/types.ts
function C(e) {
	return "name" in e && typeof e.name == "string";
}
function w(e) {
	return "url" in e && typeof e.url == "string";
}
var T = Symbol("inertia-vuetify-notifications:meta"), E = Symbol("inertia-vuetify-notifications"), D = {
	flashKeys: [
		"success",
		"error",
		"warning",
		"info",
		"notification"
	],
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
function O(e = {}) {
	let t = {
		flashKeys: e.flashKeys ?? D.flashKeys,
		defaults: {
			...D.defaults,
			...e.defaults
		},
		actions: { ...e.actions },
		colorMap: {
			...D.colorMap,
			...e.colorMap
		}
	}, n = f([]), r = new Map(Object.entries(t.actions).map(([e, t]) => [e, { handler: t }]));
	function i(e, n) {
		let r = typeof e == "string" ? { message: e } : e, i = r.type ? t.colorMap[r.type] ?? r.type : n ? t.colorMap[n] : void 0;
		return {
			text: r.message,
			color: i,
			timeout: r.timeout ?? t.defaults.timeout,
			[T]: {
				closable: r.closable ?? t.defaults.closable,
				actions: r.actions ?? []
			}
		};
	}
	function a(e, t) {
		n.value.push(i(e, t));
	}
	function o(e, t) {
		let n = { handler: t };
		return r.set(e, n), () => {
			r.get(e) === n && r.delete(e);
		};
	}
	function s(e) {
		r.delete(e);
	}
	async function c(e) {
		if (C(e)) {
			let t = r.get(e.name);
			t ? await t.handler(e.payload) : console.warn(`[inertia-vuetify-notifications] No handler registered for action: ${e.name}`);
			return;
		}
		let t = (e.method ?? "get").toLowerCase();
		v.visit(e.url, {
			method: t,
			data: e.data
		});
	}
	return {
		queue: n,
		notify: a,
		registerAction: o,
		unregisterAction: s,
		executeAction: c,
		options: t
	};
}
function k() {
	let e = s(E);
	if (!e) throw Error("[inertia-vuetify-notifications] useNotifications() must be used within a component tree that has the notification plugin installed. Did you forget to call app.use(inertiaVuetifyNotifications())?");
	return e;
}
function A(e, t) {
	let n = k().registerAction(e, t);
	o() && u(n);
}
// src/plugin.ts
function j(e = {}) {
	return { install(t) {
		let n = O(e);
		t.provide(E, n), typeof window < "u" && t.onUnmount(M(n));
	} };
}
function M(e) {
	let { flashKeys: t } = e.options, n = y(), r = /* @__PURE__ */ new Map(), i = !1, a = g([() => n.props, () => n.flash], ([e, n], [a]) => {
		i = e !== a;
		let o = N(n, t);
		r = new Map(Array.from(r).filter(([e, t]) => o.get(e)?.json === t));
	}, { flush: "sync" }), o = v.on("flash", (n) => {
		let a = N(n.detail.flash, t);
		for (let [t, { value: n, json: o }] of a) (i || r.get(t) !== o) && (P(n) ? e.notify(n, t) : console.warn(`[inertia-vuetify-notifications] Ignoring flash "${t}": expected a string or an object with a string "message".`));
		r = new Map(Array.from(a, ([e, { json: t }]) => [e, t])), i = !1;
	});
	return () => {
		a(), o();
	};
}
function N(e, t) {
	let n = /* @__PURE__ */ new Map();
	if (!e || typeof e != "object") return n;
	for (let r of t) {
		let t = e[r];
		t != null && t !== "" && n.set(r, {
			value: t,
			json: JSON.stringify(t)
		});
	}
	return n;
}
function P(e) {
	return typeof e == "string" || typeof e == "object" && !!e && typeof e.message == "string";
}
// src/components/NotificationProvider.vue
var F = /* @__PURE__ */ a({
	__name: "NotificationProvider",
	setup(a) {
		let { queue: o, executeAction: s, options: u } = k(), { t: f } = b();
		function g(e) {
			return (typeof e == "object" && e ? e[T] : void 0) ?? {
				closable: u.defaults.closable,
				actions: []
			};
		}
		async function v(e, t) {
			try {
				await s(e);
			} finally {
				t();
			}
		}
		return (a, s) => (d(), t(h(S), {
			modelValue: h(o),
			"onUpdate:modelValue": s[0] ||= (e) => c(o) ? o.value = e : null,
			location: h(u).defaults.location,
			timeout: h(u).defaults.timeout,
			"total-visible": h(u).defaults.totalVisible,
			"display-strategy": h(u).defaults.displayStrategy,
			gap: h(u).defaults.gap
		}, {
			actions: _(({ item: a, props: o }) => [(d(!0), r(e, null, p(g(a).actions, (e, n) => (d(), t(h(x), {
				key: n,
				variant: "text",
				size: "small",
				onClick: (t) => v(e, o.onClick)
			}, {
				default: _(() => [i(m(e.label), 1)]),
				_: 2
			}, 1032, ["onClick"]))), 128)), g(a).closable ? (d(), t(h(x), l({ key: 0 }, o, {
				icon: "$close",
				"aria-label": h(f)("$vuetify.dismiss")
			}), null, 16, ["aria-label"])) : n("", !0)]),
			_: 1
		}, 8, [
			"modelValue",
			"location",
			"timeout",
			"total-visible",
			"display-strategy",
			"gap"
		]));
	}
});
export { T as NOTIFICATION_META, F as NotificationProvider, j as inertiaVuetifyNotifications, C as isNamedAction, w as isUrlAction, A as useNotificationAction, k as useNotifications };
