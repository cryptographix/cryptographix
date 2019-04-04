import { View, PropertyListView } from "@cryptographix/dom-view";

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

enc.config = cfg;

export class BlockSettingsView extends View {
  constructor() {
    super();

    this.createView();
  }

  createView() {
    this.addChildView(new PropertyListView(enc.config));
  }

  render() {
    return <div style="padding: 1px">{this.renderChildViews()}</div>;
  }
}
