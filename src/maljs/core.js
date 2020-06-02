import { isList } from "./types.js";

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
