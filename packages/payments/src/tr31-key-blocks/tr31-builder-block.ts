import { BlockSettings, Encoder } from '@cryptographix/core';
import { enumProp, bytesProp } from '@cryptographix/core';

/**
 *
 */
export class TR31BuilderSettings extends BlockSettings {
  @bytesProp()
  blockProtectionKey: Uint8Array;

  @enumProp( {
    options: { 'aes': 'AES', 'des':'DES' }
  } )
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
