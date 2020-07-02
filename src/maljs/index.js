import { BlankException, read_str } from "./reader.js";
import { pr_str } from "./printer.js";
import { isList, _clone } from "./types.js";
import { new_env, env_get, env_set } from "./env.js";
import { core_ns } from "./core.js";

const READ = (str) => read_str(str);

const is_pair = (x) => Array.isArray(x) && x.length > 0;
// quasiquoteはastをlistで受ける
// 再帰している
// 一番手前の要素から、unquoteに評価結果をconsかconcatで結合しながらlistを返す
const quasiquote = (ast) => {
  if (!is_pair(ast)) {
    return [Symbol.for("quote"), ast];
  } else if (ast[0] === Symbol.for("unquote")) {
    return ast[1];
  } else if (is_pair(ast[0]) && ast[0][0] === Symbol.for("splice-unquote")) {
    return [Symbol.for("concat"), ast[0][1], quasiquote(ast.slice(1))];
  } else {
    return [Symbol.for("cons"), quasiquote(ast[0]), quasiquote(ast.slice(1))];
  }
};

const macroexpand = (ast, env) => {
  // macroexpandはlistでかつ関数呼び出しの形に行われる
  while (isList(ast) && typeof ast[0] === "symbol" && ast[0] in env) {
    let f = env_get(env, ast[0]);
    if (!f.ismacro) {
      break;
    }
    ast = f(...ast.slice(1));
  }
  return ast;
};

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
  while (true) {
    if (!isList(ast)) return eval_ast(ast, env);
    //評価されるastは常にmacro展開を試みる
    ast = macroexpand(ast, env);
    if (!isList(ast)) return eval_ast(ast, env);
    if (ast.length === 0) return ast;

    const [a0, a1, a2, a3] = ast;
    switch (
      typeof a0 === "symbol" ? Symbol.keyFor(a0) : Symbol.for(":default")
    ) {
      case "def":
        return env_set(env, a1, EVAL(a2, env));
      case "let":
        const let_env = new_env(env);
        for (let i = 0; i < a1.length; i += 2) {
          env_set(let_env, a1[i], EVAL(a1[i + 1], let_env));
        }
        ast = a2;
        env = let_env;
        //return EVAL(a2, let_env);
        break;
      case "quote":
        return a1;
      case "quasiquote":
        ast = quasiquote(a1);
        break; // continue TCO loop
      case "defmacro":
        const func = _clone(EVAL(a2, env));
        func.ismacro = true;
        return env_set(env, a1, func);
      case "macroexpand":
        return macroexpand(a1, env);
      case "try":
        try {
          return EVAL(a1, env);
        } catch (exc) {
          if (a2 && a2[0] === Symbol.for("catch")) {
            if (exc instanceof Error) exc = exc.message;
            return EVAL(a2[2], new_env(env, [a2[1]], [exc]));
          } else {
            throw exc;
          }
        }
      case "do":
        eval_ast(ast.slice(1, -1), env);
        ast = ast[ast.length - 1];
        //return eval_ast(ast.slice(1), env)[ast.length - 2];
        break;
      case "if":
        // (if a1_cond a2_true a3_false)
        const cond = EVAL(a1, env);
        if (cond === null || cond === false) {
          ast = typeof a3 !== "undefined" ? a3 : null;
        } else {
          ast = a2;
        }
        //return EVAL(a2, env);
        break;
      case "fn":
        // new_envの 第2,3引数でenv_setされる

        const fn = (...args) => EVAL(a2, new_env(env, a1, args));
        // これはそのままこのEVALループで評価されたら、
        // createMalFuncが作成するメタデータ側で評価されるのでこのfnが使われないが
        // その他のswap!とかで使われたりするので定義しておく必要はある

        return createMalFunc(fn, a2, env, a1);
      default:
        // evaluate function
        const [f, ...args] = eval_ast(ast, env);
        if (isMalFunc(f)) {
          // malで定義された関数なら、fを直接実行せずにtail-call optimizeできる
          env = new_env(f.env, f.params, args);
          ast = f.ast;
          break;
        } else {
          return f(...args);
        }
    }
  }
};

function createMalFunc(fn, ast, env, params, meta = null, ismacro = false) {
  return Object.assign(fn, { ast, env, params, meta, ismacro });
}
const isMalFunc = (fn) => (fn.ast ? true : false);
const PRINT = (exp) => pr_str(exp);

// repl
const env = new_env();

// core
for (let [k, v] of core_ns) {
  env_set(env, Symbol.for(k), v);
}
env_set(env, Symbol.for("eval"), (a) => EVAL(a, env));
export const REP = (str) => PRINT(EVAL(READ(str), env));

//defined using language itself
REP("(def not (fn (a) (if a false true)))");

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
