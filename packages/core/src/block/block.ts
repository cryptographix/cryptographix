import { IViewable, IView } from "../viewable";
import {
  ISchema,
  ISchemaProperty,
  IConstructable,
  Schema
} from "../schema/index";

import { IActionHandler, Action } from "../dispatcher/action";

import { BlockConfiguration } from "./block-config";
import { BlockPropertyChanged, ConfigPropertyChanged } from "./block-actions";

/**
 * Schema descriptor for a Block
 */
export interface IBlockSchema<TConfig extends BlockConfiguration>
  extends ISchema<Block<TConfig>> {
  type: "block";

  name: string;

  namespace: string;

  title: string;

  category: string;

  config: IConstructable<TConfig>;
}

export abstract class Block<TConfig extends BlockConfiguration = {}>
  implements IViewable, IActionHandler /*implements IBlock<S>*/ {
  //
  _view?: IView;
  _blockSchema: IBlockSchema<TConfig>;
  _configSchema: ISchema<TConfig>;

  constructor(initSettings?: Partial<TConfig>) {
    this._blockSchema = Schema.getSchemaForObject<IBlockSchema<TConfig>>(this); //

    this._config = Schema.initObjectFromClass<TConfig>(
      this._blockSchema.config,
      initSettings
    );
  }

  protected _config: TConfig;

  get config(): TConfig {
    return this._config;
  }

  set config(settings: TConfig) {
    this._config = Schema.initObjectFromClass<TConfig>(
      this._blockSchema.config,
      settings
    );
  }

  /*getSettings() {
    return Schema.getPropertiesForObject(this._config);
  }*/

  getConfigSchema<TSchemaProp extends ISchemaProperty>(
    key: keyof TConfig
  ): TSchemaProp {
    let configSchema = Schema.getSchemaForObject<ISchema<TConfig>>(
      this._config
    );

    return configSchema.properties[key as string] as TSchemaProp;
  }

  getPortMap(filterFn?: (item: ISchemaProperty) => boolean) {
    let props = Object.entries(this._blockSchema.properties);

    return props.filter(([_key, propInfo]) => {
      return !filterFn || filterFn(propInfo);
    });
  }

  /*getConfigValue<RT = any>(key: keyof TConfig): RT {
    return (this._config[key] as unknown) as RT;
  }*/

  getPortSchema<TSchemaProp extends ISchemaProperty>(
    key: keyof this
  ): TSchemaProp {
    let _schemaItem = this._blockSchema.properties[
      key as string
    ] as TSchemaProp;

    return _schemaItem;
  }

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

export class InvalidInputError extends Error {}

/*export interface IBlock<S extends BlockConfiguration> extends IViewable {
  settings: S;

  getSettingValue<RT>(key: keyof S): RT;

  settingChanged(setting: string, value: string ): boolean;
}*/
