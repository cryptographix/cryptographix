import { View } from "@cryptographix/core";
import { Flow } from "@cryptographix/flow";

import { Header } from "./header";
import { TransformerToolView } from "./transformer-tool";
import { FlowScriptView } from "../views/flow-script-view";
import { BlockExplorerView } from "../views/block-explorer-view";
import { TileView } from "../views/tile-view";
import * as CR from "@cryptographix/cryptography";

export class BlockToolApp extends View {
  constructor() {
    super();
  }

  selectedTool = 0;
  toolPanel: View;

  changeTool(newTool: number) {
    this.selectedTool = newTool;
    this.refresh();
  }

  net3 = `{
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

  parseUrl() {
    let params = {};

    //    if (document.)
  }
  renderTool() {
    switch (this.selectedTool) {
      case 0:
        return (
          <TransformerToolView
            transCtor={CR.SecretKeyEncrypter}
            config={{ mode: "cbc", encrypt: true }}
          />
        );
      case 1:
        return (
          <div id="flows" style="position: relative">
            <FlowScriptView flowScript={this.net3} />
          </div>
        );
      case 2: {
        const flow = Flow.fromFlowScript(this.net3);
        return <TileView node={flow} root />;
      }
      case 3: {
        return <BlockExplorerView transCtor={CR.SecretKeyEncrypter} />;
      }
    }
  }

  render(): HTMLElement {
    const me = this;

    return (
      <div>
        <View.Fragment>
          <Header
            menuItems={[
              "Secret Key Encrypter",
              "Flow Script Viewer",
              "Tile View",
              "Block Explorer"
            ]}
            onMenuItemChange={index => {
              me.changeTool(index);
            }}
            selectedItem={this.selectedTool}
          >
            <div>Heelo</div>
          </Header>
          {this.renderTool()}
        </View.Fragment>
      </div>
    );
  }
}
