import { Encoder } from "@cryptographix/core";
import { enumProp, bytesProp } from "@cryptographix/core";

/**
 *
 */
export class TR31BuilderSettings {
  @bytesProp()
  blockProtectionKey: Uint8Array;

  @enumProp({
    options: { aes: "AES", des: "DES" }
  })
  keyType: string;
}

/**
 *
 */
export class TR31BuilderBlock extends Encoder<TR31BuilderSettings> {
  constructor() {
    super();
  }
}
