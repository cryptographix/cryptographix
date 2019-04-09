import {
  BlockConfiguration,
  Transformer,
  IActionHandler,
  View,
  BlockView
} from "@cryptographix/core";

import { PropertyListView } from "./property-list-view";

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
