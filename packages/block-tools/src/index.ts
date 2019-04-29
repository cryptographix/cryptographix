import { View } from "@cryptographix/core";
import { BlockToolApp } from "./app/block-tool-app";

declare global {
  interface Window {
    mountApp: any;
  }

  //var window: Window;
}

window["mountApp"] = ($root: HTMLElement) => {
  View.mount($root, new BlockToolApp());
};
