export const core_ns = new Map([
  ["+", (a, b = 0) => a + b],
  ["-", (a, b = 0) => a - b],
  ["*", (a, b = 1) => a * b],
  ["/", (a, b) => a / b],
]);
