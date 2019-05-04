import {
  ISchemaProperty,
  SchemaPropertyDataType,
  ByteArray
} from "@cryptographix/core";
import { FlowNode } from "./flow-node";

/**
 *
 */
export abstract class DataNode extends FlowNode {
  $type: "data" = "data";

  static PRIMARY_KEY = "default";

  /**
   * @override
   */
  setup(): this {
    this.input = {};

    this.result = null;

    return this;
  }

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
}

/**
 *
 */
export class ConstantDataNode<
  T extends SchemaPropertyDataType
> extends DataNode {
  typeName: string;

  constructor(value: T, typeName: string, id: string = "") {
    super(id);

    this.typeName = typeName;

    let prop: ISchemaProperty<any>;

    switch (typeName) {
      case "string":
        prop = { type: "string" };
        break;

      case "integer":
        prop = { type: "integer" };
        break;

      case "boolean":
        prop = { type: "boolean" };
        break;

      case "hex":
      case "base64":
        prop = { type: "bytes" };
        break;
    }

    this.outPortSchemas[DataNode.PRIMARY_KEY] = prop;

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

    this.inPortSchemas[inKey] = this.outPortSchemas[outKey] = {
      type: null
    };
  }

  get canTrigger() {
    return super.canTrigger && this.input[this.inPortKeys[0]];
  }

  /**
   *
   */
  async trigger() {
    if (!this.canTrigger) return Promise.reject("Unable to trigger");

    this._output[this.outPortKeys[0]] = this.input[this.inPortKeys[0]];

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
        this.outPortSchemas[DataNode.PRIMARY_KEY] = {
          type: null
        };

        break;
      }

      case "$set": {
        this.inPortSchemas[DataNode.PRIMARY_KEY] = {
          type: null
        };

        this.outPortSchemas[DataNode.PRIMARY_KEY] = {
          type: null
        };

        break;
      }
    }
  }

  /**
   *
   */
  get canTrigger() {
    let ready = true;

    switch (this.name) {
      case "$set":
      case "$get": {
        ready = !!this.input[DataNode.PRIMARY_KEY];
        break;
      }
    }

    return super.canTrigger && ready;
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
