import { isList, Atom } from "./types.js";
import { pr_str } from "./printer";
import { read_str } from "./reader.js";

function _error(e) {
  throw new Error(e);
}

export const core_ns = new Map([
  ["+", (a, b = 0) => a + b],
  ["-", (a, b = 0) => a - b],
  ["*", (a, b = 1) => a * b],
  ["/", (a, b) => a / b],
  ["list", (...a) => a],
  ["list?", isList],
  ["empty?", (a) => a.length === 0],
  ["count", (a) => (a === null ? 0 : a.length)],
  ["=", equal],

  ["<", (a, b) => a < b],
  ["<=", (a, b) => a <= b],
  [">", (a, b) => a > b],
  [">=", (a, b) => a >= b],

  ["pr-str", (...a) => a.map((e) => pr_str(e, true)).join(" ")],
  ["str", (...a) => a.map((e) => pr_str(e, false)).join("")],
  ["read-string", read_str],

  ["atom", (val) => new Atom(val)],
  ["atom?", (a) => a instanceof Atom],
  ["deref", (a) => a.val],
  ["reset!", (atom, a) => (atom.val = a)],
  ["swap!", (atom, f, ...args) => (atom.val = f(atom.val, ...args))],

  ["cons", (a, b) => [a, ...b]],
  ["concat", (...a) => a.reduce((x, y) => x.concat(y), [])],
  ["nth", (a, b) => (b < a.length ? a[b] : _error("nth: index out of range"))],
  ["first", (a) => (a !== null && a.length > 0 ? a[0] : null)],
]);

function equal(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!equal(a[i], b[i])) return false;
    }
    return true;
  } else {
    return a === b;
  }
}
