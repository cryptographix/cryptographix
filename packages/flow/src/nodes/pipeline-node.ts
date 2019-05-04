import { FlowNode } from "./flow-node";
import { AnyFlowNode } from "./flow";
import { NodeSetupAction, NodeTeardownAction } from "./node-actions";

/**
 *  Encapsulates a sequence of chained nodes
 *
 *  When triggered, triggers the first node in the sequence
 *  and completes when the last node completes.
 */
export class PipelineNode extends FlowNode {
  $type: "pipeline" = "pipeline";

  // Nodes in pipe
  readonly nodes: AnyFlowNode[];

  /**
   *
   */
  constructor(nodes: AnyFlowNode[] = [], id: string = "") {
    super(id);

    this.nodes = nodes;

    nodes.forEach(node => {
      node.parent = this;
    });
  }

  /**
   *
   */
  appendNode(node: AnyFlowNode) {
    this.nodes.push(node);
    node.parent = this;
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

  /**
   *
   */
  protected triggerNode(index: number, data: {}): Promise<boolean> {
    let node = this.nodes[index];

    node.setInput(data);
    if (node.canTrigger) {
      let res = node.trigger();

      res.then(ok => {
        if (ok) {
          let output = node.output;

          if (index + 1 < this.nodes.length) {
            // chain to next
            return this.triggerNode(index + 1, output);
          } else {
            // last in pipeline
            //this.output = output;

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
  get output() {
    let out = {};
    let index = this.nodes.length - 1;

    if (index > 0)
      // shallow copy -> immutable
      out = {
        ...this.nodes[index].output
      };

    return out;
  }

  /**
   *
   */
  get canTrigger() {
    return super.canTrigger && this.nodes.length > 0;
  }

  /**
   *
   */
  async trigger() {
    if (!this.canTrigger) return Promise.reject("Unable to trigger");

    // Forward input to first node in pipeline
    return this.setTriggerResult(this.triggerNode(0, this.input));
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
