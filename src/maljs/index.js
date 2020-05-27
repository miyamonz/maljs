import { BlankException, read_str } from "./reader.js";
import { pr_str } from "./printer.js";
import { isList } from "./types.js";
import { new_env, env_get, env_set } from "./env.js";

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

  const [a0, a1, a2] = ast;
  switch (typeof a0 === "symbol" ? Symbol.keyFor(a0) : Symbol.for(":default")) {
    case "def":
      return env_set(env, a1, EVAL(a2, env));
    case "let":
      const let_env = new_env(env);
      for (let i = 0; i < a1.length; i += 2) {
        env_set(let_env, a1[i], EVAL(a1[i + 1], let_env));
      }
      return EVAL(a2, let_env);
    default:
      // evaluate function
      const [f, ...args] = eval_ast(ast, env);
      return f(...args);
  }
};
const PRINT = (exp) => pr_str(exp);

// repl
const env = new_env();
env_set(env, Symbol.for("+"), (a, b = 0) => a + b);
env_set(env, Symbol.for("-"), (a, b = 0) => a - b);
env_set(env, Symbol.for("*"), (a, b = 1) => a * b);
env_set(env, Symbol.for("/"), (a, b) => a / b);
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
