import { IViewModel, View } from "../view/index";
import { Writable } from "../schema/index";

import { IActionHandler, Action } from "../dispatcher/action";

import { BlockSchemaHelper } from "./block-schema";
import { BlockConfiguration } from "./block-config";
//import { ConfigPropertyChanged } from "./block-actions";

export abstract class Block<TConfig extends BlockConfiguration = {}>
  implements IViewModel, IActionHandler /*implements IBlock<S>*/ {
  //
  view?: View;

  //
  readonly helper: BlockSchemaHelper<TConfig, this>;

  //
  readonly config: TConfig;

  constructor(initConfig?: Partial<TConfig>) {
    //
    this.helper = new BlockSchemaHelper<TConfig, this>(this);

    //
    this.config = this.helper.initConfig(initConfig);
  }

  setConfig(config: TConfig) {
    Writable(this).config = this.helper.initConfig(config);
  }

  /*getConfigValue<RT = any>(key: keyof TConfig): RT {
    return (this.config[key] as unknown) as RT;
  }*/

  handleAction(_action: Action): Action {
    /*
    let act = action as BlockPropertyChanged | ConfigPropertyChanged;

    switch (act.action) {
      case "block:property-changed": {
        console.log("Block property changed. ", act.key, " = ", act.value);

        break;
      }

      case "config:property-changed": {
        console.log("Config property changed. ", act.key, " = ", act.value);

        break;
      }
    }
    */

    return null;
  }
}
