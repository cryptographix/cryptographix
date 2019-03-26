import { Env } from "../platform/environment";

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

export class ByteArray extends Uint8Array {
  static alloc(len: number): Uint8Array {
    return new ByteArray(len);
  }
  /**
   *
   */
  static fromString(data: string, fmt?: "hex"): Uint8Array {
    let bytes: Uint8Array;

    if (!fmt) {
      bytes = ByteArray.alloc(data.length);

      for (let i = 0; i < data.length; ++i) bytes[i] = data.charCodeAt(i);

      return bytes;
    }

    if (fmt == "hex" && typeof data == "string") data = data.replace(/\s/g, "");

    if (Env.isNode()) return ByteArray.from(Buffer.from(data, fmt));

    switch (fmt) {
      case "hex": {
        let l = data.length / 2;
        bytes = ByteArray.alloc(l);
        for (let i = 0, j = 0; j < l; j++, i += 2) {
          bytes[j] = Number.parseInt(data.substr(i, 2), 16);
        }
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

    if (Env.isNode()) return Buffer.from(bytes).toString(fmt);
    else {
      let s = "";
      switch (fmt) {
        case "hex": {
          for (let i = 0; i < bytes.length; ++i) {
            s += ("0" + bytes[i].toString(16)).slice(-2);
          }
          break;
        }
      }
      return s;
    }
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
}

export interface XXBuffer {
  /**
   * When passed a reference to the .buffer property of a TypedArray instance,
   * the newly created Buffer will share the same allocated memory as the TypedArray.
   * The optional {byteOffset} and {length} arguments specify a memory range
   * within the {arrayBuffer} that will be shared by the Buffer.
   *
   * @param arrayBuffer The .buffer property of any TypedArray or a new ArrayBuffer()
   */
  from(
    arrayBuffer: ArrayBuffer | SharedArrayBuffer,
    byteOffset?: number,
    length?: number
  ): Buffer;
  /**
   * Creates a new Buffer using the passed {data}
   * @param data data to create a new Buffer
   */
  from(data: any[]): Buffer;
  from(data: Uint8Array): Buffer;
  /**
   * Creates a new Buffer containing the given JavaScript string {str}.
   * If provided, the {encoding} parameter identifies the character encoding.
   * If not provided, {encoding} defaults to 'utf8'.
   */
  from(str: string, encoding?: string): Buffer;
}
