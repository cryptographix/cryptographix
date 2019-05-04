import { Environment } from "../platform/environment";

export function H2BA(s: string) {
  return ByteArray.fromString(s, "hex");
}
export function BA2H(ba: ByteArray) {
  return ByteArray.toString(ba, "hex").toUpperCase();
}
export function S2BA(s: string) {
  return ByteArray.fromString(s);
}
export function BA2S(ba: ByteArray) {
  return ByteArray.toString(ba);
}

function h2b(s: string): number {
  return "0123456789ABCDEF".indexOf(s && s.toUpperCase());
}

export class ByteArray extends Uint8Array {
  static alloc(len: number): Uint8Array {
    return new ByteArray(len);
  }
  /**
   *
   */
  static fromString(
    data: string,
    fmt?: "hex" | "base64" | "ascii"
  ): Uint8Array {
    let bytes: Uint8Array;

    if (!fmt || fmt == "ascii") {
      bytes = ByteArray.alloc(data.length);

      for (let i = 0; i < data.length; ++i) bytes[i] = data.charCodeAt(i);

      return bytes;
    }

    if (fmt == "hex" && typeof data == "string") data = data.replace(/\s/g, "");

    if (Environment.isNode()) return ByteArray.from(Buffer.from(data, fmt));

    switch (fmt) {
      /*      case "utf8": {
        let l = data.length;
        bytes = ByteArray.alloc(l);
        for (let i = 0, j = 0; j < l; j++, i++) {
          bytes[i] = data.charCodeAt(j);
        }*/

      case "hex": {
        if (!/[a-fA-F0-9]*/i.test(data) || data.length % 2 != 0)
          throw new Error("Invalid hexadecimal string");

        let l = data.length / 2;
        bytes = ByteArray.alloc(l);
        for (let i = 0, j = 0; j < l; j++, i += 2) {
          let b = (h2b(data[i]) << 4) + h2b(data[i + 1]);

          if (b >= 0) {
            bytes[j] = b;
          } else throw new Error("Invalid hexadecimal string");
        }
        break;
      }

      case "base64": {
        bytes = Base64.decode(data);
        break;
      }
    }

    return bytes;
  }

  /**
   *
   */
  static toString(
    bytes: ByteArray,
    fmt?: "hex" | "ascii" | "base64" | "utf8"
  ): string {
    if (!fmt) {
      let str = "";

      for (let i = 0; i < bytes.length; ++i)
        str += String.fromCharCode(bytes[i]);

      return str;
    }

    if (Environment.isNode()) return Buffer.from(bytes).toString(fmt);

    let s = "";

    switch (fmt) {
      case "hex": {
        for (let i = 0; i < bytes.length; ++i) {
          if (s.length > 0) s += " ";
          s += ("0" + bytes[i].toString(16).toUpperCase()).slice(-2);
        }
        break;
      }

      case "base64":
        s = Base64.encode(bytes);
        break;
    }
    return s;
  }

  /**
   *
   */
  static shiftBitsLeft(bytesIn: Uint8Array): Uint8Array {
    let bytesOut = ByteArray.alloc(bytesIn.length);
    let bitIn = 0;

    for (let idx = bytesIn.length - 1; idx >= 0; --idx) {
      let byte = bytesIn[idx];
      bytesOut[idx] = (byte << 1) | bitIn;
      bitIn = byte >> 7;
    }

    return bytesOut;
  }

  /**
   *
   */
  static xor(bytesA: Uint8Array, bytesB: Uint8Array): Uint8Array {
    let bytesOut = ByteArray.alloc(bytesA.length);

    for (let idx = bytesOut.length - 1; idx >= 0; --idx) {
      let byte = bytesA[idx];
      bytesOut[idx] = byte ^ bytesB[idx];
    }

    return bytesOut;
  }

  /**
   *
   */
  static and(bytesA: Uint8Array, bytesB: Uint8Array): Uint8Array {
    let bytesOut = ByteArray.alloc(bytesA.length);

    for (let idx = bytesOut.length - 1; idx >= 0; --idx) {
      let byte = bytesA[idx];
      bytesOut[idx] = byte & bytesB[idx];
    }

    return bytesOut;
  }

  /**
   *
   */
  static concat(bytes: Uint8Array[]): Uint8Array {
    let size = bytes.reduce((acc, item) => {
      return acc + item.length;
    }, 0);
    let bytesOut = ByteArray.alloc(size);
    let out = 0;

    bytes.forEach(item => {
      bytesOut.set(item, out);
      out += item.length;
    });

    return bytesOut;
  }

  /**
   *
   */
  static compare(bytesA: Uint8Array, bytesB: Uint8Array): number {
    const lenA = bytesA.length;
    const lenB = bytesB.length;
    const len = lenA > lenB ? lenB : lenA;

    for (let idx = 0; idx < len; ++idx) {
      let byte = bytesA[idx] - bytesB[idx];

      if (byte != 0) {
        return byte < 0 ? -1 : 1;
      }
    }

    return lenA > lenB ? 1 : 0;
  }

  static from(value: number[] | Buffer) {
    return new ByteArray(value);
  }
}

namespace Base64 {
  type byte = number;

  enum BASE64SPECIALS {
    PLUS = "+".charCodeAt(0),
    SLASH = "/".charCodeAt(0),
    NUMBER = "0".charCodeAt(0),
    LOWER = "a".charCodeAt(0),
    UPPER = "A".charCodeAt(0),
    PLUS_URL_SAFE = "-".charCodeAt(0),
    SLASH_URL_SAFE = "_".charCodeAt(0)
  }

  export function decode(b64: string): Uint8Array {
    if (b64.length % 4 > 0) {
      throw new Error("Invalid base64 string. Length must be a multiple of 4");
    }

    function decode(elt: String): number {
      var code = elt.charCodeAt(0);

      if (code === BASE64SPECIALS.PLUS || code === BASE64SPECIALS.PLUS_URL_SAFE)
        return 62; // '+'

      if (
        code === BASE64SPECIALS.SLASH ||
        code === BASE64SPECIALS.SLASH_URL_SAFE
      )
        return 63; // '/'

      if (code >= BASE64SPECIALS.NUMBER) {
        if (code < BASE64SPECIALS.NUMBER + 10)
          return code - BASE64SPECIALS.NUMBER + 26 + 26;

        if (code < BASE64SPECIALS.UPPER + 26)
          return code - BASE64SPECIALS.UPPER;

        if (code < BASE64SPECIALS.LOWER + 26)
          return code - BASE64SPECIALS.LOWER + 26;
      }

      throw new Error("Invalid base64 string. Character not valid");
    }

    // the number of equal signs (place holders)
    // if there are two placeholders, than the two characters before it
    // represent one byte
    // if there is only one, then the three characters before it represent 2 bytes
    // this is just a cheap hack to not do indexOf twice
    let len = b64.length;
    let placeHolders =
      b64.charAt(len - 2) === "=" ? 2 : b64.charAt(len - 1) === "=" ? 1 : 0;

    // base64 is 4/3 + up to two characters of the original data
    let arr = new Uint8Array((b64.length * 3) / 4 - placeHolders);

    // if there are placeholders, only get up to the last complete 4 chars
    let l = placeHolders > 0 ? b64.length - 4 : b64.length;

    var L = 0;

    function push(v: byte) {
      arr[L++] = v;
    }

    let i = 0,
      j = 0;

    for (; i < l; i += 4, j += 3) {
      let tmp =
        (decode(b64.charAt(i)) << 18) |
        (decode(b64.charAt(i + 1)) << 12) |
        (decode(b64.charAt(i + 2)) << 6) |
        decode(b64.charAt(i + 3));
      push((tmp & 0xff0000) >> 16);
      push((tmp & 0xff00) >> 8);
      push(tmp & 0xff);
    }

    if (placeHolders === 2) {
      let tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4);
      push(tmp & 0xff);
    } else if (placeHolders === 1) {
      let tmp =
        (decode(b64.charAt(i)) << 10) |
        (decode(b64.charAt(i + 1)) << 4) |
        (decode(b64.charAt(i + 2)) >> 2);
      push((tmp >> 8) & 0xff);
      push(tmp & 0xff);
    }

    return arr;
  }

  export function encode(uint8: Uint8Array): string {
    var i: number;
    var extraBytes = uint8.length % 3; // if we have 1 byte left, pad 2 bytes
    var output = "";

    const lookup =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    function encode(num: byte) {
      return lookup.charAt(num);
    }

    function tripletToBase64(num: number) {
      return (
        encode((num >> 18) & 0x3f) +
        encode((num >> 12) & 0x3f) +
        encode((num >> 6) & 0x3f) +
        encode(num & 0x3f)
      );
    }

    // go through the array every three bytes, we'll deal with trailing stuff later
    let length = uint8.length - extraBytes;
    for (i = 0; i < length; i += 3) {
      let temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];

      output += tripletToBase64(temp);
    }

    // pad the end with zeros, but make sure to not forget the extra bytes
    let temp: number;
    switch (extraBytes) {
      case 1:
        temp = uint8[uint8.length - 1];
        output += encode(temp >> 2);
        output += encode((temp << 4) & 0x3f);
        output += "==";
        break;

      case 2:
        temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
        output += encode(temp >> 10);
        output += encode((temp >> 4) & 0x3f);
        output += encode((temp << 2) & 0x3f);
        output += "=";
        break;

      default:
        break;
    }

    return output;
  }
}
