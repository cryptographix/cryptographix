import { View } from "@cryptographix/core";
import {
  Flow,
  FlowNode,
  PipelineNode,
  MapperNode,
  //  TransformerNode,
  //  DataNode,
  FlowNodeUnion
} from "@cryptographix/flow";

export class GridView extends View {
  constructor(public node: Flow, public root: boolean) {
    super();
  }

  renderPipe(node: PipelineNode) {
    let x = [];
    for (let i = 0; i < node.nodes.length; ++i) {
      x.push(
        <div class="grid-item" style="align-items: center">
          {this.renderNode(node.nodes[i], i + 1 < node.nodes.length)}
        </div>
      );
    }

    return <div class="grid-item">{x}</div>;
  }

  renderMap(node: MapperNode) {
    let x = [];
    Array.from(node.nodes)
      .filter(([_key, _node]) => _key != "$type")
      .forEach(([_key, node]) => {
        x.push(
          <div id={_key} class="grid-item is-child">
            {this.renderNode(node)}
          </div>
        );
      });

    return (
      <div class="grid-item is-vertical" style="xalign-items: center">
        {x}
      </div>
    );
  }

  renderNode(node: FlowNode, hasArrow: boolean = false) {
    let typedNode = node as FlowNodeUnion;
    let r: any;

    if (!node) return;

    switch (typedNode.$type) {
      case "flow":
        r = this.renderNode(typedNode.root);
        break;

      case "pipeline": {
        r = this.renderPipe(typedNode);
        break;
      }
      case "mapper": {
        r = this.renderMap(typedNode);
        break;
      }
      case "transformer":
        r = (
          <div
            class="grid-item is-child box"
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
        <div class="grid-item">
          {r}
          <div
            class="grid-item"
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
    return (
      <article>
        <div class="grid is-ancestor" style="">
          {this.renderNode(this.node)}
        </div>
      </article>
    );
  }
}
