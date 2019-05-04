import { ByteArray } from "@cryptographix/core";

import { Tokenizer, Token, EOF } from "./tokenizer";
import {
  Flow,
  AnyFlowNode,
  ConstantDataNode,
  SelectorDataNode,
  FunctionDataNode,
  TransformerNode,
  MapperNode,
  PipelineNode
} from "../nodes/index";

export class ParseError extends Error {
  constructor(pos: { line: number; col: number }, msg: string) {
    let posn = `(${pos.line + 1},${pos.col + 1}): `;

    super(posn + msg);
  }
}

function isTokenOneOf(token: Token, tokens: string | string[]) {
  let ok = false;

  if (Array.isArray(tokens)) {
    ok = !!tokens.find(t => t == token.value);
  } else ok = tokens == token.value;

  return ok;
}

const operators = ["|>", ".", "{", "}", "[", "]", ",", ":"];

export class FlowParser {
  readonly tokenizer: Tokenizer;

  constructor(text: string) {
    this.tokenizer = new Tokenizer(operators);

    this.tokenizer.startParse(text);

    this.tokenStack = [];
  }

  // LIFO
  protected tokenStack: Token[] = [];

  protected get isEOF() {
    return this.tokenStack.length == 0 && this.tokenizer.isEOF;
  }

  /**
   * Read and consume 'next' token.
   */
  protected readToken(): Token {
    let token = this.token;

    this.tokenStack.shift();

    return token;
  }

  /**
   *
   */
  protected get token(): Token {
    return this.peekToken(0);
  }

  /**
   *
   */
  protected pushToken(token: Token) {
    this.tokenStack.unshift(token);
  }

  /**
   * Take a look an the 'n'th token (0 = current)
   * If necessary, perform read-ahead
   */
  protected peekToken(index: number): Token {
    let stack = this.tokenStack;

    while (!this.isEOF && stack.length <= index) {
      let token = this.tokenizer.nextToken();

      if (0) {
        let posn = `(${token.position.line + 1},${token.position.col + 1}): `;

        switch (token.type) {
          case "integer":
            console.log(posn + "Integer", token.value);
            break;

          case "string":
            console.log(posn + "String", token.value);
            break;

          case "boolean":
            console.log(posn + "Boolean", token.value);
            break;

          case "identifier":
            console.log(posn + "Identifier", token.value);
            break;

          case "token":
            console.log(posn + "Token", token.value);
            break;

          default:
            console.log(posn + token.value);
        }
      }

      if (token.type != "EOF") stack.push(token);
    }

    return index < stack.length ? stack[index] : EOF;
  }

  /**
   *
   */
  protected ensureToken(tokens: string | string[], msg: string) {
    if (!isTokenOneOf(this.token, tokens)) {
      throw new ParseError(this.token.position, msg);
    }

    this.readToken();
  }

  protected isValue(tok: Token) {
    return (
      tok.type == "string" || tok.type == "integer" || tok.type == "boolean"
    );
  }

  protected parseValue<T = boolean | string | number>(): T {
    let token = this.token;
    let value = token.value;

    switch (token.type) {
      case "integer":
        this.readToken();
        return (parseInt(value) as unknown) as T;

      case "string":
        this.readToken();
        return (value as unknown) as T;

      case "boolean":
        this.readToken();
        return ((value != "false") as unknown) as T;

      default:
        throw new ParseError(token.position, "Needed a constant value");
    }
  }

  protected parseString(): string {
    let token = this.token;

    if (token.type == "string") {
      this.readToken();

      return this.readToken().value;
    }

    throw new ParseError(token.position, "Needed a string");
  }

  protected parseIdentifier(): string {
    let token = this.token;

    if (token.type == "identifier") {
      return this.readToken().value;
    }

    throw new ParseError(token.position, "Needed an identifier");
  }

  protected parseObject() {
    let result = {};

    this.ensureToken("{", "Missing '{'");

    while (!this.isEOF && this.token.value != "}") {
      const seq = this.parseIdentifier();

      this.ensureToken(":", "missing property terminator :");

      let item = this.parseValue();

      result[seq] = item;

      if (this.token.value != ",") break;

      this.readToken();
    }

    this.ensureToken("}", "Missing '}'");

    return result;
  }

  protected parseStringOrObject() {
    return this.token.value == "{" ? this.parseObject() : this.parseString();
  }

  protected parseMapperNode(): AnyFlowNode {
    let map = {};
    let id: string;

    this.ensureToken("{", "Missing '{'");

    while (!this.isEOF && this.token.value != "}") {
      const key = this.parseIdentifier();

      if (this.token.value != ":") {
        // Allow ES6 style initializers: { key }
        if (isTokenOneOf(this.token, ["}", ","])) {
          map[key] = new SelectorDataNode(key, key);
        }
      } else {
        this.ensureToken(":", "Missing ':'");

        if (key.indexOf("$") == 0) {
          if (key == "$id") {
            id = this.parseString();
          } else {
            let item = this.parseStringOrObject();

            map[key] = item;
          }
        } else {
          let item: AnyFlowNode;

          switch (this.token.type) {
            case "identifier":
              // just identifier .. must be a selector { id: id2 }
              if (isTokenOneOf(this.peekToken(1), ["}", ","])) {
                item = new SelectorDataNode(this.token.value, key);

                this.readToken();
              } else {
                // should be a FlowNode ..
                item = this.parseFlowNode();
              }
              break;

            default:
              item = this.parseFlowNode();
          }

          map[key] = item;
        }
      }

      if (this.token.value != ",") break;

      this.readToken();
    }

    this.ensureToken("}", "missing '}'");

    return new MapperNode(map, id);
  }

  protected parseInternalNode(): FunctionDataNode | ConstantDataNode<any> {
    let name = this.parseIdentifier();
    let params: string[] = [];

    this.ensureToken("(", "missing '(' on inbuilt");

    if (this.token.type == "string") {
      params.push(this.parseValue<string>());
    }

    this.ensureToken(")", "missing close parenthesis on block");

    switch (name) {
      case "$hex": {
        // Convert param[0] from hex to bytes
        const byteValue = ByteArray.fromString(params[0], "hex");

        return new ConstantDataNode(byteValue, "hex");
      }

      case "$base64": {
        // Convert param[0] from base64 to bytes
        // TODO
        const byteValue = ByteArray.fromString(params[0], "base64");

        return new ConstantDataNode(byteValue, "base64");
      }
    }

    // TODO:
    return new FunctionDataNode(name, params);
  }

  protected parseConstantNode() {
    let token = this.token;

    switch (token.type) {
      case "integer":
        return new ConstantDataNode<number>(this.parseValue(), token.type);

      case "string":
        return new ConstantDataNode<string>(this.parseValue(), token.type);

      case "boolean":
        return new ConstantDataNode<boolean>(this.parseValue(), token.type);
    }
  }

  /*protected parseArray() {
    let result = [];

    this.readToken(); // skip [
    if (this.token.value == "]") {
      return result;
    }

    while (!this.isEOF) {
      const seq = this.parseFlowNode();

      result.push(seq);

      if (this.token.value != ",") break;

      this.readToken();
    }

    this.ensureToken(["]"], "missing array terminator ']'");

    //this.readToken();

    return result;
  }*/

  /**
   *
   *
   *
   */
  protected parseBlockNode(): TransformerNode {
    let block = this.readToken().value;
    let cfg = undefined;
    let name = undefined;

    this.ensureToken("(", "missing '(' on block");

    if (this.token.type == "string") {
      name = this.token.value;
      this.readToken();

      if (this.token.value == ",") {
        this.readToken(); // skip ','

        let tok = this.token;

        if (tok.value != "{") {
          this.ensureToken("{", "missing config parameter on block");
        }
      }
    }

    if (this.token.value == "{") {
      cfg = this.parseObject();
    }

    this.ensureToken(")", "missing close parenthesis on block");

    // TODO:
    return new TransformerNode(block as any, name, cfg);
  }

  /**
   *  Parses a flow node, returning one of:
   *    DataNode:
   *      ConstantDataNode: a literal value -> ""/''/int/bool
   *      SelectorDataNode: a selector '{ out: in } or { io }'
   *      InbuiltDataNode:  a function '$set/$get/$hex/...'
   *    TransformerNode:    a transformer -> Block( id, cfg? )
   *    MapperNode:         a map of named nodes -> '{ key: node, ... }'
   *    PipelineNode:       a pipe of nodes -> N1 |> ...
   */
  protected parseFlowNode(): AnyFlowNode {
    let pipe = [];

    while (!this.isEOF) {
      const token = this.token;
      const val = token.value;

      let item = null;

      if (this.isValue(token)) {
        item = this.parseConstantNode();
      } else if (val == "{") {
        item = this.parseMapperNode();
      } else if (val == "[") {
        //        item = new DataNode( this.parseArray() )
      } else if (token.type == "identifier") {
        // Any 'block' beginning with "$" is an internal function
        if (val.indexOf("$") == 0) {
          // Internal - $func( ... )
          item = this.parseInternalNode();
        } else {
          item = this.parseBlockNode();
        }
      } else {
        throw new ParseError(token.position, "Invalid syntax " + token.value);
      }

      pipe.push(item);

      if (this.isEOF) break;

      if (this.token.value == "|>") {
        this.readToken();
      } else {
        break;
      }
    }

    // Two or more nodes form a pipe
    return pipe.length == 1 ? pipe[0] : new PipelineNode(pipe);
  }

  parseFlow(): Flow {
    let node = this.parseFlowNode();

    if (!this.isEOF) {
      throw new ParseError(this.token.position, "Invalid syntax " + this.token);
    }

    return new Flow(node);
  }
}
