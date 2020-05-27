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
});
