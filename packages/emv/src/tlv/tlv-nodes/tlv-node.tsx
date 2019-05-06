import { View } from "@cryptographix/core";

import { TLVInfo, TLVDatabaseEntry } from "../tlv-database";

export interface ITreeNode {
  children: Array<ITreeNode>;
}

export abstract class TreeView<TNode extends ITreeNode> extends View {
  mode: "tree" | "details";

  node: TNode;

  constructor(props: {
    node: TNode;
    mode?: "tree" | "details";
    depth?: number;
  }) {
    super();

    const { node, mode } = props;

    this.node = node;
    this.mode = mode;
  }
}

export class TLVNode extends TreeView<TLVInfo> {
  get tag(): string {
    return this.node.tlv.tagAsHex;
  }

  get len(): number {
    return this.node.tlv.len;
  }

  private get entry() {
    return this.node.entry || new TLVDatabaseEntry(0, "Unknown", "");
  }

  get name(): string {
    let entry = this.entry;

    return entry.name;
  }

  type: string = "";
  public node: TLVInfo;

  mode: "tree" | "details";

  constructor(props: { node: TLVInfo; mode?: "tree" | "details" }) {
    super(props);
  }

  onClick(evt: Event) {
    let el = evt.currentTarget as HTMLElement;

    if (el.classList.contains("tree-node-closed")) {
      el.classList.remove("tree-node-closed");
      el.classList.add("tree-node-open");
    } else {
      el.classList.remove("tree-node-open");
      el.classList.add("tree-node-closed");
    }

    evt.preventDefault();
    evt.cancelBubble = true;
  }

  render() {
    return (
      <div class="tree-node tree-node-open" onClick={this.onClick.bind(this)}>
        <span>{`[${this.tag}]:${this.name}`}</span>
        {this.node.children.map(tlv => (
          <TLVNode node={tlv} />
        ))}
      </div>
    );
  }
}
