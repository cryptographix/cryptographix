import {
  IConstructable,
  View,
  H2BA,
  Action,
  Transformer
  //ConfigPropertyChanged
} from "@cryptographix/core";

import {
  Flow,
  TransformerNode,
  MapperNode,
  PipelineNode
} from "@cryptographix/flow";

import { InputTransformer, InputPanel } from "@cryptographix/flow-views";
import { OutputTransformer, OutputPanel } from "@cryptographix/flow-views";
import { TransformerView } from "./transformer-view";
//import { PropertyValueChanged } from "./property-view";

export class BlockExplorerView extends View {
  constructor(params: { transCtor: IConstructable<Transformer> }) {
    super(); //

    this.createView(params.transCtor);
  }

  inputs = new Map<string, TransformerNode<{}, InputTransformer>>();
  transformer: TransformerNode;
  outputs = new Map<string, TransformerNode<{}, OutputTransformer>>();

  flow: Flow;

  createView(transCtor: IConstructable<Transformer>) {
    let flow = Flow.fromTransformer<{}>(transCtor, transCtor.name, {
      iv: H2BA("0123456789ABCDEFFEDCBA9876543210")
    });

    this.flow = flow;
    // instantiate
    flow.setup();

    this.transformer = flow.root as TransformerNode;

    let block = this.transformer.transformer;

    let inputMapper = new MapperNode({});
    flow.inPortKeys.forEach(key => {
      let schema = block.helper.getSchemaProp(key);

      let input = new TransformerNode<{}, InputTransformer>(
        InputTransformer,
        null,
        {
          key,
          title: schema.title || key,
          initValue: H2BA("0123456789ABCDEFFEDCBA9876543210")
        }
      );

      inputMapper.addBranch(key, input);
      this.inputs.set(key, input);
    });

    let pipeNode = new PipelineNode();
    pipeNode.appendNode(inputMapper);
    pipeNode.appendNode(flow.root);

    let outputMapper = new MapperNode({});
    flow.outPortKeys.forEach(key => {
      let schema = block.helper.getSchemaProp(key);

      let output = new TransformerNode<{}, OutputTransformer>(
        OutputTransformer,
        null,
        {
          key,
          title: schema.title || key
        }
      );
      outputMapper.addBranch(key, output);

      this.outputs.set(key, output);
    });

    pipeNode.appendNode(outputMapper);

    pipeNode.setup();
    pipeNode.trigger();

    //flow.inKeys.forEach(key =>
    //  this.triggerInput(key, this.inputs.get(key).transformer)
    //);
  }

  render() {
    return (
      <div
        class="tile is-ancestor"
        style="padding: 0.75rem; background-color: darkblue"
        id="block-explorer"
      >
        <div class="tile is-vertical">
          {Array.from(this.inputs, ([key, input]) => {
            return (
              <div
                class="box tile is-child has-background-grey"
                style="padding: 0.5rem 0.25rem"
              >
                <InputPanel key={key} input={input.transformer} />
              </div>
            );
          })}
        </div>
        <div
          class="tile"
          style="align-items: center; padding: 0.5rem; max-width: 4rem"
        >
          <span class="icon is-large has-text-white">
            <i class="fa fa-arrow-right fa-3x " />
          </span>
        </div>
        <div class="tile" style="align-items: center">
          <div
            class="box has-background-grey tile is-child"
            style="padding: 0.5rem 0.25rem"
          >
            <TransformerView handler={this} node={this.transformer} />
            {}
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
        <div class="tile is-vertical">
          {Array.from(this.outputs, ([key, output]) => {
            return (
              <div
                class="box has-background-grey tile is-child"
                style="padding: 0.5rem 0.25rem"
              >
                <OutputPanel key={key} output={output.transformer} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /*async triggerTransformer() {
    let transformer = this.transformer;

    if (transformer.canTrigger) {
      return transformer.trigger().then(() => {
        let output = this.outputs.get("out");

        output.setInput(this.transformer.output);

        return output.trigger();
      });
    }
  }

  async triggerInput(key: string, input: InputTransformer) {
    input
      .trigger()
      .then(() => {
        let transformer = this.transformer;

        transformer.setInput({ [key]: input[key] });
        console.log("Input", key, "triggered");
        this.triggerInput(key, input);

        return this.triggerTransformer();
      })
      .catch(err => console.log(err));
  }*/

  handleAction(_action: Action) {
    /*let act = action as ConfigPropertyChanged | PropertyValueChanged;
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
      case "config:property-changed":
      case "property:value-changed":
        this.triggerTransformer().catch(err => console.log(err));
    }*/
    this.flow.trigger();

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
