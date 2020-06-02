import { isList } from "./types.js";
export function pr_str(obj) {
  if (isList(obj)) {
    return `(${obj.map((e) => pr_str(e)).join(" ")})`;
  } else if (typeof obj === "symbol") {
    return Symbol.keyFor(obj);
  } else if (obj === null) {
    return "nil";
  } else {
    return obj.toString();
  }
}
