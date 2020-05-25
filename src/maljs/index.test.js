import assert from "assert";
import { REP } from "./index.js";

describe("maljs", () => {
  it("print number", () => {
    assert.equal(REP("123"), "123");
    assert.equal(REP("123.45"), "123.45");
  });
});
