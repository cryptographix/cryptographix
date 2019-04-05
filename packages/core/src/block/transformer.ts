import { Block } from "./block";

//export abstract class Transformer<TConfig> extends Block<TConfig> {
export abstract class Transformer<BC> extends Block<BC> {
  _inPortNames: string[];
  _outPortNames: string[];

  constructor(initConfig?: Partial<BC>) {
    super(initConfig);

    this._inPortNames = this.helper
      .getPortMap(prop => prop.io && prop.io.type == "data-in")
      .map(([_key, prop]) => prop.name);

    this._outPortNames = this.helper
      .getPortMap(prop => prop.io && prop.io.type == "data-out")
      .map(([_key, prop]) => prop.name);
  }

  /**
   * Trigger block processing.
   */
  abstract trigger(_reverse?: boolean): Promise<void>;

  /**
   * Trigger block processing with params
   */
  async transform<TIn = Partial<this>, TOut = Partial<this>>(
    inData: TIn,
    reverse?: boolean
  ): Promise<TOut> {
    this.helper.updateBlockProperties(inData, this._inPortNames);

    return this.trigger(reverse).then(() => {
      const result = this.helper.extractBlockProperties(this._outPortNames);

      return Promise.resolve<TOut>(result as TOut);
    });
  }

  /*async encode<TIn = {}, TOut = {}>(content: TIn): Promise<TOut> {
    return this.transform(content, true);
  }

  async decode<TIn = {}, TOut = {}>(content: TIn): Promise<TOut> {
    return this.transform(content, false);
  }*/
}
