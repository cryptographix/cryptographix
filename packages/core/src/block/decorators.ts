import { IConstructable, Omit, schemaStore } from "../schema/index";
import { Block } from "./block";
import { IBlockSchema } from "./block-schema";
import { BlockConfiguration } from "./block-config";

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
