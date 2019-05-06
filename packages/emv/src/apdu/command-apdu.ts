import {
  ByteArray,
  Schema,
  integerProp,
  bytesProp,
  stringProp
} from "@cryptographix/core";

/**
 * Encoder/Decodor for a APDU Command
 */
export class CommandAPDU {
  @integerProp({ title: "Class" })
  CLA: number;
  @integerProp({ title: "Instruction" })
  INS: number;
  @integerProp({ title: "Param P1" })
  P1: number;
  @integerProp({ title: "Param P2" })
  P2: number;

  @integerProp({ title: "Command Data Length" })
  public get Lc(): number {
    return this.data.length;
  }
  @bytesProp({ title: "Command Data" })
  data: ByteArray;

  @integerProp({ title: "Expected Length" })
  Le: number;

  @stringProp({ title: "Description" })
  description: string;
  @stringProp({ title: "Details" })
  details: string;

  /**
   * @constructor
   *
   * Deserialize from a JSON object
   */
  public constructor(attributes?: {}) {
    return Schema.initObjectFromClass(CommandAPDU, attributes);
  }

  /**
   * Serialization, returns a JSON object
   */
  public toJSON(): {} {
    return {
      CLA: this.CLA,
      INS: this.INS,
      P1: this.P1,
      P2: this.P2,
      data: this.data && this.data,
      Le: this.Le,
      description: this.description,
      details: this.details
    };
  }

  public toString(): string {
    function hex2(val: number) {
      return ("00" + val.toString(16).toUpperCase()).substr(-2);
    }

    let s = "CommandAPDU ";
    s += "CLA=0x" + hex2(this.CLA);
    s += "," + "INS=0x" + hex2(this.INS);
    s += "," + "P1=0x" + hex2(this.P1);
    s += "," + "P2=0x" + hex2(this.P2);
    if (this.data && this.data.length) {
      s += "," + "Lc=" + this.Lc;
      s += "," + "Data=" + ByteArray.toString(this.data, "hex");
    }
    if (this.Le) s += "," + "Le=" + this.Le;

    if (this.description) s += " (" + this.description + ")";

    return s;
  }

  public get header(): ByteArray {
    return new ByteArray([this.CLA, this.INS, this.P1, this.P2]);
  }

  /**
   * Fluent Builder
   */
  public static init(
    CLA?: number,
    INS?: number,
    P1?: number,
    P2?: number,
    data?: ByteArray
  ): CommandAPDU {
    return new CommandAPDU().set(CLA, INS, P1, P2, data);
  }

  public set(
    CLA: number,
    INS: number,
    P1: number,
    P2: number,
    data?: ByteArray
  ): this {
    this.CLA = CLA;
    this.INS = INS;
    this.P1 = P1;
    this.P2 = P2;
    this.data = data || new ByteArray();
    this.Le = undefined;

    return this;
  }

  public setCLA(CLA: number): this {
    this.CLA = CLA;
    return this;
  }
  public setINS(INS: number): this {
    this.INS = INS;
    return this;
  }
  public setP1(P1: number): this {
    this.P1 = P1;
    return this;
  }
  public setP2(P2: number): this {
    this.P2 = P2;
    return this;
  }
  public setData(data: ByteArray): this {
    this.data = data;
    return this;
  }
  public setLe(Le: number): this {
    this.Le = Le;
    return this;
  }
  public setDescription(description: string): this {
    this.description = description;
    return this;
  }
  public setDetails(details: string): this {
    this.details = details;
    return this;
  }

  /**
   * Encoder
   */
  public encodeBytes(_options?: {}): ByteArray {
    let dlen = this.Lc > 0 ? 1 + this.Lc : 0;
    let len = 4 + dlen + (this.Le > 0 ? 1 : 0);
    let ba = new ByteArray(len);

    // rebuild binary APDUCommand
    ba.set(this.header, 0);
    if (this.Lc) {
      ba[4] = this.Lc;
      ba.set(this.data, 5);
    }

    if (this.Le > 0) {
      ba[4 + dlen] = this.Le;
    }

    return ba;
  }

  /**
   * Decoder
   */
  public decodeBytes(byteArray: ByteArray, _options?: {}): this {
    if (byteArray.length < 4) throw new Error("CommandAPDU: Invalid buffer");

    let offset = 0;

    this.CLA = byteArray[offset++];
    this.INS = byteArray[offset++];
    this.P1 = byteArray[offset++];
    this.P2 = byteArray[offset++];

    if (byteArray.length > offset + 1) {
      var Lc = byteArray[offset++];
      this.data = byteArray.slice(offset, offset + Lc);
      offset += Lc;
    }

    if (byteArray.length > offset) this.Le = byteArray[offset++];

    if (byteArray.length != offset)
      throw new Error("CommandAPDU: Invalid buffer");

    return this;
  }
}
