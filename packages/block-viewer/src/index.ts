import { View } from "@cryptographix/core";
import { BlockExplorerApp } from "./app/block-explorer-app";

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

declare global {
  interface Window {
    mountApp: any;
  }

  //var window: Window;
}

window["mountApp"] = ($root: HTMLElement) => {
  View.mount($root, new BlockExplorerApp());
};
