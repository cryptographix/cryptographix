import {
  BlockConfiguration,
  Transformer,
  Action,
  IActionHandler,
  View,
  BlockView,
  ConfigPropertyChanged
} from "@cryptographix/core";

export { PropertyValueChanged };

import { PropertyListView, PropertyValueChanged } from "./property-list-view";

export class TransformerView extends BlockView {
  block: Transformer;

  constructor(handler: IActionHandler, transformer: Transformer) {
    super(handler, transformer);

    this.createView(transformer.config);
  }

  createView(config: BlockConfiguration) {
    this.addChildView(new PropertyListView(this.handler, config));
  }

  render() {
    return (
      <div class="field" style="padding: 1px">
        <label class="label">{this.block.helper.schema.title}</label>
        {this.renderChildViews()}
      </div>
    );
  }
}
