import { IConstructable, Omit, schemaStore } from "../schema/index";
import { IViewModel } from "../view/index";
import { Block } from "./block";
import { BlockView } from "./block-view";
import { IBlockSchema } from "./block-schema";
import { BlockConfiguration } from "./block-config";

/**
 *
 */
export function block<TConfig extends BlockConfiguration>(
  meta: Omit<IBlockSchema<TConfig>, "properties" | "type">
) {
  return function(target: IConstructable<Block>) {
    let schema = schemaStore.ensure<IBlockSchema>(target, "block");

    schema = {
      namespace: "",
      category: "default",
      markdown: {},
      ...schema,
      ...meta
    };

    schemaStore.set(target, schema);
  };
}

/**
 *
 */
export function viewForBlock(block: { new (): IViewModel }) {
  return function(target: IConstructable<BlockView>) {
    let item = schemaStore.ensure<IBlockSchema>(block);

    item.ui = {
      ...item.ui,
      view: target
    };
  };
}
