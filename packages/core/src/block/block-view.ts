import { View } from "../view/index";
import { Writable } from "../schema/index";
import { IActionHandler } from "../dispatcher/action";
import { Block } from "./block";

export abstract class BlockView<TBlock extends Block = Block> extends View {
  readonly block: TBlock;

  constructor(handler: IActionHandler, block: TBlock) {
    super(handler);

    this.block = block;

    block.view = this;
  }

  destroy() {
    super.destroy();

    this.block.view = null;
    Writable(this).block = null;
  }
}
