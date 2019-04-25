import "mocha";
import { expect } from "chai";
import { block, Transformer, isPort, integerProp } from "@cryptographix/core";
import {
  Flow,
  TransformerNode,
  PipelineNode,
  MapperNode,
  AnyFlowNode
} from "@cryptographix/flow";

class AddAndMultiplyConfig {
  @integerProp()
  mult?: number = 2;
}

@block({
  name: "",
  title: "",
  config: AddAndMultiplyConfig
  //
})
class AddAndMultiply extends Transformer<AddAndMultiplyConfig> {
  @isPort({ type: "data-in", primary: true })
  @integerProp()
  a?: number;

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

function createNode(type: "trans" | "map" | "pipe", id: string, opts?: {}) {
  let node: AnyFlowNode;

  switch (type) {
    case "trans":
      node = new Flow(
        new TransformerNode<AddAndMultiplyConfig>(AddAndMultiply, id, opts)
      );

      break;

    case "map":
      node = new MapperNode(
        {
          par1: createNode("trans", "node 100", { mult: 100 }),
          par2: createNode("trans", "node 200", { mult: 200 })
        },
        id
      );

      break;

    case "pipe":
      node = new PipelineNode(
        [
          createNode("trans", "node 100", { mult: 100 }),
          createNode("trans", "node 200", { mult: 200 })
        ],
        id
      );

      break;
  }

  return node;
}

describe("Transformer Node", () => {
  let root = new Flow(createNode("trans", "node 1", { mult: 1 }));

  it("must not trigger until all inputs ready", async () => {
    await root.setup();

    expect(root.canTrigger).to.equal(false);
  });

  it("can trigger when all inputs ready", async () => {
    await root.setInput({ a: 5 });

    expect(root.canTrigger).to.equal(true);
  });

  it("completes when triggered", async () => {
    await root.trigger();

    expect(root.status).to.equal("idle");
  });
});

describe("AddAndMultiply parallel flows", () => {
  let root = new Flow(createNode("map", "map 1"));

  it("must complete", async () => {
    await root
      .setup()
      .setInput({ a: 5, b: 0 })
      .trigger();
  });

  it("... and must output correct properties from MappedNode", async () => {
    let output = root.output;

    expect(output).to.have.property("par1");
    expect(output).to.have.property("par2");
  });

  it("... and output correct property values for input=5", async () => {
    let output = root.output;

    expect(output)
      .to.have.property("par1")
      .to.include({ x: 600 }, "Incorrect Output Value");

    expect(output)
      .to.have.property("par2")
      .to.include({ x: 1200 }, "Incorrect Output Value");
  });

  it("... and output correct property values for input=555", async () => {
    await root.setInput({ a: 555 }).trigger();

    let output = root.output;

    expect(output)
      .to.have.property("par1")
      .to.include({ x: (555 + 1) * 100 }, "Incorrect Output Value");

    expect(output)
      .to.have.property("par2")
      .to.include({ x: (555 + 1) * 200 }, "Incorrect Output Value");
  });
});

describe("Node state", () => {
  let roots: Flow[] = [];

  roots.push(
    new Flow(createNode("trans", "node 1", { mult: 1 }), "Transformer")
  );
  roots.push(new Flow(createNode("map", "map 1"), "Mapper"));
  roots.push(new Flow(createNode("pipe", "pipe 1"), "Pipeline"));

  roots.forEach(root => {
    describe("state (" + root.id + ")", () => {
      it("newborn must have status='created'", async () => {
        expect(root.status).to.equal("created");
      });

      it("after setup, must have status='idle'", async () => {
        await root.setup();

        expect(root.status).to.equal("idle");
        if (root.id == "Transformer") expect(root.canTrigger).to.equal(false);
      });

      it("after input, must continue with status='idle'", async () => {
        await root.setInput({ a: 5 });

        expect(root.status).to.equal("idle");
        expect(root.canTrigger).to.equal(true);
      });

      it("after trigger but before completion, state must be 'busy'", async () => {
        let res = root.trigger();

        expect(root.status).to.equal("busy");
        expect(root.canTrigger).to.equal(false);

        return res;
      });

      it("after completion, state must return to 'idle'", async () => {
        expect(root.status).to.equal("idle");
        expect(root.canTrigger).to.equal(true);
      });
    });
  });
});
