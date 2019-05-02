const EOL: string = null;

export function isAlpha(c: string) {
  return /^[A-Z]$/i.test(c);
}

export function isDigit(c: string) {
  return /^[0-9]$/.test(c);
}

export function isHexChar(c: string) {
  return /^[A-F0-9a-f]$/i.test(c);
}
export function isBase64Char(c: string) {
  return /^[A-Za-z0-9\+/=]$/i.test(c);
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

export function isIdentifierChar(c: string, init: boolean = false) {
  return /^[A-Z_]$/i.test(c) || c == "$" || (!init && isDigit(c));
}

export type TokenTypes =
  | "EOF"
  | "unknown"
  | "number"
  | "boolean"
  | "string"
  | "identifier"
  | "token";

export type Token = {
  type: TokenTypes;
  value: string;

  position?: {
    line: number;
    col: number;
    pos: number;
  };
};

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
    return pos != this.pos && !this.isEOF;
  }

  isToken(str: string) {
    return this.operators.has(str);
  }

  /**
   *
   */
  nextToken(): Token {
    let result = EOF;

    while (!this.isEOF) {
      if (!this.skipToContent()) break;
    }

    let position = {
      line: this.linePos.length - 1,
      col: this.pos - this.linePos[this.linePos.length - 1],
      pos: this.pos
    };

    // Found any content?
    if (!this.isEOF) {
      this.markPos();

      let ch = this.peekChar();

      if (isIdentifierChar(ch, true)) {
        do {
          this.nextChar();

          ch = this.peekChar();
        } while (isIdentifierChar(ch));

        const ident = this.getMarkedText();

        if (ident == "true" || ident == "false")
          result = {
            type: "boolean",
            value: ident
          };
        else
          result = {
            type: "identifier",
            value: ident
          };
      } else if (isDigit(ch) || ch == "+" || ch == "-") {
        this.nextChar();

        // Handle hex constants "0x"
        if (ch == "0" && this.peekChar() == "x") {
          this.nextChar();

          while (isHexChar(this.peekChar())) {
            this.nextChar();
          }
        } else {
          while (isDigit(this.peekChar())) {
            this.nextChar();
          }
        }

        result = {
          type: "number",
          value: this.getMarkedText()
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

        result = {
          type: "string",
          value: quoted.slice(1, quoted.length - 1)
        };
      } else {
        let tok = ch;

        this.nextChar();

        if (this.isToken(tok + this.peekChar())) tok += this.nextChar();

        result = {
          type: this.isToken(tok) ? "token" : "unknown",
          value: tok
        };
      }
    }

    return {
      ...result,
      position
    };
  }
}
