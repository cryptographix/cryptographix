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

export class BlockSchema {
  static getBlockSchemaForClass(blockCtor: IConstructable): IBlockSchema {
    return Schema.getSchemaForClass(blockCtor);
  }
}

/**
 * Helper for Block Schema
 */
export class BlockSchemaHelper<
  TConfig extends BlockConfiguration,
  TBlock extends Block<TConfig>
> {
  protected block: TBlock;
  readonly schema: IBlockSchema<TConfig>;

  readonly configSchema: ISchema<TConfig>;

  constructor(block: TBlock) {
    //
    this.block = block;

    //
    this.schema = Schema.getSchemaForObject<IBlockSchema<TConfig>>(block);

    //
    this.configSchema = Schema.getSchemaForClass<TConfig, ISchema<TConfig>>(
      this.schema.config || ({} as any)
    );
  }

  isSchemaProperty(prop: string): boolean {
    return !!this.schema.properties[prop];
  }

  extractBlockProperties(props: string[]): Partial<TBlock> {
    const self = this;

    return props
      .filter(this.isSchemaProperty.bind(this))
      .reduce<Partial<TBlock>>((accum, name) => {
        accum[name] = self.block[name];

        return accum;
      }, {});
  }

  updateBlockProperties(obj: Partial<TBlock>, props: string[]): void {
    const self = this;

    props.filter(this.isSchemaProperty.bind(this)).forEach(name => {
      self.block[name] = obj[name];
    });
  }

  /**
   * CONFIG
   */
  get config(): TConfig {
    return this.block.config;
  }

  initConfig(initConfig: Partial<TConfig>): TConfig {
    let config = Schema.initObjectFromClass<TConfig>(
      this.schema.config,
      initConfig
    );

    return config;
  }

  getConfigPropSchema<TSchemaProp extends ISchemaProperty>(
    key: keyof TConfig
  ): TSchemaProp {
    let schemaProp = this.configSchema.properties[key as string];

    return schemaProp as TSchemaProp;
  }

  updateConfigPropSchema<TSchemaProp extends ISchemaProperty>(
    key: keyof TConfig,
    updatedProp: Partial<TSchemaProp>
  ): TSchemaProp {
    let schemaProp = this.configSchema.properties[key as string];

    schemaProp = {
      ...schemaProp,
      ...updatedProp
    };

    this.configSchema.properties[key as string] = schemaProp;

    return schemaProp as TSchemaProp;
  }

  getPortSchema<TSchemaProp extends ISchemaProperty>(
    key: keyof TBlock
  ): TSchemaProp {
    let schemaProp = this.schema.properties[key as string];

    return schemaProp as TSchemaProp;
  }

  updatePortSchema<TSchemaProp extends ISchemaProperty>(
    key: keyof TBlock,
    updatedProp: Partial<TSchemaProp>
  ): TSchemaProp {
    let schemaProp = this.schema.properties[key as string];

    schemaProp = {
      ...schemaProp,
      ...updatedProp
    };

    this.schema.properties[key as string] = schemaProp;

    return schemaProp as TSchemaProp;
  }

  filterPorts(filterFn?: (item: ISchemaProperty) => boolean) {
    let props = Object.entries(this.schema.properties);

    return props.filter(([_key, propInfo]) => {
      return !filterFn || filterFn(propInfo);
    });
  }
}
