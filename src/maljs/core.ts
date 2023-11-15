import { isList, Atom } from "./types";
import { pr_str } from "./printer";
import { read_str, type MalForm } from "./reader";

function _error(e: string) {
  throw new Error(e);
}

export type MalAst = MalForm | CallableFunction;

export const core_ns = new Map<string, MalAst>([
  ["+", (a: number, b = 0) => a + b],
  ["-", (a: number, b = 0) => a - b],
  ["*", (a: number, b = 1) => a * b],
  ["/", (a: number, b: number) => a / b],
  ["list", (...a: unknown[]) => a],
  ["list?", isList],
  ["empty?", (a: unknown[]) => a.length === 0],
  ["count", (a: null | unknown[]) => (a === null ? 0 : a.length)],
  ["=", equal],

  ["<", (a: number, b: number) => a < b],
  ["<=", (a: number, b: number) => a <= b],
  [">", (a: number, b: number) => a > b],
  [">=", (a: number, b: number) => a >= b],

  ["pr-str", (...a: MalAst[]) => a.map((e) => pr_str(e, true)).join(" ")],
  ["str", (...a: MalAst[]) => a.map((e) => pr_str(e, false)).join("")],
  ["read-string", read_str],

  ["atom", (val: MalAst) => new Atom(val)],
  ["atom?", (a: unknown) => a instanceof Atom],
  ["deref", (a: Atom) => a.val],
  ["reset!", (atom: Atom, a: MalAst) => (atom.val = a)],
  [
    "swap!",
    (atom: Atom, f: CallableFunction, ...args: unknown[]) =>
      (atom.val = f(atom.val, ...args)),
  ],

  ["cons", (a: MalAst, b: MalAst[]) => [a, ...b]],
  ["concat", (...a: MalAst[][]) => a.reduce((x, y) => x.concat(y), [])],
  [
    "nth",
    (a: unknown[], b: number) =>
      b < a.length ? a[b] : _error("nth: index out of range"),
  ],
  ["first", (a: unknown[]) => (a !== null && a.length > 0 ? a[0] : null)],
  ["rest", (a: unknown[]) => (a === null ? [] : Array.from(a.slice(1)))],

  //prettier-ignore
  [ "throw", (a:unknown) => { throw a; } ],
]);

function equal(a: MalAst, b: MalAst): boolean {
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
