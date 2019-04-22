import { View } from "@cryptographix/core";
import { AnyFlowNode } from "@cryptographix/flow";
import { ensureNodeView } from "./helpers";

import { GridView as GV } from "./grid-view";

export interface IPortRef {
  node: AnyFlowNode;
  portKey: string;
}

export class LinkView extends View {
  source: IPortRef;
  target: IPortRef;

  constructor(source: IPortRef, target: IPortRef) {
    super();

    this.source = source;
    this.target = target;

    console.log(
      "Link{" +
        this.source.node.id +
        ":" +
        this.source.node.$type +
        "#" +
        this.source.portKey +
        "," +
        this.target.node.id +
        ":" +
        this.target.node.$type +
        "#" +
        this.target.portKey +
        "}"
    );
  }

  onLinkClick(evt: Event) {
    alert("Clicked (" + this.source.node.id + "," + this.target.node.id + ")");
  }

  render() {
    let source = this.source.node;
    let target = this.target.node;

    let sourcePos = ensureNodeView(source).getPortPosition(this.source.portKey);
    let targetPos = ensureNodeView(target).getPortPosition(this.target.portKey);
    //    let parent = this.source.node.node.parent as AnyFlowNode;

    console.log(
      "Link{" +
        source.id +
        ":" +
        source.$type +
        "#" +
        this.source.portKey +
        "," +
        target.id +
        ":" +
        target.$type +
        "#" +
        this.target.portKey +
        "}",
      JSON.stringify(sourcePos),
      JSON.stringify(targetPos)
    );

    const border = 3;

    let pos: any = {};

    if (sourcePos.x <= targetPos.x) {
      pos.left = sourcePos.x;
      pos.width = targetPos.x - pos.left;
    } else {
      pos.left = targetPos.x;
      pos.width = sourcePos.x - pos.left;
    }

    pos.width -= border * 2;
    //if (pos.width < 3) pos.width = 3;

    let isHoriz = false;
    let toTopRight = false;

    // Draw an "inverted S" shape from 3 elements - horiz, vert, horiz
    //    let ports = target.inKeys.length;
    let off = target.inKeys.indexOf(this.target.portKey);

    // X pos of vertical.
    let vertX = pos.width - (2 + off - 1) * GV.PORT_LINK_DELTA_X;

    pos.height = 3;

    //
    // HEIGHT
    // y1 = top of port, so add h/2
    // y2 =
    if (sourcePos.y == targetPos.y) {
      pos.top = 1 + sourcePos.y; // middle of port
      isHoriz = true;
      vertX = pos.width;
    } else if (sourcePos.y < targetPos.y) {
      pos.top = 1 + sourcePos.y; // middle of port
      pos.height += 3 + targetPos.y - pos.top; // - sourcePos.r * 2;
    } else {
      pos.top = 1 + targetPos.y; // middle of port
      pos.height = 1 + 3 + 3 + sourcePos.y - pos.top - sourcePos.r * 3;
      toTopRight = true;
    }

    let style = `
      left: ${pos.left - border}px;
      width: ${pos.width - border}px;
      top: ${pos.top}px;
      height: ${pos.height}px;
      background-color: unset;
      `;

    let segs = [];

    // Horizontal segment
    segs.push(
      <div
        class="link-seg"
        style={
          (toTopRight ? "bottom" : "top") +
          ": 0px; left: 0px; width: " +
          vertX +
          "px; height: 3px"
        }
        onClick={this.onLinkClick.bind(this)}
      />
    );

    if (!isHoriz) {
      segs.push(
        <div
          class="link-seg"
          style={
            "top: 0px; left: " +
            vertX +
            "px; width: 3" +
            "px; height: " +
            pos.height +
            "px; "
          }
          onClick={this.onLinkClick.bind(this)}
        />
      );

      segs.push(
        <div
          class="link-seg"
          style={
            (!toTopRight ? "bottom" : "top") +
            ": 0px; left: " +
            vertX +
            "px; width: " +
            (pos.width - vertX) +
            "px; height: 3px"
          }
          onClick={this.onLinkClick.bind(this)}
        />
      );
    }

    return (
      <div class="link" style={style}>
        {segs}
      </div>
    );
  }
}
