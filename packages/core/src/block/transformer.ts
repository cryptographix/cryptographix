import { Block } from "./block";
import { BlockSchemaHelper } from "./block-schema";
import { BlockConfiguration } from "./block-config";
import { FilterSchemaProps } from "../schema/index";

export class TransformerSchemaHelper<
  TConfig extends BlockConfiguration,
  TBlock extends Block<TConfig>
> extends BlockSchemaHelper<TConfig, TBlock> {
  /**
   *
   */
  constructor(transformer: TBlock) {
    super(transformer);
  }

  /**
   * Return list of keys (names of ) Input Ports
   */
  get inPortKeys() {
    return this.filterProps(prop => prop.io && prop.io.type == "data-in");
  }

  /**
   * Return list of keys (names of ) Output Ports
   */
  get outPortKeys() {
    return this.filterProps(prop => prop.io && prop.io.type == "data-out");
  }

  get isReversible(): boolean {
    return (
      this.filterProps(
        prop => prop.name == "direction" && prop.type == "boolean"
      ).length > 0
    );
  }

  /*hasValidInputs(errors: string[] = []): boolean {
    let ok = true;
    let props = Object.entries(this.schema.properties);

    const block = this.block;

    props.forEach(([key, propInfo]) => {
      let value = this[key];

      if (!propInfo.optional && value == null) {
        errors.push( key + "")
        ok = false;
      }
    });

    return ok;
    //
  }*/
}

export abstract class Transformer<
  BC extends BlockConfiguration = object
> extends Block<BC> {
  helper: TransformerSchemaHelper<BC, this>;

  constructor(initConfig?: Partial<BC>) {
    super(initConfig);

    this.helper = new TransformerSchemaHelper<BC, this>(this);
  }

  /**
   * Ready for trigger ?
   */
  get canTrigger(): boolean {
    const requiredInputs = this.helper.filterProps(
      item => item && item.io && item.io.type == "data-in" && !item.optional
    );

    let missingInputs = requiredInputs.filter(key => !this[key]);

    return missingInputs.length == 0;
  }

  /**
   * Trigger block processing.
   */
  abstract trigger(_reverse?: boolean): Promise<void>;

  /**
   * Trigger block processing with params
   */
  async transform<
    TIn extends FilterSchemaProps<this> = FilterSchemaProps<this>,
    TOut extends FilterSchemaProps<this> = FilterSchemaProps<this>
  >(inData: Partial<TIn>, reverse?: boolean): Promise<Partial<TOut>> {
    this.helper.updateBlockProperties(inData, this.helper.inPortKeys);

    return this.trigger(reverse).then(() => {
      const result = this.helper.extractBlockProperties(
        this.helper.outPortKeys
      );

      return Promise.resolve<TOut>(result as TOut);
    });
  }
}

/**
 *
export class PortDataAction<T = any> extends Action {
  action: "port:data" = "port:data";

  key: string;
  portIndex?: number;

  data: T;

  constructor(
    target: IActionHandler,
    id: any,
    key: string,
    data: T,
    portIndex?: number
  ) {
    super(target, id);

    this.key = key;
    this.data = data;
    this.portIndex = portIndex;
  }

  get id() {
    return this.__id;
  }
}*/
