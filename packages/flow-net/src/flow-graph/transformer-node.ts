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
  TConfig extends BlockConfiguration = {},
  TTransformer extends Transformer<TConfig> = Transformer<TConfig>
> extends FlowNode {
  //
  _target: IConstructable<TTransformer>;

  //
  _config: TConfig;

  //
  _schema: IBlockSchema<TConfig, TTransformer>;

  //
  _block: TTransformer = null;

  /**
   *
   */
  constructor(target: IConstructable<TTransformer>, config?: TConfig) {
    super();

    this.schema = Schema.getSchemaForClass<
      Transformer<TConfig>,
      IBlockSchema<TConfig, TTransformer>
    >(target);

    this.target = this.schema.target;
    this.config = config;
  }

  /**
   *
   */
  setup() {
    super.setup();

    this.block = new this.target(this.config);

    this.inKeys = this.block._inPortNames;
    this.outKeys = this.block._outPortNames;

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
  setInput(data: any) {
    let block = this.block;

    this.inKeys.forEach(key => {
      if (data[key]) block[key] = data[key];
    });

    return this;
  }

  /**
   *
   */
  getOutput(): object {
    let block = this.block;
    let ret = {};

    this.outKeys.forEach(key => {
      if (block[key]) ret[key] = block[key];
    });

    return ret;
  }

  /**
   *
   */
  async trigger(reverse?: boolean) {
    if (!this.canTrigger) return Promise.reject("Unable to trigger");

    const result = new Promise<boolean>((resolve, reject) => {
      this.block
        .trigger(reverse)
        .then(() => {
          resolve(true);
        })
        .catch(err => {
          reject(err);
        });
    });

    this.result = result;

    return result;
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
