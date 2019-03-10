import 'mocha';
import * as assert from 'assert';
import { BlockCipher } from '@cryptographix/cryptography';

import { TR31BuilderBlock, TR31, TR31BuilderSettings } from '@cryptographix/payments';
//import { generateSubKeys, calculateCMAC } from '@cryptographix/cryptography';
import { ByteArray } from '@cryptographix/core';

//class Buffer {}

describe( 'TR31 AES-256', ()=> {
  it( 'should work', async ()=>  {
    //let bs: TR31BuilderSettings = {
//    }
//    let block = new TR31BuilderBlock(bs);

    let tr31 = new TR31();

    let kbpkKey = ByteArray.from('88E1AB2A2E3DD38C1FA039A536500CC8A87AB9D62DC92C01058FA79F44657DE6','hex');

    await tr31.deriveBlockKeys( 'AES', kbpkKey );

    //console.log("k1:" + ByteArray.toString(keys.k1.key,'hex')) // is equal to '' but should be 014baf2278a69d331d5180103643e99a
    //console.log("k2:" + ByteArray.toString(keys.k2.key,'hex')) // is equal to '' but should be 014baf2278a69d331d5180103643e99a

    let examplePadding = ByteArray.from('1C2965473CE206BB855B01533782','hex');

    tr31.setBlockHeader( 'D0112P0AE00E0000' )
      .setBlockKeyData( ByteArray.from('3F419E1CB7079442AA37474C2EFBF8B8', 'hex') )
      .padKeyData( 32, examplePadding );

    let keyBlock = await tr31.generateKeyBlock();

    console.log( "keyBlock:" + ByteArray.toString(keyBlock,'hex'));
    assert.equal(ByteArray.toString(keyBlock,'hex'), '44303131325030414530304530303030b82679114f470f540165edfbf7e250fcea43f810d215f8d207e2e417c07156a27e8e31da05f7425509593d03a457dc34');
  })
})
