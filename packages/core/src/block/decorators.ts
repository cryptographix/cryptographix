import { IConstructable, Omit, schemaStore } from "../schema/index";
import { Block } from "./block";
import { IBlockSchema } from "./block-schema";
import { BlockConfiguration } from "./block-config";

/*export class BlockFactory {
  private _blockRegistry: Map<typeof Block, BlockMeta>;

  constructor() {
    this.blockRegistry = new Map<typeof Block, BlockMeta>();
  }

  register(meta: BlockMeta, blockConstructor: BlockConstructor ) {
    this.blockRegistry.set( blockConstructor, meta );
  }
}

export const blockFactory = new BlockFactory();*/

export function block<TConfig extends BlockConfiguration>(
  meta: Omit<IBlockSchema<TConfig>, "target" | "properties" | "type">
) {
  return function(target: IConstructable<Block>) {
    let schema = schemaStore.ensure<IBlockSchema<TConfig>>(target, "block");

    schema = {
      namespace: "",
      category: "default",
      ...schema,
      ...meta
    };

    schemaStore.set(target, schema);
  };
}
