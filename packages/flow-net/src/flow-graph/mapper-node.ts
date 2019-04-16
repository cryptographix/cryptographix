import { FlowNode } from "./flow-node";
import { NodeSetupAction, NodeTeardownAction } from "./node-actions";

/**
 *
 */
export class MapperNode extends FlowNode {
  $type: "mapper" = "mapper";

  //
  nodes: Map<string, FlowNode>;

  /**
   *
   */
  constructor(nodes: { [index: string]: FlowNode } = null, id: string = "") {
    super(id);

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
  async trigger() {
    if (!this.canTrigger) return Promise.reject("Unable to trigger");

    // Forward input to all branches
    this.nodes.forEach((node, _key) => {
      node.setInput(this.input);
    });

    let output = (this.output = {});

    let results: Promise<boolean>[] = [];
    this.nodes.forEach((node, key) => {
      let trig = node.trigger().then(ok => {
        if (ok) {
          output[key] = node.getOutput();
        }

        return ok;
      });

      results.push(trig);
    });

    let result = Promise.all(results).then(oks => {
      let allOK = oks.reduce((accum, ok) => accum && ok, true);

      return Promise.resolve<boolean>(allOK);
    });

    return this.setTriggerResult(result);
  }
}
