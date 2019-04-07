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

    this._schema = Schema.getSchemaForClass<
      Transformer<TConfig>,
      IBlockSchema<TConfig, TTransformer>
    >(target);

    this._target = this._schema.target;
    this._config = config;
  }

  /**
   *
   */
  setup() {
    super.setup();

    this._block = new this._target(this._config);

    this._inKeys = this._block._inPortNames;
    this._outKeys = this._block._outPortNames;
  }

  /**
   *
   */
  tearDown() {
    this._block = null;

    super.tearDown();
  }

  /**
   *
   */
  get status() {
    if (!this._block) return "created";
    else return super.status;
  }

  /**
   *
   */
  setInput(data: any): void {
    let block = this._block;

    this._inKeys.forEach(key => {
      if (data[key]) block[key] = data[key];
    });
  }

  /**
   *
   */
  getOutput(): object {
    let block = this._block;
    let ret = {};

    this._outKeys.forEach(key => {
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
      this._block
        .trigger(reverse)
        .then(() => {
          resolve(true);
        })
        .catch(err => {
          reject(err);
        });
    });

    this._result = result;

    return result;
  }

  /**
   *
  handleAction(action: Action): Action {
    let act = action as PortDataInAction | NodeSetupAction | NodeTeardownAction;

    switch (act.action) {
      case "port-data-in":
        {
          const result = this._block.transform(act.data, true);

          this._result = result;
        }
        break;
    }

    return super.handleAction(action);
  }
  */
}
