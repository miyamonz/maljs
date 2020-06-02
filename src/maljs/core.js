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
]);
