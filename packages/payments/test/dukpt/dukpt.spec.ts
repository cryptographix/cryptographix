import 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiString from 'chai-string';
chai.use( chaiString );

import { ByteArray, H2BA, S2BA, BA2H } from '@cryptographix/core';
import { IDESKey, IAESKey } from '@cryptographix/cryptography';
import { DUKPT } from '@cryptographix/payments';

let dukpt: DUKPT = null;
let bdk = H2BA('0123456789ABCDEFFEDCBA9876543210');
let ksn = 'FFFFFFFFFFFFFFFFFFFF';
let cc_trackdata_example = '%B4815881002861896^YATES/EUGENE JOHN              ^37829821000123456789?'; // taken from wikipedia. not an actual card
let cc_trackdata_hex_example = '2542343831353838313030323836313839365e59415445532f455547454e45204a4f484e20202020202020202020202020205e33373832393832313030303132333435363738393f';
let cc_trackdata_3des_encrypted_sample = '88B0208C24474EB41EE216D3BD0D226777FBBE15CEB7A2F840F16588FA583100848D334DD1B33CCD03728AD03E65993BB82F969EC4C5A68A83B8C5D80CC899D0E5C184D5BA48E7FF';
let cc_trackdata_aes_encrypted_sample = '6773ECC682BA7419F7035B4097BF4052D0460D90165651F7CA6760E612F422DA68D6385D2F5705B5F5A8A2DABEA93BEA157ED634E0729923FD8F720985F3624D06FAA7B133883B8FA5860294FAF36F80';

/*function getRandomText() {
    return new RandExp(/[A-Z0-9]{50}/).gen();
}

function getRandomHexText() {
    return Buffer.from(getRandomText(), 'ascii').toString('hex');
}*/

function getDUKPT( type: 'aes'|'des', bdk: ByteArray, ksn: string ) {
  let key: IDESKey|IAESKey;

  if ( type=='aes') {
    key = {
      algorithm: { name: 'AES-CBC' },
      type: "secret",
      data: { k: bdk }
    }
  }
  else {
    key = {
      algorithm: { name: 'DES-CBC' },
      type: "secret",
      data: { k: bdk }
    }
  }

  return new DUKPT( key, ksn );
}

describe('dukpt encryption tests with 3des encryption mode', () => {

    beforeEach(()=> {
      dukpt = getDUKPT('des',bdk, ksn);
    });

    it('should generate correct encrypted output', async () => {
      let encrypted = await dukpt.encryptDUKPT(S2BA(cc_trackdata_example));

      expect( BA2H(encrypted) ).to.equalIgnoreCase( cc_trackdata_3des_encrypted_sample );
    });

    it('should throw an error when input is not provided', async () => {
        try {
            await dukpt.encryptDUKPT( null );
        }
        catch(err){
          expect( err.message ).to.equal( 'either session key or data not provided');
        }
    });
});

describe('dukpt encryption tests with AES encryption mode', () => {

    beforeEach(()=> {
      dukpt = getDUKPT('aes', bdk, ksn);
    });

    it('should generate correct encrypted output', async () => {
        let encrypted = await dukpt.encryptDUKPT(S2BA(cc_trackdata_hex_example), {
            encryptionMode: 'AES'
        });

        expect( BA2H(encrypted) ).to.equalIgnoreCase( cc_trackdata_aes_encrypted_sample );
    });

    it('should throw an error when input is not provided', async () => {
        try{
            await dukpt.encryptDUKPT( null, {
                encryptionMode: 'AES'
            });
        }
        catch(err){
          expect( err.message ).to.equal( 'either session key or data not provided');
        }
    });
});

describe('dukpt decryption tests 3des encryption mode', () => {
    beforeEach(()=> {
      dukpt = getDUKPT('des',bdk, ksn);
    });

    it('should generate correct decrypted', async () => {
        let plain = await dukpt.decryptDUKPT(H2BA(cc_trackdata_3des_encrypted_sample));

        expect( BA2H(plain) ).to.equalIgnoreCase( cc_trackdata_hex_example );
    });

    it('should throw an error when input encrypted string is not provided', async () => {
        try{
          await dukpt.decryptDUKPT(null);
        }
        catch(err){
          expect( err.message ).to.equal( 'either session key or data not provided');
        }
    });
});

describe('dukpt decryption tests with aes encryption mode', () => {

    beforeEach(()=> {
      dukpt = getDUKPT('aes', bdk, ksn);
    });

    it('should generate correct decrypted output', async () => {
        let plain = await dukpt.decryptDUKPT(H2BA(cc_trackdata_aes_encrypted_sample), {
            decryptionMode: 'AES',
        });

        expect( BA2H(plain) ).to.equalIgnoreCase( cc_trackdata_hex_example );
    });

    it('should throw an error when input encrypted string is not provided', async () => {
        try{
            await dukpt.decryptDUKPT(null, {
                decryptionMode: 'AES'
            });
        }
        catch(err){
          expect( err.message ).to.equal( 'either session key or data not provided');
        }
    });
});

/*describe('internal methods test suite', () => {

    beforeEach(() => {
        dukpt = new Dukpt(bdk, ksn);
    });

    afterEach(() => {
        sandbox.restore();
        dukpt = null;
    });

    it('should generate dukpt session key provided ipek and ksn', async () => {
        const stub = sinon.stub(Dukpt, '_createDataKeyHex', () => '123');

        const dukptSessKey = Dukpt.generateDukptSessionKey(getRandomHexText(), getRandomHexText());

        dukptSessKey.should.equal('123');
        stub.restore();
        done();
    });

    it('should throw an error when either ipek or ksn is not provided for generateDukptSessionKey', async () => {
        const stub = sinon.stub(Dukpt, '_createDataKeyHex', () => '123' );
        try{
            Dukpt.generateDukptSessionKey('', getRandomHexText());
        }
        catch (err){
            should.exist(err);
            err.message.should.equal('either IPEK or data params not provided');
        }

        try{
            Dukpt.generateDukptSessionKey(getRandomHexText(), '');
        }
        catch (err){
            should.exist(err);
            err.message.should.equal('either IPEK or data params not provided');
        }
        stub.restore();
        done();
    });
});*/
