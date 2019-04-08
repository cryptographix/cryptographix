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

  inputs: InputPanel[] = [];
  transformer: TransformerView;
  output: OutputPanel;

  createView(transCtor: IConstructable<Transformer>) {
    const transformer = new transCtor({
      iv: H2BA("0123456789ABCDEFFEDCBA9876543210")
    });

    let ports = new Map(transformer.helper.filterPorts());

    transformer.helper.inPortKeys.forEach(key => {
      const input = new InputTransformer(key, ports.get(key).title || key);
      input.value = H2BA("0123456789ABCDEFFEDCBA9876543210");
      this.inputs.push(new InputPanel(input, input));
      this.triggerInput(input);
    });

    this.transformer = new TransformerView(this, transformer);

    transformer.helper.outPortKeys.forEach(key => {
      const output = new OutputTransformer(key, ports.get(key).title || key);
      //      this.addChildView();
      this.output = new OutputPanel(output, output);
    });
  }

  render() {
    return (
      <div id="block-explorer">
        {this.inputs[0].element}
        {this.inputs[1].element}
        {this.transformer.element}
        {this.output.element}
      </div>
    );
  }

  triggerInput(input: InputTransformer) {
    input
      .trigger()
      .then(() => {
        let transformer = this.transformer.block;

        transformer[input.key] = input.value;
        console.log("Input", input.key, "triggered");
        this.triggerInput(input);

        return transformer.trigger();
      })
      .then(() => {
        let output = this.output.block;

        output.value = this.transformer.block[output.key];

        return output.trigger();
      })
      .catch(err => console.log(err));
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

          this.transformer.block
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
