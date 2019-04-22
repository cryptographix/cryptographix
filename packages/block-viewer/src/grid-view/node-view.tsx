import { View } from "@cryptographix/core";
import {
  AnyFlowNode,
  TransformerNode
  //  DataNode,
} from "@cryptographix/flow";

import { ensureNodeView, calcBlockHeight, LightenDarkenColor } from "./helpers";
import { GridView } from "./grid-view";
import { GridView as GV } from "./grid-view";

export class NodeView extends View<GridView> {
  layout?: {
    x: number;
    y: number;
    h: number;
    w: number;
    z: number;
    color?: string;
  };

  constructor(public node: AnyFlowNode, color?: string) {
    super();

    this.layout = {
      x: 0,
      y: 0,
      h: 0,
      w: 0,
      z: 0,
      color
    };
  }

  renderPorts() {
    let ports = [];

    this.node.inKeys.reduce<number>((y, _key) => {
      //      console.log("Port", this.getPortPosition(_inp));
      ports.push(
        <a class="port in-port" style={"top: " + y + "px; left:  -15px; "}>
          <label
            class="label"
            style={
              "top:3px; position: absolute; left: 15px; font-size: 11px;color: blue;"
            }
          >
            {_key}
          </label>
        </a>
      );

      return y + GV.PORT_DELTA_Y;
    }, GV.PORT_INIT_Y);

    this.node.outKeys.reduce<number>((y, _key) => {
      //      console.log("Port", this.getPortPosition(_out));
      ports.push(
        <a class="port out-port" style={"top: " + y + "px; right: -15px; "}>
          <label
            class="label"
            style={
              "top:3px; position: absolute; right: 15px; font-size: 11px;color: blue;"
            }
          >
            {_key}
          </label>
        </a>
      );

      return y + GV.PORT_DELTA_Y;
    }, GV.PORT_INIT_Y);

    return ports;
  }

  getOriginBlockView(portKey?: string) {
    if (this.node.$type == "mapper") {
      let child = this.node.nodes.get(portKey);
      console.log("  got  " + portKey + ":map = " + child.id);

      return ensureNodeView(child).getOriginBlockView(portKey);
    } else if (this.node.$type == "pipeline") {
      let child = this.node.nodes[this.node.nodes.length - 1];
      console.log("   got " + portKey + ":pipe = " + child.id);

      return ensureNodeView(child).getOriginBlockView(portKey);
    }

    return this;
  }

  getPortPosition(portKey: string) {
    let inIndex = this.node.inKeys.indexOf(portKey);
    let outIndex = this.node.outKeys.indexOf(portKey);

    let out = inIndex < 0;
    let idx = out ? outIndex : inIndex;

    let pos: any;

    let view: NodeView = this;

    if (idx > 0) {
      console.log(portKey, idx);
    }

    if (out && this.node.$type == "mapper") {
      let child = this.node.nodes.get(portKey);
      console.log("  got  " + portKey + ":map = " + child.id);

      view = ensureNodeView(child);
      view = view.getOriginBlockView();
    } else if (this.node.$type == "pipeline") {
      let child = this.node.nodes[this.node.nodes.length - 1];
      console.log("   got " + portKey + ":pipe = " + child.id);

      view = ensureNodeView(child);
      view = view.getOriginBlockView();
    }

    pos = view.getBlockPosition();

    // Adjust position to centre of curve
    let ret = {
      x: pos.x + (out ? pos.w + GV.PORT_R : 0),
      y: pos.y + GV.PORT_INIT_Y + idx * GV.PORT_DELTA_Y + GV.PORT_R,
      r: GV.PORT_R
    };

    console.log(
      "Node",
      this.node.id,
      "port",
      portKey,
      "= (",
      pos.x,
      ",",
      pos.y,
      ") => (",
      ret.x,
      ",",
      ret.y,
      ")"
    );

    return ret;
  }

  getBlockPosition() {
    let view = ensureNodeView(this.node);
    let ports = Math.max(this.node.inKeys.length, this.node.outKeys.length);

    return {
      x: view.layout.x,
      y: view.layout.y,
      w: GV.BLOCKX,
      h: calcBlockHeight(ports)
    };
  }

  onNodeClick(_evt: Event) {
    alert("Clicked" + this.node.id);
  }

  renderTransformerNode() {
    let node = this.node as TransformerNode;

    let pos = this.getBlockPosition();

    console.log("Node: " + node.id, JSON.stringify(pos));

    let r = (
      <div
        class="node"
        style={
          " left: " +
          pos.x +
          "px; " +
          "top: " +
          pos.y +
          "px; " +
          "width: " +
          pos.w +
          "px; height: " +
          pos.h +
          "px;"
        }
        onClick={this.onNodeClick.bind(this)}
      >
        <div class="has-text-centered">
          {node.blockName + "('" + node.id + "')"}
        </div>
        {this.renderPorts()}
      </div>
    );

    /*    if (hasArrow) {
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
    }*/

    return r;
  }

  renderGroup() {
    let style = `position: absolute;
      left: ${this.layout.x}px;
      top: ${this.layout.y}px;
      width: ${this.layout.w}px;
      height: ${this.layout.h}px;
      background-color: ${this.layout.color};
      `;

    return (
      <div class={this.node.$type} style={style}>
        <div
          style={
            "position: absolute; right: 0px;" +
            (this.node.$type != "pipeline"
              ? "bottom: -1rem;"
              : "top: -1.5rem;") +
            "background-color: " +
            this.layout.color +
            ";"
          }
        >
          <span
            style={
              this.layout.color
                ? "color: #" +
                  LightenDarkenColor(this.layout.color.slice(1), 0.5) +
                  ";"
                : ""
            }
          >
            {this.node.$type + this.node.id}
          </span>
        </div>
      </div>
    );
  }

  render() {
    //let view = ensureNodeView(this.node);

    /*   Flow.traverseFlow(this.node, null, (node, _children) => {
      console.log(
        node.$type,
        node.id,
        node.layout.x,
        node.layout.y,
        node.layout.w,
        node.layout.h
      );
    });*/

    return this.node.$type == "transformer"
      ? this.renderTransformerNode()
      : this.renderGroup();
  }
}
