// bind とexprは関数呼出のときに引数を代入してenvとして保存する
export function new_env(outer = {}, binds = [], exprs = []) {
  const e = Object.create(outer);
  // Bind symbols in binds to values in exprs
  for (let i = 0; i < binds.length; i++) {
    if (Symbol.keyFor(binds[i]) === "&") {
      e[binds[i + 1]] = exprs.slice(i); // variable length arguments
      break;
    }
    e[binds[i]] = exprs[i];
  }
  return e;
}
export const env_get = (env, sym) => {
  if (sym in env) {
    return env[sym];
  }
  throw Error(`'${Symbol.keyFor(sym)}' not found`);
};
export const env_set = (env, sym, val) => (env[sym] = val);
