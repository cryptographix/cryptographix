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

  title: string;

  category?: string;

  markdown?: {
    // "Tell user what to do to use as a tool"
    prompt?: string;

    // Short ""
    hint?: string;

    // What is this all about
    about?: string;

    // More details and links
    learnMore?: string;
  };

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

  //
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

  //
  protected _propertyCache: { [key: string]: AnySchemaProperty };

  /**
   * Local cache for block and config properties
   */
  get propertyCache() {
    if (!this._propertyCache) {
      // Merge block and config properties into local cache
      let cache = (this._propertyCache = {
        ...this.schema.properties,
        ...this.configSchema.properties
      });

      // some magic ..
      Object.keys(this.schema.properties)
        // 'shared' property, present both in block and config
        .filter(prop => this.configSchema.properties.hasOwnProperty(prop))
        .forEach(prop => {
          // Merge property definitions .. lets hope they are compatible
          cache[prop] = {
            ...this.configSchema.properties[prop],
            ...this.schema.properties[prop]
          } as any;
        });
    }

    return this._propertyCache;
  }

  isSchemaProperty(prop: string): boolean {
    return this.schema.properties.hasOwnProperty(prop);
  }

  getPropSchema<TSchemaProp extends ISchemaProperty>(key: string): TSchemaProp {
    let schemaProp = this.propertyCache[key as string];

    return schemaProp as TSchemaProp;
  }

  updatePropSchema<TSchemaProp extends ISchemaProperty>(
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

  /*
   * Initialize block with default values for properties
   * Priority:
   *   1. Already initialized via class property initializer or constructor
   *   2. Identically named property in block-config
   *   3. Default value defined in Schema
   */
  initBlockProperties(): void {
    const block = this.block;

    Object.entries(this.schema.properties).forEach(([key, propInfo]) => {
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
    const block = this.block;

    return props
      .filter(this.isSchemaProperty.bind(this))
      .reduce<Partial<TBlock>>((accum, name) => {
        accum[name] = block[name];

        return accum;
      }, {});
  }

  updateBlockProperties(obj: Partial<TBlock>, props: string[]): void {
    const block = this.block;

    props.filter(this.isSchemaProperty.bind(this)).forEach(name => {
      block[name] = obj[name];
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

  /*getPortSchema<TSchemaProp extends ISchemaProperty = AnySchemaProperty>(
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
  }*/

  filterProps(filterFn?: (item: ISchemaProperty, key: string) => boolean) {
    return Object.keys(this.propertyCache).filter(key => {
      return !filterFn || filterFn(this.propertyCache[key], key);
    });
  }
}
