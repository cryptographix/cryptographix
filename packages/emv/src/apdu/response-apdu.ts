import {
  ByteArray,
  Schema,
  integerProp,
  bytesProp,
  stringProp
} from "@cryptographix/core";
//import { ISO7816 } from "./iso7816";

/**
 * Encoder/Decodor for a APDU Response
 */
export class ResponseAPDU {
  @integerProp({})
  SW: number;

  @bytesProp({ title: "Response Data" })
  data: ByteArray;

  @integerProp({ title: "Actual Length" })
  public get La() {
    return this.data.length;
  }

  @stringProp({ title: "Description" })
  description: string;

  @stringProp({ title: "Details" })
  details: string;

  /**
   * @constructor
   *
   * Deserialize from a JSON object
   */
  constructor(attributes?: {}) {
    return Schema.initObjectFromClass(ResponseAPDU, attributes);
  }

  /**
   * Serialization, returns a JSON object
   */
  public toJSON(): {} {
    return {
      data: this.data && this.data.slice(),
      SW: this.SW,
      description: this.description,
      details: this.details
    };
  }

  public toString(): string {
    function hex4(val: number) {
      return ("0000" + val.toString(16).toUpperCase()).substr(-4);
    }

    let s = "ResponseAPDU ";
    s += "SW=0x" + hex4(this.SW);
    if (this.data && this.data.length) {
      s += "," + "La=" + this.La;
      s += "," + "Data=" + ByteArray.toString(this.data, "hex");
    }
    if (this.description) s += " (" + this.description + ")";

    return s;
  }

  public static init(sw: number, data?: ByteArray): ResponseAPDU {
    return new ResponseAPDU().set(sw, data);
  }

  public set(sw: number, data?: ByteArray): this {
    this.SW = sw;
    this.data = data || new ByteArray();

    return this;
  }

  public setSW(SW: number): this {
    this.SW = SW;
    return this;
  }
  public setSW1(SW1: number): this {
    this.SW = (this.SW & 0xff) | (SW1 << 8);
    return this;
  }
  public setSW2(SW2: number): this {
    this.SW = (this.SW & 0xff00) | SW2;
    return this;
  }
  public setData(data: ByteArray): this {
    this.data = data;
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
   * Encoder function, returns a blob from an APDUResponse object
   */
  public encodeBytes(_options?: {}): ByteArray {
    let ba = new ByteArray(this.La + 2);

    ba.set(this.data, 0);
    ba[this.La] = (this.SW >> 8) & 0xff;
    ba[this.La + 1] = (this.SW >> 0) & 0xff;

    return ba;
  }

  public decodeBytes(byteArray: ByteArray, _options?: {}): this {
    if (byteArray.length < 2) throw new Error("ResponseAPDU Buffer invalid");

    let la = byteArray.length - 2;

    this.SW = byteArray[la] << (8 + byteArray[la + 1]);
    this.data = la ? byteArray.slice(0, la) : new ByteArray();

    return this;
  }
}
