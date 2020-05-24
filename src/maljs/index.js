const READ = (str) => str;
const EVAL = (ast, env) => ast;
const PRINT = (exp) => exp;

// repl
export const REP = (str) => PRINT(EVAL(READ(str), {}));
