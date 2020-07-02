import assert from "assert";
import { REP } from "./index.js";

describe("maljs", () => {
  it("print number", () => {
    assert.equal(REP("123"), "123");
    assert.equal(REP("123.45"), "123.45");
  });

  it("print atom", () => {
    //assert.equal(REP("hoge"), "hoge");
    //assert.equal(REP("nil"), "nil");
  });

  it("parse list and calc number", () => {
    assert.equal(REP("()"), "()");
    assert.equal(REP("(+ 1 )"), "1");
    assert.equal(REP("(+ 1 5   )"), "6");
    assert.equal(REP("(*  -4  5   )"), "-20");

    assert.equal(REP("( +   1   (+   2 3   )   )"), "6");
    assert.equal(REP("(/  14  2   )"), "7");

    assert.equal(REP("(/ (- (+ 515 (* -87 311)) 296) 27)"), "-994");

    // 2つより多い引数は未サポート 難しくはないと思う
  });

  describe("environment", () => {
    it("def", () => {
      assert.equal(REP("(def x 1)"), "1");
      assert.equal(REP("(+ x 1 )"), "2");
    });

    it("let", () => {
      assert.equal(REP("(let (z 5) z )"), "5");
      assert.equal(REP("(let (p 5, q 3) (+ p q) )"), "8");
      REP("(def  y (let (z 10) 10) )");
      assert.equal(REP("y"), "10");
    });

    it("outside", () => {
      assert.equal(REP("(def a  5 )"), "5");
      assert.equal(REP("(let (b  8) a )"), "5");
      assert.equal(REP("(let (c  10) (let (d 4) a) )"), "5");
    });
  });

  describe("list", () => {
    it("list", () => {
      assert.equal(REP("(list)"), "()");
      assert.equal(REP("(list? ())"), "true");
      assert.equal(REP("(list? (list 6 4))"), "true");
      assert.equal(REP("(list? 4)"), "false");

      assert.equal(REP("(empty? (list))"), "true");
      assert.equal(REP("(empty? (list 1))"), "false");

      assert.equal(REP("(count (list))"), "0");
      assert.equal(REP("(count (list 4))"), "1");
      assert.equal(REP("(count (list 4 6))"), "2");
    });
  });

  describe("conditional", () => {
    it("boolean", () => {
      assert.equal(REP("true"), "true");
      assert.equal(REP("false"), "false");
      assert.equal(REP("nil"), "nil");
    });
    it("if", () => {
      assert.equal(REP("(if true 2)"), "2");
      assert.equal(REP("(if false 2 3)"), "3");
      assert.equal(REP("(if nil 2 3)"), "3");

      // only nil and false are falsy.
      assert.equal(REP("(if 0 2 3)"), "2");
      // empty list is truthy.
      assert.equal(REP("(if () 2 3)"), "2");
    });
    it("conditional", () => {
      assert.equal(REP("(= 0 0)"), "true");
      assert.equal(REP("(= 1 0)"), "false");

      assert.equal(REP("(= (list 4 6) (list 4 (+ 3 3 )))"), "true");
      assert.equal(REP("(= (list 5 6) (list 4 (+ 3 3 )))"), "false");

      assert.equal(REP("(> 1 0)"), "true");
      assert.equal(REP("(> 0 0)"), "false");

      assert.equal(REP("(>= 1 0)"), "true");
      assert.equal(REP("(>= 0 0)"), "true");
      assert.equal(REP("(>= 0 3)"), "false");

      assert.equal(REP("(< 1 0)"), "false");
      assert.equal(REP("(< 0 0)"), "false");
      assert.equal(REP("(< 0 1)"), "true");

      assert.equal(REP("(<= 1 0)"), "false");
      assert.equal(REP("(<= 0 0)"), "true");
      assert.equal(REP("(<= 0 3)"), "true");
    });
  });
  it("str", () => {
    assert.equal(REP(`(str)`), `""`);
    assert.equal(REP(`(str "")`), `""`);
    assert.equal(REP(`(str "abc")`), `"abc"`);
    assert.equal(REP(`(str 1 "abc" 3)`), `"1abc3"`);

    assert.equal(
      REP(String.raw`(str "abc\\def\\ghi")`),
      String.raw`"abc\\def\\ghi"`
    );
    assert.equal(REP(`(str (list))`), `"()"`);
  });
  describe("function", () => {
    it("fn", () => {
      assert.equal(REP("((fn (a b) (+ a b)) 1 2)"), "3");
      assert.equal(REP("((fn () 3) )"), "3");
      assert.equal(REP("((fn (f x) (f x)) (fn (a) (+ 1 a)) 4 )"), "5");
      assert.equal(REP("(((fn (b) (fn (a) (+ b a))) 4) 5)"), "9");

      REP("(def plus5 (fn (a) (+ a 5)) )");
      assert.equal(REP("(plus5 3)"), "8");

      REP("(def gen-plusX (fn (x) (fn (a) (+ a x)) ))");
      REP("(def plus3 (gen-plusX 3))");
      assert.equal(REP("(plus3 5)"), "8");
    });

    it("recursive function", () => {
      //fibbonati
      REP(`
          (def fib 
            (fn (N) 
              (if (= N 0) 
                1 
                (if (= N 1) 
                  1 
                  (+ 
                    (fib (- N 1)) 
                    (fib (- N 2)))))))
    `);
      assert.equal(REP("(fib 1)"), "1");
      assert.equal(REP("(fib 5)"), "8");
      assert.equal(REP("(fib 6)"), "13");
    });
  });
  describe("do", () => {
    it("do", () => {
      assert.equal(REP("(do 5 8)"), "8");
      assert.equal(REP("(do (def a 5) a)"), "5");
      assert.equal(REP("(do (def a 6) 7  (+ a 3))"), "9");
      assert.equal(REP("(do (do 8))"), "8");
    });
  });

  describe("recursive tail-call function", () => {
    it("sum", () => {
      REP(
        " (def sum2 (fn (n acc) (if (= n 0) acc (sum2 (- n 1) (+ n acc))))) "
      );
      assert.equal(REP("(sum2 10 0)"), "55");
      assert.equal(REP("(def res2 nil)"), "nil");
      assert.equal(REP("(do (def res2 (sum2 10000 0)) res2)"), "50005000");
    });
    it("mutually recursive tail-call function", () => {
      REP("(def foo (fn (n) (if (= n 0) 0 (bar (- n 1)))))");
      REP("(def bar (fn (n) (if (= n 0) 0 (foo (- n 1)))))");
      assert.equal(REP("(foo 10000)"), "0");
    });
  });
  it("comment", () => {
    assert.equal(REP(`100; hello`), `100`);
  });
  describe("string", () => {
    it("literal", () => {
      assert.equal(REP(`"hoge"`), `"hoge"`);
      assert.equal(REP(String.raw`"ho\"ge"`), String.raw`"ho\"ge"`);
      assert.equal(REP(String.raw`"hoge\n"`), String.raw`"hoge\n"`);
    });
    it("read-string", () => {
      assert.equal(REP(`(read-string "(1 2 (3 4) nil)")`), "(1 2 (3 4) nil)");
      assert.equal(REP(`(read-string "a")`), `a`);
      assert.equal(REP(String.raw`(read-string "\"\n\"")`), String.raw`"\n"`);
      assert.equal(REP(`(read-string "4; comment")`), `4`);
    });
    it("read-string eval", () => {
      assert.equal(REP(`(eval (read-string "(+ 2 3)"))`), "5");
      assert.equal(
        REP(`(let () (do (eval (read-string "(def aa 7)")) aa ))`),
        7
      );
    });
  });

  describe("atom", () => {
    it("atom", () => {
      assert.equal(REP(`(def a (atom 2))`), `(atom 2)`);
      assert.equal(REP(`(atom? a)`), `true`);
      assert.equal(REP(`(atom? 1)`), `false`);
      assert.equal(REP(`(deref a)`), `2`);
      assert.equal(REP(`(reset! a 3)`), `3`);
      assert.equal(REP(`(deref a)`), `3`);
    });
    it("@", () => {
      assert.equal(REP(`(def b (atom 5))`), `(atom 5)`);
      assert.equal(REP(`@b`), `5`);
    });
    it("swap", () => {
      assert.equal(REP(`(swap! a (fn (a) a))`), `3`);
      assert.equal(REP(`(swap! a (fn (a) (* a 2)))`), `6`);
      assert.equal(REP(`(swap! a (fn (a b) (* a b)) 10)`), `60`); // (swap! atom fn ...args) は atom.val = f(atom.val, ...args)
      assert.equal(REP(`(swap! a + 4)`), `64`); // こういうことが可能になる

      REP(`(def inc (fn (a) (+ 1 a)))`);
      REP(`(def atm (atom 3))`);
      REP(`(def f (fn () (swap! atm inc)))`);
      assert.equal(REP(`(f)`), `4`);
      assert.equal(REP(`(f)`), `5`);
    });
    it("closures can retain atoms", () => {
      REP(`(def g (let (atm (atom 0)) (fn () (deref atm))))`);
      REP(`(def atm (atom 1))`);
      assert.equal(REP(`(g)`), `0`);
    });
    it("cons", () => {
      assert.equal(REP(`(cons 1 (list))`), `(1)`);
      assert.equal(REP(`(cons 1 (list 2))`), `(1 2)`);
      assert.equal(REP(`(cons 1 (list 2 3))`), `(1 2 3)`);
      assert.equal(REP(`(cons (list 1) (list 2 3))`), `((1) 2 3)`);

      REP(`(def a (list 2 3))`);
      assert.equal(REP(`(cons 1 a)`), `(1 2 3)`);
      assert.equal(REP(`a`), `(2 3)`);
    });
    it("concat", () => {
      assert.equal(REP(`(concat)`), `()`);
      assert.equal(REP(`(concat (list 1 2))`), `(1 2)`);
      assert.equal(REP(`(concat (list 1 2) (list 3 4))`), `(1 2 3 4)`);
      assert.equal(
        REP(`(concat (list 1 2) (list 3 4) (list 5 6))`),
        `(1 2 3 4 5 6)`
      );
      assert.equal(REP(`(concat (concat))`), `()`);
      assert.equal(REP(`(concat (list) (list))`), `()`);

      REP(`(def a (list 1 2))`);
      REP(`(def b (list 3 4))`);
      assert.equal(REP(`(concat a b (list 5 6))`), `(1 2 3 4 5 6)`);
      assert.equal(REP(`a`), `(1 2)`);
      assert.equal(REP(`b`), `(3 4)`);
    });

    it("nth", () => {
      assert.equal(REP(`(nth (list 1) 0)`), `1`);
      return;
      assert.equal(REP(`(nth (list 1 2) 1)`), `2`);
      assert.equal(REP(`(nth (list 1 2 nil) 2)`), `nil`);
      REP(`(def x "x")`);
      REP(`(def x (nth (list 1 2) 2))`);
      assert.equal("x", `"x"`);
    });

    it("first", () => {
      assert.equal(REP(`(first (list))`), `nil`);
      assert.equal(REP(`(first nil)`), `nil`);
      assert.equal(REP(`(first (list 10))`), `10`);
      assert.equal(REP(`(first (list 10 11 12))`), `10`);
    });

    it("quote", () => {
      assert.equal(REP(`(quote 7)`), `7`);
      assert.equal(REP(`(quote (1 2 3))`), `(1 2 3)`);
      assert.equal(REP(`(quote (1 2 (3 4)))`), `(1 2 (3 4))`);

      //shorthand
      assert.equal(REP(`'(1 2 3)`), `(1 2 3)`);
    });
    it("quasiquote", () => {
      assert.equal(REP(`(quasiquote 7)`), `7`);
      assert.equal(REP(`(quasiquote (1 2 3))`), `(1 2 3)`);
      assert.equal(REP(`(quasiquote (1 2 (3 4)))`), `(1 2 (3 4))`);
      assert.equal(REP(`(quasiquote (nil))`), `(nil)`);

      //shorthand
      assert.equal(REP("`(1 2 3)"), `(1 2 3)`);
    });
    it("unquote", () => {
      assert.equal(REP(`(quasiquote (unquote 7))`), `7`);
      assert.equal(REP(`(def a 8)`), `8`);
      assert.equal(REP(`(quasiquote a)`), `a`);
      assert.equal(REP(`(quasiquote (unquote a))`), `8`);
      assert.equal(REP(`(quasiquote (1 a 3))`), `(1 a 3)`);
      assert.equal(REP(`(quasiquote (1 (unquote a) 3))`), `(1 8 3)`);
      assert.equal(REP(`(def b (quote (1 "b" "d")))`), `(1 "b" "d")`);
      assert.equal(REP(`(quasiquote (1 b 3))`), `(1 b 3)`);
      assert.equal(REP(`(quasiquote (1 (unquote b) 3))`), `(1 (1 "b" "d") 3)`);
      assert.equal(REP(`(quasiquote ((unquote 1) (unquote 2)))`), `(1 2)`);

      //shorthand
      assert.equal(REP("`(1 ~b 3)"), `(1 (1 "b" "d") 3)`);
    });
    it("splice-unquote", () => {
      assert.equal(REP(`(def c (quote (1 "b" "d")))`), `(1 "b" "d")`);
      assert.equal(REP(`(quasiquote (1 c 3))`), `(1 c 3)`);
      assert.equal(
        REP(`(quasiquote (1 (splice-unquote c) 3))`),
        `(1 1 "b" "d" 3)`
      );
      //shorthand
      assert.equal(REP("`(1 ~@c 3)"), `(1 1 "b" "d" 3)`);
    });
    it("quote equality", () => {
      assert.equal(REP(`(= (quote abc) (quote abc))`), `true`);
      assert.equal(REP(`(= (quote abc) (quote abcd))`), `false`);
      assert.equal(REP(`(= (quote abc) "abc")`), `false`);
      assert.equal(REP(`(= "abc" (quote abc))`), `false`);
      assert.equal(REP(`(= "abc" (str (quote abc)))`), `true`);
      assert.equal(REP(`(= (quote abc) nil)`), `false`);
      assert.equal(REP(`(= nil (quote abc))`), `false`);
    });
    it("defmacro", () => {
      REP(`(defmacro one (fn () 1))`);
      assert.equal(REP(`(one)`), `1`);
      REP(`(defmacro two (fn () 2))`);
      assert.equal(REP(`(two)`), `2`);
      REP("(defmacro unless (fn (pred a b) `(if ~pred ~b ~a)))");
      assert.equal(REP(`(unless false 7 8)`), `7`);
      assert.equal(REP(`(unless true 7 8)`), `8`);
      REP(`(defmacro unless2 (fn (pred a b) (list 'if (list 'not pred) a b)))`);
      assert.equal(REP(`(unless2 false 7 8)`), `7`);
      assert.equal(REP(`(unless2 true 7 8)`), `8`);
    });
    it("macroexpand", () => {
      assert.equal(REP(`(macroexpand (unless2 2 3 4))`), `(if (not 2) 3 4)`);
    });
  });
});
