//#region \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = (n, r, a) => (a = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule ? t(a, "default", {
	value: n,
	enumerable: !0
}) : a, n));
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_isPlaceholder.js
function l(e) {
	return typeof e == "object" && !!e && e["@@functional/placeholder"] === !0;
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_curry1.js
function u(e) {
	return function t(n) {
		return arguments.length === 0 || l(n) ? t : e.apply(this, arguments);
	};
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_curry2.js
function d(e) {
	return function t(n, r) {
		switch (arguments.length) {
			case 0: return t;
			case 1: return l(n) ? t : u(function(t) {
				return e(n, t);
			});
			default: return l(n) && l(r) ? t : l(n) ? u(function(t) {
				return e(t, r);
			}) : l(r) ? u(function(t) {
				return e(n, t);
			}) : e(n, r);
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_arity.js
function f(e, t) {
	switch (e) {
		case 0: return function() {
			return t.apply(this, arguments);
		};
		case 1: return function(e) {
			return t.apply(this, arguments);
		};
		case 2: return function(e, n) {
			return t.apply(this, arguments);
		};
		case 3: return function(e, n, r) {
			return t.apply(this, arguments);
		};
		case 4: return function(e, n, r, i) {
			return t.apply(this, arguments);
		};
		case 5: return function(e, n, r, i, a) {
			return t.apply(this, arguments);
		};
		case 6: return function(e, n, r, i, a, o) {
			return t.apply(this, arguments);
		};
		case 7: return function(e, n, r, i, a, o, s) {
			return t.apply(this, arguments);
		};
		case 8: return function(e, n, r, i, a, o, s, c) {
			return t.apply(this, arguments);
		};
		case 9: return function(e, n, r, i, a, o, s, c, l) {
			return t.apply(this, arguments);
		};
		case 10: return function(e, n, r, i, a, o, s, c, l, u) {
			return t.apply(this, arguments);
		};
		default: throw Error("First argument to _arity must be a non-negative integer no greater than ten");
	}
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_curryN.js
function p(e, t, n) {
	return function() {
		for (var r = [], i = 0, a = e, o = 0, s = !1; o < t.length || i < arguments.length;) {
			var c;
			o < t.length && (!l(t[o]) || i >= arguments.length) ? c = t[o] : (c = arguments[i], i += 1), r[o] = c, l(c) ? s = !0 : --a, o += 1;
		}
		return !s && a <= 0 ? n.apply(this, r) : f(Math.max(0, a), p(e, r, n));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/curryN.js
var ee = /* @__PURE__ */ d(function(e, t) {
	return e === 1 ? u(t) : f(e, p(e, [], t));
});
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_curry3.js
function te(e) {
	return function t(n, r, i) {
		switch (arguments.length) {
			case 0: return t;
			case 1: return l(n) ? t : d(function(t, r) {
				return e(n, t, r);
			});
			case 2: return l(n) && l(r) ? t : l(n) ? d(function(t, n) {
				return e(t, r, n);
			}) : l(r) ? d(function(t, r) {
				return e(n, t, r);
			}) : u(function(t) {
				return e(n, r, t);
			});
			default: return l(n) && l(r) && l(i) ? t : l(n) && l(r) ? d(function(t, n) {
				return e(t, n, i);
			}) : l(n) && l(i) ? d(function(t, n) {
				return e(t, r, n);
			}) : l(r) && l(i) ? d(function(t, r) {
				return e(n, t, r);
			}) : l(n) ? u(function(t) {
				return e(t, r, i);
			}) : l(r) ? u(function(t) {
				return e(n, t, i);
			}) : l(i) ? u(function(t) {
				return e(n, r, t);
			}) : e(n, r, i);
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_isArray.js
var ne = Array.isArray || function(e) {
	return e != null && e.length >= 0 && Object.prototype.toString.call(e) === "[object Array]";
};
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_isTransformer.js
function re(e) {
	return e != null && typeof e["@@transducer/step"] == "function";
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_dispatchable.js
function ie(e, t, n) {
	return function() {
		if (arguments.length === 0) return n();
		var r = arguments[arguments.length - 1];
		if (!ne(r)) {
			for (var i = 0; i < e.length;) {
				if (typeof r[e[i]] == "function") return r[e[i]].apply(r, Array.prototype.slice.call(arguments, 0, -1));
				i += 1;
			}
			if (re(r)) return t.apply(null, Array.prototype.slice.call(arguments, 0, -1))(r);
		}
		return n.apply(this, arguments);
	};
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_xfBase.js
var m = {
	init: function() {
		return this.xf["@@transducer/init"]();
	},
	result: function(e) {
		return this.xf["@@transducer/result"](e);
	}
};
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_arrayFromIterator.js
function ae(e) {
	for (var t = [], n; !(n = e.next()).done;) t.push(n.value);
	return t;
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_includesWith.js
function oe(e, t, n) {
	for (var r = 0, i = n.length; r < i;) {
		if (e(t, n[r])) return !0;
		r += 1;
	}
	return !1;
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_functionName.js
function se(e) {
	var t = String(e).match(/^function (\w*)/);
	return t == null ? "" : t[1];
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_has.js
function h(e, t) {
	return Object.prototype.hasOwnProperty.call(t, e);
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_objectIs.js
function ce(e, t) {
	return e === t ? e !== 0 || 1 / e == 1 / t : e !== e && t !== t;
}
var le = typeof Object.is == "function" ? Object.is : ce, ue = Object.prototype.toString, de = /* @__PURE__ */ function() {
	return ue.call(arguments) === "[object Arguments]" ? function(e) {
		return ue.call(e) === "[object Arguments]";
	} : function(e) {
		return h("callee", e);
	};
}(), fe = !/* @__PURE__ */ { toString: null }.propertyIsEnumerable("toString"), pe = [
	"constructor",
	"valueOf",
	"isPrototypeOf",
	"toString",
	"propertyIsEnumerable",
	"hasOwnProperty",
	"toLocaleString"
], me = /* @__PURE__ */ function() {
	return arguments.propertyIsEnumerable("length");
}(), he = function(e, t) {
	for (var n = 0; n < e.length;) {
		if (e[n] === t) return !0;
		n += 1;
	}
	return !1;
}, g = typeof Object.keys == "function" && !me ? /* @__PURE__ */ u(function(e) {
	return Object(e) === e ? Object.keys(e) : [];
}) : /* @__PURE__ */ u(function(e) {
	if (Object(e) !== e) return [];
	var t, n, r = [], i = me && de(e);
	for (t in e) h(t, e) && (!i || t !== "length") && (r[r.length] = t);
	if (fe) for (n = pe.length - 1; n >= 0;) t = pe[n], h(t, e) && !he(r, t) && (r[r.length] = t), --n;
	return r;
}), ge = /* @__PURE__ */ u(function(e) {
	return e === null ? "Null" : e === void 0 ? "Undefined" : Object.prototype.toString.call(e).slice(8, -1);
});
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_equals.js
function _e(e, t, n, r) {
	var i = ae(e), a = ae(t);
	function o(e, t) {
		return ve(e, t, n.slice(), r.slice());
	}
	return !oe(function(e, t) {
		return !oe(o, t, e);
	}, a, i);
}
function ve(e, t, n, r) {
	if (le(e, t)) return !0;
	var i = ge(e);
	if (i !== ge(t)) return !1;
	if (typeof e["fantasy-land/equals"] == "function" || typeof t["fantasy-land/equals"] == "function") return typeof e["fantasy-land/equals"] == "function" && e["fantasy-land/equals"](t) && typeof t["fantasy-land/equals"] == "function" && t["fantasy-land/equals"](e);
	if (typeof e.equals == "function" || typeof t.equals == "function") return typeof e.equals == "function" && e.equals(t) && typeof t.equals == "function" && t.equals(e);
	switch (i) {
		case "Arguments":
		case "Array":
		case "Object":
			if (typeof e.constructor == "function" && se(e.constructor) === "Promise") return e === t;
			break;
		case "Boolean":
		case "Number":
		case "String":
			if (!(typeof e == typeof t && le(e.valueOf(), t.valueOf()))) return !1;
			break;
		case "Date":
			if (!le(e.valueOf(), t.valueOf())) return !1;
			break;
		case "Error": return e.name === t.name && e.message === t.message;
		case "RegExp":
			if (!(e.source === t.source && e.global === t.global && e.ignoreCase === t.ignoreCase && e.multiline === t.multiline && e.sticky === t.sticky && e.unicode === t.unicode)) return !1;
			break;
	}
	for (var a = n.length - 1; a >= 0;) {
		if (n[a] === e) return r[a] === t;
		--a;
	}
	switch (i) {
		case "Map": return e.size === t.size ? _e(e.entries(), t.entries(), n.concat([e]), r.concat([t])) : !1;
		case "Set": return e.size === t.size ? _e(e.values(), t.values(), n.concat([e]), r.concat([t])) : !1;
		case "Arguments":
		case "Array":
		case "Object":
		case "Boolean":
		case "Number":
		case "String":
		case "Date":
		case "Error":
		case "RegExp":
		case "Int8Array":
		case "Uint8Array":
		case "Uint8ClampedArray":
		case "Int16Array":
		case "Uint16Array":
		case "Int32Array":
		case "Uint32Array":
		case "Float32Array":
		case "Float64Array":
		case "ArrayBuffer": break;
		default: return !1;
	}
	var o = g(e);
	if (o.length !== g(t).length) return !1;
	var s = n.concat([e]), c = r.concat([t]);
	for (a = o.length - 1; a >= 0;) {
		var l = o[a];
		if (!(h(l, t) && ve(t[l], e[l], s, c))) return !1;
		--a;
	}
	return !0;
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/equals.js
var ye = /* @__PURE__ */ d(function(e, t) {
	return ve(e, t, [], []);
});
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_map.js
function be(e, t) {
	for (var n = 0, r = t.length, i = Array(r); n < r;) i[n] = e(t[n]), n += 1;
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_arrayReduce.js
function xe(e, t, n) {
	for (var r = 0, i = n.length; r < i;) t = e(t, n[r]), r += 1;
	return t;
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_filter.js
function Se(e, t) {
	for (var n = 0, r = t.length, i = []; n < r;) e(t[n]) && (i[i.length] = t[n]), n += 1;
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_filterMap.js
function Ce(e, t) {
	for (var n = /* @__PURE__ */ new Map(), r = t.entries(), i = r.next(); !i.done;) e(i.value[1]) && n.set(i.value[0], i.value[1]), i = r.next();
	return n;
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_isMap.js
function we(e) {
	return Object.prototype.toString.call(e) === "[object Map]";
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_isObject.js
function Te(e) {
	return Object.prototype.toString.call(e) === "[object Object]";
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_xfilter.js
var Ee = /* @__PURE__ */ function() {
	function e(e, t) {
		this.xf = t, this.f = e;
	}
	return e.prototype["@@transducer/init"] = m.init, e.prototype["@@transducer/result"] = m.result, e.prototype["@@transducer/step"] = function(e, t) {
		return this.f(t) ? this.xf["@@transducer/step"](e, t) : e;
	}, e;
}();
function De(e) {
	return function(t) {
		return new Ee(e, t);
	};
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/filter.js
var Oe = /* @__PURE__ */ d(/* @__PURE__ */ ie(["fantasy-land/filter", "filter"], De, function(e, t) {
	return Te(t) ? xe(function(n, r) {
		return e(t[r]) && (n[r] = t[r]), n;
	}, {}, g(t)) : we(t) ? Ce(e, t) : Se(e, t);
})), ke = /* @__PURE__ */ function() {
	function e(e, t) {
		this.xf = t, this.f = e;
	}
	return e.prototype["@@transducer/init"] = m.init, e.prototype["@@transducer/result"] = m.result, e.prototype["@@transducer/step"] = function(e, t) {
		return this.xf["@@transducer/step"](e, this.f(t));
	}, e;
}(), Ae = function(e) {
	return function(t) {
		return new ke(e, t);
	};
}, je = /* @__PURE__ */ d(/* @__PURE__ */ ie(["fantasy-land/map", "map"], Ae, function(e, t) {
	switch (Object.prototype.toString.call(t)) {
		case "[object Function]": return ee(t.length, function() {
			return e.call(this, t.apply(this, arguments));
		});
		case "[object Object]": return xe(function(n, r) {
			return n[r] = e(t[r]), n;
		}, {}, g(t));
		default: return be(e, t);
	}
})), Me = Number.isInteger || function(e) {
	return e << 0 === e;
};
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_nth.js
function Ne(e, t) {
	return t[e < 0 ? t.length + e : e];
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_prop.js
function Pe(e, t) {
	if (t != null) return Me(e) ? Ne(e, t) : t[e];
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/prop.js
var Fe = /* @__PURE__ */ d(Pe);
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_isString.js
function Ie(e) {
	return Object.prototype.toString.call(e) === "[object String]";
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_isArrayLike.js
var Le = /* @__PURE__ */ u(function(e) {
	return ne(e) ? !0 : !e || typeof e != "object" || Ie(e) ? !1 : e.length === 0 ? !0 : e.length > 0 ? e.hasOwnProperty(0) && e.hasOwnProperty(e.length - 1) : !1;
}), Re = typeof Symbol < "u" ? Symbol.iterator : "@@iterator";
function ze(e, t, n) {
	return function(r, i, a) {
		if (Le(a)) return e(r, i, a);
		if (a == null) return i;
		if (typeof a["fantasy-land/reduce"] == "function") return t(r, i, a, "fantasy-land/reduce");
		if (a[Re] != null) return n(r, i, a[Re]());
		if (typeof a.next == "function") return n(r, i, a);
		if (typeof a.reduce == "function") return t(r, i, a, "reduce");
		throw TypeError("reduce: list must be array or iterable");
	};
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_xArrayReduce.js
function Be(e, t, n) {
	for (var r = 0, i = n.length; r < i;) {
		if (t = e["@@transducer/step"](t, n[r]), t && t["@@transducer/reduced"]) {
			t = t["@@transducer/value"];
			break;
		}
		r += 1;
	}
	return e["@@transducer/result"](t);
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/bind.js
var Ve = /* @__PURE__ */ d(function(e, t) {
	return f(e.length, function() {
		return e.apply(t, arguments);
	});
});
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_xReduce.js
function He(e, t, n) {
	for (var r = n.next(); !r.done;) {
		if (t = e["@@transducer/step"](t, r.value), t && t["@@transducer/reduced"]) {
			t = t["@@transducer/value"];
			break;
		}
		r = n.next();
	}
	return e["@@transducer/result"](t);
}
function Ue(e, t, n, r) {
	return e["@@transducer/result"](n[r](Ve(e["@@transducer/step"], e), t));
}
var We = /* @__PURE__ */ ze(Be, Ue, He), Ge = /* @__PURE__ */ u(function(e) {
	for (var t = g(e), n = t.length, r = [], i = 0; i < n;) r[i] = e[t[i]], i += 1;
	return r;
}), Ke = /* @__PURE__ */ u(function(e) {
	return ee(e.length, e);
});
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_makeFlat.js
function qe(e) {
	return function t(n) {
		for (var r, i, a, o = [], s = 0, c = n.length; s < c;) {
			if (Le(n[s])) for (r = e ? t(n[s]) : n[s], a = 0, i = r.length; a < i;) o[o.length] = r[a], a += 1;
			else o[o.length] = n[s];
			s += 1;
		}
		return o;
	};
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_forceReduced.js
function Je(e) {
	return {
		"@@transducer/value": e,
		"@@transducer/reduced": !0
	};
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_flatCat.js
var Ye = "@@transducer/init", Xe = "@@transducer/step", Ze = "@@transducer/result", Qe = /* @__PURE__ */ function() {
	function e(e) {
		this.xf = e;
	}
	return e.prototype[Ye] = m.init, e.prototype[Ze] = m.result, e.prototype[Xe] = function(e, t) {
		var n = this.xf[Xe](e, t);
		return n["@@transducer/reduced"] ? Je(n) : n;
	}, e;
}(), $e = /* @__PURE__ */ function() {
	function e(e) {
		this.xf = new Qe(e);
	}
	return e.prototype[Ye] = m.init, e.prototype[Ze] = m.result, e.prototype[Xe] = function(e, t) {
		return Le(t) ? We(this.xf, e, t) : Be(this.xf, e, [t]);
	}, e;
}(), et = function(e) {
	return new $e(e);
};
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_xchain.js
function tt(e) {
	return function(t) {
		return Ae(e)(et(t));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/chain.js
var nt = /* @__PURE__ */ d(/* @__PURE__ */ ie(["fantasy-land/chain", "chain"], tt, function(e, t) {
	return typeof t == "function" ? function(n) {
		return e(t(n))(n);
	} : qe(!1)(je(e, t));
}));
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_isTypedArray.js
function rt(e) {
	var t = Object.prototype.toString.call(e);
	return t === "[object Uint8ClampedArray]" || t === "[object Int8Array]" || t === "[object Uint8Array]" || t === "[object Int16Array]" || t === "[object Uint16Array]" || t === "[object Int32Array]" || t === "[object Uint32Array]" || t === "[object Float32Array]" || t === "[object Float64Array]" || t === "[object BigInt64Array]" || t === "[object BigUint64Array]";
}
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/empty.js
var it = /* @__PURE__ */ u(function(e) {
	return e != null && typeof e["fantasy-land/empty"] == "function" ? e["fantasy-land/empty"]() : e != null && e.constructor != null && typeof e.constructor["fantasy-land/empty"] == "function" ? e.constructor["fantasy-land/empty"]() : e != null && typeof e.empty == "function" ? e.empty() : e != null && e.constructor != null && typeof e.constructor.empty == "function" ? e.constructor.empty() : e == Set || e instanceof Set ? /* @__PURE__ */ new Set() : e == Map || e instanceof Map ? /* @__PURE__ */ new Map() : ne(e) ? [] : Ie(e) ? "" : Te(e) ? {} : de(e) ? function() {
		return arguments;
	}() : rt(e) ? e.constructor.from("") : void 0;
});
//#endregion
//#region ../../node_modules/.pnpm/ramda@0.32.0/node_modules/ramda/es/internal/_objectAssign.js
function at(e) {
	if (e == null) throw TypeError("Cannot convert undefined or null to object");
	for (var t = Object(e), n = 1, r = arguments.length; n < r;) {
		var i = arguments[n];
		if (i != null) for (var a in i) h(a, i) && (t[a] = i[a]);
		n += 1;
	}
	return t;
}
var ot = typeof Object.assign == "function" ? Object.assign : at, st = /* @__PURE__ */ u(function(e) {
	return e != null && ye(e, it(e));
}), ct = /* @__PURE__ */ te(function(e, t, n) {
	var r = {}, i;
	for (i in t ||= {}, n ||= {}, t) h(i, t) && (r[i] = h(i, n) ? e(i, t[i], n[i]) : t[i]);
	for (i in n) h(i, n) && !h(i, r) && (r[i] = n[i]);
	return r;
}), lt = /* @__PURE__ */ te(function e(t, n, r) {
	return ct(function(n, r, i) {
		return Te(r) && Te(i) ? e(t, r, i) : t(n, r, i);
	}, n, r);
}), ut = /* @__PURE__ */ d(function(e, t) {
	return lt(function(e, t, n) {
		return n;
	}, e, t);
}), dt = /* @__PURE__ */ d(function(e, t) {
	return ot({}, e, t);
}), ft = /* @__PURE__ */ d(function(e, t) {
	for (var n = {}, r = {}, i = 0, a = e.length; i < a;) r[e[i]] = 1, i += 1;
	for (var o in t) r.hasOwnProperty(o) || (n[o] = t[o]);
	return n;
}), pt = /* @__PURE__ */ d(function(e, t) {
	for (var n = 0, r = Math.min(e.length, t.length), i = {}; n < r;) i[e[n]] = t[n], n += 1;
	return i;
}), mt = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict", ht = (e) => crypto.getRandomValues(new Uint8Array(e)), gt = (e, t, n) => {
	let r = (2 << Math.log2(e.length - 1)) - 1, i = -~(1.6 * r * t / e.length);
	return (a = t) => {
		let o = "";
		for (;;) {
			let t = n(i), s = i | 0;
			for (; s--;) if (o += e[t[s] & r] || "", o.length >= a) return o;
		}
	};
}, _t = (e, t = 21) => gt(e, t | 0, ht), vt = (e = 21) => {
	let t = "", n = crypto.getRandomValues(new Uint8Array(e |= 0));
	for (; e--;) t += mt[n[e] & 63];
	return t;
};
Object.freeze({ status: "aborted" });
function _(e, t, n) {
	function r(n, r) {
		if (n._zod || Object.defineProperty(n, "_zod", {
			value: {
				def: r,
				constr: o,
				traits: /* @__PURE__ */ new Set()
			},
			enumerable: !1
		}), n._zod.traits.has(e)) return;
		n._zod.traits.add(e), t(n, r);
		let i = o.prototype, a = Object.keys(i);
		for (let e = 0; e < a.length; e++) {
			let t = a[e];
			t in n || (n[t] = i[t].bind(n));
		}
	}
	let i = n?.Parent ?? Object;
	class a extends i {}
	Object.defineProperty(a, "name", { value: e });
	function o(e) {
		var t;
		let i = n?.Parent ? new a() : this;
		r(i, e), (t = i._zod).deferred ?? (t.deferred = []);
		for (let e of i._zod.deferred) e();
		return i;
	}
	return Object.defineProperty(o, "init", { value: r }), Object.defineProperty(o, Symbol.hasInstance, { value: (t) => n?.Parent && t instanceof n.Parent ? !0 : t?._zod?.traits?.has(e) }), Object.defineProperty(o, "name", { value: e }), o;
}
var v = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, yt = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
}, bt = {};
function y(e) {
	return e && Object.assign(bt, e), bt;
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/util.js
function xt(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function St(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
function Ct(e) {
	return { get value() {
		{
			let t = e();
			return Object.defineProperty(this, "value", { value: t }), t;
		}
		throw Error("cached value already set");
	} };
}
function wt(e) {
	return e == null;
}
function Tt(e) {
	let t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function Et(e, t) {
	let n = (e.toString().split(".")[1] || "").length, r = t.toString(), i = (r.split(".")[1] || "").length;
	if (i === 0 && /\d?e-\d?/.test(r)) {
		let e = r.match(/\d?e-(\d?)/);
		e?.[1] && (i = Number.parseInt(e[1]));
	}
	let a = n > i ? n : i;
	return Number.parseInt(e.toFixed(a).replace(".", "")) % Number.parseInt(t.toFixed(a).replace(".", "")) / 10 ** a;
}
var Dt = Symbol("evaluating");
function b(e, t, n) {
	let r;
	Object.defineProperty(e, t, {
		get() {
			if (r !== Dt) return r === void 0 && (r = Dt, r = n()), r;
		},
		set(n) {
			Object.defineProperty(e, t, { value: n });
		},
		configurable: !0
	});
}
function x(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function S(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function Ot(e) {
	return JSON.stringify(e);
}
function kt(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var At = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function C(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var jt = Ct(() => {
	if (typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function w(e) {
	if (C(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return !(C(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function Mt(e) {
	return w(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
var Nt = new Set([
	"string",
	"number",
	"symbol"
]);
function T(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function E(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function D(e) {
	let t = e;
	if (!t) return {};
	if (typeof t == "string") return { error: () => t };
	if (t?.message !== void 0) {
		if (t?.error !== void 0) throw Error("Cannot specify both `message` and `error` params");
		t.error = t.message;
	}
	return delete t.message, typeof t.error == "string" ? {
		...t,
		error: () => t.error
	} : t;
}
function Pt(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
var Ft = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function It(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	return E(e, S(e._zod.def, {
		get shape() {
			let e = {};
			for (let r in t) {
				if (!(r in n.shape)) throw Error(`Unrecognized key: "${r}"`);
				t[r] && (e[r] = n.shape[r]);
			}
			return x(this, "shape", e), e;
		},
		checks: []
	}));
}
function Lt(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	return E(e, S(e._zod.def, {
		get shape() {
			let r = { ...e._zod.def.shape };
			for (let e in t) {
				if (!(e in n.shape)) throw Error(`Unrecognized key: "${e}"`);
				t[e] && delete r[e];
			}
			return x(this, "shape", r), r;
		},
		checks: []
	}));
}
function Rt(e, t) {
	if (!w(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = e._zod.def.shape;
		for (let e in t) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return E(e, S(e._zod.def, { get shape() {
		let n = {
			...e._zod.def.shape,
			...t
		};
		return x(this, "shape", n), n;
	} }));
}
function zt(e, t) {
	if (!w(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return E(e, S(e._zod.def, { get shape() {
		let n = {
			...e._zod.def.shape,
			...t
		};
		return x(this, "shape", n), n;
	} }));
}
function Bt(e, t) {
	return E(e, S(e._zod.def, {
		get shape() {
			let n = {
				...e._zod.def.shape,
				...t._zod.def.shape
			};
			return x(this, "shape", n), n;
		},
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: []
	}));
}
function Vt(e, t, n) {
	let r = t._zod.def.checks;
	if (r && r.length > 0) throw Error(".partial() cannot be used on object schemas containing refinements");
	return E(t, S(t._zod.def, {
		get shape() {
			let r = t._zod.def.shape, i = { ...r };
			if (n) for (let t in n) {
				if (!(t in r)) throw Error(`Unrecognized key: "${t}"`);
				n[t] && (i[t] = e ? new e({
					type: "optional",
					innerType: r[t]
				}) : r[t]);
			}
			else for (let t in r) i[t] = e ? new e({
				type: "optional",
				innerType: r[t]
			}) : r[t];
			return x(this, "shape", i), i;
		},
		checks: []
	}));
}
function Ht(e, t, n) {
	return E(t, S(t._zod.def, { get shape() {
		let r = t._zod.def.shape, i = { ...r };
		if (n) for (let t in n) {
			if (!(t in i)) throw Error(`Unrecognized key: "${t}"`);
			n[t] && (i[t] = new e({
				type: "nonoptional",
				innerType: r[t]
			}));
		}
		else for (let t in r) i[t] = new e({
			type: "nonoptional",
			innerType: r[t]
		});
		return x(this, "shape", i), i;
	} }));
}
function O(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function k(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function A(e) {
	return typeof e == "string" ? e : e?.message;
}
function j(e, t, n) {
	let r = {
		...e,
		path: e.path ?? []
	};
	return e.message || (r.message = A(e.inst?._zod.def?.error?.(e)) ?? A(t?.error?.(e)) ?? A(n.customError?.(e)) ?? A(n.localeError?.(e)) ?? "Invalid input"), delete r.inst, delete r.continue, t?.reportInput || delete r.input, r;
}
function Ut(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function M(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/errors.js
var Wt = (e, t) => {
	e.name = "$ZodError", Object.defineProperty(e, "_zod", {
		value: e._zod,
		enumerable: !1
	}), Object.defineProperty(e, "issues", {
		value: t,
		enumerable: !1
	}), e.message = JSON.stringify(t, St, 2), Object.defineProperty(e, "toString", {
		value: () => e.message,
		enumerable: !1
	});
}, Gt = _("$ZodError", Wt), Kt = _("$ZodError", Wt, { Parent: Error });
function qt(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? (n[i.path[0]] = n[i.path[0]] || [], n[i.path[0]].push(t(i))) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function Jt(e, t = (e) => e.message) {
	let n = { _errors: [] }, r = (e) => {
		for (let i of e.issues) if (i.code === "invalid_union" && i.errors.length) i.errors.map((e) => r({ issues: e }));
		else if (i.code === "invalid_key") r({ issues: i.issues });
		else if (i.code === "invalid_element") r({ issues: i.issues });
		else if (i.path.length === 0) n._errors.push(t(i));
		else {
			let e = n, r = 0;
			for (; r < i.path.length;) {
				let n = i.path[r];
				r === i.path.length - 1 ? (e[n] = e[n] || { _errors: [] }, e[n]._errors.push(t(i))) : e[n] = e[n] || { _errors: [] }, e = e[n], r++;
			}
		}
	};
	return r(e), n;
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/parse.js
var Yt = (e) => (t, n, r, i) => {
	let a = r ? Object.assign(r, { async: !1 }) : { async: !1 }, o = t._zod.run({
		value: n,
		issues: []
	}, a);
	if (o instanceof Promise) throw new v();
	if (o.issues.length) {
		let t = new (i?.Err ?? e)(o.issues.map((e) => j(e, a, y())));
		throw At(t, i?.callee), t;
	}
	return o.value;
}, Xt = (e) => async (t, n, r, i) => {
	let a = r ? Object.assign(r, { async: !0 }) : { async: !0 }, o = t._zod.run({
		value: n,
		issues: []
	}, a);
	if (o instanceof Promise && (o = await o), o.issues.length) {
		let t = new (i?.Err ?? e)(o.issues.map((e) => j(e, a, y())));
		throw At(t, i?.callee), t;
	}
	return o.value;
}, Zt = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new v();
	return a.issues.length ? {
		success: !1,
		error: new (e ?? Gt)(a.issues.map((e) => j(e, i, y())))
	} : {
		success: !0,
		data: a.value
	};
}, Qt = /* @__PURE__ */ Zt(Kt), N = (e) => async (t, n, r) => {
	let i = r ? Object.assign(r, { async: !0 }) : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? {
		success: !1,
		error: new e(a.issues.map((e) => j(e, i, y())))
	} : {
		success: !0,
		data: a.value
	};
}, $t = /* @__PURE__ */ N(Kt), en = (e) => (t, n, r) => {
	let i = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
	return Yt(e)(t, n, i);
}, tn = (e) => (t, n, r) => Yt(e)(t, n, r), nn = (e) => async (t, n, r) => {
	let i = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
	return Xt(e)(t, n, i);
}, rn = (e) => async (t, n, r) => Xt(e)(t, n, r), an = (e) => (t, n, r) => {
	let i = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
	return Zt(e)(t, n, i);
}, on = (e) => (t, n, r) => Zt(e)(t, n, r), sn = (e) => async (t, n, r) => {
	let i = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
	return N(e)(t, n, i);
}, cn = (e) => async (t, n, r) => N(e)(t, n, r), ln = /^[cC][^\s-]{8,}$/, un = /^[0-9a-z]+$/, dn = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, fn = /^[0-9a-vA-V]{20}$/, pn = /^[A-Za-z0-9]{27}$/, mn = /^[a-zA-Z0-9_-]{21}$/, hn = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, gn = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, _n = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, vn = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, yn = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function bn() {
	return new RegExp(yn, "u");
}
var xn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Sn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Cn = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, wn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Tn = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, En = /^[A-Za-z0-9_-]*$/, Dn = /^\+[1-9]\d{6,14}$/, On = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", kn = /* @__PURE__ */ RegExp(`^${On}$`);
function An(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function jn(e) {
	return RegExp(`^${An(e)}$`);
}
function Mn(e) {
	let t = An({ precision: e.precision }), n = ["Z"];
	e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let r = `${t}(?:${n.join("|")})`;
	return RegExp(`^${On}T(?:${r})$`);
}
var Nn = (e) => {
	let t = e ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ""}}` : "[\\s\\S]*";
	return RegExp(`^${t}$`);
}, Pn = /^-?\d+$/, Fn = /^-?\d+(?:\.\d+)?$/, In = /^(?:true|false)$/i, Ln = /^[^A-Z]*$/, Rn = /^[^a-z]*$/, P = /* @__PURE__ */ _("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), zn = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, Bn = /* @__PURE__ */ _("$ZodCheckLessThan", (e, t) => {
	P.init(e, t);
	let n = zn[typeof t.value];
	e._zod.onattach.push((e) => {
		let n = e._zod.bag, r = (t.inclusive ? n.maximum : n.exclusiveMaximum) ?? Infinity;
		t.value < r && (t.inclusive ? n.maximum = t.value : n.exclusiveMaximum = t.value);
	}), e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Vn = /* @__PURE__ */ _("$ZodCheckGreaterThan", (e, t) => {
	P.init(e, t);
	let n = zn[typeof t.value];
	e._zod.onattach.push((e) => {
		let n = e._zod.bag, r = (t.inclusive ? n.minimum : n.exclusiveMinimum) ?? -Infinity;
		t.value > r && (t.inclusive ? n.minimum = t.value : n.exclusiveMinimum = t.value);
	}), e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Hn = /* @__PURE__ */ _("$ZodCheckMultipleOf", (e, t) => {
	P.init(e, t), e._zod.onattach.push((e) => {
		var n;
		(n = e._zod.bag).multipleOf ?? (n.multipleOf = t.value);
	}), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : Et(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Un = /* @__PURE__ */ _("$ZodCheckNumberFormat", (e, t) => {
	P.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = Ft[t.format];
	e._zod.onattach.push((e) => {
		let r = e._zod.bag;
		r.format = t.format, r.minimum = i, r.maximum = a, n && (r.pattern = Pn);
	}), e._zod.check = (o) => {
		let s = o.value;
		if (n) {
			if (!Number.isInteger(s)) {
				o.issues.push({
					expected: r,
					format: t.format,
					code: "invalid_type",
					continue: !1,
					input: s,
					inst: e
				});
				return;
			}
			if (!Number.isSafeInteger(s)) {
				s > 0 ? o.issues.push({
					input: s,
					code: "too_big",
					maximum: 2 ** 53 - 1,
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				}) : o.issues.push({
					input: s,
					code: "too_small",
					minimum: -(2 ** 53 - 1),
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				});
				return;
			}
		}
		s < i && o.issues.push({
			origin: "number",
			input: s,
			code: "too_small",
			minimum: i,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		}), s > a && o.issues.push({
			origin: "number",
			input: s,
			code: "too_big",
			maximum: a,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		});
	};
}), Wn = /* @__PURE__ */ _("$ZodCheckMaxLength", (e, t) => {
	var n;
	P.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !wt(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.maximum ?? Infinity;
		t.maximum < n && (e._zod.bag.maximum = t.maximum);
	}), e._zod.check = (n) => {
		let r = n.value;
		if (r.length <= t.maximum) return;
		let i = Ut(r);
		n.issues.push({
			origin: i,
			code: "too_big",
			maximum: t.maximum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), Gn = /* @__PURE__ */ _("$ZodCheckMinLength", (e, t) => {
	var n;
	P.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !wt(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.minimum ?? -Infinity;
		t.minimum > n && (e._zod.bag.minimum = t.minimum);
	}), e._zod.check = (n) => {
		let r = n.value;
		if (r.length >= t.minimum) return;
		let i = Ut(r);
		n.issues.push({
			origin: i,
			code: "too_small",
			minimum: t.minimum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), Kn = /* @__PURE__ */ _("$ZodCheckLengthEquals", (e, t) => {
	var n;
	P.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !wt(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.minimum = t.length, n.maximum = t.length, n.length = t.length;
	}), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if (i === t.length) return;
		let a = Ut(r), o = i > t.length;
		n.issues.push({
			origin: a,
			...o ? {
				code: "too_big",
				maximum: t.length
			} : {
				code: "too_small",
				minimum: t.length
			},
			inclusive: !0,
			exact: !0,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), F = /* @__PURE__ */ _("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	P.init(e, t), e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.format = t.format, t.pattern && (n.patterns ??= /* @__PURE__ */ new Set(), n.patterns.add(t.pattern));
	}), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: t.format,
			input: n.value,
			...t.pattern ? { pattern: t.pattern.toString() } : {},
			inst: e,
			continue: !t.abort
		});
	}) : (r = e._zod).check ?? (r.check = () => {});
}), qn = /* @__PURE__ */ _("$ZodCheckRegex", (e, t) => {
	F.init(e, t), e._zod.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: n.value,
			pattern: t.pattern.toString(),
			inst: e,
			continue: !t.abort
		});
	};
}), Jn = /* @__PURE__ */ _("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= Ln, F.init(e, t);
}), Yn = /* @__PURE__ */ _("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= Rn, F.init(e, t);
}), Xn = /* @__PURE__ */ _("$ZodCheckIncludes", (e, t) => {
	P.init(e, t);
	let n = T(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
	t.pattern = r, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(r);
	}), e._zod.check = (n) => {
		n.value.includes(t.includes, t.position) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: t.includes,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Zn = /* @__PURE__ */ _("$ZodCheckStartsWith", (e, t) => {
	P.init(e, t);
	let n = RegExp(`^${T(t.prefix)}.*`);
	t.pattern ??= n, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(n);
	}), e._zod.check = (n) => {
		n.value.startsWith(t.prefix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: t.prefix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Qn = /* @__PURE__ */ _("$ZodCheckEndsWith", (e, t) => {
	P.init(e, t);
	let n = RegExp(`.*${T(t.suffix)}$`);
	t.pattern ??= n, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(n);
	}), e._zod.check = (n) => {
		n.value.endsWith(t.suffix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: t.suffix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), $n = /* @__PURE__ */ _("$ZodCheckOverwrite", (e, t) => {
	P.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), er = class {
	constructor(e = []) {
		this.content = [], this.indent = 0, this && (this.args = e);
	}
	indented(e) {
		this.indent += 1, e(this), --this.indent;
	}
	write(e) {
		if (typeof e == "function") {
			e(this, { execution: "sync" }), e(this, { execution: "async" });
			return;
		}
		let t = e.split("\n").filter((e) => e), n = Math.min(...t.map((e) => e.length - e.trimStart().length)), r = t.map((e) => e.slice(n)).map((e) => " ".repeat(this.indent * 2) + e);
		for (let e of r) this.content.push(e);
	}
	compile() {
		let e = Function, t = this?.args, n = [...(this?.content ?? [""]).map((e) => `  ${e}`)];
		return new e(...t, n.join("\n"));
	}
}, tr = {
	major: 4,
	minor: 3,
	patch: 6
}, I = /* @__PURE__ */ _("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = tr;
	let r = [...e._zod.def.checks ?? []];
	e._zod.traits.has("$ZodCheck") && r.unshift(e);
	for (let t of r) for (let n of t._zod.onattach) n(e);
	if (r.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (e, t, n) => {
			let r = O(e), i;
			for (let a of t) {
				if (a._zod.def.when) {
					if (!a._zod.def.when(e)) continue;
				} else if (r) continue;
				let t = e.issues.length, o = a._zod.check(e);
				if (o instanceof Promise && n?.async === !1) throw new v();
				if (i || o instanceof Promise) i = (i ?? Promise.resolve()).then(async () => {
					await o, e.issues.length !== t && (r ||= O(e, t));
				});
				else {
					if (e.issues.length === t) continue;
					r ||= O(e, t);
				}
			}
			return i ? i.then(() => e) : e;
		}, n = (n, i, a) => {
			if (O(n)) return n.aborted = !0, n;
			let o = t(i, r, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new v();
				return o.then((t) => e._zod.parse(t, a));
			}
			return e._zod.parse(o, a);
		};
		e._zod.run = (i, a) => {
			if (a.skipChecks) return e._zod.parse(i, a);
			if (a.direction === "backward") {
				let t = e._zod.parse({
					value: i.value,
					issues: []
				}, {
					...a,
					skipChecks: !0
				});
				return t instanceof Promise ? t.then((e) => n(e, i, a)) : n(t, i, a);
			}
			let o = e._zod.parse(i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new v();
				return o.then((e) => t(e, r, a));
			}
			return t(o, r, a);
		};
	}
	b(e, "~standard", () => ({
		validate: (t) => {
			try {
				let n = Qt(e, t);
				return n.success ? { value: n.data } : { issues: n.error?.issues };
			} catch {
				return $t(e, t).then((e) => e.success ? { value: e.data } : { issues: e.error?.issues });
			}
		},
		vendor: "zod",
		version: 1
	}));
}), nr = /* @__PURE__ */ _("$ZodString", (e, t) => {
	I.init(e, t), e._zod.pattern = [...e?._zod.bag?.patterns ?? []].pop() ?? Nn(e._zod.bag), e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = String(n.value);
		} catch {}
		return typeof n.value == "string" || n.issues.push({
			expected: "string",
			code: "invalid_type",
			input: n.value,
			inst: e
		}), n;
	};
}), L = /* @__PURE__ */ _("$ZodStringFormat", (e, t) => {
	F.init(e, t), nr.init(e, t);
}), rr = /* @__PURE__ */ _("$ZodGUID", (e, t) => {
	t.pattern ??= gn, L.init(e, t);
}), ir = /* @__PURE__ */ _("$ZodUUID", (e, t) => {
	if (t.version) {
		let e = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[t.version];
		if (e === void 0) throw Error(`Invalid UUID version: "${t.version}"`);
		t.pattern ??= _n(e);
	} else t.pattern ??= _n();
	L.init(e, t);
}), ar = /* @__PURE__ */ _("$ZodEmail", (e, t) => {
	t.pattern ??= vn, L.init(e, t);
}), or = /* @__PURE__ */ _("$ZodURL", (e, t) => {
	L.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = new URL(r);
			t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(i.hostname) || n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			})), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(i.protocol.endsWith(":") ? i.protocol.slice(0, -1) : i.protocol) || n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			})), t.normalize ? n.value = i.href : n.value = r;
			return;
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "url",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), sr = /* @__PURE__ */ _("$ZodEmoji", (e, t) => {
	t.pattern ??= bn(), L.init(e, t);
}), cr = /* @__PURE__ */ _("$ZodNanoID", (e, t) => {
	t.pattern ??= mn, L.init(e, t);
}), lr = /* @__PURE__ */ _("$ZodCUID", (e, t) => {
	t.pattern ??= ln, L.init(e, t);
}), ur = /* @__PURE__ */ _("$ZodCUID2", (e, t) => {
	t.pattern ??= un, L.init(e, t);
}), dr = /* @__PURE__ */ _("$ZodULID", (e, t) => {
	t.pattern ??= dn, L.init(e, t);
}), fr = /* @__PURE__ */ _("$ZodXID", (e, t) => {
	t.pattern ??= fn, L.init(e, t);
}), pr = /* @__PURE__ */ _("$ZodKSUID", (e, t) => {
	t.pattern ??= pn, L.init(e, t);
}), mr = /* @__PURE__ */ _("$ZodISODateTime", (e, t) => {
	t.pattern ??= Mn(t), L.init(e, t);
}), hr = /* @__PURE__ */ _("$ZodISODate", (e, t) => {
	t.pattern ??= kn, L.init(e, t);
}), gr = /* @__PURE__ */ _("$ZodISOTime", (e, t) => {
	t.pattern ??= jn(t), L.init(e, t);
}), _r = /* @__PURE__ */ _("$ZodISODuration", (e, t) => {
	t.pattern ??= hn, L.init(e, t);
}), vr = /* @__PURE__ */ _("$ZodIPv4", (e, t) => {
	t.pattern ??= xn, L.init(e, t), e._zod.bag.format = "ipv4";
}), yr = /* @__PURE__ */ _("$ZodIPv6", (e, t) => {
	t.pattern ??= Sn, L.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
		try {
			new URL(`http://[${n.value}]`);
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "ipv6",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), br = /* @__PURE__ */ _("$ZodCIDRv4", (e, t) => {
	t.pattern ??= Cn, L.init(e, t);
}), xr = /* @__PURE__ */ _("$ZodCIDRv6", (e, t) => {
	t.pattern ??= wn, L.init(e, t), e._zod.check = (n) => {
		let r = n.value.split("/");
		try {
			if (r.length !== 2) throw Error();
			let [e, t] = r;
			if (!t) throw Error();
			let n = Number(t);
			if (`${n}` !== t || n < 0 || n > 128) throw Error();
			new URL(`http://[${e}]`);
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "cidrv6",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
});
function Sr(e) {
	if (e === "") return !0;
	if (e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var Cr = /* @__PURE__ */ _("$ZodBase64", (e, t) => {
	t.pattern ??= Tn, L.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
		Sr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function wr(e) {
	if (!En.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return Sr(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var Tr = /* @__PURE__ */ _("$ZodBase64URL", (e, t) => {
	t.pattern ??= En, L.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
		wr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Er = /* @__PURE__ */ _("$ZodE164", (e, t) => {
	t.pattern ??= Dn, L.init(e, t);
});
function Dr(e, t = null) {
	try {
		let n = e.split(".");
		if (n.length !== 3) return !1;
		let [r] = n;
		if (!r) return !1;
		let i = JSON.parse(atob(r));
		return !("typ" in i && i?.typ !== "JWT" || !i.alg || t && (!("alg" in i) || i.alg !== t));
	} catch {
		return !1;
	}
}
var Or = /* @__PURE__ */ _("$ZodJWT", (e, t) => {
	L.init(e, t), e._zod.check = (n) => {
		Dr(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), kr = /* @__PURE__ */ _("$ZodNumber", (e, t) => {
	I.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? Fn, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = Number(n.value);
		} catch {}
		let i = n.value;
		if (typeof i == "number" && !Number.isNaN(i) && Number.isFinite(i)) return n;
		let a = typeof i == "number" ? Number.isNaN(i) ? "NaN" : Number.isFinite(i) ? void 0 : "Infinity" : void 0;
		return n.issues.push({
			expected: "number",
			code: "invalid_type",
			input: i,
			inst: e,
			...a ? { received: a } : {}
		}), n;
	};
}), Ar = /* @__PURE__ */ _("$ZodNumberFormat", (e, t) => {
	Un.init(e, t), kr.init(e, t);
}), jr = /* @__PURE__ */ _("$ZodBoolean", (e, t) => {
	I.init(e, t), e._zod.pattern = In, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = !!n.value;
		} catch {}
		let i = n.value;
		return typeof i == "boolean" || n.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
	};
}), Mr = /* @__PURE__ */ _("$ZodUnknown", (e, t) => {
	I.init(e, t), e._zod.parse = (e) => e;
}), Nr = /* @__PURE__ */ _("$ZodNever", (e, t) => {
	I.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function Pr(e, t, n) {
	e.issues.length && t.issues.push(...k(n, e.issues)), t.value[n] = e.value;
}
var Fr = /* @__PURE__ */ _("$ZodArray", (e, t) => {
	I.init(e, t), e._zod.parse = (n, r) => {
		let i = n.value;
		if (!Array.isArray(i)) return n.issues.push({
			expected: "array",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
		n.value = Array(i.length);
		let a = [];
		for (let e = 0; e < i.length; e++) {
			let o = i[e], s = t.element._zod.run({
				value: o,
				issues: []
			}, r);
			s instanceof Promise ? a.push(s.then((t) => Pr(t, n, e))) : Pr(s, n, e);
		}
		return a.length ? Promise.all(a).then(() => n) : n;
	};
});
function R(e, t, n, r, i) {
	if (e.issues.length) {
		if (i && !(n in r)) return;
		t.issues.push(...k(n, e.issues));
	}
	e.value === void 0 ? n in r && (t.value[n] = void 0) : t.value[n] = e.value;
}
function Ir(e) {
	let t = Object.keys(e.shape);
	for (let n of t) if (!e.shape?.[n]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${n}": expected a Zod schema`);
	let n = Pt(e.shape);
	return {
		...e,
		keys: t,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(n)
	};
}
function Lr(e, t, n, r, i, a) {
	let o = [], s = i.keySet, c = i.catchall._zod, l = c.def.type, u = c.optout === "optional";
	for (let i in t) {
		if (s.has(i)) continue;
		if (l === "never") {
			o.push(i);
			continue;
		}
		let a = c.run({
			value: t[i],
			issues: []
		}, r);
		a instanceof Promise ? e.push(a.then((e) => R(e, n, i, t, u))) : R(a, n, i, t, u);
	}
	return o.length && n.issues.push({
		code: "unrecognized_keys",
		keys: o,
		input: t,
		inst: a
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var Rr = /* @__PURE__ */ _("$ZodObject", (e, t) => {
	if (I.init(e, t), !Object.getOwnPropertyDescriptor(t, "shape")?.get) {
		let e = t.shape;
		Object.defineProperty(t, "shape", { get: () => {
			let n = { ...e };
			return Object.defineProperty(t, "shape", { value: n }), n;
		} });
	}
	let n = Ct(() => Ir(t));
	b(e._zod, "propValues", () => {
		let e = t.shape, n = {};
		for (let t in e) {
			let r = e[t]._zod;
			if (r.values) {
				n[t] ?? (n[t] = /* @__PURE__ */ new Set());
				for (let e of r.values) n[t].add(e);
			}
		}
		return n;
	});
	let r = C, i = t.catchall, a;
	e._zod.parse = (t, o) => {
		a ??= n.value;
		let s = t.value;
		if (!r(s)) return t.issues.push({
			expected: "object",
			code: "invalid_type",
			input: s,
			inst: e
		}), t;
		t.value = {};
		let c = [], l = a.shape;
		for (let e of a.keys) {
			let n = l[e], r = n._zod.optout === "optional", i = n._zod.run({
				value: s[e],
				issues: []
			}, o);
			i instanceof Promise ? c.push(i.then((n) => R(n, t, e, s, r))) : R(i, t, e, s, r);
		}
		return i ? Lr(c, s, t, o, n.value, e) : c.length ? Promise.all(c).then(() => t) : t;
	};
}), zr = /* @__PURE__ */ _("$ZodObjectJIT", (e, t) => {
	Rr.init(e, t);
	let n = e._zod.parse, r = Ct(() => Ir(t)), i = (e) => {
		let t = new er([
			"shape",
			"payload",
			"ctx"
		]), n = r.value, i = (e) => {
			let t = Ot(e);
			return `shape[${t}]._zod.run({ value: input[${t}], issues: [] }, ctx)`;
		};
		t.write("const input = payload.value;");
		let a = Object.create(null), o = 0;
		for (let e of n.keys) a[e] = `key_${o++}`;
		t.write("const newResult = {};");
		for (let r of n.keys) {
			let n = a[r], o = Ot(r), s = e[r]?._zod?.optout === "optional";
			t.write(`const ${n} = ${i(r)};`), s ? t.write(`
        if (${n}.issues.length) {
          if (${o} in input) {
            payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${o}, ...iss.path] : [${o}]
            })));
          }
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `) : t.write(`
        if (${n}.issues.length) {
          payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${o}, ...iss.path] : [${o}]
          })));
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `);
		}
		t.write("payload.value = newResult;"), t.write("return payload;");
		let s = t.compile();
		return (t, n) => s(e, t, n);
	}, a, o = C, s = !bt.jitless, c = s && jt.value, l = t.catchall, u;
	e._zod.parse = (d, f) => {
		u ??= r.value;
		let p = d.value;
		return o(p) ? s && c && f?.async === !1 && f.jitless !== !0 ? (a ||= i(t.shape), d = a(d, f), l ? Lr([], p, d, f, u, e) : d) : n(d, f) : (d.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), d);
	};
});
function Br(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !O(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => j(e, r, y())))
	}), t);
}
var Vr = /* @__PURE__ */ _("$ZodUnion", (e, t) => {
	I.init(e, t), b(e._zod, "optin", () => t.options.some((e) => e._zod.optin === "optional") ? "optional" : void 0), b(e._zod, "optout", () => t.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), b(e._zod, "values", () => {
		if (t.options.every((e) => e._zod.values)) return new Set(t.options.flatMap((e) => Array.from(e._zod.values)));
	}), b(e._zod, "pattern", () => {
		if (t.options.every((e) => e._zod.pattern)) {
			let e = t.options.map((e) => e._zod.pattern);
			return RegExp(`^(${e.map((e) => Tt(e.source)).join("|")})$`);
		}
	});
	let n = t.options.length === 1, r = t.options[0]._zod.run;
	e._zod.parse = (i, a) => {
		if (n) return r(i, a);
		let o = !1, s = [];
		for (let e of t.options) {
			let t = e._zod.run({
				value: i.value,
				issues: []
			}, a);
			if (t instanceof Promise) s.push(t), o = !0;
			else {
				if (t.issues.length === 0) return t;
				s.push(t);
			}
		}
		return o ? Promise.all(s).then((t) => Br(t, i, e, a)) : Br(s, i, e, a);
	};
}), Hr = /* @__PURE__ */ _("$ZodIntersection", (e, t) => {
	I.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => Wr(e, t, n)) : Wr(e, i, a);
	};
});
function Ur(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (w(e) && w(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		for (let n of r) {
			let r = Ur(e[n], t[n]);
			if (!r.valid) return {
				valid: !1,
				mergeErrorPath: [n, ...r.mergeErrorPath]
			};
			i[n] = r.data;
		}
		return {
			valid: !0,
			data: i
		};
	}
	if (Array.isArray(e) && Array.isArray(t)) {
		if (e.length !== t.length) return {
			valid: !1,
			mergeErrorPath: []
		};
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r], a = t[r], o = Ur(i, a);
			if (!o.valid) return {
				valid: !1,
				mergeErrorPath: [r, ...o.mergeErrorPath]
			};
			n.push(o.data);
		}
		return {
			valid: !0,
			data: n
		};
	}
	return {
		valid: !1,
		mergeErrorPath: []
	};
}
function Wr(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i;
	for (let n of t.issues) if (n.code === "unrecognized_keys") {
		i ??= n;
		for (let e of n.keys) r.has(e) || r.set(e, {}), r.get(e).l = !0;
	} else e.issues.push(n);
	for (let t of n.issues) if (t.code === "unrecognized_keys") for (let e of t.keys) r.has(e) || r.set(e, {}), r.get(e).r = !0;
	else e.issues.push(t);
	let a = [...r].filter(([, e]) => e.l && e.r).map(([e]) => e);
	if (a.length && i && e.issues.push({
		...i,
		keys: a
	}), O(e)) return e;
	let o = Ur(t.value, n.value);
	if (!o.valid) throw Error(`Unmergable intersection. Error path: ${JSON.stringify(o.mergeErrorPath)}`);
	return e.value = o.data, e;
}
var Gr = /* @__PURE__ */ _("$ZodRecord", (e, t) => {
	I.init(e, t), e._zod.parse = (n, r) => {
		let i = n.value;
		if (!w(i)) return n.issues.push({
			expected: "record",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
		let a = [], o = t.keyType._zod.values;
		if (o) {
			n.value = {};
			let s = /* @__PURE__ */ new Set();
			for (let e of o) if (typeof e == "string" || typeof e == "number" || typeof e == "symbol") {
				s.add(typeof e == "number" ? e.toString() : e);
				let o = t.valueType._zod.run({
					value: i[e],
					issues: []
				}, r);
				o instanceof Promise ? a.push(o.then((t) => {
					t.issues.length && n.issues.push(...k(e, t.issues)), n.value[e] = t.value;
				})) : (o.issues.length && n.issues.push(...k(e, o.issues)), n.value[e] = o.value);
			}
			let c;
			for (let e in i) s.has(e) || (c ??= [], c.push(e));
			c && c.length > 0 && n.issues.push({
				code: "unrecognized_keys",
				input: i,
				inst: e,
				keys: c
			});
		} else {
			n.value = {};
			for (let o of Reflect.ownKeys(i)) {
				if (o === "__proto__") continue;
				let s = t.keyType._zod.run({
					value: o,
					issues: []
				}, r);
				if (s instanceof Promise) throw Error("Async schemas not supported in object keys currently");
				if (typeof o == "string" && Fn.test(o) && s.issues.length) {
					let e = t.keyType._zod.run({
						value: Number(o),
						issues: []
					}, r);
					if (e instanceof Promise) throw Error("Async schemas not supported in object keys currently");
					e.issues.length === 0 && (s = e);
				}
				if (s.issues.length) {
					t.mode === "loose" ? n.value[o] = i[o] : n.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: s.issues.map((e) => j(e, r, y())),
						input: o,
						path: [o],
						inst: e
					});
					continue;
				}
				let c = t.valueType._zod.run({
					value: i[o],
					issues: []
				}, r);
				c instanceof Promise ? a.push(c.then((e) => {
					e.issues.length && n.issues.push(...k(o, e.issues)), n.value[s.value] = e.value;
				})) : (c.issues.length && n.issues.push(...k(o, c.issues)), n.value[s.value] = c.value);
			}
		}
		return a.length ? Promise.all(a).then(() => n) : n;
	};
}), Kr = /* @__PURE__ */ _("$ZodEnum", (e, t) => {
	I.init(e, t);
	let n = xt(t.entries), r = new Set(n);
	e._zod.values = r, e._zod.pattern = RegExp(`^(${n.filter((e) => Nt.has(typeof e)).map((e) => typeof e == "string" ? T(e) : e.toString()).join("|")})$`), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), qr = /* @__PURE__ */ _("$ZodTransform", (e, t) => {
	I.init(e, t), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new yt(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new v();
		return n.value = i, n;
	};
});
function Jr(e, t) {
	return e.issues.length && t === void 0 ? {
		issues: [],
		value: void 0
	} : e;
}
var Yr = /* @__PURE__ */ _("$ZodOptional", (e, t) => {
	I.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", b(e._zod, "values", () => t.innerType._zod.values ? new Set([...t.innerType._zod.values, void 0]) : void 0), b(e._zod, "pattern", () => {
		let e = t.innerType._zod.pattern;
		return e ? RegExp(`^(${Tt(e.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (t.innerType._zod.optin === "optional") {
			let r = t.innerType._zod.run(e, n);
			return r instanceof Promise ? r.then((t) => Jr(t, e.value)) : Jr(r, e.value);
		}
		return e.value === void 0 ? e : t.innerType._zod.run(e, n);
	};
}), Xr = /* @__PURE__ */ _("$ZodExactOptional", (e, t) => {
	Yr.init(e, t), b(e._zod, "values", () => t.innerType._zod.values), b(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), Zr = /* @__PURE__ */ _("$ZodNullable", (e, t) => {
	I.init(e, t), b(e._zod, "optin", () => t.innerType._zod.optin), b(e._zod, "optout", () => t.innerType._zod.optout), b(e._zod, "pattern", () => {
		let e = t.innerType._zod.pattern;
		return e ? RegExp(`^(${Tt(e.source)}|null)$`) : void 0;
	}), b(e._zod, "values", () => t.innerType._zod.values ? new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), Qr = /* @__PURE__ */ _("$ZodDefault", (e, t) => {
	I.init(e, t), e._zod.optin = "optional", b(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => $r(e, t)) : $r(r, t);
	};
});
function $r(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var ei = /* @__PURE__ */ _("$ZodPrefault", (e, t) => {
	I.init(e, t), e._zod.optin = "optional", b(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), ti = /* @__PURE__ */ _("$ZodNonOptional", (e, t) => {
	I.init(e, t), b(e._zod, "values", () => {
		let e = t.innerType._zod.values;
		return e ? new Set([...e].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => ni(t, e)) : ni(i, e);
	};
});
function ni(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
var ri = /* @__PURE__ */ _("$ZodCatch", (e, t) => {
	I.init(e, t), b(e._zod, "optin", () => t.innerType._zod.optin), b(e._zod, "optout", () => t.innerType._zod.optout), b(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((r) => (e.value = r.value, r.issues.length && (e.value = t.catchValue({
			...e,
			error: { issues: r.issues.map((e) => j(e, n, y())) },
			input: e.value
		}), e.issues = []), e)) : (e.value = r.value, r.issues.length && (e.value = t.catchValue({
			...e,
			error: { issues: r.issues.map((e) => j(e, n, y())) },
			input: e.value
		}), e.issues = []), e);
	};
}), ii = /* @__PURE__ */ _("$ZodPipe", (e, t) => {
	I.init(e, t), b(e._zod, "values", () => t.in._zod.values), b(e._zod, "optin", () => t.in._zod.optin), b(e._zod, "optout", () => t.out._zod.optout), b(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => z(e, t.in, n)) : z(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => z(e, t.out, n)) : z(r, t.out, n);
	};
});
function z(e, t, n) {
	return e.issues.length ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var ai = /* @__PURE__ */ _("$ZodReadonly", (e, t) => {
	I.init(e, t), b(e._zod, "propValues", () => t.innerType._zod.propValues), b(e._zod, "values", () => t.innerType._zod.values), b(e._zod, "optin", () => t.innerType?._zod?.optin), b(e._zod, "optout", () => t.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(oi) : oi(r);
	};
});
function oi(e) {
	return e.value = Object.freeze(e.value), e;
}
var si = /* @__PURE__ */ _("$ZodCustom", (e, t) => {
	P.init(e, t), I.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => ci(t, n, r, e));
		ci(i, n, r, e);
	};
});
function ci(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(M(e));
	}
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/registries.js
var li, ui = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
	}
	add(e, ...t) {
		let n = t[0];
		return this._map.set(e, n), n && typeof n == "object" && "id" in n && this._idmap.set(n.id, e), this;
	}
	clear() {
		return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
	}
	remove(e) {
		let t = this._map.get(e);
		return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(e), this;
	}
	get(e) {
		let t = e._zod.parent;
		if (t) {
			let n = { ...this.get(t) ?? {} };
			delete n.id;
			let r = {
				...n,
				...this._map.get(e)
			};
			return Object.keys(r).length ? r : void 0;
		}
		return this._map.get(e);
	}
	has(e) {
		return this._map.has(e);
	}
};
function di() {
	return new ui();
}
(li = globalThis).__zod_globalRegistry ?? (li.__zod_globalRegistry = di());
var B = globalThis.__zod_globalRegistry;
//#endregion
//#region ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/api.js
/* @__NO_SIDE_EFFECTS__ */
function fi(e, t) {
	return new e({
		type: "string",
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function pi(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function mi(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function hi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function gi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _i(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function vi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function yi(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function bi(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function xi(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Si(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ci(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function wi(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ti(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ei(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Di(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Oi(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ki(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ai(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ji(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Mi(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ni(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Pi(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Fi(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ii(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Li(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ri(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function zi(e, t) {
	return new e({
		type: "number",
		checks: [],
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Bi(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Vi(e, t) {
	return new e({
		type: "boolean",
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Hi(e) {
	return new e({ type: "unknown" });
}
/* @__NO_SIDE_EFFECTS__ */
function Ui(e, t) {
	return new e({
		type: "never",
		...D(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Wi(e, t) {
	return new Bn({
		check: "less_than",
		...D(t),
		value: e,
		inclusive: !1
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Gi(e, t) {
	return new Bn({
		check: "less_than",
		...D(t),
		value: e,
		inclusive: !0
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ki(e, t) {
	return new Vn({
		check: "greater_than",
		...D(t),
		value: e,
		inclusive: !1
	});
}
/* @__NO_SIDE_EFFECTS__ */
function qi(e, t) {
	return new Vn({
		check: "greater_than",
		...D(t),
		value: e,
		inclusive: !0
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ji(e, t) {
	return new Hn({
		check: "multiple_of",
		...D(t),
		value: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Yi(e, t) {
	return new Wn({
		check: "max_length",
		...D(t),
		maximum: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function V(e, t) {
	return new Gn({
		check: "min_length",
		...D(t),
		minimum: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Xi(e, t) {
	return new Kn({
		check: "length_equals",
		...D(t),
		length: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Zi(e, t) {
	return new qn({
		check: "string_format",
		format: "regex",
		...D(t),
		pattern: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Qi(e) {
	return new Jn({
		check: "string_format",
		format: "lowercase",
		...D(e)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function $i(e) {
	return new Yn({
		check: "string_format",
		format: "uppercase",
		...D(e)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ea(e, t) {
	return new Xn({
		check: "string_format",
		format: "includes",
		...D(t),
		includes: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ta(e, t) {
	return new Zn({
		check: "string_format",
		format: "starts_with",
		...D(t),
		prefix: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function na(e, t) {
	return new Qn({
		check: "string_format",
		format: "ends_with",
		...D(t),
		suffix: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function H(e) {
	return new $n({
		check: "overwrite",
		tx: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ra(e) {
	return /* @__PURE__ */ H((t) => t.normalize(e));
}
/* @__NO_SIDE_EFFECTS__ */
function ia() {
	return /* @__PURE__ */ H((e) => e.trim());
}
/* @__NO_SIDE_EFFECTS__ */
function aa() {
	return /* @__PURE__ */ H((e) => e.toLowerCase());
}
/* @__NO_SIDE_EFFECTS__ */
function oa() {
	return /* @__PURE__ */ H((e) => e.toUpperCase());
}
/* @__NO_SIDE_EFFECTS__ */
function sa() {
	return /* @__PURE__ */ H((e) => kt(e));
}
/* @__NO_SIDE_EFFECTS__ */
function ca(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...D(n)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function la(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...D(n)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function ua(e) {
	let t = /* @__PURE__ */ da((n) => (n.addIssue = (e) => {
		if (typeof e == "string") n.issues.push(M(e, n.value, t._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", r.input ??= n.value, r.inst ??= t, r.continue ??= !t._zod.def.abort, n.issues.push(M(r));
		}
	}, e(n.value, n)));
	return t;
}
/* @__NO_SIDE_EFFECTS__ */
function da(e, t) {
	let n = new P({
		check: "custom",
		...D(t)
	});
	return n._zod.check = e, n;
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/to-json-schema.js
function fa(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? B,
		target: t,
		unrepresentable: e?.unrepresentable ?? "throw",
		override: e?.override ?? (() => {}),
		io: e?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		cycles: e?.cycles ?? "ref",
		reused: e?.reused ?? "inline",
		external: e?.external ?? void 0
	};
}
function U(e, t, n = {
	path: [],
	schemaPath: []
}) {
	var r;
	let i = e._zod.def, a = t.seen.get(e);
	if (a) return a.count++, n.schemaPath.includes(e) && (a.cycle = n.path), a.schema;
	let o = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: n.path
	};
	t.seen.set(e, o);
	let s = e._zod.toJSONSchema?.();
	if (s) o.schema = s;
	else {
		let r = {
			...n,
			schemaPath: [...n.schemaPath, e],
			path: n.path
		};
		if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, o.schema, r);
		else {
			let n = o.schema, a = t.processors[i.type];
			if (!a) throw Error(`[toJSONSchema]: Non-representable type encountered: ${i.type}`);
			a(e, t, n, r);
		}
		let a = e._zod.parent;
		a && (o.ref ||= a, U(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && Object.assign(o.schema, c), t.io === "input" && W(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && o.schema._prefault && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function pa(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = /* @__PURE__ */ new Map();
	for (let t of e.seen.entries()) {
		let n = e.metadataRegistry.get(t[0])?.id;
		if (n) {
			let e = r.get(n);
			if (e && e !== t[0]) throw Error(`Duplicate schema id "${n}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			r.set(n, t[0]);
		}
	}
	let i = (t) => {
		let r = e.target === "draft-2020-12" ? "$defs" : "definitions";
		if (e.external) {
			let n = e.external.registry.get(t[0])?.id, i = e.external.uri ?? ((e) => e);
			if (n) return { ref: i(n) };
			let a = t[1].defId ?? t[1].schema.id ?? `schema${e.counter++}`;
			return t[1].defId = a, {
				defId: a,
				ref: `${i("__shared")}#/${r}/${a}`
			};
		}
		if (t[1] === n) return { ref: "#" };
		let i = `#/${r}/`, a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + a
		};
	}, a = (e) => {
		if (e[1].schema.$ref) return;
		let t = e[1], { ref: n, defId: r } = i(e);
		t.def = { ...t.schema }, r && (t.defId = r);
		let a = t.schema;
		for (let e in a) delete a[e];
		a.$ref = n;
	};
	if (e.cycles === "throw") for (let t of e.seen.entries()) {
		let e = t[1];
		if (e.cycle) throw Error(`Cycle detected: #/${e.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (let n of e.seen.entries()) {
		let r = n[1];
		if (t === n[0]) {
			a(n);
			continue;
		}
		if (e.external) {
			let r = e.external.registry.get(n[0])?.id;
			if (t !== n[0] && r) {
				a(n);
				continue;
			}
		}
		if (e.metadataRegistry.get(n[0])?.id) {
			a(n);
			continue;
		}
		if (r.cycle) {
			a(n);
			continue;
		}
		if (r.count > 1 && e.reused === "ref") {
			a(n);
			continue;
		}
	}
}
function ma(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : Object.assign(i, s), Object.assign(i, a), t._zod.parent === o) for (let e in i) e === "$ref" || e === "allOf" || e in a || delete i[e];
			if (s.$ref && n.def) for (let e in i) e === "$ref" || e === "allOf" || e in n.def && JSON.stringify(i[e]) === JSON.stringify(n.def[e]) && delete i[e];
		}
		let s = t._zod.parent;
		if (s && s !== o) {
			r(s);
			let t = e.seen.get(s);
			if (t?.schema.$ref && (i.$ref = t.schema.$ref, t.def)) for (let e in i) e === "$ref" || e === "allOf" || e in t.def && JSON.stringify(i[e]) === JSON.stringify(t.def[e]) && delete i[e];
		}
		e.override({
			zodSchema: t,
			jsonSchema: i,
			path: n.path ?? []
		});
	};
	for (let t of [...e.seen.entries()].reverse()) r(t[0]);
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	Object.assign(i, n.def ?? n.schema);
	let a = e.external?.defs ?? {};
	for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (a[e.defId] = e.def);
	}
	e.external || Object.keys(a).length > 0 && (e.target === "draft-2020-12" ? i.$defs = a : i.definitions = a);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: ga(t, "input", e.processors),
					output: ga(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function W(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return W(r.element, n);
	if (r.type === "set") return W(r.valueType, n);
	if (r.type === "lazy") return W(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault") return W(r.innerType, n);
	if (r.type === "intersection") return W(r.left, n) || W(r.right, n);
	if (r.type === "record" || r.type === "map") return W(r.keyType, n) || W(r.valueType, n);
	if (r.type === "pipe") return W(r.in, n) || W(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (W(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (W(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (W(e, n)) return !0;
		return !!(r.rest && W(r.rest, n));
	}
	return !1;
}
var ha = (e, t = {}) => (n) => {
	let r = fa({
		...n,
		processors: t
	});
	return U(e, r), pa(r, e), ma(r, e);
}, ga = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = fa({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return U(e, o), pa(o, e), ma(o, e);
}, _a = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, va = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l } = e._zod.bag;
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = _a[s] ?? s, i.format === "" && delete i.format, s === "time" && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c];
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, ya = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, format: s, multipleOf: c, exclusiveMaximum: l, exclusiveMinimum: u } = e._zod.bag;
	typeof s == "string" && s.includes("int") ? i.type = "integer" : i.type = "number", typeof u == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (i.minimum = u, i.exclusiveMinimum = !0) : i.exclusiveMinimum = u), typeof a == "number" && (i.minimum = a, typeof u == "number" && t.target !== "draft-04" && (u >= a ? delete i.minimum : delete i.exclusiveMinimum)), typeof l == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (i.maximum = l, i.exclusiveMaximum = !0) : i.exclusiveMaximum = l), typeof o == "number" && (i.maximum = o, typeof l == "number" && t.target !== "draft-04" && (l <= o ? delete i.maximum : delete i.exclusiveMaximum)), typeof c == "number" && (i.multipleOf = c);
}, ba = (e, t, n, r) => {
	n.type = "boolean";
}, xa = (e, t, n, r) => {
	n.not = {};
}, Sa = (e, t, n, r) => {
	let i = e._zod.def, a = xt(i.entries);
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, Ca = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Custom types cannot be represented in JSON Schema");
}, wa = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Transforms cannot be represented in JSON Schema");
}, Ta = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = e._zod.bag;
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = U(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
}, Ea = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object", i.properties = {};
	let o = a.shape;
	for (let e in o) i.properties[e] = U(o[e], t, {
		...r,
		path: [
			...r.path,
			"properties",
			e
		]
	});
	let s = new Set(Object.keys(o)), c = new Set([...s].filter((e) => {
		let n = a.shape[e]._zod;
		return t.io === "input" ? n.optin === void 0 : n.optout === void 0;
	}));
	c.size > 0 && (i.required = Array.from(c)), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = U(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, Da = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => U(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, Oa = (e, t, n, r) => {
	let i = e._zod.def, a = U(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = U(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1;
	n.allOf = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
}, ka = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = o._zod.bag?.patterns;
	if (a.mode === "loose" && s && s.size > 0) {
		let e = U(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of s) i.patternProperties[t.source] = e;
	} else (t.target === "draft-07" || t.target === "draft-2020-12") && (i.propertyNames = U(a.keyType, t, {
		...r,
		path: [...r.path, "propertyNames"]
	})), i.additionalProperties = U(a.valueType, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	});
	let c = o._zod.values;
	if (c) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e);
	}
}, Aa = (e, t, n, r) => {
	let i = e._zod.def, a = U(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, ja = (e, t, n, r) => {
	let i = e._zod.def;
	U(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Ma = (e, t, n, r) => {
	let i = e._zod.def;
	U(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.default = JSON.parse(JSON.stringify(i.defaultValue));
}, Na = (e, t, n, r) => {
	let i = e._zod.def;
	U(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(i.defaultValue)));
}, Pa = (e, t, n, r) => {
	let i = e._zod.def;
	U(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		throw Error("Dynamic catch values are not supported in JSON Schema");
	}
	n.default = o;
}, Fa = (e, t, n, r) => {
	let i = e._zod.def, a = t.io === "input" ? i.in._zod.def.type === "transform" ? i.out : i.in : i.out;
	U(a, t, r);
	let o = t.seen.get(e);
	o.ref = a;
}, Ia = (e, t, n, r) => {
	let i = e._zod.def;
	U(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, La = (e, t, n, r) => {
	let i = e._zod.def;
	U(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Ra = /* @__PURE__ */ _("ZodISODateTime", (e, t) => {
	mr.init(e, t), J.init(e, t);
});
function za(e) {
	return /* @__PURE__ */ Fi(Ra, e);
}
var Ba = /* @__PURE__ */ _("ZodISODate", (e, t) => {
	hr.init(e, t), J.init(e, t);
});
function Va(e) {
	return /* @__PURE__ */ Ii(Ba, e);
}
var Ha = /* @__PURE__ */ _("ZodISOTime", (e, t) => {
	gr.init(e, t), J.init(e, t);
});
function Ua(e) {
	return /* @__PURE__ */ Li(Ha, e);
}
var Wa = /* @__PURE__ */ _("ZodISODuration", (e, t) => {
	_r.init(e, t), J.init(e, t);
});
function Ga(e) {
	return /* @__PURE__ */ Ri(Wa, e);
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/errors.js
var Ka = (e, t) => {
	Gt.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
		format: { value: (t) => Jt(e, t) },
		flatten: { value: (t) => qt(e, t) },
		addIssue: { value: (t) => {
			e.issues.push(t), e.message = JSON.stringify(e.issues, St, 2);
		} },
		addIssues: { value: (t) => {
			e.issues.push(...t), e.message = JSON.stringify(e.issues, St, 2);
		} },
		isEmpty: { get() {
			return e.issues.length === 0;
		} }
	});
};
_("ZodError", Ka);
var G = _("ZodError", Ka, { Parent: Error }), qa = /* @__PURE__ */ Yt(G), Ja = /* @__PURE__ */ Xt(G), Ya = /* @__PURE__ */ Zt(G), Xa = /* @__PURE__ */ N(G), Za = /* @__PURE__ */ en(G), Qa = /* @__PURE__ */ tn(G), $a = /* @__PURE__ */ nn(G), eo = /* @__PURE__ */ rn(G), to = /* @__PURE__ */ an(G), no = /* @__PURE__ */ on(G), ro = /* @__PURE__ */ sn(G), io = /* @__PURE__ */ cn(G), K = /* @__PURE__ */ _("ZodType", (e, t) => (I.init(e, t), Object.assign(e["~standard"], { jsonSchema: {
	input: ga(e, "input"),
	output: ga(e, "output")
} }), e.toJSONSchema = ha(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(S(t, { checks: [...t.checks ?? [], ...n.map((e) => typeof e == "function" ? { _zod: {
	check: e,
	def: { check: "custom" },
	onattach: []
} } : e)] }), { parent: !0 }), e.with = e.check, e.clone = (t, n) => E(e, t, n), e.brand = () => e, e.register = ((t, n) => (t.add(e, n), e)), e.parse = (t, n) => qa(e, t, n, { callee: e.parse }), e.safeParse = (t, n) => Ya(e, t, n), e.parseAsync = async (t, n) => Ja(e, t, n, { callee: e.parseAsync }), e.safeParseAsync = async (t, n) => Xa(e, t, n), e.spa = e.safeParseAsync, e.encode = (t, n) => Za(e, t, n), e.decode = (t, n) => Qa(e, t, n), e.encodeAsync = async (t, n) => $a(e, t, n), e.decodeAsync = async (t, n) => eo(e, t, n), e.safeEncode = (t, n) => to(e, t, n), e.safeDecode = (t, n) => no(e, t, n), e.safeEncodeAsync = async (t, n) => ro(e, t, n), e.safeDecodeAsync = async (t, n) => io(e, t, n), e.refine = (t, n) => e.check(ms(t, n)), e.superRefine = (t) => e.check(hs(t)), e.overwrite = (t) => e.check(/* @__PURE__ */ H(t)), e.optional = () => Xo(e), e.exactOptional = () => Qo(e), e.nullable = () => es(e), e.nullish = () => Xo(es(e)), e.nonoptional = (t) => os(e, t), e.array = () => Lo(e), e.or = (t) => Bo([e, t]), e.and = (t) => Ho(e, t), e.transform = (t) => us(e, Jo(t)), e.default = (t) => ns(e, t), e.prefault = (t) => is(e, t), e.catch = (t) => cs(e, t), e.pipe = (t) => us(e, t), e.readonly = () => fs(e), e.describe = (t) => {
	let n = e.clone();
	return B.add(n, { description: t }), n;
}, Object.defineProperty(e, "description", {
	get() {
		return B.get(e)?.description;
	},
	configurable: !0
}), e.meta = (...t) => {
	if (t.length === 0) return B.get(e);
	let n = e.clone();
	return B.add(n, t[0]), n;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e.apply = (t) => t(e), e)), ao = /* @__PURE__ */ _("_ZodString", (e, t) => {
	nr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => va(e, t, n, r);
	let n = e._zod.bag;
	e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...t) => e.check(/* @__PURE__ */ Zi(...t)), e.includes = (...t) => e.check(/* @__PURE__ */ ea(...t)), e.startsWith = (...t) => e.check(/* @__PURE__ */ ta(...t)), e.endsWith = (...t) => e.check(/* @__PURE__ */ na(...t)), e.min = (...t) => e.check(/* @__PURE__ */ V(...t)), e.max = (...t) => e.check(/* @__PURE__ */ Yi(...t)), e.length = (...t) => e.check(/* @__PURE__ */ Xi(...t)), e.nonempty = (...t) => e.check(/* @__PURE__ */ V(1, ...t)), e.lowercase = (t) => e.check(/* @__PURE__ */ Qi(t)), e.uppercase = (t) => e.check(/* @__PURE__ */ $i(t)), e.trim = () => e.check(/* @__PURE__ */ ia()), e.normalize = (...t) => e.check(/* @__PURE__ */ ra(...t)), e.toLowerCase = () => e.check(/* @__PURE__ */ aa()), e.toUpperCase = () => e.check(/* @__PURE__ */ oa()), e.slugify = () => e.check(/* @__PURE__ */ sa());
}), oo = /* @__PURE__ */ _("ZodString", (e, t) => {
	nr.init(e, t), ao.init(e, t), e.email = (t) => e.check(/* @__PURE__ */ pi(so, t)), e.url = (t) => e.check(/* @__PURE__ */ yi(uo, t)), e.jwt = (t) => e.check(/* @__PURE__ */ Pi(Eo, t)), e.emoji = (t) => e.check(/* @__PURE__ */ bi(fo, t)), e.guid = (t) => e.check(/* @__PURE__ */ mi(co, t)), e.uuid = (t) => e.check(/* @__PURE__ */ hi(lo, t)), e.uuidv4 = (t) => e.check(/* @__PURE__ */ gi(lo, t)), e.uuidv6 = (t) => e.check(/* @__PURE__ */ _i(lo, t)), e.uuidv7 = (t) => e.check(/* @__PURE__ */ vi(lo, t)), e.nanoid = (t) => e.check(/* @__PURE__ */ xi(po, t)), e.guid = (t) => e.check(/* @__PURE__ */ mi(co, t)), e.cuid = (t) => e.check(/* @__PURE__ */ Si(mo, t)), e.cuid2 = (t) => e.check(/* @__PURE__ */ Ci(ho, t)), e.ulid = (t) => e.check(/* @__PURE__ */ wi(go, t)), e.base64 = (t) => e.check(/* @__PURE__ */ ji(Co, t)), e.base64url = (t) => e.check(/* @__PURE__ */ Mi(wo, t)), e.xid = (t) => e.check(/* @__PURE__ */ Ti(_o, t)), e.ksuid = (t) => e.check(/* @__PURE__ */ Ei(vo, t)), e.ipv4 = (t) => e.check(/* @__PURE__ */ Di(yo, t)), e.ipv6 = (t) => e.check(/* @__PURE__ */ Oi(bo, t)), e.cidrv4 = (t) => e.check(/* @__PURE__ */ ki(xo, t)), e.cidrv6 = (t) => e.check(/* @__PURE__ */ Ai(So, t)), e.e164 = (t) => e.check(/* @__PURE__ */ Ni(To, t)), e.datetime = (t) => e.check(za(t)), e.date = (t) => e.check(Va(t)), e.time = (t) => e.check(Ua(t)), e.duration = (t) => e.check(Ga(t));
});
function q(e) {
	return /* @__PURE__ */ fi(oo, e);
}
var J = /* @__PURE__ */ _("ZodStringFormat", (e, t) => {
	L.init(e, t), ao.init(e, t);
}), so = /* @__PURE__ */ _("ZodEmail", (e, t) => {
	ar.init(e, t), J.init(e, t);
}), co = /* @__PURE__ */ _("ZodGUID", (e, t) => {
	rr.init(e, t), J.init(e, t);
}), lo = /* @__PURE__ */ _("ZodUUID", (e, t) => {
	ir.init(e, t), J.init(e, t);
}), uo = /* @__PURE__ */ _("ZodURL", (e, t) => {
	or.init(e, t), J.init(e, t);
}), fo = /* @__PURE__ */ _("ZodEmoji", (e, t) => {
	sr.init(e, t), J.init(e, t);
}), po = /* @__PURE__ */ _("ZodNanoID", (e, t) => {
	cr.init(e, t), J.init(e, t);
}), mo = /* @__PURE__ */ _("ZodCUID", (e, t) => {
	lr.init(e, t), J.init(e, t);
}), ho = /* @__PURE__ */ _("ZodCUID2", (e, t) => {
	ur.init(e, t), J.init(e, t);
}), go = /* @__PURE__ */ _("ZodULID", (e, t) => {
	dr.init(e, t), J.init(e, t);
}), _o = /* @__PURE__ */ _("ZodXID", (e, t) => {
	fr.init(e, t), J.init(e, t);
}), vo = /* @__PURE__ */ _("ZodKSUID", (e, t) => {
	pr.init(e, t), J.init(e, t);
}), yo = /* @__PURE__ */ _("ZodIPv4", (e, t) => {
	vr.init(e, t), J.init(e, t);
}), bo = /* @__PURE__ */ _("ZodIPv6", (e, t) => {
	yr.init(e, t), J.init(e, t);
}), xo = /* @__PURE__ */ _("ZodCIDRv4", (e, t) => {
	br.init(e, t), J.init(e, t);
}), So = /* @__PURE__ */ _("ZodCIDRv6", (e, t) => {
	xr.init(e, t), J.init(e, t);
}), Co = /* @__PURE__ */ _("ZodBase64", (e, t) => {
	Cr.init(e, t), J.init(e, t);
}), wo = /* @__PURE__ */ _("ZodBase64URL", (e, t) => {
	Tr.init(e, t), J.init(e, t);
}), To = /* @__PURE__ */ _("ZodE164", (e, t) => {
	Er.init(e, t), J.init(e, t);
}), Eo = /* @__PURE__ */ _("ZodJWT", (e, t) => {
	Or.init(e, t), J.init(e, t);
}), Do = /* @__PURE__ */ _("ZodNumber", (e, t) => {
	kr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => ya(e, t, n, r), e.gt = (t, n) => e.check(/* @__PURE__ */ Ki(t, n)), e.gte = (t, n) => e.check(/* @__PURE__ */ qi(t, n)), e.min = (t, n) => e.check(/* @__PURE__ */ qi(t, n)), e.lt = (t, n) => e.check(/* @__PURE__ */ Wi(t, n)), e.lte = (t, n) => e.check(/* @__PURE__ */ Gi(t, n)), e.max = (t, n) => e.check(/* @__PURE__ */ Gi(t, n)), e.int = (t) => e.check(ko(t)), e.safe = (t) => e.check(ko(t)), e.positive = (t) => e.check(/* @__PURE__ */ Ki(0, t)), e.nonnegative = (t) => e.check(/* @__PURE__ */ qi(0, t)), e.negative = (t) => e.check(/* @__PURE__ */ Wi(0, t)), e.nonpositive = (t) => e.check(/* @__PURE__ */ Gi(0, t)), e.multipleOf = (t, n) => e.check(/* @__PURE__ */ Ji(t, n)), e.step = (t, n) => e.check(/* @__PURE__ */ Ji(t, n)), e.finite = () => e;
	let n = e._zod.bag;
	e.minValue = Math.max(n.minimum ?? -Infinity, n.exclusiveMinimum ?? -Infinity) ?? null, e.maxValue = Math.min(n.maximum ?? Infinity, n.exclusiveMaximum ?? Infinity) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? .5), e.isFinite = !0, e.format = n.format ?? null;
});
function Y(e) {
	return /* @__PURE__ */ zi(Do, e);
}
var Oo = /* @__PURE__ */ _("ZodNumberFormat", (e, t) => {
	Ar.init(e, t), Do.init(e, t);
});
function ko(e) {
	return /* @__PURE__ */ Bi(Oo, e);
}
var Ao = /* @__PURE__ */ _("ZodBoolean", (e, t) => {
	jr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => ba(e, t, n, r);
});
function jo(e) {
	return /* @__PURE__ */ Vi(Ao, e);
}
var Mo = /* @__PURE__ */ _("ZodUnknown", (e, t) => {
	Mr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function No() {
	return /* @__PURE__ */ Hi(Mo);
}
var Po = /* @__PURE__ */ _("ZodNever", (e, t) => {
	Nr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => xa(e, t, n, r);
});
function Fo(e) {
	return /* @__PURE__ */ Ui(Po, e);
}
var Io = /* @__PURE__ */ _("ZodArray", (e, t) => {
	Fr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ta(e, t, n, r), e.element = t.element, e.min = (t, n) => e.check(/* @__PURE__ */ V(t, n)), e.nonempty = (t) => e.check(/* @__PURE__ */ V(1, t)), e.max = (t, n) => e.check(/* @__PURE__ */ Yi(t, n)), e.length = (t, n) => e.check(/* @__PURE__ */ Xi(t, n)), e.unwrap = () => e.element;
});
function Lo(e, t) {
	return /* @__PURE__ */ ca(Io, e, t);
}
var Ro = /* @__PURE__ */ _("ZodObject", (e, t) => {
	zr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ea(e, t, n, r), b(e, "shape", () => t.shape), e.keyof = () => Ko(Object.keys(e._zod.def.shape)), e.catchall = (t) => e.clone({
		...e._zod.def,
		catchall: t
	}), e.passthrough = () => e.clone({
		...e._zod.def,
		catchall: No()
	}), e.loose = () => e.clone({
		...e._zod.def,
		catchall: No()
	}), e.strict = () => e.clone({
		...e._zod.def,
		catchall: Fo()
	}), e.strip = () => e.clone({
		...e._zod.def,
		catchall: void 0
	}), e.extend = (t) => Rt(e, t), e.safeExtend = (t) => zt(e, t), e.merge = (t) => Bt(e, t), e.pick = (t) => It(e, t), e.omit = (t) => Lt(e, t), e.partial = (...t) => Vt(Yo, e, t[0]), e.required = (...t) => Ht(as, e, t[0]);
});
function X(e, t) {
	return new Ro({
		type: "object",
		shape: e ?? {},
		...D(t)
	});
}
var zo = /* @__PURE__ */ _("ZodUnion", (e, t) => {
	Vr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Da(e, t, n, r), e.options = t.options;
});
function Bo(e, t) {
	return new zo({
		type: "union",
		options: e,
		...D(t)
	});
}
var Vo = /* @__PURE__ */ _("ZodIntersection", (e, t) => {
	Hr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Oa(e, t, n, r);
});
function Ho(e, t) {
	return new Vo({
		type: "intersection",
		left: e,
		right: t
	});
}
var Uo = /* @__PURE__ */ _("ZodRecord", (e, t) => {
	Gr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => ka(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function Wo(e, t, n) {
	return new Uo({
		type: "record",
		keyType: e,
		valueType: t,
		...D(n)
	});
}
var Go = /* @__PURE__ */ _("ZodEnum", (e, t) => {
	Kr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Sa(e, t, n, r), e.enum = t.entries, e.options = Object.values(t.entries);
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new Go({
			...t,
			checks: [],
			...D(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new Go({
			...t,
			checks: [],
			...D(r),
			entries: i
		});
	};
});
function Ko(e, t) {
	return new Go({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...D(t)
	});
}
var qo = /* @__PURE__ */ _("ZodTransform", (e, t) => {
	qr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => wa(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new yt(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(M(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", t.input ??= n.value, t.inst ??= e, n.issues.push(M(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function Jo(e) {
	return new qo({
		type: "transform",
		transform: e
	});
}
var Yo = /* @__PURE__ */ _("ZodOptional", (e, t) => {
	Yr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => La(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Xo(e) {
	return new Yo({
		type: "optional",
		innerType: e
	});
}
var Zo = /* @__PURE__ */ _("ZodExactOptional", (e, t) => {
	Xr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => La(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Qo(e) {
	return new Zo({
		type: "optional",
		innerType: e
	});
}
var $o = /* @__PURE__ */ _("ZodNullable", (e, t) => {
	Zr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Aa(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function es(e) {
	return new $o({
		type: "nullable",
		innerType: e
	});
}
var ts = /* @__PURE__ */ _("ZodDefault", (e, t) => {
	Qr.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ma(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function ns(e, t) {
	return new ts({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Mt(t);
		}
	});
}
var rs = /* @__PURE__ */ _("ZodPrefault", (e, t) => {
	ei.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Na(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function is(e, t) {
	return new rs({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Mt(t);
		}
	});
}
var as = /* @__PURE__ */ _("ZodNonOptional", (e, t) => {
	ti.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => ja(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function os(e, t) {
	return new as({
		type: "nonoptional",
		innerType: e,
		...D(t)
	});
}
var ss = /* @__PURE__ */ _("ZodCatch", (e, t) => {
	ri.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Pa(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function cs(e, t) {
	return new ss({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : () => t
	});
}
var ls = /* @__PURE__ */ _("ZodPipe", (e, t) => {
	ii.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Fa(e, t, n, r), e.in = t.in, e.out = t.out;
});
function us(e, t) {
	return new ls({
		type: "pipe",
		in: e,
		out: t
	});
}
var ds = /* @__PURE__ */ _("ZodReadonly", (e, t) => {
	ai.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ia(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function fs(e) {
	return new ds({
		type: "readonly",
		innerType: e
	});
}
var ps = /* @__PURE__ */ _("ZodCustom", (e, t) => {
	si.init(e, t), K.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ca(e, t, n, r);
});
function ms(e, t = {}) {
	return /* @__PURE__ */ la(ps, e, t);
}
function hs(e) {
	return /* @__PURE__ */ ua(e);
}
//#endregion
//#region src/types/keys.ts
var gs = X({
	name: q(),
	limit: Y(),
	cost: Y(),
	autoVerify: jo().default(!1).optional(),
	duration: Y()
}), Z = X({
	id: q().regex(/^[a-z0-9_-]{16}$/i),
	hash: q(),
	owner: q(),
	name: q(),
	createdAt: Y(),
	expires: Y().optional(),
	meta: Wo(q(), q()).optional(),
	rateLimits: Lo(gs).optional()
}), _s = X({
	owner: q(),
	rateLimits: Lo(gs).optional(),
	meta: Wo(q(), q()).optional()
});
Z.omit({
	hash: !0,
	createdAt: !0,
	id: !0
}).extend({
	bytes: Y().optional(),
	prefix: q().optional()
}), Z.omit({ hash: !0 }).extend({ key: q() }), X({
	key: q().min(1).describe("API key to verify"),
	rateLimits: Lo(gs).optional()
}), X({
	valid: jo(),
	key: Z.omit({ hash: !0 }),
	error: q().optional()
});
//#endregion
//#region src/utils.ts
var Q = (e) => {
	let { error: t, data: n } = e;
	return t ? {
		success: !1,
		error: t
	} : {
		success: !0,
		data: n
	};
}, vs = (e) => {
	let t = async (t) => {
		let n = await e.hgetall(`key:${t}`).then((e) => Ge(e).length === 0 ? {} : {
			...e,
			rateLimits: JSON.parse(e.rateLimits ?? [])
		});
		return st(n) ? null : n;
	};
	return {
		create: async (n) => {
			let r = Z.omit({ createdAt: !0 }).parse({
				...n,
				id: vt(16)
			});
			if (await e.exists(`key:${r.hash}`)) return Q({ error: Error("DUPLICATE_KEY: Key with hash already exists") });
			await e.multi().hset(`key:${r.hash}`, {
				...r,
				createdAt: Date.now(),
				rateLimits: JSON.stringify(r.rateLimits ?? [])
			}).sadd(`owner:${r.owner}:keys`, r.hash).sadd("keys:all", r.hash).exec();
			let i = await t(r.hash);
			return Q(i ? { data: i } : { error: Error("Unable to create key") });
		},
		get: t,
		update: async (n, r) => {
			let i = Z.omit({
				hash: !0,
				owner: !0
			}).partial().parse(r);
			return await e.exists(`key:${n}`) || Q({ error: Error("Key not found") }), Object.keys(i).length > 0 && await e.hset(`key:${n}`, {
				...i,
				rateLimits: JSON.stringify(i.rateLimits)
			}), Q({ data: await t(n) });
		},
		delete: async (n) => {
			let r = await t(n);
			if (r !== null) return e.multi().del(`key:${n}`).srem(`owner:${r.owner}:keys`, n).srem("keys:all", n).exec();
		},
		list: async (t = 0, n = 10) => {
			let [r, i] = await e.sscan("keys:all", t, "COUNT", n);
			if (i.length === 0) return {
				keys: [],
				next_cursor: r
			};
			let a = e.pipeline();
			return i.forEach((e) => a.hgetall(`key:${e}`)), {
				keys: (await a.exec() ?? []).map(([e, t]) => {
					if (e) throw e;
					return {
						...t,
						rateLimits: t.rateLimits ? JSON.parse(t.rateLimits) : []
					};
				}),
				next_cursor: r
			};
		},
		list_by_owner: async (t, n = "0", r = 10) => {
			let [i, a] = await e.sscan(`owner:${t}:keys`, n, "COUNT", r);
			if (a.length === 0) return {
				keys: [],
				next_cursor: i
			};
			let o = e.pipeline();
			return a.forEach((e) => o.hgetall(`key:${e}`)), {
				keys: (await o.exec() ?? []).map(([e, t]) => {
					if (e) throw e;
					return {
						...t,
						rateLimits: t.rateLimits ? JSON.parse(t.rateLimits) : []
					};
				}),
				next_cursor: i
			};
		}
	};
}, ys = (e) => {
	let t = async (t) => {
		let n = await e.hgetall(`workspaces:${t}`).then((e) => Ge(e).length === 0 ? {} : {
			...e,
			rateLimits: JSON.parse(e.rateLimits ?? [])
		});
		return st(n) ? null : n;
	};
	return {
		create: async (n) => {
			let r = _s.parse({
				...n,
				id: vt(16)
			});
			if (await e.exists(`workspaces:${r.owner}`)) return Q({ error: Error("Workspace already exists for this owner") });
			await e.multi().hset(`workspaces:${r.owner}`, {
				...r,
				rateLimits: JSON.stringify(r.rateLimits ?? [])
			}).sadd("workspaces:all", r.owner).exec();
			let i = await t(r.owner);
			return Q(i ? { data: i } : { error: Error("Could not create workspace") });
		},
		get: t,
		update: async (n, r) => {
			let i = _s.partial().parse(r);
			return await e.exists(`workspaces:${n}`) ? (Object.keys(i).length > 0 && await e.hset(`workspaces:${n}`, {
				...i,
				rateLimits: JSON.stringify(i.rateLimits)
			}), Q({ data: await t(n) })) : Q({ error: Error("Workspace not found") });
		},
		delete: async (n) => await t(n) === null ? Q({ error: Error("Workspace does not exist") }) : (await e.del(`workspaces:${n}`), Q({ data: "success" })),
		list: async (t, n) => {
			let [r, i] = await e.sscan("workspaces:all", t, "COUNT", n);
			if (i.length === 0) return {
				workspaces: [],
				next_cursor: r
			};
			let a = e.pipeline();
			return i.forEach((e) => a.hgetall(`workspaces:${e}`)), {
				workspaces: (await a.exec() ?? []).map(([, e]) => e).filter((e) => !st(e)).map((e) => ({
					...e,
					rateLimits: JSON.parse(e.rateLimits ?? "")
				})),
				next_cursor: r
			};
		}
	};
}, bs = "\n  -- Sliding window rate limiter\n  -- KEYS[1]: rate limit key (sorted set)\n  -- ARGV[1]: limit (number)\n  -- ARGV[2]: duration (milliseconds)\n  -- ARGV[3]: cost (number)\n  -- ARGV[4]: current timestamp (milliseconds, from client)\n\n  local key = KEYS[1]\n  local limit = tonumber(ARGV[1])\n  local duration = tonumber(ARGV[2])\n  local cost = tonumber(ARGV[3])\n  local now = tonumber(ARGV[4])\n  local scope = tostring(ARGV[5])\n\n  -- 1. Remove expired entries\n  redis.call('ZREMRANGEBYSCORE', key, 0, now - duration)\n\n  -- 2. Count current valid entries\n  local current = redis.call('ZCARD', key)\n\n  -- 3. Check if adding cost would exceed limit\n  if current + cost > limit then\n      -- Get the oldest entry's score to compute reset time\n      local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')\n      local reset = 0\n      if #oldest > 0 then\n          local oldest_score = tonumber(oldest[2])\n          reset = math.max(0, duration - (now - oldest_score))\n      end\n      return {0, limit - current, reset, scope}  -- exceeded\n  end\n\n  -- 4. Add cost entries with unique members\n  for i = 1, cost do\n      -- Unique member: timestamp + random hex (collision probability negligible)\n      local member = now .. ':' .. string.format('%x', math.random(1, 2^31-1))\n      redis.call('ZADD', key, now, member)\n  end\n\n  -- 5. Set expiration on the key (in milliseconds) to auto-cleanup\n  redis.call('PEXPIRE', key, duration)\n\n  -- 6. Compute remaining and reset after addition\n  local new_current = current + cost\n  local remaining = limit - new_current\n  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')\n  local reset = 0\n  if #oldest > 0 then\n      local oldest_score = tonumber(oldest[2])\n      reset = math.max(0, duration - (now - oldest_score))\n  end\n\n  return {1, remaining, reset, scope}  -- allowed\n", xs = Ke((e, t) => nt(pt, je(e))(t))(Fe("name")), Ss = (e) => {
	let [t, n, r, i] = e;
	return {
		exceeded: t === 0,
		remaining: n,
		reset: r,
		scope: i
	};
}, Cs = (e, t, n, r) => {
	let i = r.cost, a = Date.now();
	return e.check_limit(t, r.limit.toString(), r.duration.toString(), i.toString(), a, n);
}, ws = (e) => {
	e.defineCommand("check_limit", {
		numberOfKeys: 1,
		lua: bs
	});
	let t = vs(e), n = ys(e), r = async (e, t) => {
		let r = xs(e.rateLimits ?? []), i = Oe((e) => e.autoVerify ?? !1, r), a = xs((await n.get(e.owner))?.rateLimits ?? []), o = Oe((e) => e.autoVerify ?? !1, a), s = t.reduce((e, t) => {
			let n = r[t.name ?? ""], i = a[t.name ?? ""];
			return {
				workspaces: i ? {
					...e.workspaces,
					[t.name]: dt(i, t)
				} : e.workspaces,
				keys: {
					...e.keys,
					[t.name]: dt(n ?? {}, t)
				}
			};
		}, {
			keys: {},
			workspaces: {}
		}), c = ut(i, s.keys), l = ut(o, s.workspaces);
		return {
			key_limits_to_check: Ge(c),
			workspace_limits_to_check: Ge(l)
		};
	};
	return {
		get_usage: async (t, n, r) => {
			let i = `${t}_rate_limit:${n}:${r}`;
			return await e.zcard(i);
		},
		check_limit: Cs,
		normalize_limit_check: Ss,
		check_limits: async (n, i) => {
			let a = await t.get(n);
			if (a === null) return Q({ error: Error("NO KEY FOUND") });
			let o = e.pipeline(), { key_limits_to_check: s, workspace_limits_to_check: c } = await r(a, i);
			s.forEach((e) => {
				Cs(o, `key_rate_limit:${a.id}:${e.name}`, "key", e);
			}), c.forEach((e) => {
				Cs(o, `workspace_rate_limit:${a.id}:${e.name}`, "workspace", e);
			});
			let l = await o.exec() ?? [], u = s.concat(c);
			return Q({ data: l.map(([e, t], n) => {
				if (e) {
					let e = t[3];
					return {
						exceeded: !0,
						name: u[n].name,
						limit: u[n].limit,
						duration: u[n].duration,
						reset: u[n].duration,
						cost: u[n].cost,
						remaining: 0,
						scope: e
					};
				}
				let [r, i, a, o] = t;
				return {
					exceeded: r === 0,
					name: u[n].name,
					limit: u[n].limit,
					duration: u[n].duration,
					cost: u[n].cost,
					reset: Math.max(0, a),
					remaining: Math.max(0, i),
					scope: o
				};
			}) });
		}
	};
}, Ts = ({ redis: e }) => ({
	keys: vs(e),
	workspaces: ys(e),
	limits: ws(e)
}), Es = /* @__PURE__ */ c((/* @__PURE__ */ o(((e, t) => {
	t.exports = {};
})))(), 1), Ds = _t("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz_", 32), Os = (e = 32, t = "") => {
	let n = Ds(e);
	return t ? `${t}_${n}` : n;
}, $ = (e) => Es.default.createHash("sha256").update(e).digest("hex"), ks = (e = 32, t = "") => {
	let n = Os(e, t);
	return {
		key: n,
		hash: $(n)
	};
}, As = (e) => ({
	create_key: async (t, n) => {
		let { key: r, hash: i } = ks(n?.bytes, n?.prefix), a = await e.keys.create({
			...t,
			hash: i
		}), { success: o } = a;
		if (!o) return Q({ error: a.error });
		let { data: s } = a;
		return Q({ data: {
			...s,
			key: r
		} });
	},
	verify: async (t, n) => {
		let r = $(t), i = await e.limits.check_limits(r, n);
		if (!i.success) return i;
		let a = await e.keys.get(r);
		return Q(a ? { data: {
			valid: i.data.find((e) => e.exceeded) === void 0,
			...a,
			rateLimits: i.data
		} } : { error: Error("KEY NOT FOUND") });
	},
	get: async (t) => {
		let n = $(t), r = await e.keys.get(n);
		return r ? ft(["hash"], r) : null;
	},
	update: (t, n) => e.keys.update($(t), n),
	list_by_owner: e.keys.list_by_owner,
	delete: (t) => e.keys.delete($(t))
}), js = (e) => {
	let { storage: t } = e;
	return {
		keys: As(t),
		admin: t,
		workspaces: t.workspaces
	};
}, Ms = (e) => {
	let { redis: t } = e;
	return js({ storage: Ts({ redis: t }) });
};
//#endregion
export { Ms as default };
