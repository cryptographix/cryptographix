import { View } from "@cryptographix/core";
import {
  Flow,
  PipelineNode,
  MapperNode,
  //  TransformerNode,
  //  DataNode,
  AnyFlowNode
} from "@cryptographix/flow";

export class TileView extends View {
  node: Flow;
  root: boolean;

  constructor(props: { node: Flow; root: boolean }) {
    super();

    this.node = props.node;
    this.root = props.root;
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
    Array.from(node.nodes)
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

  toggleGroup(evt: Event) {
    let t: any = evt.target as HTMLElement;

    let prev = t.parentElement.parentElement
      .previousElementSibling as HTMLElement;

    if (prev.style.display == "none") prev.style.display = "flex";
    else prev.style.display = "none";
  }

  renderNode(node: AnyFlowNode, hasArrow: boolean = false) {
    let r: any;

    if (!node) return;

    switch (node.$type) {
      case "flow":
        r = this.renderNode(node.root);
        break;

      case "pipeline":
        r = this.renderPipe(node);
        break;

      case "mapper":
        r = this.renderMap(node);
        break;

      case "transformer":
        r = (
          <div
            class="tile is-child box"
            style="padding-left: 1rem; max-width: 320px"
          >
            {node.blockName + "('" + node.id + "')"}
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
              <i
                class="fa fa-arrow-right fa-3x"
                onclick={this.toggleGroup.bind(this)}
              />
            </span>
          </div>
        </div>
      );
    }

    return r;
  }

  render() {
    return (
      <div class="tile is-ancestor" style="background-color: darkblue">
        {this.renderNode(this.node)}
      </div>
    );
  }
}
