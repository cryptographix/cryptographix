import {
  IConstructable,
  Transformer,
  BlockConfiguration,
  ISchemaProperty
} from "@cryptographix/core";

//import { FlowNode, TransformerNode, PipelineNode, MapperNode } from "./index";
import { FlowNode } from "./flow-node";
import { TransformerNode } from "./transformer-node";
import { PipelineNode } from "./pipeline-node";
import { MapperNode } from "./mapper-node";
import {
  DataNode
  //  ConstantDataNode,
  //  SelectorDataNode,
  //  FunctionDataNode
} from "./data-node";

import { FlowScript } from "../parser/flow-script";

export type AnyFlowNode =
  | Flow
  | PipelineNode
  | MapperNode
  | TransformerNode
  | DataNode;

export class Flow extends FlowNode {
  $type: "flow" = "flow";

  //
  readonly root?: AnyFlowNode;

  constructor(root: AnyFlowNode = null, id?: string) {
    super(id);

    this.root = root;
    if (root) root.parent = this;
  }

  /**
   *
   */
  setInput(data: object) {
    this.root.setInput(data);

    return this;
  }

  /**
   *
   */
  get output(): object {
    return this.root.output;
  }

  /**
   *
   */
  setup() {
    super.setup();

    this.root.setup();

    this.inPortSchemas = this.root.inPortSchemas;
    this.outPortSchemas = this.root.outPortSchemas;

    return this;
  }

  /**
   *
   */
  tearDown() {
    this.root.tearDown();

    return super.tearDown();
  }

  /**
   *
   */
  getPortSchema<TSchemaProperty extends ISchemaProperty = ISchemaProperty<any>>(
    key: string
  ): TSchemaProperty {
    return this.root.getPortSchema(key);
  }
  /**
   *
   */
  get canTrigger() {
    return super.canTrigger && !!this.root && this.root.canTrigger;
  }

  /**
   *
   */
  trigger(): Promise<boolean> {
    return this.setTriggerResult(this.root.trigger());
  }

  toJSON(): {} {
    return Flow.toJSON(this);
  }
}

export namespace Flow {
  type Traverser = (
    node: AnyFlowNode,
    children: AnyFlowNode[],
    prev?: AnyFlowNode
  ) => void;

  /**
   *
   */
  export function traverseFlow(
    node: AnyFlowNode,
    pre?: Traverser,
    post?: Traverser,
    prev?: AnyFlowNode
  ): void {
    let children = [];

    switch (node.$type) {
      case "flow":
        children.push(node.root);
        break;

      case "pipeline":
        for (let i = 0; i < node.nodes.length; ++i) {
          children.push(node.nodes[i]);
        }
        break;

      case "mapper":
        Array.from(node.nodes)
          .filter(([_key, _node]) => _key.indexOf("$") != 0)
          .forEach(([_key, node]) => {
            children.push(node);
          });
        break;
    }

    if (pre) {
      pre(node, children, prev);
    }

    if (node.$type == "pipeline") {
      let piped = prev;
      children.forEach(child => {
        if (child) traverseFlow(child, pre, post, piped);

        piped = child;
      });
    } else {
      children.forEach(child => {
        if (child) traverseFlow(child, pre, post, prev);
      });
    }

    if (post) {
      post(node, children, prev);
    }
  }

  /**
   *
   */
  export const fromFlowScript = FlowScript.fromFlowScript;

  /**
   *
   */
  export function fromTransformer<
    TConfig extends BlockConfiguration = object,
    TTransformer extends Transformer<TConfig> = Transformer<TConfig>
  >(
    transCtor: IConstructable<TTransformer>,
    id?: string,
    config?: TConfig
  ): Flow {
    let trans = new TransformerNode<TConfig>(transCtor, id, config);

    let flow = new Flow(trans, trans.id);

    return flow;
  }

  /**
   *
   */
  export const toFlowScript = FlowScript.toFlowScript;
  export const toJSON = FlowScript.toJSON;
  export const toRawJSON = FlowScript.toRawJSON;
}
