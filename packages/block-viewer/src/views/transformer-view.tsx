import {
  BlockConfiguration,
  Transformer,
  IActionHandler
} from "@cryptographix/core";
import { View, PropertyListView } from "@cryptographix/dom-view";

export class TransformerView extends View {
  constructor(handler: IActionHandler, transformer: Transformer) {
    super(handler);

    this.createView(transformer.config);
  }

  createView(config: BlockConfiguration) {
    this.addChildView(new PropertyListView(this.handler, config));
  }

  render() {
    return <div style="padding: 1px">{this.renderChildViews()}</div>;
  }
}
