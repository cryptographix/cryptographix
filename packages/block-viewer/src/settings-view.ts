import { RootView } from "./view/index";
import { PropertyListView } from "./views/property-list-view";
import { H2BA } from "@cryptographix/core";
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

export function showSettings($element: HTMLElement) {
  let $root = new RootView();
  $root.bindRoot($element);

  let $propsView = new PropertyListView(enc.settings);

  $root.addChildView($propsView);
}

window["showSettings"] = showSettings;
