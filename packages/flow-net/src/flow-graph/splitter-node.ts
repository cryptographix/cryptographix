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

    this._nodes = new Map<string, FlowNode>(Object.entries(nodes));

    this._nodes.forEach(node => {
      node.parent = this;
    });
  }

  /**
   *
   */
  addBranch(key: string, node: FlowNode) {
    this._nodes.set(key, node);

    node.parent = this;
  }

  /**
   *
   */
  setup() {
    super.setup();

    this._nodes.forEach((node, _key) => {
      let act = new NodeSetupAction(node);
      act.dispatch();
    });
  }

  /**
   *
   */
  tearDown(): void {
    this._nodes.forEach((node, _key) => {
      let act = new NodeTeardownAction(node);
      act.dispatch();
    });

    super.tearDown();
  }

  /**
   *
   */
  async trigger(reverse?: boolean) {
    if (!this.canTrigger) return Promise.reject("Unable to trigger");

    let output = (this._output = {});

    let result: Promise<boolean>[] = [];
    this._nodes.forEach((node, key) => {
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
