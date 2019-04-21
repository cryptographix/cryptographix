import { IStringSchemaProp } from "@cryptographix/core";
import { Action, IActionHandler } from "@cryptographix/core";
import { View } from "@cryptographix/core";
import { PropertyView, PropertyValueChanged } from "./property-view";
//import { TileView } from "./tile-view";
import { GridView } from "../grid-view/grid-view";

import { Flow } from "@cryptographix/flow";

export class FlowScriptView extends View implements IActionHandler {
  inputView: PropertyView;
  flowView: GridView;

  constructor(net: string) {
    super();

    this.script = net;

    let inPropInfo: IStringSchemaProp = {
      name: "value",
      type: "string",
      title: "FlowScript",
      ui: {
        widget: "multiline",
        lines: null
      }
    };

    this.inputView = new PropertyView(this, {
      target: this,
      key: "script",
      propertyType: inPropInfo
    });

    this.addChildView(this.inputView);

    /*    let outputView = new PropertyView(this, {
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

    //    this.addChildView(outputView);*/

    this.flowView = new GridView(new Flow());

    this.addChildView(this.flowView);
  }

  script: string;

  nodes: string;

  errDebounce: any;

  scriptChanged() {
    try {
      let flow = Flow.fromFlowScript(this.script);

      this.flowView.updateFlow(flow);

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

  showTab(evt: Event) {
    let tab = evt.currentTarget as HTMLElement;

    const TABS = [...(document.querySelectorAll(".tabs li") as any)];
    const CONTENT = [...(document.querySelectorAll(".tab") as any)];
    const ACTIVE_CLASS = "is-active";

    let selected = tab.getAttribute("data-tab");
    updateActiveTab(tab);
    updateActiveContent(selected);

    function updateActiveTab(selected: HTMLElement) {
      TABS.forEach(tab => {
        if (tab && tab.classList.contains(ACTIVE_CLASS)) {
          tab.classList.remove(ACTIVE_CLASS);
        }
      });
      selected.classList.add(ACTIVE_CLASS);
    }

    function updateActiveContent(selected: string) {
      CONTENT.forEach(item => {
        if (item && item.classList.contains(ACTIVE_CLASS)) {
          item.classList.remove(ACTIVE_CLASS);
        }
        let data = item.getAttribute("data-content");
        if (data === selected) {
          item.classList.add(ACTIVE_CLASS);
        }
      });
    }
  }

  render() {
    return (
      <div id="flow-script-panel">
        <div class="tabs">
          <ul>
            <li data-tab="1" onClick={this.showTab.bind(this)}>
              <a>FlowScript</a>
            </li>
            <li
              class="is-active"
              data-tab="2"
              onClick={this.showTab.bind(this)}
            >
              <a>Flow Diagram</a>
            </li>
          </ul>
        </div>
        <div class="tab-content">
          <div class="tab" data-content="1">
            <div id="flow-script" style="min-height: calc(100vh - 126px)">
              <div
                class="box"
                style="padding: 0.5rem 0.25rem; padding: 0.5rem 0.25rem; "
              >
                {this.children[0].element}
              </div>
            </div>
          </div>
          <div class="tab  is-active" style="" data-content="2">
            <div
              style="padding: 1rem; background-color: #eef; overflow: auto"
              id="flow-grid"
            >
              {this.children[1].element}
            </div>
          </div>
          <div class="tab" data-content="3">
            Videos
          </div>
          <div class="tab" data-content="4">
            Documents
          </div>
        </div>
      </div>
    );
  }
}
