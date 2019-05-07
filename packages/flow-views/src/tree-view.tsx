import { View, ITreeSchemaProp } from "@cryptographix/core";

/**
 * Abstract class for a Tree-Node view
 */
export abstract class TreeNodeView<
  TNode extends ITreeSchemaProp = any
> extends View {
  node: TNode;

  constructor(
    public props: {
      node: TNode;
      listeners: ITreeNodeListeners<TNode>;
      mode?: "tree" | "details";
      depth?: number;
    }
  ) {
    super();

    this.node = props.node;
  }
}

export interface ITreeNodeListeners<TTreeNode = ITreeSchemaProp<any>> {
  onSelectNode?: (node: TreeNodeView) => boolean;
  openCloseNode?: (node: TTreeNode) => void;
}

export class TreeView<TTreeNode extends ITreeSchemaProp> extends View {
  constructor(
    public props: {
      treeRoot: ITreeSchemaProp;

      createNodeView: (
        treeNode: TTreeNode,
        listeners: ITreeNodeListeners<TTreeNode>,
        depth?: number
      ) => TreeNodeView;

      listeners: ITreeNodeListeners<TTreeNode>;

      depth?: number;
    }
  ) {
    super();
  }

  render() {
    const { treeRoot, createNodeView, listeners, depth } = this.props;

    const view = (
      <section class="panel-block">
        <div class="tree-pane">
          {treeRoot &&
            treeRoot.children.map((node: TTreeNode) =>
              createNodeView(node, listeners, depth || 100)
            )}
        </div>

        {/*treeRoot && treeRoot.children.length == 0 ? (
        <div style="height: 400px; border: 3px dotted #888; border-radius: 5px; padding: 10px;">
          <h3>
            <i>Explore</i> mode
          </h3>
          <p>Decompose hexadecimal TLV data, and represent it as a tree.</p>
          <p>
            Context sensitive lookup, ISO / EMV and different payment-card
            standards
          </p>
          <br />
          <p>
            try something like
            <a
              onClick={
                null
                //(view.tlvInput =
                  //"9505 3399AA55FF 700e 5a086271550000000001 5f340100")
              }
            >
              700e 5a086271550000000001 5f340100
            </a>
          </p>
        </div>
      ) : null*/}
      </section>
    );

    return view;
  }
}
