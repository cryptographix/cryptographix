import { TLVDatabase, TLVDatabaseEntry, TLV, TLVParser } from ".";
import { ByteArray, ITreeSchemaProp } from "@cryptographix/core";

function buildTLVInfos(
  tlvDatabase: TLVDatabase,
  bytes: ByteArray,
  encoding: number,
  expandDepth: number
) {
  let tlvInfos = new Array<TLVInfo>();

  if (bytes.length) {
    let parser: TLVParser = new TLVParser(bytes, { encoding: encoding });

    while (!parser.isEOF) {
      let tlv = parser.nextTLV();
      if (!tlv) throw new Error("Invalid TLV Data");

      tlvInfos.push(new TLVInfo(tlvDatabase, tlv, encoding, expandDepth - 1));
    }
  }

  return tlvInfos;
}

export class RootTLVInfo {
  private rootBytes: ByteArray;

  encoding: number;
  expandDepth: number;

  public get bytes(): ByteArray {
    return this.rootBytes;
  }
  public set bytes(bytes: ByteArray) {
    this.rootBytes = bytes || new ByteArray();

    this.children = buildTLVInfos(
      this.tlvDatabase,
      this.rootBytes,
      this.encoding,
      this.expandDepth
    );
  }

  public tlvDatabase: TLVDatabase;

  public children: Array<TLVInfo>;

  constructor(
    tlvDatabase: TLVDatabase,
    bytes?: ByteArray,
    encoding: number = TLV.Encodings.EMV
  ) {
    this.tlvDatabase = tlvDatabase;

    this.encoding = encoding;

    this.bytes = bytes;
  }
}

export class TLVInfo implements ITreeSchemaProp<TLVInfo> {
  public tlv: TLV;
  public entry: TLVDatabaseEntry;

  public children: Array<TLVInfo>;

  constructor(
    tlvDatabase: TLVDatabase,
    tlv: TLV,
    encoding: number,
    expandDepth: number
  ) {
    this.tlv = tlv;
    this.entry = tlvDatabase && tlvDatabase.findTag(tlv.tag);
    this.children = new Array<TLVInfo>();

    if (tlv) {
      let tag: number = tlv.tag;
      if (tag > 255) tag >>= 8;

      if (expandDepth > 0 && tag & 0x20) {
        this.children = buildTLVInfos(
          tlvDatabase,
          <any>tlv.value,
          encoding,
          expandDepth - 1
        );
      }
    }
  }
}
