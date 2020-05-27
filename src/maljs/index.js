import { BlankException, read_str } from "./reader.js";
import { pr_str } from "./printer.js";
import { isList } from "./types.js";

const READ = (str) => read_str(str);

const eval_ast = (ast, env) => {
  if (typeof ast === "symbol") {
    if (ast in env) {
      return env[ast];
    } else {
      throw Error(`'${Symbol.keyFor(ast)}' not found`);
    }
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

  // evaluate function
  const [f, ...args] = eval_ast(ast, env);
  return f(...args);
};
const PRINT = (exp) => pr_str(exp);

// repl
const repl_env = {
  [Symbol.for("+")]: (a, b = 0) => a + b,
  [Symbol.for("-")]: (a, b = 0) => a - b,
  [Symbol.for("*")]: (a, b = 1) => a * b,
  [Symbol.for("/")]: (a, b) => a / b,
};
export const REP = (str) => PRINT(EVAL(READ(str), repl_env));

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
