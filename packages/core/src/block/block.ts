import { IViewable, IView } from "../viewable";
import {
  ISchema,
  Schema,
  ISchemaProperty,
  IConstructable,
  schemaStore
} from "../schema/index";

import { BlockConfiguration } from "./block-config";

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

  settings: IConstructable<TConfig>;
}

/*export interface IBlock<S extends BlockConfiguration> extends IViewable {
  settings: S;

  getSettingValue<RT>(key: keyof S): RT;

  settingChanged(setting: string, value: string ): boolean;
}*/

export abstract class Block<TConfig extends BlockConfiguration = {}>
  implements IViewable /*implements IBlock<S>*/ {
  _view?: IView;

  constructor(initSettings?: Partial<TConfig>) {
    let blockSchema = schemaStore.ensure<IBlockSchema<TConfig>>(this
      .constructor as IConstructable);

    this._settings = Schema.initObjectFromClass<TConfig>(
      blockSchema.settings,
      initSettings
    );
  }

  protected _settings: TConfig;

  get settings(): TConfig {
    return this._settings;
  }

  set settings(settings: TConfig) {
    let blockSchema = schemaStore.ensure<IBlockSchema<TConfig>>(this
      .constructor as IConstructable);

    this._settings = Schema.initObjectFromClass<TConfig>(
      blockSchema.settings,
      settings
    );
  }

  getSettings() {
    return Schema.getPropertiesForObject(this.settings);
  }

  getSettingSchema<TSchemaProp extends ISchemaProperty<any>>(
    key: keyof TConfig
  ): TSchemaProp {
    let _schema = schemaStore.ensure(this._settings
      .constructor as IConstructable);
    let _schemaItem = _schema.properties[key as string] as TSchemaProp;

    return _schemaItem;
  }

  getSettingValue<RT = any>(key: keyof TConfig): RT {
    return (this._settings[key] as unknown) as RT;
  }

  settingChanged(_setting: string, _value: string): boolean {
    return false;
  }
}

export class InvalidInputError extends Error {}
