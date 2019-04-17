import { RootView } from "./views/root-view";
//import { BlockExplorerView } from "./views/block-explorer-view";
//import { SecretKeyEncrypter } from "@cryptographix/cryptography";
import { Flow } from "@cryptographix/flow";

//import { GridView } from "./views/grid-view";
//import { TileView } from "./views/tile-view"
import { FlowScriptView } from "./views/flow-script-view";

let net = `
{
  key: {
    key: {
      key: HEX('IMK'),
      data: HEX('PAN')
    } |> DERIVE(),
    data: HEX('ATC')
  } |> DERIVE(),
  data: HEX('BUFFER')
} |> MAC()
`;

let tree = Flow.fromFlowString(net);

export function showSettings($element: HTMLElement) {
  let $root = new RootView($element);

  //$root.addChildView(new BlockExplorerView(SecretKeyEncrypter));
  //  $root.addChildView(new TileView(tree, true));
  $root.addChildView(new FlowScriptView());
}

declare global {
  interface Window {
    showSettings: any;
  }
}

//var window = window || {};

window.showSettings = showSettings;
