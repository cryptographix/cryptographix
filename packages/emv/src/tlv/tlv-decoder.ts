import { ByteArray, Transformer, ITreeSchemaProp } from "@cryptographix/core";
import { block, bytesProp, objectProp, isPort } from "@cryptographix/core";

import {
  TLV,
  TLVInfo,
  RootTLVInfo,
  TLVDatabase,
  TLVDatabaseEntry
} from "./tlv-database/index";

import { tags } from "./tlv-database/emv-db";

class TLVDecoderConfig {
  //
}

@block({ title: "TLV Decoder", config: TLVDecoderConfig })
export class TLVDecoder extends Transformer<TLVDecoderConfig> {
  @bytesProp({ title: "Byte data to be decoded", ui: { widget: "multiline" } })
  @isPort({ type: "data-in" })
  data: ByteArray;

  @objectProp(TLVInfo, { title: "TLV Data", isTree: true })
  @isPort({ type: "data-out" })
  tlvData: ITreeSchemaProp<TLVInfo>;

  tlvDatabase: TLVDatabase;
  rootTLVInfo: RootTLVInfo;

  constructor() {
    super();

    this.tlvDatabase = new TLVDatabase();
    this.rootTLVInfo = new RootTLVInfo(this.tlvDatabase);

    let entries = [];
    Object.keys(tags).forEach((t: any) => {
      entries.push(new TLVDatabaseEntry(t, tags[t].name, ""));
    });

    this.tlvDatabase.databaseEntries = this.tlvDatabase.databaseEntries.concat(
      entries
    );
    this.rootTLVInfo.encoding = TLV.Encodings.EMV;
    this.rootTLVInfo.expandDepth = 100;
  }

  async trigger() {
    try {
      this.rootTLVInfo.bytes = this.data;
    } catch (E) {
      throw new Error("INVALID TLV DATA");
    }

    this.tlvData = this.rootTLVInfo;

    return null; //
  }
}
