import { BlankException, read_str } from "./reader.js";

const READ = (str) => read_str(str);
const EVAL = (ast, env) => ast;
const PRINT = (exp) => exp.toString();

// repl
export const REP = (str) => PRINT(EVAL(READ(str), {}));

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
