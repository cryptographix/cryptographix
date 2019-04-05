import {
  ISchema,
  Schema,
  IConstructable,
  ISchemaProperty
} from "../schema/index";

import { BlockConfiguration } from "./block-config";

import { Block } from "./block";

/**
 * Schema descriptor for a Block
 * Generic Parameters:
 *  TConfig = BlockConfiguration subclass
 *  TBlock  = Block subclass
 */
export interface IBlockSchema<
  TConfig extends BlockConfiguration = BlockConfiguration,
  TBlock extends Block<TConfig> = Block<TConfig>
> extends ISchema<TBlock> {
  type: "block";

  name: string;

  namespace?: string;

  title: string;

  category?: string;

  config: IConstructable<TConfig>;
}

/**
 * Helper for Block Schema
 */
export class BlockSchemaHelper<
  TConfig extends BlockConfiguration = {},
  TBlock extends Block<TConfig> = Block<TConfig>
> {
  private _block: TBlock; // Block<TConfig>;
  private _schema: IBlockSchema<TConfig>;

  constructor(block: TBlock) {
    //
    this._block = block;
    //
    this._schema = Schema.getSchemaForObject<IBlockSchema<TConfig>>(block);
  }

  get schema(): IBlockSchema<TConfig> {
    return this._schema;
  }

  isSchemaProperty(prop: string): boolean {
    return !!this._schema.properties[prop];
  }

  extractBlockProperties(props: string[]): Partial<TBlock> {
    const self = this;
    return props
      .filter(this.isSchemaProperty.bind(this))
      .reduce<Partial<TBlock>>((accum, name) => {
        accum[name] = self._block[name];

        return accum;
      }, {});
  }

  updateBlockProperties(obj: Partial<TBlock>, props: string[]): void {
    const self = this;
    props.filter(this.isSchemaProperty.bind(this)).forEach(name => {
      self._block[name] = obj[name];
    });
  }

  initConfig(initConfig: Partial<TConfig>): TConfig {
    return Schema.initObjectFromClass<TConfig>(this._schema.config, initConfig);
  }

  getConfigSchema<TSchemaProp extends ISchemaProperty>(
    config: TConfig,
    key: keyof TConfig
  ): TSchemaProp {
    let configSchema = Schema.getSchemaForObject<ISchema<TConfig>>(config);

    return configSchema.properties[key as string] as TSchemaProp;
  }

  getPortMap(filterFn?: (item: ISchemaProperty) => boolean) {
    let props = Object.entries(this._schema.properties);

    return props.filter(([_key, propInfo]) => {
      return !filterFn || filterFn(propInfo);
    });
  }
}
