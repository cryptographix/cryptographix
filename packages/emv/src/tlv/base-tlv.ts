import { ByteArray } from "@cryptographix/core";

export type TLVParseType = "pad" | "t" | "tl" | "tlv";

export class BaseTLV {
  public static Encodings = {
    EMV: 1,
    DGI: 2
  };

  /**
   * Parse and extract TLV information from a ByteArray
   * @return
   *   null:   Malformed TLV
   *   { }:    Info about the TLV, including
   *              tag: TAG if found, 0 otherwise (only padding)
   **/
  static parseTLV(
    buffer: ByteArray,
    encoding: number,
    parseType: TLVParseType = "tlv"
  ): {
    tag: number;
    len: number;
    value: ByteArray;
    tagOffset: number;
    lenOffset: number;
    valueOffset: number;
  } {
    var res = {
      tag: 0,
      len: 0,
      value: undefined,
      tagOffset: 0,
      lenOffset: 0,
      valueOffset: 0
    };
    var off = 0;
    var bytes = buffer;

    switch (encoding) {
      case BaseTLV.Encodings.EMV: {
        while (off < bytes.length && (bytes[off] == 0x00 || bytes[off] == 0xff))
          ++off;

        res.tagOffset = off;

        if (off >= bytes.length || parseType == "pad") return res;

        res.tagOffset = off;
        if ((bytes[off] & 0x1f) == 0x1f) {
          res.tag = bytes[off++] << 8;
          if (off >= bytes.length) return null;
        }

        res.tag |= bytes[off++];

        res.lenOffset = off;

        if (parseType == "t") break;

        // extract "L"
        if (off >= bytes.length) return null;

        var ll = bytes[off] & 0x80 ? bytes[off++] & 0x7f : 1;
        while (ll-- > 0) {
          if (off >= bytes.length) return null;

          res.len = (res.len << 8) | bytes[off++];
        }

        res.valueOffset = off;

        if (parseType == "tl") break;

        // extract "V"
        if (off + res.len > bytes.length) return null;

        res.value = buffer.slice(res.valueOffset, res.valueOffset + res.len);

        //          console.log(res.valueOffset + "+" + res.len + "=" + res.value);
        break;
      }
    }

    return res;
  }

  public byteArray: ByteArray;
  encoding: number;

  constructor(tag: number, value: ByteArray, encoding?: number) {
    this.encoding = encoding || BaseTLV.Encodings.EMV;

    switch (this.encoding) {
      case BaseTLV.Encodings.EMV: {
        var tlvBuffer = new ByteArray([]);
        let bytes = [];

        if (tag >= 0x100) bytes.push((tag >> 8) & 0xff);
        bytes.push(tag & 0xff);

        var len = value.length;
        if (len > 0xff) {
          bytes.push(0x82);
          bytes.push((len >> 8) & 0xff);
        } else if (len > 0x7f) bytes.push(0x81);

        bytes.push(len & 0xff);

        tlvBuffer = new ByteArray(bytes.length + len);
        tlvBuffer.set(bytes, 0);
        tlvBuffer.set(value, bytes.length);

        this.byteArray = tlvBuffer;

        break;
      }
    }
  }

  get tag(): number {
    return BaseTLV.parseTLV(this.byteArray, this.encoding).tag;
  }

  get value(): ByteArray {
    return BaseTLV.parseTLV(this.byteArray, this.encoding).value;
  }

  get len(): number {
    return BaseTLV.parseTLV(this.byteArray, this.encoding).len;
  }
}

BaseTLV.Encodings["CTV"] = 4; // { parse: 0, build: 1 };
