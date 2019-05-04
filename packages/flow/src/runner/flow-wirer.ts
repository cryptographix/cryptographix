import { ISchemaPropertyMap } from "@cryptographix/core";

import {
  FlowNode,
  AnyFlowNode,
  // TransformerNode,
  // PipelineNode,
  MapperNode,
  // DataNode,
  ConstantDataNode,
  SelectorDataNode,
  FunctionDataNode
} from "../nodes/index";

/**
 * Strategy:
 *  1. Traverse flow tree, depth first, extracting Outputs
 *     - consts and transformers: keys=static, types=static
 *     - selector: keys=static, types=inferred from input
 *     - getters: keys=static, types=inferred from ref
 *     - setters: keys=static, types=inferred from input
 *     - mappers: keys=static, types=inferred from node
 *     - pipes: keys=static (last-node), types=static
 */

class FlowTypeContent {
  // input (received)
  inPortSchemas?: ISchemaPropertyMap = {};

  // input (needed)
  reqPortSchemas?: ISchemaPropertyMap = {};

  // output (extracted)
  outPortSchemas?: ISchemaPropertyMap = {};

  nodeStack? = <FlowNode[]>[];
}

function reconcileNodes(sourceNode: AnyFlowNode, targetNode: AnyFlowNode) {
  if (sourceNode instanceof MapperNode) {
    //
  }
  //
}

/**
 *
 * Return output keys from a node
 *   - constant, selector, function
 *   - mapper = map.keys
 *   - pipe = last.keys
 */
export function propagateOutputTypes(
  node: AnyFlowNode,
  sourceNode: AnyFlowNode,
  context: FlowTypeContent = {}
): FlowTypeContent {
  let { inPortSchemas = {}, nodeStack = [] } = context;

  nodeStack.unshift(node);

  switch (node.$type) {
    case "flow":
      let { outPortSchemas, reqPortSchemas } = propagateOutputTypes(
        node.root,
        sourceNode,
        {
          inPortSchemas,
          nodeStack
        }
      );

      node.outPortSchemas = outPortSchemas;
      break;

    case "pipeline": {
      let lastPortSchemas = {};
      let pipePrev = sourceNode;

      node.nodes.forEach(node => {
        let { outPortSchemas, reqPortSchemas } = propagateOutputTypes(
          node,
          pipePrev,
          {
            inPortSchemas,
            nodeStack
          }
        );

        inPortSchemas = lastPortSchemas = outPortSchemas;
        pipePrev = node;
      });

      node.outPortSchemas = lastPortSchemas;

      break;
    }

    case "mapper": {
      let outPortSchemas = {};

      Array.from(node.nodes)
        .filter(([_key, _node]) => _key.indexOf("$") != 0)
        .forEach(([key, node]) => {
          let temp = propagateOutputTypes(node, sourceNode, {
            inPortSchemas,
            nodeStack
          });

          outPortSchemas[key] = temp.outPortSchemas;
        });

      node.outPortSchemas = outPortSchemas;

      break;
    }

    case "data":
      let inPortKey = node.inPortKeys[0];
      let outPortKey = node.outPortKeys[0];

      if (node instanceof ConstantDataNode) {
        // Constants are already typed
        //
      } else if (node instanceof SelectorDataNode) {
        // Selector out obeys in type
        node.inPortSchemas[inPortKey] = inPortSchemas[inPortKey];
        node.outPortSchemas[outPortKey] = node.inPortSchemas[inPortKey];
        //
      } else if (node instanceof FunctionDataNode) {
        //
        switch (node.name) {
          case "set":
            // TODO: Lookup ref and set type
            node.inPortSchemas[inPortKey] = inPortSchemas[inPortKey];
            node.outPortSchemas[outPortKey] = node.inPortSchemas[inPortKey];

            break;

          case "get":
            // TODO: Lookup ref and get type
            node.outPortSchemas[outPortKey] = null;
            break;
        }
      }
      break;

    case "transformer":
      break;
  }

  // remove-me
  nodeStack.shift();

  let result: FlowTypeContent = {
    outPortSchemas: node.outPortSchemas
  };

  return result;
}
