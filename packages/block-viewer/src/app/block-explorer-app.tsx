import { View } from "@cryptographix/core";

//import * as CR from "@cryptographix/cryptography";
import { Header } from "./header";

//import { BlockExplorerView } from "../views/block-explorer-view";
import { FlowScriptView } from "../views/flow-script-view";

/*export abstract class RootView extends View {
  $rootElement: HTMLElement;

  constructor($rootElement: HTMLElement) {
    super();

    this.$rootElement = $rootElement;

    View.mount($rootElement, this);
  }
}*/

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

export class BlockExplorerApp extends View {
  constructor() {
    super();
  }

  render(): HTMLElement {
    return (
      <View.Fragment>
        <Header />
        <div id="flows" style="background-color: #2980b9; padding: 0.5rem">
          {/*<BlockExplorerView transCtor={CR.SecretKeyEncrypter} />*/}
          <FlowScriptView flowScript={netx} />
        </div>
      </View.Fragment>
    );
  }
}
