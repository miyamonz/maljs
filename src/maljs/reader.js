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
  const re = /[\s,]*(~@|[()'`~@]|"(?:\\.|[^\\"])*"?|;.*|[^\s,();]*)/g;
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

function read_form(reader) {
  const token = reader.peek();
  switch (token) {
    // reader macros/transforms
    case ";":
      return null; // Ignore comments
    case "@":
      reader.next();
      return [Symbol.for("deref"), read_form(reader)];

    case `'`:
      reader.next();
      return [Symbol.for("quote"), read_form(reader)];
    case "`":
      reader.next();
      return [Symbol.for("quasiquote"), read_form(reader)];
    case "~":
      reader.next();
      return [Symbol.for("unquote"), read_form(reader)];
    case "~@":
      reader.next();
      return [Symbol.for("splice-unquote"), read_form(reader)];

    // list
    case ")":
      throw new Error("unexpected ')'");
    case "(":
      return read_list(reader);
    default:
      return read_atom(reader);
  }
}

// read list of tokens
function read_list(reader) {
  const ast = []; // consider it as list
  let token = reader.next();
  if (token !== "(") {
    throw new Error("expected '('");
  }
  while ((token = reader.peek()) !== ")") {
    if (!token) {
      console.error(reader.tokens);
      throw new Error("expected ')', got EOF");
    }
    ast.push(read_form(reader));
  }
  reader.next();
  return ast;
}

function read_atom(reader) {
  const token = reader.next();
  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token, 10); // integer
  } else if (token.match(/^-?[0-9][0-9.]*$/)) {
    return parseFloat(token, 10); // float
  } else if (token.match(/^"(?:\\.|[^\\"])*"$/)) {
    return token
      .slice(1, token.length - 1)
      .replace(/\\(.)/g, (_, c) => (c === "n" ? "\n" : c)); //string
  } else if (token[0] === `"`) {
    throw new Error(`expected '"', but got EOF`);
  } else if (token === "nil") {
    return null;
  } else if (token === "true") {
    return true;
  } else if (token === "false") {
    return false;
  } else {
    return Symbol.for(token); // symbol
  }
}

export function read_str(str) {
  const tokens = tokenize(str);
  if (tokens.length === 0) {
    throw new BlankException(`token is blank ${str}`);
  }
  return read_form(new Reader(tokens));
}
