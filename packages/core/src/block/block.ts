import { IViewModel } from "../view/index";
import { Writable } from "../schema/index";

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
  readonly handler?: IActionHandler;

  //
  readonly helper: BlockSchemaHelper<TConfig, this>;

  //
  readonly config: TConfig;

  /**
   *
   */
  constructor(initConfig?: Partial<TConfig>, handler?: IActionHandler) {
    //
    this.helper = new BlockSchemaHelper<TConfig, this>(this);

    //
    this.helper.initBlockProperties();

    //
    this.config = this.helper.initConfig(initConfig);

    //
    this.handler = handler;
  }

  setConfig(config: TConfig) {
    Writable(this).config = this.helper.initConfig(config);
  }

  handleAction(action: Action): Promise<Action> {
    if (this.handler) {
      switch (action.action) {
        case "config:property-changed":
          return action.dispatchTo(this.handler);
      }
    }

    return Promise.resolve<Action>(null);
  }
}
