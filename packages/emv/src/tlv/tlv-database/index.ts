export { TLVDatabase } from "./tlv-database";
export { TLVDatabaseEntry } from "./tlv-database-entry";
export { RootTLVInfo, TLVInfo } from "./tlv-info";

import { ByteArray } from "@cryptographix/core";

import { BaseTLV, TLVParseType } from "../base-tlv";

function I2H(value: number): string {
  let len = 2;

  if (value > 0xffffffff) len = 16;
  else if (value > 0xffffff) len = 8;
  else if (value > 0xffff) len = 6;
  else if (value > 0xff) len = 4;

  return ("0".repeat(len - 1) + value.toString(16)).slice(-len).toUpperCase();
}

export class TLV extends BaseTLV {
  public get tagAsHex(): string {
    return I2H(this.tag);
  }

  public get lenAsHex(): string {
    let parse = TLV.parseTLV(this.byteArray, TLV.Encodings.EMV);

    return ByteArray.toString(
      this.byteArray.slice(parse.lenOffset, parse.valueOffset),
      "hex"
    );
  }
}

export class TLVParser {
  static defaults: { extract?: TLVParseType; encoding?: number } = {
    extract: "tlv",
    encoding: TLV.Encodings.EMV
  };

  options: typeof TLVParser.defaults;
  pos: number;

  constructor(public tlvData: ByteArray, options?: typeof TLVParser.defaults) {
    this.options = Object.assign<typeof options, typeof options>(
      TLVParser.defaults,
      options
    );

    this.pos = 0;
  }

  public nextTLV(peek: boolean = false): TLV {
    var info = TLV.parseTLV(
      <any>this.tlvData.slice(this.pos),
      this.options.encoding,
      this.options.extract
    );

    // no TLV found (empty or only padding)
    if (!info) return null;

    if (!peek) {
      switch (this.options.extract) {
        case "tlv":
          this.pos += info.valueOffset + info.len;
          break;
        case "tl":
          this.pos += info.valueOffset;
          break;
        case "t":
          this.pos += info.lenOffset;
          break;
      }
    }

    return new TLV(info.tag, info.value);
  }

  get isEOF(): boolean {
    let buffer = <any>this.tlvData.slice(this.pos);
    let info = TLV.parseTLV(buffer, TLV.Encodings.EMV, "pad");

    // not-erro and no-more-data
    return info && info.tagOffset == buffer.length;
  }
}
