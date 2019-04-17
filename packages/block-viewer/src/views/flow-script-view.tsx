import { IStringSchemaProp } from "@cryptographix/core";
import { Action, IActionHandler } from "@cryptographix/core";
import { View } from "@cryptographix/core";
import { PropertyView, PropertyValueChanged } from "./property-view";
import { TileView } from "./tile-view";

import { Flow } from "@cryptographix/flow";

export class FlowScriptView extends View implements IActionHandler {
  inputView: PropertyView;
  flowView: TileView;

  constructor() {
    super();

    let inPropInfo: IStringSchemaProp = {
      name: "value",
      type: "string",
      title: "FlowScript",
      ui: {
        widget: "multiline",
        lines: 10
      }
    };

    this.inputView = new PropertyView(this, {
      target: this,
      key: "script",
      propertyType: inPropInfo
    });

    this.addChildView(this.inputView);

    let outputView = new PropertyView(this, {
      target: this,
      key: "nodes",
      propertyType: {
        ...inPropInfo,
        title: "Flow Nodes",
        ui: {
          ...inPropInfo.ui,
          readonly: true,
          lines: 15
        }
      }
    });

    //    this.addChildView(outputView);

    this.flowView = new TileView(new Flow(), true);

    this.addChildView(this.flowView);
  }

  script: string;

  nodes: string;

  errDebounce: any;

  scriptChanged() {
    try {
      let flow = Flow.fromFlowString(this.script);

      this.flowView.node = flow;
      this.flowView.refresh();

      //      this.nodes = JSON.stringify(flow.toJSON(), null, 2);

      //      this.children[1].refresh();
      //this.inputView.clearError();
      if (this.errDebounce) {
        clearTimeout(this.errDebounce);
        this.errDebounce = 0;
      }
    } catch (err) {
      let view = this.inputView;
      let msg = (err as Error).message;

      //this.errDebounce = setTimeout(() => {
      view.setError(msg);
      this.errDebounce = 0;
      //}, 300);

      console.log(err);
    }
  }

  handleAction(action: Action) {
    let act = action as PropertyValueChanged;
    switch (act.action) {
      case "property:value-changed": {
        console.log("changed: ", act.key, " to ", this.script);
        this.scriptChanged();
      }
    }

    return null;
  }

  render() {
    return (
      <div class="tile is-ancestor" style="" id="flow-script">
        <div class="tile xis-parent is-vertical">
          <div class="box tile is-child" style="padding: 0.5rem 0.25rem">
            {this.children[0].element}
          </div>{" "}
          <div class="box" style="background-color: #004">
            {this.children[1].element}
          </div>{" "}
        </div>
      </div>
    );
  }
}
