import { ByteArray } from "@cryptographix/core";

import {
  Flow,
  AnyFlowNode,
  //  TransformerNode,
  PipelineNode,
  MapperNode,
  DataNode,
  ConstantDataNode,
  SelectorDataNode,
  FunctionDataNode
} from "../nodes/index";

import { FlowParser } from "./flow-parser";

export namespace FlowScript {
  export function fromFlowScript(flowScript: string): Flow {
    const parser = new FlowParser(flowScript);

    let flow = parser.parseFlow();

    return flow;
  }

  export function toFlowScript(node: AnyFlowNode): string {
    let res = "";

    switch (node.$type) {
      case "flow":
        res = Flow.toFlowScript(node.root);
        break;

      case "pipeline": {
        let nodes: string[] = [];
        node.nodes.forEach(step => {
          nodes.push(Flow.toFlowScript(step));
        });

        res = nodes.join(" |> ");
        break;
      }

      case "mapper": {
        let items = [];

        node.nodes.forEach((value, key) => {
          if (value instanceof SelectorDataNode && key == value.outPortKeys[0])
            items.push(key);
          else items.push(key + ": " + Flow.toFlowScript(value));
        });

        res = items.length == 0 ? "{}" : "{ " + items.join(", ") + " }";

        break;
      }

      case "data": {
        if (node instanceof ConstantDataNode) {
          let out = node.output[DataNode.PRIMARY_KEY];

          switch (node.typeName) {
            case "string":
              res = "'" + out + "'";
              break;

            case "hex":
              res =
                "$hex( '" + ByteArray.toString(out as ByteArray, "hex") + "' )";
              break;

            case "bytes":
            case "base64":
              res =
                "$base64( '" +
                ByteArray.toString(out as ByteArray, "base64") +
                "' )";
              break;

            default:
              res = out;
          }
        } else if (node instanceof SelectorDataNode) {
          //res = (node.inKeys[0] == node.outKeys[0]) ?
          res = node.inPortKeys[0];
        } else if (node instanceof FunctionDataNode) {
          res = node.name + "( '" + node.params[0] + "' )";
        }
        break;
      }

      case "transformer": {
        let hasLabel = !!node.id;
        let hasConfig =
          node.initConfig && Object.keys(node.initConfig).length > 0;

        res =
          node.blockName +
          "(" +
          (hasLabel ? '"' + node.id + '"' : "") +
          (hasLabel && hasConfig ? ", " : "") +
          (hasConfig ? JSON.stringify(node.initConfig) : "") +
          (hasLabel && hasConfig ? " " : "") +
          ")";
      }
    }

    return res;
  }

  /**
   *
   */
  export function toJSON(node: AnyFlowNode): any {
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
          root: FlowScript.toJSON(node.root)
        };
        break;

      case "pipeline": {
        let nodes: any[] = [];
        node.nodes.forEach(step => {
          nodes.push(FlowScript.toJSON(step));
        });

        res = nodes.length == 1 ? nodes[0] : nodes;
        break;
      }

      case "mapper": {
        let items = {};

        node.nodes.forEach((value, key) => {
          items[key] = FlowScript.toJSON(value);
        });

        res = items;
        break;
      }

      case "data": {
        if (node instanceof ConstantDataNode) {
          let out = node.output[DataNode.PRIMARY_KEY];

          switch (node.typeName) {
            case "string":
              res = "'" + out + '"';
              break;

            case "hex":
            case "bytes":
            case "base64":
              res =
                '"' + ByteArray.toString(out as ByteArray, "base64") + '" )';
              break;

            default:
              res = out;
          }
        } else if (node instanceof SelectorDataNode) {
          //res = (node.inKeys[0] == node.outKeys[0]) ?
          res = node.inPortKeys[0];
        } else if (node instanceof FunctionDataNode) {
          res = node.name + '( "' + node.params[0] + '" )';
        }
        break;
      }

      case "transformer": {
        let hasLabel = !!node.id;
        let hasConfig =
          node.initConfig && Object.keys(node.initConfig).length > 0;

        res =
          node.blockName +
          "(" +
          (hasLabel ? "'" + node.id + "'" : "") +
          (hasLabel && hasConfig ? ", " : "") +
          (hasConfig ? objToString(node.initConfig) : "") +
          (hasLabel && hasConfig ? " " : "") +
          ")";
      }
    }

    return res;
  }

  /**
   *
   */
  export function toRawJSON(flow: AnyFlowNode): {} {
    function orphanize(n: AnyFlowNode) {
      let nn = {
        ...n,
        parentNode: undefined,
        nodes: undefined,
        input: Object.keys(n.input).length ? n.input : undefined,
        output: Object.keys(n.output).length ? n.output : undefined,
        root: undefined,
        inKeys: n.inPortKeys.length > 0 ? n.inPortKeys : undefined,
        outKeys: n.outPortKeys.length > 0 ? n.outPortKeys : undefined
      };

      if (n instanceof PipelineNode || n instanceof MapperNode) {
        nn.nodes = n instanceof PipelineNode ? [] : {};

        n.nodes.forEach((node: AnyFlowNode, key: any) => {
          //          console.log(key);
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
