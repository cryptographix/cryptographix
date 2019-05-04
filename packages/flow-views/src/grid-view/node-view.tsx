import { View } from "@cryptographix/core";
import {
  Flow,
  AnyFlowNode,
  TransformerNode
  //PipelineNode
  //  DataNode,
} from "@cryptographix/flow";

import { ensureNodeView, calcBlockHeight, LightenDarkenColor } from "./helpers";
import { GridView } from "./grid-view";
import { GridView as GV } from "./grid-view";

export class NodeView extends View {
  layout?: {
    x: number;
    y: number;
    h: number;
    w: number;
    z: number;
    color?: string;
    hidden: number;
  };

  constructor(public node: AnyFlowNode, color?: string) {
    super();

    this.layout = {
      x: 0,
      y: 0,
      h: 0,
      w: 0,
      z: 0,
      color,
      hidden: 0
    };
  }

  renderPorts() {
    let ports = [];

    this.node.inPortKeys.reduce<number>((y, _key) => {
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

    this.node.outPortKeys.reduce<number>((y, _key) => {
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
    let inIndex = this.node.inPortKeys.indexOf(portKey);
    let outIndex = this.node.outPortKeys.indexOf(portKey);

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
    let ports = Math.max(
      this.node.inPortKeys.length,
      this.node.outPortKeys.length
    );

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

  collapsePipe(_evt: Event) {
    if (this.layout.hidden > 0) {
      // Top-down calculate positions
      Flow.traverseFlow(this.node, node => {
        let view = ensureNodeView(node);
        view.layout.hidden--;
        if (view.layout.hidden == 0) view.refresh();
      });
    } else {
      Flow.traverseFlow(this.node, node => {
        let view = ensureNodeView(node);
        let hidden = view.layout.hidden++;
        if (hidden == 0) view.refresh();
      });
    }

    (this.parentView as GridView).layoutView().refresh();

    /*
    let t: any = evt.target as HTMLElement;

    let prev = t.parentElement.parentElement as HTMLElement;

    if (prev.style.display == "none") prev.style.display = "flex";
    else prev.style.display = "none";*/
  }

  renderTransformerNode() {
    let node = this.node as TransformerNode;

    let pos = this.getBlockPosition();

    if (this.layout.hidden > 0) return null;

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

    /*let r = (
      <div
        data-key="fulfilled"
        data-id="fetch.fulfilled"
        data-type="compound"
        data-open="true"
        class="sc-ifAKCX kGUNdt"
        style={
          "position: absolute; left: " +
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
      >
        <header class="sc-bxivhb hERUcc" style="--depth:1;">
          <strong>fulfilled</strong>
        </header>
        <ul class="sc-EHOje dGgGss" />
        <div class="sc-bwzfXH khegNK">
          <div
            data-key="first"
            data-id="fetch.fulfilled.first"
            data-type="atomic"
            data-open="true"
            class="sc-ifAKCX kGUNdt"
          >
            <header class="sc-bxivhb hERUcc" style="--depth:2;">
              <strong>first</strong>
            </header>
            <ul class="sc-EHOje dGgGss">
              <li
                data-disabled="true"
                class="sc-gzVnrw bhBNQH"
                style="--delay:0;"
              >
                <button
                  disabled=""
                  data-id="fetch.fulfilled.first:NEXT->fetch.fulfilled.second"
                  title="NEXT"
                  class="sc-htoDjs eDrxtj"
                >
                  <span>NEXT</span>
                  <div class="sc-iwsKbI cYYCTJ" />
                </button>
              </li>
            </ul>
          </div>
          <div
            data-key="second"
            data-id="fetch.fulfilled.second"
            data-type="atomic"
            data-open="true"
            class="sc-ifAKCX kGUNdt"
          >
            <header class="sc-bxivhb hERUcc" style="--depth:2;">
              <strong>second</strong>
            </header>
            <ul class="sc-EHOje dGgGss">
              <li
                data-disabled="true"
                class="sc-gzVnrw bhBNQH"
                style="--delay:0;"
              >
                <button
                  disabled=""
                  data-id="fetch.fulfilled.second:NEXT->fetch.fulfilled.third"
                  title="NEXT"
                  class="sc-htoDjs eDrxtj"
                >
                  <span>NEXT</span>
                  <div class="sc-iwsKbI cYYCTJ" />
                </button>
              </li>
            </ul>
          </div>
          <div
            data-key="third"
            data-id="fetch.fulfilled.third"
            data-type="final"
            data-open="true"
            class="sc-ifAKCX kGUNdt"
          >
            <header class="sc-bxivhb hERUcc" style="--depth:2;">
              <strong>third</strong>
            </header>
            <ul class="sc-EHOje dGgGss" />
          </div>
        </div>
        <button title="Hide children" class="sc-htpNat kkuncR" />
      </div>
    );*/

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
      z-index: ${200 - this.layout.z};
      background-color: ${this.layout.color};
       box-shadow:
      0 0 0 5px hsl(0, 0%, 80%),
      0 0 0 5px hsl(0, 0%, 90%);
      border: 3px solid #000808020;

      `;

    if (this.layout.hidden > 1) return null;

    return (
      <div class={this.node.$type} style={style}>
        <a
          title="Hide children"
          class="sc-htpNat"
          onClick={this.collapsePipe.bind(this)}
        >
          <i class="fa fa-ellipsis-h" />
        </a>
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
    return this.node.$type == "transformer"
      ? this.renderTransformerNode()
      : this.node.$type == "pipeline"
      ? this.renderGroup()
      : null;
  }
}
