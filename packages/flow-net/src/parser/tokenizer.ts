const EOL: string = null;

export function isAlpha(c: string) {
  return /^[A-Z]$/i.test(c);
}

export function isNumber(c: string) {
  return /^[0-9]$/.test(c);
}

export function isWhiteSpace(c: string) {
  return /^[\s]$/.test(c);
}

export function isQuoteChar(c: string) {
  return /^['"]$/.test(c);
}

export function isLineBreak(c: string) {
  return /^[\r\n]$/.test(c);
}

export type Token = {
  type: TokenTypes;
  value: number | string;
};

export type TokenTypes =
  | "EOF"
  | "unknown"
  | "number"
  | "boolean"
  | "string"
  | "identifier"
  | "token";

export const EOF: Token = {
  type: "EOF",
  value: null
};

export class Tokenizer {
  operators: Set<string>;
  text: string = "";
  linePos: number[] = [];
  pos = 0;

  constructor(operators: string[] = []) {
    this.operators = new Set<string>(operators);
  }

  startParse(text: string) {
    this.text = text;

    this.reset();
  }

  reset() {
    this.pos = 0;
    this.linePos = [];

    this.linePos.push(0);

    this.skipToContent();
  }

  get position() {
    this.skipToContent();

    return {
      line: this.linePos.length - 1,
      col: this.pos - this.linePos[this.linePos.length - 1],
      pos: this.pos
    };
  }

  get curChar() {
    return this.text[this.pos];
  }

  get isEOL() {
    return this.isEOF || isLineBreak(this.curChar);
  }

  get isEOF() {
    return this.pos == this.text.length;
  }

  protected markedPos: number;
  markPos() {
    this.markedPos = this.pos;
  }

  getMarkedText() {
    return this.text.slice(this.markedPos, this.pos);
  }

  nextChar(): string {
    const ch = this.peekChar();

    if (!this.isEOF) {
      // end of line, or spaces
      if (!this.skipToContent()) {
        this.pos++;
      }
    }

    return ch;
  }

  peekChar(): string {
    let c = this.text[this.pos];

    return isLineBreak(c) ? EOL : c;
  }

  // Move to next character (skipping blank lines)
  skipToContent(): boolean {
    let pos = this.pos;

    while (!this.isEOF) {
      // Move to start of next unblank line
      if (this.isEOL) {
        const ch = this.curChar == "\n" ? "\r" : "\n";
        this.pos++;
        if (this.curChar == ch) this.pos++;
        this.linePos.push(this.pos);
      } else if (isWhiteSpace(this.curChar)) {
        this.pos++;
      } else {
        break;
      }
    }

    // Moved cursor?
    return pos != this.pos;
  }

  isToken(str: string) {
    return this.operators.has(str);
  }

  nextToken(): Token {
    while (!this.isEOF) {
      if (this.skipToContent()) continue;

      this.markPos();

      let ch = this.peekChar();

      if (isAlpha(ch)) {
        do {
          this.nextChar();

          ch = this.peekChar();
        } while (isAlpha(ch) || isNumber(ch) || ch == "_");

        return {
          type: "identifier",
          value: this.getMarkedText()
        };
      } else if (isNumber(ch) || ch == "+" || ch == "-") {
        do {
          this.nextChar();
        } while (isNumber(this.peekChar()));

        return {
          type: "number",
          value: +this.getMarkedText()
        };
      } else if (isQuoteChar(ch)) {
        let initQuote = ch;

        do {
          this.nextChar();
        } while (!this.isEOL && !(initQuote == this.peekChar()));

        if (this.isEOL) {
          throw new Error("Unterminated string");
        }

        this.nextChar();

        let quoted = this.getMarkedText();

        return {
          type: "string",
          value: quoted.slice(1, quoted.length - 1)
        };
      } else {
        let tok = ch;

        this.nextChar();

        if (this.isToken(tok + this.peekChar())) tok += this.nextChar();

        return {
          type: this.isToken(tok) ? "token" : "unknown",
          value: tok
        };
      }
    }

    return EOF;
  }
}