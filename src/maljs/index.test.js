import assert from "assert";
import { REP } from "./index.js";

describe("maljs", () => {
  it("print number", () => {
    assert.equal(REP("123"), "123");
    assert.equal(REP("123.45"), "123.45");
  });

  it("parse list", () => {
    assert.equal(REP("()"), "()");
    assert.equal(REP("(1)"), "(1)");
    assert.equal(REP("( 1 5   )"), "(1 5)");
    assert.equal(REP("( 1 4  5   )"), "(1 4 5)");
  });
});
