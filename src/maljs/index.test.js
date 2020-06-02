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
});
