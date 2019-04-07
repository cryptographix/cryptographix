import {
  IConstructable,
  View,
  H2BA,
  Action,
  IActionHandler,
  Transformer,
  PortDataAction
} from "@cryptographix/core";
import { InputTransformer, InputPanel } from "./input-panel";
import { OutputTransformer, OutputPanel } from "./output-panel";
import { TransformerView } from "./transformer-view";

export class BlockExplorerView extends View implements IActionHandler {
  constructor(transCtor: IConstructable<Transformer>) {
    super(); //

    this.createView(transCtor);
  }

  transformer: Transformer<{}>;
  output: OutputTransformer;

  createView(transCtor: IConstructable<Transformer>) {
    const transformer = (this.transformer = new transCtor({
      iv: H2BA("0123456789ABCDEFFEDCBA9876543210")
    }));

    let ports = new Map(transformer.helper.filterPorts());

    transformer.helper.inPortKeys.forEach(key => {
      const input = new InputTransformer(key, ports.get(key).title || key);
      input.value = H2BA("0123456789ABCDEFFEDCBA9876543210");
      this.addChildView(new InputPanel(input, input));
      this.triggerInput(input);
    });

    this.addChildView(new TransformerView(this, transformer));

    transformer.helper.outPortKeys.forEach(key => {
      const output = new OutputTransformer(key, ports.get(key).title || key);
      this.addChildView(new OutputPanel(output, output));
      this.output = output;
    });
  }

  render() {
    return <div id="block-explorer">{this.renderChildViews()}</div>;
  }

  triggerInput(input: InputTransformer) {
    input.trigger().then(() => {
      this.transformer[input.key] = input.value;
      console.log("Input", input.key, "triggered");
      this.triggerInput(input);

      this.transformer
        .trigger()
        .then(() => {
          this.output.value = this.transformer[this.output.key];

          this.output.trigger();
        })
        .catch(err => console.log(err));
    });
  }

  triggerTransformer() {
    //
  }

  handleAction(action: Action) {
    let act = action as PortDataAction;
    switch (act.action) {
      case "port:data": {
        if (act.id instanceof InputTransformer) {
          console.log("In changed: ", act.key, " to ", this[act.key]);

          this.transformer
            .trigger()
            .then(() => {
              console.log("Done");
            })
            .catch(err => console.log(err));
        }
      }
    }

    return null;
  }
}
