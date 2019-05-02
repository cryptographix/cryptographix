import { ISchemaProperty, ByteArray } from "@cryptographix/core";
import { FlowNode } from "./flow-node";

/**
 *
 */
export abstract class DataNode extends FlowNode {
  $type: "data" = "data";

  static PRIMARY_KEY = "default";

  /**
   * Store for output data
   */
  protected _output = {};

  /**
   *
   */
  get output() {
    return this._output;
  }

  /**
   *
   */
  getPortSchema<TSchemaProperty extends ISchemaProperty = ISchemaProperty<any>>(
    key: string
  ): TSchemaProperty {
    return null && key;
  }
}

/**
 *
 */
export class ConstantDataNode<
  T extends number | string | boolean | ByteArray
> extends DataNode {
  typeName: string;

  constructor(value: T, typeName: string, id: string = "") {
    super(id);

    this.typeName = typeName;

    this.outKeys.push(DataNode.PRIMARY_KEY);
    this._output[DataNode.PRIMARY_KEY] = value;
  }

  /**
   *
   */
  async trigger() {
    if (!this.canTrigger) return Promise.reject("Unable to trigger");

    return this.setTriggerResult(Promise.resolve(true));
  }
}

/**
 *
 */
export class SelectorDataNode extends DataNode {
  constructor(inKey: string, outKey: string, id: string = "") {
    super(id);

    this.inKeys.push(inKey);
    this.outKeys.push(outKey);
  }

  get canTrigger() {
    return super.canTrigger && this.input[this.inKeys[0]];
  }

  /**
   *
   */
  async trigger() {
    if (!this.canTrigger) return Promise.reject("Unable to trigger");

    this._output[this.outKeys[0]] = this.input[this.inKeys[0]];

    return this.setTriggerResult(Promise.resolve(true));
  }
}

/**
 *
 */
export class FunctionDataNode extends DataNode {
  name: string;
  params: string[];

  /**
   *
   */
  constructor(name: string, params: string[], id: string = "") {
    super(id);

    this.name = name;

    this.parseParams(params);
  }

  /**
   *
   */
  protected parseParams(params: string[]) {
    this.params = params;

    switch (this.name) {
      case "$get": {
        this.outKeys.push(DataNode.PRIMARY_KEY);
        break;
      }

      case "$set": {
        this.inKeys.push(DataNode.PRIMARY_KEY);
        this.outKeys.push(DataNode.PRIMARY_KEY);
        break;
      }

      // Convert param[0] from hex to bytes
      case "$hex": {
        this.outKeys.push(DataNode.PRIMARY_KEY);

        this._output[DataNode.PRIMARY_KEY] = ByteArray.fromString(
          params[0],
          "hex"
        );
      }
    }
  }

  /**
   *
   */
  get canTrigger() {
    let canI = true;

    switch (this.name) {
      case "$set":
      case "$get": {
        canI = !!this.input[DataNode.PRIMARY_KEY];
        break;
      }
    }

    return super.canTrigger && canI;
  }

  /**
   *
   */
  async trigger() {
    if (!this.canTrigger) return Promise.reject("Unable to trigger");

    switch (this.name) {
      case "$get": {
        // TODO: get referenced variable
        break;
      }

      case "$set": {
        // TODO: set referenced variable
        this._output[DataNode.PRIMARY_KEY] = this.input[DataNode.PRIMARY_KEY];
        break;
      }
    }

    return this.setTriggerResult(Promise.resolve(true));
  }
}
