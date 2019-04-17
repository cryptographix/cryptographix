import { IViewModel } from "./view-model";
import { IConstructable, schemaStore } from "../schema/index";
import { IBlockSchema, BlockView } from "../block/index";

export function viewFor(model: { new (): IViewModel }) {
  return function(target: IConstructable<BlockView>) {
    let item = schemaStore.ensure<IBlockSchema>(model);

    item.ui = {
      ...item.ui,
      view: target
    };
  };
}
