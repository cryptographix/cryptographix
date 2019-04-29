import {
  //BlockConfiguration,
  //Transformer,
  //Action,
  IActionHandler,
  View
  //  BlockView
  //ConfigPropertyChanged
} from "@cryptographix/core";

import { TransformerNode } from "@cryptographix/flow";

export { PropertyValueChanged };

import {
  PropertyListView,
  PropertyValueChanged
} from "@cryptographix/flow-views";

export class TransformerView extends View {
  node: TransformerNode;

  constructor(params: { handler: IActionHandler; node: TransformerNode }) {
    super(params);

    this.node = params.node;
  }

  render() {
    return (
      <div class="field" style="padding: 1px">
        <label class="label">{this.node.schema.title}</label>
        <PropertyListView
          handler={this.handler}
          config={this.node.transformer.config}
        />
      </div>
    );
  }
}
