import {
  //BlockConfiguration,
  Transformer,
  //Action,
  IActionHandler,
  View,
  BlockView
  //ConfigPropertyChanged
} from "@cryptographix/core";

export { PropertyValueChanged };

import { PropertyListView, PropertyValueChanged } from "./property-list-view";

export class TransformerView extends BlockView<Transformer> {
  //block: Transformer;

  constructor(params: { handler: IActionHandler; block: Transformer }) {
    super(params);
  }

  render() {
    return (
      <div class="field" style="padding: 1px">
        <label class="label">{this.block.helper.schema.title}</label>
        <PropertyListView handler={this.handler} config={this.block.config} />
      </div>
    );
  }
}
