import { FlowNode } from "./flow-node";
import { TransformerNode } from "./transformer-node";
import { PipelineNode } from "./pipeline-node";
import { MapperNode } from "./mapper-node";
import { FlowParser } from "../parser/flow-parser";
import { DataNode } from "./data-node";

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
  getOutput(): object {
    return this.root.getOutput();
  }

  /**
   *
   */
  setup() {
    super.setup();

    this.root.setup();

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

  static toJSON(node: FlowNode): any {
    let res: any;

    function objToString(obj: object): string {
      let s = [];

      Object.entries(obj).forEach(([key, value]) => {
        s.push("'" + key + "': '" + value + "'");
      });
      return "{" + s.join(",") + "}";
    }

    switch (node.$type) {
      case "flow":
        res = {
          $flow: true,
          root: Flow.toJSON((node as Flow).root)
        };
        break;

      case "pipeline": {
        let nodes: any[] = [];
        (node as PipelineNode).nodes.forEach(step => {
          nodes.push(Flow.toJSON(step));
        });

        res = nodes.length == 1 ? nodes[0] : nodes;
        break;
      }

      case "mapper": {
        let items = {};

        (node as MapperNode).nodes.forEach((value, key) => {
          items[key] = Flow.toJSON(value);
        });

        res = items;
        break;
      }

      case "data": {
        res = (node as DataNode).value;
        break;
      }

      case "transformer": {
        let trans = node as TransformerNode;
        let hasLabel = !!trans.id;
        let hasConfig = trans.config && Object.keys(trans.config).length > 0;

        res =
          trans.blockName +
          "(" +
          (hasLabel ? "'" + trans.id + "'" : "") +
          (hasLabel && hasConfig ? ", " : "") +
          (hasConfig ? objToString(trans.config) : "") +
          (hasLabel && hasConfig ? " " : "") +
          ")";
      }
    }

    return res;
  }

  /*  _() {
    return { key: { key: { key: HEX("IMK"), data: HEX("PAN") } |> DERIVE("Derive MKac", {"algorithm":"DES2"} ), data: HEX("ATC") } |> DERIVE("Derive SKac"), data: HEX("BUFFER") } |> MAC();
  }*/

  //
  /**
   *
   */
  static toxJSON(flow: AnyFlowNode): {} {
    function orphanize(n: AnyFlowNode) {
      let nn = {
        ...n,
        parentNode: undefined,
        nodes: undefined,
        input: Object.keys(n.input).length ? n.input : undefined,
        output: Object.keys(n.output).length ? n.output : undefined,
        root: undefined,
        inKeys: n.inKeys && n.inKeys.length > 0 ? n.inKeys : undefined,
        outKeys: n.outKeys && n.outKeys.length > 0 ? n.outKeys : undefined
      };

      if (n instanceof PipelineNode || n instanceof MapperNode) {
        nn.nodes = n instanceof PipelineNode ? [] : {};

        n.nodes.forEach((node: AnyFlowNode, key: any) => {
          console.log(key);
          nn.nodes[key] = orphanize(node);
        });
      } else if (n instanceof Flow) {
        nn.root = orphanize(n.root);
      }

      return nn;
    }

    return orphanize(flow);
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
  export function fromFlowScript(flowScript: string): Flow {
    const parser = new FlowParser(flowScript);

    let flow = parser.parseFlow();

    return flow;
  }

  /**
   *
   */
  export function toFlowScript(node: FlowNode): string {
    let res = "";

    switch (node.$type) {
      case "flow":
        res = Flow.toFlowScript((node as Flow).root);
        break;

      case "pipeline": {
        let nodes: string[] = [];
        (node as PipelineNode).nodes.forEach(step => {
          nodes.push(Flow.toFlowScript(step));
        });

        res = nodes.join(" |> ");
        break;
      }

      case "mapper": {
        let items = [];

        (node as MapperNode).nodes.forEach((value, key) => {
          //nodes[key] = Flow.toFlowString(value);
          items.push(key + ": " + Flow.toFlowScript(value));
        });

        res = items.length == 0 ? "{}" : "{ " + items.join(", ") + " }";

        break;
      }

      case "data": {
        res = (node as DataNode).value;
        break;
      }

      case "transformer": {
        let trans = node as TransformerNode;
        let hasLabel = !!trans.id;
        let hasConfig = trans.config && Object.keys(trans.config).length > 0;

        res =
          trans.blockName +
          "(" +
          (hasLabel ? '"' + trans.id + '"' : "") +
          (hasLabel && hasConfig ? ", " : "") +
          (hasConfig ? JSON.stringify(trans.config) : "") +
          (hasLabel && hasConfig ? " " : "") +
          ")";
      }
    }

    return res;
  }
}
