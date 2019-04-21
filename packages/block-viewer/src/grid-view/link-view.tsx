import { View } from "@cryptographix/core";
import { AnyFlowNode } from "@cryptographix/flow";
import { ensureNodeView } from "./helpers";

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
    let toTopRight = true;

    if (sourcePos.x <= targetPos.x) {
      pos.left = sourcePos.x + sourcePos.w;
      pos.width = targetPos.x - pos.left;
    } else {
      pos.left = targetPos.x + targetPos.w;
      pos.width = sourcePos.x - pos.left;
    }

    pos.width -= border * 2;
    //if (pos.width < 3) pos.width = 3;

    //
    // HEIGHT
    // y1 = top of port, so add h/2
    // y2 =
    if (sourcePos.y <= targetPos.y) {
      pos.top = sourcePos.y + sourcePos.h / 2; // middle of port
      pos.height = targetPos.y - pos.top - targetPos.h / 2;

      toTopRight = false;
    } else {
      pos.top = targetPos.y + targetPos.h / 2; // middle of port
      pos.height = sourcePos.y - pos.top - sourcePos.h / 2;
    }

    // Draw an "inverted S" shape from 3 elements - horiz, vert, horiz
    let ports = target.inKeys.length;
    let off = target.inKeys.indexOf(this.target.portKey);

    // X pos of vertical.
    let vertX = pos.width - 16 - (ports - off - 1) * 16;

    let isHoriz = pos.height < 10;
    if (isHoriz) {
      pos.height = 2 * (border + 1);
      vertX = pos.width;
    } else {
      pos.height -= border + 1;
    }

    let style = `
      left: ${pos.left - border}px;
      width: ${pos.width - border}px;
      top: ${pos.top + border / 2}px;
      height: ${pos.height - border - 1}px;
      background-color: unset;
      `;

    let segs = [];

    segs.push(
      <div
        class="link-seg"
        style={
          "bottom: 0px; left: 0px; width: " + vertX + "px; height: 3" + "px; "
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
            (pos.height - border - 1) +
            "px; "
          }
          onClick={this.onLinkClick.bind(this)}
        />
      );
      segs.push(
        <div
          class="link-seg"
          style={
            "top: 0px; left: " +
            vertX +
            "px; width: " +
            (pos.width - vertX) +
            "px; height: 3" +
            "px; "
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
