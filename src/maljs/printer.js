import { isList } from "./types.js";
export function pr_str(obj) {
  if (isList(obj)) {
    return `(${obj.map((e) => pr_str(e)).join(" ")})`;
  }
  return obj.toString();
}
