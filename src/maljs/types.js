export const isList = (obj) => Array.isArray(obj);

export class Atom {
  constructor(val) {
    this.val = val;
  }
}

export function _clone(obj, new_meta) {
  let new_obj = null;
  if (isList(obj)) {
    new_obj = obj.slice(0);
  } else if (obj instanceof Function) {
    let f = (...a) => obj.apply(f, a); // new function instance
    new_obj = Object.assign(f, obj); // copy original properties
  } else {
    throw Error("Unsupported type for clone");
  }
  if (typeof new_meta !== "undefined") {
    new_obj.meta = new_meta;
  }
  return new_obj;
}
