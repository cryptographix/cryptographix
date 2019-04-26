import {
  ISchema,
  IConstructable,
  ISchemaProperty,
  AnySchemaProperty,
  Schema
} from "../schema/index";

import { Block } from "./block";
import { BlockConfiguration } from "./block-config";
import { BlockView } from "./block-view";

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

  ui?: { view: IConstructable<BlockView> };
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

  //
  propertyCache: { [key: string]: AnySchemaProperty } = {};

  constructor(block: TBlock) {
    //
    this.block = block;

    //
    this.schema = Schema.getSchemaForObject<IBlockSchema<TConfig>>(block);

    //
    this.configSchema = Schema.getSchemaForClass<TConfig, ISchema<TConfig>>(
      this.schema.config || ({} as any)
    );

    // Local copy of merged properties
    this.propertyCache = {
      ...this.configSchema.properties,
      ...this.schema.properties
    };
  }

  isSchemaProperty(prop: string): boolean {
    return !!this.schema.properties[prop];
  }

  /*
   * Initialize block with default values for properties
   * Priority:
   *   1. Already initialized via class property initializer or constructor
   *   2. Identically named property in block-config
   *   3. Default value defined in Schema
   */
  initBlockProperties(): void {
    let props = Object.entries(this.schema.properties);

    const block = this.block;
    props.forEach(([key, propInfo]) => {
      Schema.initPropertyFromPropertyType(
        propInfo,
        block,
        key as any,
        block.config,
        false
      );
    });
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

  getConfigValue<RT = any>(key: keyof TConfig): RT {
    return (this.config[key] as unknown) as RT;
  }

  getConfigPropSchema<TSchemaProp extends ISchemaProperty>(
    key: string
  ): TSchemaProp {
    let schemaProp = this.propertyCache[key as string];

    return schemaProp as TSchemaProp;
  }

  updateConfigPropSchema<TSchemaProp extends ISchemaProperty>(
    key: string,
    updatedProp: Partial<TSchemaProp>
  ): TSchemaProp {
    let schemaProp = this.propertyCache[key];

    schemaProp = {
      ...schemaProp,
      ...updatedProp
    };

    // Save to cache
    this.propertyCache[key as string] = schemaProp;

    return schemaProp as TSchemaProp;
  }

  getPortSchema<TSchemaProp extends ISchemaProperty = AnySchemaProperty>(
    key: string
  ): TSchemaProp {
    let schemaProp = this.propertyCache[key];

    return schemaProp as TSchemaProp;
  }

  updatePortSchema<TSchemaProp extends ISchemaProperty>(
    key: string,
    updatedProp: Partial<TSchemaProp>
  ): TSchemaProp {
    let schemaProp = this.propertyCache[key];

    schemaProp = {
      ...schemaProp,
      ...updatedProp
    };

    // Save to cache
    this.propertyCache[key] = schemaProp;

    return schemaProp as TSchemaProp;
  }

  filterPorts(filterFn?: (item: ISchemaProperty) => boolean) {
    return Object.entries(this.propertyCache).filter(([_key, propInfo]) => {
      return !filterFn || filterFn(propInfo);
    });
  }
}
