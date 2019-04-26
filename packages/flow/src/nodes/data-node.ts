import { ISchemaProperty } from "@cryptographix/core";
import { FlowNode } from "./flow-node";

/**
 *
 */
export class DataNode extends FlowNode {
  $type: "data" = "data";

  value: string;

  constructor(value: string, id: string = "") {
    super(id);

    this.value = value;
  }

  /**
   *
   */
  setup() {
    return super.setup();
  }

  /**
   *
   */
  tearDown() {
    return super.tearDown();
  }

  /**
   *
   */
  getPortSchema<TSchemaProperty extends ISchemaProperty = ISchemaProperty<any>>(
    key: string
  ): TSchemaProperty {
    return null && key;
  }

  /**
   *
   */
  get canTrigger(): boolean {
    return this.status == "idle";
  }

  /**
   *
   */
  async trigger() {
    if (!this.canTrigger) return Promise.reject("Unable to trigger");

    this._output = {
      ...this.input
    };

    return this.setTriggerResult(Promise.resolve(true));
  }

  private _output = {};

  /**
   *
   */
  get output() {
    return this._output;
  }
}
