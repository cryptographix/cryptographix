import { View } from "../view/index";
import { Writable } from "../schema/index";
import { IActionHandler } from "../dispatcher/action";
import { Block } from "./block";

export abstract class BlockView extends View {
  readonly block: Block;

  constructor(handler: IActionHandler, block: Block) {
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
