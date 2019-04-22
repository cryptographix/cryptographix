import { RootView } from "./views/root-view";
//import { BlockExplorerView } from "./views/block-explorer-view";
//import { SecretKeyEncrypter } from "@cryptographix/cryptography";
//import { Flow } from "@cryptographix/flow";

//import { GridView } from "./views/grid-view";
//import { TileView } from "./views/tile-view"
import { FlowScriptView } from "./views/flow-script-view";

let net1 = `{
  $id: 'Derive AC Master Key',

  data: HEX('PAN'),
  key: HEX('IMK')
} |> DERIVE('MKac')
`;
let net2 = `{
  $id: 'Derive AC Master Key',

  data: HEX('PAN'),
  key: HEX('IMK'),
  iv: HEX('IV')
} |> DERIVE('MKac') |> DERIVE('GAC')
`;
let net3 = `
{
  $id: 'MAP2',
  $color: '#DDECD3',

  data: {
    $id: 'MAP1',
    $color: '#F3DEEB',

    key: HEX('B')
    data: HEX('A')
  } |> DERIVE('C'),

  key: HEX('D')
} |> DERIVE('E')
`;

let netx = `{
  $id: 'GenerateAC',

  key: {
    $id: 'Derive AC Session Key',

    key: {
      $id: 'Derive AC Master Key',

      data: HEX('PAN'),
      key: HEX('IMK')
    } |> DERIVE('MKac'),

    data: HEX('ATC')
  } |> DERIVE('SKac'),

  data: HEX('BUFFER')
} |> MAC('AC')
`;

//let tree = Flow.fromFlowString(net);

export function showSettings($element: HTMLElement) {
  let $root = new RootView($element);

  //$root.addChildView(new BlockExplorerView(SecretKeyEncrypter));
  //  $root.addChildView(new TileView(tree, true));
  $root.addChildView(new FlowScriptView(netx));
}

declare global {
  interface Window {
    showSettings: any;
  }
}

//var window = window || {};

window.showSettings = showSettings;
