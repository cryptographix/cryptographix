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
    return this._parentNode;
  }

  set parent(parentNode: FlowNode) {
    this._parentNode = parentNode;
  }

  /**
   *
   */

  get status(): "created" | "idle" | "busy" | "error" {
    return !!this._result ? "busy" : "idle";
  }

  /**
   *
   */
  setup(): void {
    this._inKeys = ["default"];
    this._input = {};

    this._outKeys = ["default"];
    this._output = {};

    this._result = null;
  }

  /**
   *
   */
  tearDown(): void {
    this._input = {};
    this._output = {};
    this._result = null;
  }

  /**
   *
   */
  setInput(data: object): void {
    this._input = {
      ...this._input,
      ...data
    };
  }

  /**
   *
   */
  getOutput(): object {
    return {
      ...this._output
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
