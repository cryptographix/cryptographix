import { View } from "@cryptographix/core";
import { BlockToolChooser } from "./block-tool-chooser";
import { TLVDecoder } from "@cryptographix/emv";

import { Header } from "./header";
import { TransformerToolView } from "../transformer-tool/transformer-tool";
import { FlowScriptView } from "../views/flow-script-view";
import { BlockExplorerView } from "../views/block-explorer-view";
//import { TileView } from "../views/tile-view";
import * as CR from "@cryptographix/cryptography";

export class BlockToolApp extends View {
  constructor() {
    super();

    let currentState = history.state;
    console.log(currentState);

    let app = this;

    window.onpopstate = function(_event) {
      console.log("history changed to: " + document.location.href);
      app.navegateTo();
    };

    //    window.history.pushState(null,null,null)
    this.navegateTo();
  }

  navegateTo() {
    if (document.location.pathname == "/") {
      let hash = document.location.hash.slice(1);
      let parts = hash.split("/");
      if (parts[0] == "block-tool") {
        if (parts[1]) {
          this.selectedTool = 1;
          this.blockName = parts[1];
        } else this.selectedTool = 0;

        this.refresh();
        this.element.scrollTo(0, 0);
      }
    }
  }

  selectedTool = 0;
  blockName: string = "SecretKeyEncrypter";
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
    //let params = {};
    //    if (document.)
  }

  renderTool() {
    switch (this.selectedTool) {
      case 0:
        return <BlockToolChooser />;

      case 1: {
        let b = CR[this.blockName];

        if (!b) {
          b = TLVDecoder;
        }

        return <TransformerToolView transCtor={b} />;
      }

      case 2:
        return (
          <TransformerToolView
            transCtor={CR.SecretKeyEncrypter}
            config={{ mode: "cbc" }}
          />
        );

      case 3: {
        return (
          <TransformerToolView
            transCtor={TLVDecoder}
            config={{ mode: "cbc" }}
          />
        );
      }
      case 4: {
        return <BlockExplorerView transCtor={CR.SecretKeyEncrypter} />;
      }
      case 5:
        return (
          <div id="flows" style="position: relative">
            <FlowScriptView flowScript={this.net3} />
          </div>
        );
    }
  }

  render(): HTMLElement {
    const me = this;

    return (
      <div>
        <View.Fragment>
          <Header
            menuItems={[
              "Select Tool",
              "Selected Tool",
              "Secret Key Encrypter",
              "TLV Decoder",
              "Block Explorer",
              "Flow Script Viewer"
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
