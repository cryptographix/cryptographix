import {
  BlockConfiguration,
  Transformer,
  IActionHandler,
  View
} from "@cryptographix/core";

import { PropertyListView } from "./property-list-view";

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
