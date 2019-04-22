import { AnyFlowNode } from "@cryptographix/flow";

import { GridView as GV } from "./grid-view";
import { NodeView } from "./node-view";

const emptyNodeView = new NodeView(null);

/**
 *
 */
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

/**
 *
 */
export function calcBlockHeight(ports: number) {
  return Math.min(GV.BLOCKY + ports * GV.PORT_DELTA_Y, 102);
}

/**
 *
 */
export function calculateNodeSizes(node: AnyFlowNode, children: AnyFlowNode[]) {
  let layout = ensureNodeView(node).layout;
  let ports = Math.max(node.inKeys.length, node.outKeys.length);

  switch (node.$type) {
    case "flow": {
      let root = ensureNodeView(node.root);

      layout.w = root.layout.w;
      layout.h = root.layout.h;
      layout.z = root.layout.z + 1;
      break;
    }

    case "pipeline":
      children.forEach(child => {
        let view = ensureNodeView(child);

        layout.w += view.layout.w;
        layout.h = Math.max(layout.h, view.layout.h);
        layout.z = Math.max(view.layout.z + 1, layout.z);
      });
      break;

    case "mapper":
      children.forEach(child => {
        let view = ensureNodeView(child);

        layout.w = Math.max(layout.w, view.layout.w);
        layout.h += view.layout.h;
        layout.z = Math.max(view.layout.z + 1, layout.z);
      });
      break;

    default:
      let bh = calcBlockHeight(ports);
      layout.w = GV.GRIDX * 2;
      layout.h = Math.floor(bh / GV.GRIDY) * GV.GRIDY * 2;
      layout.z = 1;
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

      root.layout.x = layout.x; //+ GV.GRIDX_BORDER;
      root.layout.y = layout.y; //+ GV.GRIDY_BORDER;
      break;
    }

    case "pipeline":
      children.forEach(child => {
        let view = ensureNodeView(child);

        view.layout.x = layout.x; // + GV.GRIDX_BORDER;
        layout.x += view.layout.w;

        view.layout.y = layout.y; //+ GV.GRIDY_BORDER;
      });
      break;

    case "mapper":
      children.forEach(child => {
        let view = ensureNodeView(child);

        view.layout.x = layout.x; //+ GV.GRIDX_BORDER;

        view.layout.y = layout.y; //+ GV.GRIDY_BORDER;
        layout.y += view.layout.h;
      });
      break;

    default:
      break;
  }
}

export function LightenDarkenColor(col: string, amt: number) {
  var usePound = false;
  if (col[0] == "#") {
    col = col.slice(1);
    usePound = true;
  }

  var num = parseInt(col, 16);

  var r = (num >> 16) * amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  var b = ((num >> 8) & 0x00ff) * amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  var g = (num & 0x0000ff) * amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

/*export function propagateNodePorts(node: AnyFlowNode, children: AnyFlowNode[]) {
  switch (node.$type) {
    case "flow": {
      let root = ensureNodeView(node.root);

      if (root) {
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
      });
      break;

    default:
      break;
  }
}*/
