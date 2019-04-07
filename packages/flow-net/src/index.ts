import { block, Transformer, isPort, integerProp } from "@cryptographix/core";

export { Parser } from "./parser/flow-parser";
export { Tokenizer } from "./parser/tokenizer";

export * from "./flow-graph";

import * as FG from "./flow-graph";

class DummyConfig {
  @integerProp()
  mult?: number = 2;
}

@block({
  name: "",
  title: "",
  config: DummyConfig
  //
})
class Dummy extends Transformer<DummyConfig> {
  @isPort({ type: "data-in", primary: true })
  a: number = 0;
  @isPort({ type: "data-in" })
  b: number = 1;
  @isPort({ type: "data-out", primary: true })
  x: number;

  //
  async trigger() {
    this.x = (this.a + this.b) * this.config.mult;

    return Promise.resolve();
  }
}

//let c = new FG.TransformerNode<DummyConfig, Dummy>(Dummy, { mult: 100 });

let root = new FG.RootNode(
  //  new FG.PipelineNode([
  new FG.SplitterNode({
    par1: new FG.TransformerNode<DummyConfig, Dummy>(Dummy, { mult: 100 }),
    par2: new FG.TransformerNode<DummyConfig, Dummy>(Dummy, { mult: 200 })
  })
);

root.setup();

root.setInput({ a: 5 });

root
  .trigger()
  .then(() => {
    console.log("Done", root.getOutput());
  })
  .catch(err => {
    console.log(err);
  });
