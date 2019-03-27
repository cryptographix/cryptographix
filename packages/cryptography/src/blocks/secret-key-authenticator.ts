import { Encoder, BlockSettings, block } from "@cryptographix/core";
import {
  booleanProp,
  /*numberField, stringField,*/ enumProp,
  bytesProp
} from "@cryptographix/core";

export class SecretKeyAuthenticatorSettings extends BlockSettings {
  @booleanProp({
    trueLabel: "Sign",
    falseLabel: "Verify"
  })
  encrypt: boolean;

  @enumProp({
    options: { "aes-cmac": "AES CMAC" }
  })
  algorithm: string;

  @bytesProp({})
  key: Uint8Array;
}

@block({
  name: "secret-key-authenticator",
  namespace: "org.cryptographix.cryptography",
  title: "Secret Key Authenticator",
  category: "Digital Cryptography",
  settings: SecretKeyAuthenticatorSettings
})
export class SecretKeyAuthenticator extends Encoder<
  SecretKeyAuthenticatorSettings
> {}
