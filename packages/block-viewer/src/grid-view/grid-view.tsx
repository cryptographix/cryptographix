import { View } from "@cryptographix/core";
import {
  Flow,
  //  PipelineNode,
  //  MapperNode,
  //  TransformerNode,
  //  DataNode,
  AnyFlowNode
} from "@cryptographix/flow";

import {
  calculateNodeSizes,
  calculateNodePositions,
  ensureNodeView
} from "./helpers";

import { NodeView } from "./node-view";
import { LinkView /*, IPortRef*/ } from "./link-view";

export class GridView extends View {
  nodes: NodeView[] = [];
  links: LinkView[] = [];

  constructor(private flow: Flow) {
    super();
  }

  updateFlow(flow: Flow) {
    this.flow = flow;

    Flow.traverseFlow(this.flow, null, (node, children, prev) => {
      if (node.$type == "transformer") {
        if (node.blockName == "HEX") {
          node.outKeys.push("out");
        } else if (node.blockName == "DERIVE" || node.blockName == "MAC") {
          node.inKeys.push("data");
          node.inKeys.push("key");

          node.outKeys.push("out");
        }
      } else {
        if (prev) {
          node.inKeys.push(...prev.outKeys);
        }

        if (children.length > 0) {
          if (node.$type == "mapper") {
            for (let key of node.nodes.keys()) {
              node.outKeys.push(key);
            }
          } else {
            let last = children[children.length - 1];
            node.outKeys.push(...last.outKeys);
          }
        }
      }

      //console.log(Flow.toxJSON(node));
    });

    this.layoutView();

    this.triggerUpdate();
  }

  ind: number = 0;

  colors: string[] = [
    "FCF7D2",
    "FFE9DB",
    "F3DEEB",
    "DDECD3",
    "E3DFEF",
    "D3D3D3",
    "F8F68E",
    "FFFFFF"
  ];
  // Yellow:    F8F68E
  // Orangy:    FCF7D2 + FCF6CB + CCC597
  // Champagne: FFE9DB + FEE4D6
  // Rosey:     F3DEEB + F2D9E8 + D897C1
  // Green:     DDECD3 + D8EACC + 96C08D
  // Lilac:     E3DFEF + DEDAED + B2A0EB
  // Grey:      D3D3D3          + CCCCCC
  // White:     FFFFFF
  // Blue:                      + 97C8CD

  layoutView() {
    // Bottom-up calculate sizes
    Flow.traverseFlow(this.flow, null, calculateNodeSizes);

    // Top-down calculate positions
    Flow.traverseFlow(this.flow, calculateNodePositions);

    this.nodes = [];
    this.links = [];

    this.ind = 0;

    // Build pipe/mapper views .. traverse bottom-up so they stack correctly
    Flow.traverseFlow(this.flow, null, node => {
      let view = ensureNodeView(node);
      if (node.$type != "transformer") {
        this.nodes.push(view);
        if (node.meta["$color"]) view.layout.color = node.meta["$color"]; // this.colors[this.ind++];
      }
    });

    // Build node-views
    Flow.traverseFlow(this.flow, node => {
      let view = ensureNodeView(node);
      if (node.$type == "transformer") {
        this.nodes.push(view);
      }
    });

    // Build links and link-views
    Flow.traverseFlow(this.flow, (node, children) => {
      let prev: AnyFlowNode;

      switch (node.$type) {
        case "pipeline":
          console.log("traverse: pipeline" + ":" + node.id);
          children.forEach(child => {
            console.log("  child: " + child.$type + ":" + child.id);

            if (prev && child.$type == "transformer") {
              let inKeys = [...child.inKeys];
              let outKeys = [...prev.outKeys];

              for (let key of child.inKeys) {
                if (outKeys.indexOf(key) >= 0) {
                  this.links.push(
                    new LinkView(
                      { node: prev, portKey: key },
                      { node: child, portKey: key }
                    )
                  );
                  inKeys.splice(inKeys.indexOf(key), 1);

                  outKeys.splice(outKeys.indexOf(key), 1);
                }
              }

              for (let key of inKeys) {
                if (outKeys.length > 0) {
                  this.links.push(
                    new LinkView(
                      { node: prev, portKey: outKeys.pop() },
                      { node: child, portKey: key }
                    )
                  );
                  // inKeys.splice(0, 1);

                  //                  outKeys.splice(outKeys.indexOf(key), 1);
                }
              }
            }

            prev = child;
          });
      }
      return {};
    });
  }

  render() {
    let view = ensureNodeView(this.flow);

    return (
      <div
        class="grid-inner"
        style={
          // Yellow:    F8F68E
          // Orangy:    FCF7D2 + FCF6CB + CCC597
          // Champagne: FFE9DB + FEE4D6
          // Rosey:     F3DEEB + F2D9E8 + D897C1
          // Green:     DDECD3 + D8EACC + 96C08D
          // Lilac:     E3DFEF + DEDAED + B2A0EB
          // Grey:      D3D3D3          + CCCCCC
          // White:     FFFFFF
          // Blue:                      + 97C8CD

          " width: " +
          (4 + view.layout.w) +
          "px; " +
          "height: " +
          (1 + view.layout.h) +
          "px" +
          ""
        }
        onMouseMove={(evt: MouseEvent | any) => {
          let rect = evt.currentTarget.getBoundingClientRect();
          var x = evt.pageX - rect.left;
          var y = evt.pageY - rect.top;
          //console.log(evt);
          document.getElementById("mousey").innerHTML = `${x}, ${y}`;
        }}
      >
        {View.renderViews(this.nodes)}
        {View.renderViews(this.links)}
        <div
          id="mousey"
          style="position: absolute; width:200px; height: 2rem; right: 0px; bottom: 0px; border: 1px solid #080;"
        />
      </div>
    );
  }
}

export namespace GridView {
  export const GRIDX = 128;
  export const GRIDX_BORDER = GRIDX * 0.25;
  export const GRIDY = 56;
  export const GRIDY_BORDER = GRIDY * 0.25;

  export const BLOCKX = 182;
  export const BLOCKY = 44;

  export const PORT_INIT_Y = 12;
  export const PORT_DELTA_Y = 42;

  export const PORTX = 15;
  export const PORTY = 29;

  export const PORT_LINK_DELTA_X = 16;
}
