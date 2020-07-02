import { isList, Atom } from "./types.js";

export function pr_str(obj, _r = true) {
  if (isList(obj)) {
    return `(${obj.map((e) => pr_str(e, _r)).join(" ")})`;
  } else if (typeof obj === "symbol") {
    return Symbol.keyFor(obj);
  } else if (typeof obj === "string") {
    if (_r) {
      const str = obj
        .replace(/\\/g, String.raw`\\`)
        .replace(/"/g, String.raw`\"`)
        .replace(/\n/g, String.raw`\n`);
      return `"${str}"`;
    } else {
      return obj;
    }
  } else if (obj instanceof Atom) {
    return `(atom ${pr_str(obj.val, _r)})`;
  } else if (obj === null) {
    return "nil";
  } else {
    return obj.toString();
  }
}
