import {
  IConstructable,
  Schema,
  Transformer,
  IBlockSchema,
  BlockConfiguration
} from "@cryptographix/core";

import { FlowNode } from "./flow-node";

/**
 *
 */
export class TransformerNode<
  TConfig extends BlockConfiguration = object,
  TTransformer extends Transformer<TConfig> = Transformer<TConfig>
> extends FlowNode {
  $type: "transformer" = "transformer";

  //
  readonly blockName: string;

  //
  readonly target: IConstructable<TTransformer>;

  //
  readonly id: string;

  //
  readonly initConfig: TConfig;

  //
  readonly schema: IBlockSchema<TConfig>;

  //
  protected block: TTransformer = null;

  //
  protected inMask = 0;

  //
  protected trigMask = Number.MAX_SAFE_INTEGER + 1;

  /**
   *
   */
  constructor(
    block: string | IConstructable<TTransformer>,
    id: string = "",
    config?: TConfig
  ) {
    super();

    if (typeof block == "string") {
      this.blockName = block;
    } else {
      this.initTarget(block);
      this.blockName = this.schema.name;
    }

    this.id = id || this.blockName;
    this.initConfig = config;
  }

  protected initTarget(target: IConstructable<TTransformer>) {
    (this.schema as Schema) = Schema.getSchemaForClass<
      Transformer<TConfig>,
      IBlockSchema<TConfig>
    >(target);

    (this.target as any) = target;
  }

  /**
   *
   */
  setup() {
    super.setup();

    // Create new transformer object.
    // Block super constructor will initialize all block properties
    // where defaults are defined in Schema definitions.
    let block = new this.target(this.initConfig, null);

    this.block = block;

    this.inPortSchemas = block.helper.inPortKeys.reduce<{}>((map, key) => {
      map[key] = block.helper.getSchemaProp(key);
      return map;
    }, {});

    this.outPortSchemas = block.helper.outPortKeys.reduce<{}>((map, key) => {
      map[key] = block.helper.getSchemaProp(key);
      return map;
    }, {});

    this.inMask = this.trigMask = 0;

    this.inPortKeys.forEach((key, index) => {
      let propSchema = this.inPortSchemas[key];

      if (!propSchema.optional) this.trigMask |= 1 << index;

      if (this.block[key] != undefined) {
        this.inMask |= 1 << index;

        this.input[key] = this.block[key];
      }
    });

    return this;
  }

  /**
   *
   */
  tearDown() {
    this.block = null;

    return super.tearDown();
  }

  /**
   *
   */
  get status() {
    if (!this.block) return "created";
    else return super.status;
  }

  /**
   *
   */
  get transformer() {
    if (!this.block) this.setup();

    return this.block;
  }

  /**
   *
   */
  setInput(data: any) {
    let block = this.block;

    this.inPortKeys.forEach((key, index) => {
      if (data[key]) {
        block[key] = data[key];

        this.inMask |= 1 << index;
      }
    });

    return this;
  }

  /**
   *
   */
  get output(): object {
    let block = this.block;
    let ret = {};

    this.outPortKeys.forEach(key => {
      if (block[key]) ret[key] = block[key];
    });

    return ret;
  }

  /**
   *
   */
  get canTrigger() {
    return super.canTrigger && (this.inMask & this.trigMask) == this.trigMask;
  }

  /**
   *
   */
  async trigger() {
    if (!this.canTrigger) return Promise.reject("Unable to trigger");

    const result = new Promise<boolean>((resolve, reject) => {
      this.block
        .trigger()
        .then(() => {
          resolve(true);
        })
        .catch(err => {
          reject(err);
        });
    });

    return this.setTriggerResult(result);
  }

  /**
   *
  handleAction(action: Action): Action {
    let act = action as PortDataInAction | NodeSetupAction | NodeTeardownAction;

    switch (act.action) {
      case "port-data-in":
        {
          const result = this.block.transform(act.data, true);

          this.result = result;
        }
        break;
    }

    return super.handleAction(action);
  }
  */
}
