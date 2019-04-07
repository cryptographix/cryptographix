//import { Action } from "@cryptographix/core";
import { FlowNode } from "./flow-node";
import { NodeSetupAction, NodeTeardownAction } from "./node-actions";

/**
 *  Encapsulates a sequence of chained nodes
 *
 *  When triggered, triggers the first node in the sequence
 *  and completes when the last node completes.
 */
export class PipelineNode extends FlowNode {
  //
  _nodes: FlowNode[] = [];

  /**
   *
   */
  constructor(nodes: FlowNode[] = []) {
    super();

    this.nodes = nodes;

    nodes.forEach(node => {
      node.parent = this;
    });
  }

  /**
   *
   */
  appendNode(node: FlowNode) {
    this.nodes.push(node);
  }

  /**
   *
   */
  setup() {
    super.setup();

    this.nodes.forEach(node => {
      let act = new NodeSetupAction(node);
      act.dispatch();
    });

    return this;
  }

  /**
   *
   */
  tearDown() {
    this.nodes.forEach(node => {
      let act = new NodeTeardownAction(node);
      act.dispatch();
    });

    return super.tearDown();
  }

  protected triggerNode(index: number, data: {}): Promise<boolean> {
    let node = this.nodes[index];

    node.setInput(data);
    if (node.canTrigger) {
      let res = node.trigger();

      res.then(ok => {
        if (ok) {
          let output = node.getOutput();

          if (index + 1 < this.nodes.length) {
            // chain to next
            return this.triggerNode(index + 1, output);
          } else {
            this.output = output;
            // last in pipeline
            return ok;
          }
        }

        return ok;
      });

      return res;
    }
  }

  /**
   *
   */
  async trigger(_reverse?: boolean) {
    if (!this.canTrigger) return Promise.reject("Unable to trigger");

    this.result = this.triggerNode(0, this.input);

    let me = this;
    return this.result
      .then(_ok => {
        return _ok;
      })
      .finally(() => {
        me._result = null;
      });
  }

  /**
   *
  handleAction(action: Action): Action {
    let act = action as PortDataInAction | NodeSetupAction | NodeTeardownAction;

    switch (act.action) {
      case "port-data-in":
        {
        }
        break;
    }

    return super.handleAction(action);
  }
  */
}
