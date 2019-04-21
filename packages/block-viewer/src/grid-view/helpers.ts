import { AnyFlowNode } from "@cryptographix/flow";

import { NodeView } from "./node-view";
//import { LinkView, IPortRef } from "./link-view";

const emptyNodeView = new NodeView(null);

export function ensureNodeView(node: AnyFlowNode): NodeView {
  if (!node) return emptyNodeView;

  if (!node.view) {
    //
    if (node.$type == "transformer") {
      node.view = new NodeView(node);
    } else {
      node.view = new NodeView(node);
    }
  }

  return node.view as NodeView;
}

export function calculateNodeSizes(node: AnyFlowNode, children: AnyFlowNode[]) {
  let layout = ensureNodeView(node).layout;

  switch (node.$type) {
    case "flow": {
      let root = ensureNodeView(node.root);

      if (root) {
        layout.w = root.layout.w;
        layout.h = root.layout.h;
      }
      break;
    }

    case "pipeline":
      children.forEach(child => {
        let view = ensureNodeView(child);

        layout.w += view.layout.w;
        layout.h = Math.max(layout.h, view.layout.h);
      });
      break;

    case "mapper":
      children.forEach(child => {
        let view = ensureNodeView(child);

        layout.w = Math.max(layout.w, view.layout.w);
        layout.h += view.layout.h;
      });
      break;

    default:
      layout.w = 1;
      layout.h = 1;
      break;
  }
}

export function propagateNodePorts(node: AnyFlowNode, children: AnyFlowNode[]) {
  let layout = {
    ...ensureNodeView(node).layout
  };

  switch (node.$type) {
    case "flow": {
      let root = ensureNodeView(node.root);

      if (root) {
        root.layout.x = layout.x;
        root.layout.y = layout.y;
      }
      break;
    }

    case "pipeline":
      let first: string[];
      let last = node.inKeys;

      children.forEach(child => {
        //let view = ensureNodeView(child);

        if (!first) {
          first = child.inKeys;
        } else {
          child.inKeys = last;
        }
        last = child.outKeys;
      });
      node.inKeys = first;
      break;

    case "mapper":
      children.forEach(child => {
        let view = ensureNodeView(child);

        view.layout.x = layout.x;

        view.layout.y = layout.y;
        layout.y += view.layout.h * 2;
      });
      break;

    default:
      break;
  }
}

export function calculateNodePositions(
  node: AnyFlowNode,
  children: AnyFlowNode[]
) {
  let layout = {
    ...ensureNodeView(node).layout
  };

  switch (node.$type) {
    case "flow": {
      let root = ensureNodeView(node.root);

      if (root) {
        root.layout.x = layout.x;
        root.layout.y = layout.y;
      }
      break;
    }

    case "pipeline":
      children.forEach(child => {
        let view = ensureNodeView(child);

        view.layout.x = layout.x;
        layout.x += view.layout.w * 2;

        view.layout.y = layout.y;
      });
      break;

    case "mapper":
      children.forEach(child => {
        let view = ensureNodeView(child);

        view.layout.x = layout.x;

        view.layout.y = layout.y;
        layout.y += view.layout.h * 2;
      });
      break;

    default:
      break;
  }
}
