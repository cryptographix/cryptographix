import { View } from "@cryptographix/core";
import { TreeNodeView } from "@cryptographix/flow-views";

import { TLVInfo, TLVDatabaseEntry } from "../tlv-database";

export class TLVNode extends TreeNodeView<TLVInfo> {
  /*constructor(props: {
    node: TLVInfo;
    listeners: ITreeNodeListeners;
    mode: "tree" | "details";
    depth: number;
  }) {
    super(props);
  }*/

  get tag(): string {
    let { node } = this.props;

    return node.tlv.tagAsHex;
  }

  get len(): number {
    let { node } = this.props;

    return node.tlv.len;
  }

  private get entry() {
    let { node } = this.props;

    return node.entry || new TLVDatabaseEntry(0, "Unknown", "");
  }

  get name(): string {
    let entry = this.entry;

    return entry.name;
  }

  type: string = "";

  onSelectNode(evt: Event, node: TLVInfo, _canSelect: boolean) {
    let el = evt.currentTarget as HTMLElement;

    if (el.classList.contains("tree-node-closed")) {
      el.classList.remove("tree-node-closed");
      el.classList.add("tree-node-open");
    } else {
      el.classList.remove("tree-node-open");
      if ( node.children.length > 0 )
        el.classList.add("tree-node-closed");
    }

    evt.preventDefault();
    evt.cancelBubble = true;
  }

  render() {
    let view = this;
    let { node, listeners, depth } = this.props;

    return (
      <div
        class={"tree-node " + ( (node.children.length > 0 )?"tree-node-open":"tree-node-empty")}
        onClick={(evt: Event) => {
          view.onSelectNode(evt, node, listeners.onSelectNode(view));
        }}
      >
        <span>{`[${this.tag}]:${this.name}`}</span>
        {node.children.map(tlv => (
          <TLVNode
            node={tlv}
            listeners={listeners}
            mode="tree"
            depth={depth - 1}
          />
        ))}
      </div>
    );
  }
}
