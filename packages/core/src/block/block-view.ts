import { View, ViewParams } from "../view/index";
import { Writable } from "../schema/index";
import { Block } from "./block";

export interface BlockViewParams<TBlock extends Block = Block>
  extends ViewParams {
  block: TBlock;
}

export abstract class BlockView<TBlock extends Block = Block> extends View {
  readonly block: TBlock;

  constructor(params: BlockViewParams<TBlock>) {
    const { block } = params;

    super(params);

    this.block = block;

    block.view = this;
  }

  destroy() {
    super.destroy();

    this.block.view = null;
    Writable(this).block = null;
  }
}
