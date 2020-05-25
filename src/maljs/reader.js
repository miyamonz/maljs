export class BlankException extends Error {}

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }
  next() {
    return this.tokens[this.position++];
  }
  peek() {
    return this.tokens[this.position];
  }
}

function tokenize(str) {
  const re = /[\s,]*([^\s]*)/g;
  let match = null;
  let results = [];
  while ((match = re.exec(str)[1]) != "") {
    if (match[0] === ";") {
      continue;
    }
    results.push(match);
  }
  return results;
}

function read_atom(reader) {
  const token = reader.next();
  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token, 10); // integer
  } else if (token.match(/^-?[0-9][0-9.]*$/)) {
    return parseFloat(token, 10); // float
  } else {
    return Symbol.for(token); // symbol
  }
}

export function read_str(str) {
  const tokens = tokenize(str);
  if (tokens.length === 0) {
    throw new BlankException();
  }
  return read_atom(new Reader(tokens));
}
