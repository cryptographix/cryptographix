import { FlowNode } from "./flow-node";
import { NodeSetupAction, NodeTeardownAction } from "./node-actions";

/**
 *
 */
export class SplitterNode extends FlowNode {
  //
  _nodes: Map<string, FlowNode>;

  /**
   *
   */
  constructor(nodes: { [index: string]: FlowNode } = null) {
    super();

    this.nodes = new Map<string, FlowNode>(Object.entries(nodes));

    this.nodes.forEach(node => {
      node.parent = this;
    });
  }

  /**
   *
   */
  addBranch(key: string, node: FlowNode): this {
    this.nodes.set(key, node);

    node.parent = this;

    return this;
  }

  /**
   *
   */
  setup() {
    super.setup();

    this.nodes.forEach((node, _key) => {
      let act = new NodeSetupAction(node);
      act.dispatch();
    });

    return this;
  }

  /**
   *
   */
  tearDown() {
    this.nodes.forEach((node, _key) => {
      let act = new NodeTeardownAction(node);
      act.dispatch();
    });

    return super.tearDown();
  }

  /**
   *
   */
  async trigger(reverse?: boolean) {
    if (!this.canTrigger) return Promise.reject("Unable to trigger");

    let output = (this.output = {});

    let result: Promise<boolean>[] = [];
    this.nodes.forEach((node, key) => {
      let trig = node.trigger(reverse).then(ok => {
        if (ok) {
          output[key] = node.getOutput();
        }

        return ok;
      });

      result.push(trig);
    });

    return Promise.all(result).then(oks => {
      let allOK = oks.reduce((accum, ok) => accum && ok, true);

      return Promise.resolve(allOK);
    });
  }
}
