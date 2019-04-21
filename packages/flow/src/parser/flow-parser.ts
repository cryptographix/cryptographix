import { Tokenizer, Token, EOF } from "./tokenizer";
import {
  Flow,
  AnyFlowNode,
  DataNode,
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

const operators = ["|>", ".", "{", "}", "[", "]", ",", ":"];

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export class FlowParser {
  readonly tokenizer: Tokenizer;

  constructor(text: string) {
    this.tokenizer = new Tokenizer(operators);

    this.tokenizer.startParse(text);
  }

  protected get isEOF() {
    return (
      (this._curToken && this._curToken.type == "EOF") || this.tokenizer.isEOF
    );
  }

  private _curToken: Token;
  protected tokPos: PropType<Tokenizer, "position">;

  protected get curToken(): Token {
    if (!this._curToken) {
      let pos = (this.tokPos = this.tokenizer.position);
      let posn = `(${pos.line + 1},${pos.col + 1}): `;

      if (this.isEOF) {
        return (this._curToken = EOF);
      }

      let tok = (this._curToken = this.tokenizer.nextToken());

      if (0)
        switch (tok.type) {
          case "number":
            console.log(posn + "Number", tok.value);
            break;

          case "string":
            console.log(posn + "String", tok.value);
            break;

          case "identifier":
            console.log(posn + "Identifier", tok.value);
            break;

          case "boolean":
            console.log(posn + "Boolean", tok.value);
            break;

          case "token":
            console.log(posn + "Token", tok.value);
            break;

          default:
            console.log(posn + tok.value);
        }
    }

    return this._curToken;
  }

  protected skipToken(): Token {
    const tok = this.curToken;

    this._curToken = null;

    return tok;
  }

  protected ensureToken(tokens: string | string[], msg: string) {
    let tok = this.curToken.value;
    let ok = false;

    if (Array.isArray(tokens)) {
      ok = !!tokens.find(t => t == tok);
    } else ok = tokens == tok;

    if (!ok) throw new ParseError(this.tokPos, msg);

    this.skipToken();
  }

  protected isValue(tok: Token) {
    return (
      tok.type == "string" || tok.type == "number" || tok.type == "boolean"
    );
  }

  protected parseValue() {
    let tok = this.curToken;
    let val = tok.value;

    switch (tok.type) {
      case "string":
      case "number":
      case "boolean":
        this.skipToken();
        break;

      default:
        throw new ParseError(this.tokPos, "Needed a constant value");
    }

    return val;
  }

  protected parseString(): string {
    let tok = this.curToken;
    let val = tok.value;

    if (tok.type == "string") {
      this.skipToken();
      return val as string;
    }

    throw new ParseError(this.tokPos, "Needed a string");
  }

  protected parseIdentifier(): string {
    if (this.curToken.type == "identifier") {
      return this.skipToken().value as string;
    }

    throw new ParseError(this.tokPos, "Needed an identifier");
  }

  protected parseObject() {
    let result = {};

    this.skipToken(); // skip {

    if (this.curToken.value != "}") {
      while (!this.isEOF) {
        const seq = this.parseIdentifier();

        this.ensureToken(":", "missing property terminator :");

        let item = this.parseValue();

        result[seq] = item;

        if (this.curToken.value != ",") break;

        this.skipToken();
      }
    }

    this.ensureToken("}", "Object");

    return result;
  }

  protected parseStringOrObject() {
    return this.curToken.value == "{" ? this.parseObject() : this.parseString();
  }

  protected parseMapperNode(): AnyFlowNode {
    let map = {};
    let id: string;
    //let flow: string | {};

    this.skipToken(); // skip {

    if (this.curToken.value != "}") {
      while (!this.isEOF) {
        const key = this.parseIdentifier();

        this.ensureToken(":", "missing property terminator :");

        if (key.indexOf("$") == 0) {
          if (key == "$id") {
            id = this.parseString();
          } /*else if (key == "$flow") {
            flow = this.parseStringOrObject();
          } */ else {
            let item = this.parseStringOrObject();

            map[key] = item;
          }
        } else {
          let item = this.parseFlowNode();

          map[key] = item;
        }
        if (this.curToken.value != ",") break;

        this.skipToken();
      }
    }

    this.ensureToken("}", "Object");

    return new MapperNode(map, id);
  }

  /*protected parseArray() {
    let result = [];

    this.skipToken(); // skip [
    if (this.curToken.value == "]") {
      return result;
    }

    while (!this.isEOF) {
      const seq = this.parseFlowNode();

      result.push(seq);

      if (this.curToken.value != ",") break;

      this.skipToken();
    }

    this.ensureToken(["]"], "missing array terminator ']'");

    //this.skipToken();

    return result;
  }*/

  protected parseBlockNode(): TransformerNode {
    let block = this.curToken.value;
    let cfg = undefined;
    let name = undefined;
    this.skipToken();

    this.ensureToken("(", "missing open parenthesis on block");

    if (this.curToken.type == "string") {
      name = this.curToken.value;
      this.skipToken();

      if (this.curToken.value == ",") {
        this.skipToken();
        let tok = this.curToken;

        if (tok.value != "{") {
          this.ensureToken("{", "missing config parameter on block");
        }
      }

      //console.log("Got label", name);
    }

    if (this.curToken.value == "{") {
      cfg = this.parseObject();
      console.log("Got CFG", cfg);
    }

    this.ensureToken(")", "missing close parenthesis on block");

    // TODO:
    return new TransformerNode(block as any, name, cfg);
  }

  /**
   *  Parses a flow node, returning one of:
   *    DataNode:         a literal value -> ""/''/int/bool/0xHEX,0bBASE64
   *    TransformerNode:  a transformer -> Block( opts?, cfg? )
   *    MapperNode:       a map of named nodes -> '{ key: node, ... }'
   *    PipelineNode:     a pipe of nodes -> N1 |>
   */
  protected parseFlowNode(): AnyFlowNode {
    let pipe = [];

    while (!this.isEOF) {
      const tok = this.curToken;
      const val = tok.value;

      let item = null;

      if (this.isValue(tok)) {
        item = new DataNode("" + this.parseValue());
      } else if (val == "{") {
        item = this.parseMapperNode();
      } else if (val == "[") {
        //        item = new DataNode( this.parseArray() )
      } else if (tok.type == "identifier") {
        item = this.parseBlockNode();
      } else {
        throw new ParseError(this.tokPos, "Invalid syntax " + tok);
      }

      pipe.push(item);

      if (this.isEOF) break;

      if (this.curToken.value == "|>") {
        this.skipToken();
      } else {
        break;
      }
    }

    return pipe.length == 1 ? pipe[0] : new PipelineNode(pipe);
  }

  parseFlow(): Flow {
    let node = this.parseFlowNode();

    if (!this.isEOF) {
      throw new ParseError(this.tokPos, "Invalid syntax " + this.curToken);
    }

    return new Flow(node);
  }
}
