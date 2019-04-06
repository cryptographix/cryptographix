import { IViewable, IView } from "../viewable";

import { IActionHandler, Action } from "../dispatcher/action";

import { BlockSchemaHelper } from "./block-schema";
import { BlockConfiguration } from "./block-config";
import { BlockPropertyChanged, ConfigPropertyChanged } from "./block-actions";

export abstract class Block<TConfig extends BlockConfiguration = {}>
  implements IViewable, IActionHandler /*implements IBlock<S>*/ {
  //
  _view?: IView;

  //
  protected _helper: BlockSchemaHelper<TConfig, this>;

  //
  protected _config: TConfig;

  constructor(initConfig?: Partial<TConfig>) {
    //
    this._helper = new BlockSchemaHelper<TConfig, this>(this);

    //
    this._config = this._helper.initConfig(initConfig);
  }

  get config(): TConfig {
    return this._config;
  }

  set config(config: TConfig) {
    this._config = this._helper.initConfig(config);
  }

  get helper(): BlockSchemaHelper<TConfig, this> {
    return this._helper;
  }

  /*getConfigValue<RT = any>(key: keyof TConfig): RT {
    return (this._config[key] as unknown) as RT;
  }*/

  handleAction(action: Action): Action {
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

    return null;
  }
}
