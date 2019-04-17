import { IActionHandler, Action } from "@cryptographix/core";

import { NodeSetupAction, NodeTeardownAction } from "./node-actions";

export abstract class FlowNode implements IActionHandler {
  public $type: "flow" | "pipeline" | "mapper" | "transformer" | "data" = null;

  //
  readonly id: string = "";

  //
  protected parentNode: FlowNode = null;

  //
  public inKeys: string[] = [];

  //
  public input: object = {};

  //
  public outKeys: string[] = [];

  //
  public output: object = {};

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
    this.inKeys = ["default"];
    this.input = {};

    this.outKeys = ["default"];
    this.output = {};

    this.result = null;

    return this;
  }

  /**
   *
   */
  tearDown(): this {
    this.input = {};
    this.output = {};
    this.result = undefined;

    return this;
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
  getOutput(): object {
    return {
      ...this.output
    };
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
