import type { MalAst } from "./core";

export const isList = (obj: MalAst): obj is MalAst[] => Array.isArray(obj);

export class Atom {
  val: MalAst;
  constructor(val: MalAst) {
    this.val = val;
  }
}

export function _clone(obj:MalAst, new_meta = undefined) {
  let new_obj = null;
  if (isList(obj)) {
    new_obj = obj.slice(0);
  } else if (obj instanceof Function) {
    const f = (...a: unknown[]) => obj.apply(f, a); // new function instance
    new_obj = Object.assign(f, obj); // copy original properties
  } else {
    throw Error("Unsupported type for clone");
  }
  if (typeof new_meta !== "undefined") {
    new_obj.meta = new_meta;
  }
  return new_obj;
}
