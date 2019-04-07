import { IActionHandler, Action } from "@cryptographix/core";

import { NodeSetupAction, NodeTeardownAction } from "./node-actions";

export abstract class FlowNode implements IActionHandler {
  //
  protected _parentNode: FlowNode = null;

  //
  protected _inKeys: string[] = ["default"];

  //
  protected _input: object = {};

  //
  protected _outKeys: string[] = ["default"];

  //
  protected _output: object = {};

  //
  protected _result: Promise<boolean>;

  /**
   *
   */
  constructor() {
    //
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
    this.result = null;

    return this;
  }

  /**
   *
   */
  setInput(data: object): this {
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

  /**
   *
   */
  abstract async trigger(reverse?: boolean): Promise<boolean>;
}
