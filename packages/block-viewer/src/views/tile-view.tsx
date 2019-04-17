import { View } from "@cryptographix/core";
import {
  Flow,
  FlowNode,
  PipelineNode,
  MapperNode,
  TransformerNode,
  DataNode
} from "@cryptographix/flow-net";

type FlowNodeUnion =
  | Flow
  | PipelineNode
  | MapperNode
  | TransformerNode
  | DataNode;

export class TileView extends View {
  constructor(public node: Flow, public root: boolean) {
    super();
  }

  renderPipe(node: PipelineNode) {
    let x = [];
    for (let i = 0; i < node.nodes.length; ++i) {
      x.push(
        <div class="tile" style="align-items: center">
          {this.renderNode(node.nodes[i], i + 1 < node.nodes.length)}
        </div>
      );
    }

    return <div class="tile">{x}</div>;
  }

  renderMap(node: MapperNode) {
    let x = [];
    Object.entries(node.nodes)
      .filter(([key, _node]) => key != "$type")
      .forEach(([key, node]) => {
        x.push(
          <div id={key} class="tile is-child">
            {this.renderNode(node)}
          </div>
        );
      });

    return (
      <div class="tile is-vertical" style="xalign-items: center">
        {x}
      </div>
    );
  }

  renderNode(node: FlowNode, hasArrow: boolean = false) {
    let typedNode = node as FlowNodeUnion;
    let r: any;

    switch (typedNode.$type) {
      case "flow":
        r = this.renderNode(typedNode.root);
        break;

      case "pipeline":
        r = this.renderPipe(typedNode);
        break;

      case "mapper":
        r = this.renderMap(typedNode);
        break;

      case "transformer":
        r = (
          <div
            class="tile is-child box"
            style="padding-left: 1rem; max-width: 320px"
          >
            {typedNode.blockName + "('" + node.id + "')"}
          </div>
        );
        break;

      case "data":
        return null;
    }

    if (hasArrow) {
      r = (
        <div class="tile">
          {r}
          <div
            class="tile"
            style="align-items: center; padding-right: 0.5rem; border-left: 3px solid white; margin-left: 1rem"
          >
            <span class="icon is-large has-text-white" style="width: 2.5rem">
              <i class="fa fa-arrow-right fa-3x " />
            </span>
          </div>
        </div>
      );
    }

    return r;
  }

  render() {
    return <div class="tile is-ancestor">{this.renderNode(this.node)}</div>;
  }
}
