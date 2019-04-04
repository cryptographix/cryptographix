import { View } from "@cryptographix/dom-view";
import { InputPanel } from "./input-panel";
import { OutputPanel } from "./output-panel";
import { BlockSettingsView } from "./settings-view";
import { PiperNet } from "../data-piper/piper-net";

export class BlockExplorerView extends View {
  net: PiperNet = new PiperNet();

  constructor() {
    super(); //

    this.createView();
  }

  createView() {
    this.addChildView(new InputPanel(this.net));
    this.addChildView(new BlockSettingsView());
    this.addChildView(new OutputPanel(this.net));
  }

  render() {
    return <div id="block-explorer">{this.renderChildViews()}</div>;
  }
}
