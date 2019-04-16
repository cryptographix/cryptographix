import {
  IConstructable,
  View,
  H2BA,
  Action,
  IActionHandler,
  Transformer,
  ConfigPropertyChanged
} from "@cryptographix/core";
import { InputTransformer, InputPanel } from "./input-panel";
import { OutputTransformer, OutputPanel } from "./output-panel";
import { TransformerView } from "./transformer-view";
import { PropertyValueChanged } from "./property-view";

export class BlockExplorerView extends View implements IActionHandler {
  constructor(transCtor: IConstructable<Transformer>) {
    super(); //

    this.createView(transCtor);
  }

  inputs: InputPanel[] = [];
  transformer: TransformerView;
  output: OutputPanel;

  createView(transCtor: IConstructable<Transformer>) {
    const transformer = new transCtor(
      {
        iv: H2BA("0123456789ABCDEFFEDCBA9876543210")
      },
      this
    );

    let ports = new Map(transformer.helper.filterPorts());

    transformer.helper.inPortKeys.forEach(key => {
      const input = new InputTransformer(
        key,
        ports.get(key).title || key,
        null,
        this
      );
      input.value = H2BA("0123456789ABCDEFFEDCBA9876543210");

      this.inputs.push(new InputPanel(input, input));

      this.triggerInput(input);
    });

    this.transformer = new TransformerView(this, transformer);

    transformer.helper.outPortKeys.forEach(key => {
      const output = new OutputTransformer(
        key,
        ports.get(key).title || key,
        null,
        this
      );

      this.output = new OutputPanel(output, output);
    });

    this.inputs.forEach(input => this.triggerInput(input.block));
  }

  render() {
    return (
      <div
        class="tile is-ancestor"
        style="padding: 0.75rem"
        id="block-explorer"
      >
        <div class="tile xis-parent is-vertical">
          <div class="box tile is-child" style="padding: 0.5rem 0.25rem">
            {this.inputs[0].element}
          </div>{" "}
          <div class="box tile is-child" style="padding: 0.5rem 0.25rem">
            {this.inputs[1].element}
          </div>{" "}
        </div>
        <div
          class="tile"
          style="align-items: center; padding: 0.5rem; max-width: 4rem"
        >
          <span class="icon is-large has-text-white">
            <i class="fa fa-arrow-right fa-3x " />
          </span>
        </div>
        <div class="tile xis-parent" style="align-items: center">
          <div class="box tile is-child" style="padding: 0.5rem 0.25rem">
            {this.transformer.element}
          </div>
        </div>
        <div
          class="tile"
          style="align-items: center; padding: 0.5rem; max-width: 4rem"
        >
          <span class="icon is-large has-text-white">
            <i class="fa fa-arrow-right fa-3x " />
          </span>
        </div>
        <div class="tile xis-parent" style="align-items: center">
          <div class="box tile is-child" style="padding: 0.5rem 0.25rem">
            {this.output.element}
          </div>
        </div>{" "}
      </div>
    );
  }

  async triggerTransformer() {
    let transformer = this.transformer.block;

    return transformer.trigger().then(() => {
      let output = this.output.block;

      output.value = this.transformer.block[output.key];

      return output.trigger();
    });
  }

  async triggerInput(input: InputTransformer) {
    input
      .trigger()
      .then(() => {
        let transformer = this.transformer.block;

        transformer[input.key] = input.value;
        console.log("Input", input.key, "triggered");
        this.triggerInput(input);

        return this.triggerTransformer();
      })
      .catch(err => console.log(err));
  }

  handleAction(action: Action) {
    let act = action as ConfigPropertyChanged | PropertyValueChanged;
    switch (act.action) {
      /*      case "port:data": {
        if (act.id instanceof InputTransformer) {
          console.log("In changed: ", act.key, " to ", this[act.key]);

          this.transformer.block
            .trigger()
            .then(() => {
              console.log("Done");
            })
            .catch(err => console.log(err));
        }
      }*/
      case "config:property-changed":
      case "property:value-changed":
        this.triggerTransformer().catch(err => console.log(err));
    }

    return null;
  }

  /*handleAction(action: Action): Action {
    let act = action as PropertyValueChanged;

    switch (act.action) {
      case "property:value-changed": {
        let act2 = new ConfigPropertyChanged(this.block, this);

        act2.dispatch();
      }
    }

    return null;
  }*/
}
