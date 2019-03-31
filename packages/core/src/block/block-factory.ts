import { IConstructable, Omit, schemaStore } from "../schema/index";
import { Block, IBlockSchema } from "./block";
import { BlockConfiguration } from "./block-config";

/*export class BlockFactory {
  private _blockRegistry: Map<typeof Block, BlockMeta>;

  constructor() {
    this._blockRegistry = new Map<typeof Block, BlockMeta>();
  }

  register(meta: BlockMeta, blockConstructor: BlockConstructor ) {
    this._blockRegistry.set( blockConstructor, meta );
  }
}

export const blockFactory = new BlockFactory();*/

export function block<TConfig extends BlockConfiguration>(
  meta: Omit<IBlockSchema<TConfig>, "target" | "properties" | "type">
) {
  return function(target: IConstructable<Block>) {
    let schema = schemaStore.ensure<IBlockSchema<TConfig>>(target, "block");

    schema = {
      ...schema,
      ...meta
    };

    schemaStore.set(target, schema);
  };
}
