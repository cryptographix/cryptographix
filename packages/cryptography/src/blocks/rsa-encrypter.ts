import { ByteArray } from '@cryptographix/core';
import { IRSAKey } from '@cryptographix/cryptography';

import '../provider/node-forge';
import { forge } from '../provider/node-forge';

import { Encoder, BlockSettings, block } from '@cryptographix/core';

export class RSAEncrypterSettings extends BlockSettings {
}

@block( {
  name: 'rsa-encrypter',
  namespace: 'org.cryptographix.cryptography',
  title: 'RSA Encrypter',
  category: 'Modern cryptography',
  settings: RSAEncrypterSettings
})
export class RSAEncrypter extends Encoder<RSAEncrypterSettings> {

  _key: IRSAKey;

  constructor( key: IRSAKey ) {
    super();

    this._key = key;
  }

  async decrypt( data: ByteArray ): Promise<ByteArray> {
    let key = {
      e: new forge.jsbn.BigInteger( ByteArray.toString( this._key.data.e, 'hex' ), 16 ),
      n: new forge.jsbn.BigInteger( ByteArray.toString( this._key.data.n, 'hex'), 16 )
    };

    let plain = forge.pki.rsa.decrypt( ByteArray.toString(data), key, true, false );

    return Promise.resolve<ByteArray>( ByteArray.fromString( plain ) );
  }
}
