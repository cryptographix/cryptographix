

import { ByteArray, H2BA, BA2H } from "@cryptographix/core";
import * as cryp from "@cryptographix/cryptography";
import { TR31 } from "@cryptographix/payments";
import { BlockSettingsView } from "./views/settings-view";

async function tr() {
  let tr31 = new TR31();

  let kbpkKey = H2BA(
    "88E1AB2A2E3DD38C1FA039A536500CC8A87AB9D62DC92C01058FA79F44657DE6"
  );

  await tr31.deriveBlockKeys("AES", kbpkKey);

  //console.log("k1:" + ByteArray.toString(keys.k1.key,'hex')) // is equal to '' but should be 014baf2278a69d331d5180103643e99a
  //console.log("k2:" + ByteArray.toString(keys.k2.key,'hex')) // is equal to '' but should be 014baf2278a69d331d5180103643e99a

  let examplePadding = H2BA("1C2965473CE206BB855B01533782");

  tr31
    .setBlockHeader("D0112P0AE00E0000")
    .setBlockKeyData(H2BA("3F419E1CB7079442AA37474C2EFBF8B8"))
    .padKeyData(32, examplePadding);

  let keyBlock = await tr31.generateKeyBlock();

  return keyBlock;
}

tr()
  .then(keyBlock => {
    console.log("keyBlock:" + ByteArray.toString(keyBlock, "hex"));
  })
  .catch(e => {
    console.log(e);
  });

let xx = H2BA("0123456789abcdef0123456789abcdef");

let cfg = {
  algorithm: "aes-128",
  key: xx,
  iv: xx
  //mode: 'ecb'
};
let enc = new cryp.SecretKeyEncrypter(cfg);

enc
  .encode(xx)
  .then(res => {
    console.log(BA2H(res));
  })
  .catch(err => {
    console.log("Error: ", err);
  });
