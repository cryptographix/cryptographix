import {
  ISchema,
  IConstructable,
  ISchemaProperty,
  Schema
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
  TConfig extends BlockConfiguration,
  TBlock extends Block<TConfig>
> {
  private _block: TBlock;
  private _schema: IBlockSchema<TConfig>;

  private _configSchema: ISchema<TConfig>;

  constructor(block: TBlock) {
    //
    this._block = block;

    //
    this._schema = Schema.getSchemaForObject<IBlockSchema<TConfig>>(block);

    //
    this._configSchema = Schema.getSchemaForClass<TConfig, ISchema<TConfig>>(
      this._schema.config
    );
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

  /**
   * CONFIG
   */
  get config(): TConfig {
    return this._block.config;
  }

  initConfig(initConfig: Partial<TConfig>): TConfig {
    let config = Schema.initObjectFromClass<TConfig>(
      this._schema.config,
      initConfig
    );

    return config;
  }

  getConfigPropSchema<TSchemaProp extends ISchemaProperty>(
    key: keyof TConfig
  ): TSchemaProp {
    let schemaProp = this._configSchema.properties[key as string];

    return schemaProp as TSchemaProp;
  }

  updateConfigPropSchema<TSchemaProp extends ISchemaProperty>(
    key: keyof TConfig,
    updatedProp: Partial<TSchemaProp>
  ): TSchemaProp {
    let schemaProp = this._configSchema.properties[key as string];

    schemaProp = {
      ...schemaProp,
      ...updatedProp
    };

    this._configSchema.properties[key as string] = schemaProp;

    return schemaProp as TSchemaProp;
  }

  getPortSchema<TSchemaProp extends ISchemaProperty>(
    key: keyof TBlock
  ): TSchemaProp {
    let schemaProp = this._schema.properties[key as string];

    return schemaProp as TSchemaProp;
  }

  updatePortSchema<TSchemaProp extends ISchemaProperty>(
    key: keyof TBlock,
    updatedProp: Partial<TSchemaProp>
  ): TSchemaProp {
    let schemaProp = this._schema.properties[key as string];

    schemaProp = {
      ...schemaProp,
      ...updatedProp
    };

    this._schema.properties[key as string] = schemaProp;

    return schemaProp as TSchemaProp;
  }

  getPortMap(filterFn?: (item: ISchemaProperty) => boolean) {
    let props = Object.entries(this._schema.properties);

    return props.filter(([_key, propInfo]) => {
      return !filterFn || filterFn(propInfo);
    });
  }
}
