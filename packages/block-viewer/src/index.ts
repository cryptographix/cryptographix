import { RootView } from "./views/root-view";
import { BlockExplorerView } from "./views/block-explorer-view";
import { SecretKeyEncrypter } from "@cryptographix/cryptography";

export function showSettings($element: HTMLElement) {
  let $root = new RootView($element);

  $root.addChildView(new BlockExplorerView(SecretKeyEncrypter));
}

declare global {
  interface Window {
    showSettings: any;
  }
}

//var window = window || {};

window.showSettings = showSettings;
