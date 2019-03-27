import { View } from "./view";
import { Settings } from "./components/settings";
import { Schema, schemaStore } from "@cryptographix/core";
import { ByteArray, H2BA, BA2H } from "@cryptographix/core";
import * as cryp from "@cryptographix/cryptography";

let xx = H2BA("0123456789abcdef0123456789abcdef");

let enc = new cryp.SecretKeyEncrypter();
let cfg = {
  algorithm: "aes-128",
  key: xx,
  iv: xx,
  encrypt: true

  //mode: 'ecb'
};

enc.settings = cfg;

export function showSettings(element: HTMLElement) {
  let $view = new View();
  $view._$root = element;

  let schema = schemaStore.ensure(enc.settings.constructor);

  Object.entries(schema.properties).forEach(([key, propInfo]) => {
    if (!propInfo.ignore) {
      let pv = new Settings(enc.settings, key, propInfo);

      $view.addSubview(pv);
    }
  });
}

window["showSettings"] = showSettings;
