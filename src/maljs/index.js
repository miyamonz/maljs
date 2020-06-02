import { BlankException, read_str } from "./reader.js";
import { pr_str } from "./printer.js";
import { isList } from "./types.js";
import { new_env, env_get, env_set } from "./env.js";
import { core_ns } from "./core.js";

const READ = (str) => read_str(str);

const eval_ast = (ast, env) => {
  if (typeof ast === "symbol") {
    return env_get(env, ast);
  } else if (ast instanceof Array) {
    return ast.map((x) => EVAL(x, env));
  } else {
    return ast;
  }
};
const EVAL = (ast, env) => {
  if (!isList(ast)) {
    return eval_ast(ast, env);
  }
  if (ast.length === 0) {
    return ast;
  }

  const [a0, a1, a2, a3] = ast;
  switch (typeof a0 === "symbol" ? Symbol.keyFor(a0) : Symbol.for(":default")) {
    case "def":
      return env_set(env, a1, EVAL(a2, env));
    case "let":
      const let_env = new_env(env);
      for (let i = 0; i < a1.length; i += 2) {
        env_set(let_env, a1[i], EVAL(a1[i + 1], let_env));
      }
      return EVAL(a2, let_env);
    case "if":
      // (if a1_cond a2_true a3_false)
      const cond = EVAL(a1, env);
      if (cond === null || cond === false) {
        return typeof a3 !== "undefined" ? EVAL(a3, env) : null;
      }
      return EVAL(a2, env);
    case "fn":
      // new_envの 第2,3引数でenv_setされる
      return (...args) => EVAL(a2, new_env(env, a1, args));
    default:
      // evaluate function
      const [f, ...args] = eval_ast(ast, env);
      return f(...args);
  }
};
const PRINT = (exp) => pr_str(exp);

// repl
const env = new_env();

// core
for (let [k, v] of core_ns) {
  env_set(env, Symbol.for(k), v);
}
export const REP = (str) => PRINT(EVAL(READ(str), env));

export function send(text) {
  try {
    return REP(text);
  } catch (e) {
    if (e instanceof BlankException) return;
    if (e instanceof Error) {
      console.warn(e.stack);
    } else {
      console.warn(`Error: ${e}`);
    }
  }
}
