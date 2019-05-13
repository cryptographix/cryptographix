import { IViewModel } from "../view/index";
import { IActionHandler, Action } from "../dispatcher/action";

import { BlockSchemaHelper } from "./block-schema";
import { BlockConfiguration } from "./block-config";
import { BlockView } from "./block-view";

/**
 *
 */
export abstract class Block<TConfig extends BlockConfiguration = {}>
  implements IViewModel, IActionHandler {
  //
  view?: BlockView<this>;

  //
  readonly helper: BlockSchemaHelper<TConfig, this>;

  //
  readonly config: TConfig;

  /**
   *
   */
  constructor(initConfig?: Partial<TConfig>) {
    //
    this.helper = new BlockSchemaHelper<TConfig, this>(this);

    //
    this.helper.initBlockProperties();

    //
    this.config = this.helper.initConfig(initConfig);
  }

  setConfig(config: TConfig) {
    (this.config as TConfig) = this.helper.initConfig(config);
  }

  handleAction(_action: Action): Promise<Action> {
    return Promise.resolve<Action>(null);
  }
}
