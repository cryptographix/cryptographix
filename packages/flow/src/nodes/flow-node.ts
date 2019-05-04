import { View, IViewModel, IActionHandler, Action } from "@cryptographix/core";
import { ISchemaPropertyMap, ISchemaProperty } from "@cryptographix/core";

import { NodeSetupAction, NodeTeardownAction } from "./node-actions";

export abstract class FlowNode implements IActionHandler, IViewModel {
  view?: View;

  public $type: "flow" | "pipeline" | "mapper" | "transformer" | "data" = null;

  //
  readonly id: string = "";

  // Additional '$...' attributes
  public meta: {} = {};

  //
  protected parentNode: FlowNode = null;

  //
  public inPortKeyMap: { [index: string]: string } = {};

  //
  public inPortSchemas: ISchemaPropertyMap = {};

  //
  public input: object = {};

  //
  public outPortSchemas: ISchemaPropertyMap = {};

  //
  public abstract get output(): object;

  //
  protected result: Promise<boolean>;

  /**
   *
   */
  constructor(id: string = "") {
    this.id = id;
  }

  get parent(): FlowNode {
    return this.parentNode;
  }

  set parent(parentNode: FlowNode) {
    this.parentNode = parentNode;
  }

  //
  public get inPortKeys(): string[] {
    return Object.keys(this.inPortSchemas);
  }

  //
  public get outPortKeys(): string[] {
    return Object.keys(this.outPortSchemas);
  }

  /**
   *
   */
  get status(): "created" | "idle" | "busy" | "error" {
    if (this.result === undefined) return "created";

    return !!this.result ? "busy" : "idle";
  }

  /**
   *
   */
  setup(): this {
    this.inPortSchemas = {};
    this.input = {};

    this.outPortSchemas = {};

    this.result = null;

    return this;
  }

  /**
   *
   */
  tearDown(): this {
    this.input = {};
    this.result = undefined;

    return this;
  }

  /**
   *
   */
  getPortSchema<TSchemaProperty extends ISchemaProperty>(
    key: string
  ): TSchemaProperty {
    let schema: TSchemaProperty = null;

    if (this.inPortKeys.indexOf(key) >= 0) {
      schema = <TSchemaProperty>this.inPortSchemas[key];
    } else if (this.outPortKeys.indexOf(key) >= 0) {
      schema = <TSchemaProperty>this.outPortSchemas[key];
    }

    return schema;
  }

  /**
   *
   */
  setInput(data: {}): this {
    this.input = {
      ...this.input,
      ...data
    };

    return this;
  }

  /**
   *
   */
  handleAction(action: Action): Action {
    let act = action as NodeSetupAction | NodeTeardownAction;

    switch (act.action) {
      case "node-setup": {
        if (this.setup) this.setup();

        break;
      }

      case "node-teardown": {
        if (this.tearDown) this.tearDown();

        break;
      }
    }

    return null;
  }

  /**
   *
   */
  get canTrigger(): boolean {
    return this.status == "idle";
  }

  protected setTriggerResult(result: Promise<boolean>) {
    let self = this;

    this.result = result
      .then<boolean>(ok => {
        self.result = null;

        return ok; // Promise.resolve<boolean>(ok);
      })
      .finally(() => {
        self.result = null;
      });

    return this.result;
    //
  }

  /**
   *
   */
  abstract async trigger(reverse?: boolean): Promise<boolean>;
}
