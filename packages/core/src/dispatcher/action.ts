//import { Block as XBlock } from "@cryptographix/core";

//class Block extends XBlock implements BlockActionReceiver {
//  handleAction<BA extends BlockAction>(_action: BA): void {}
//}

export interface IActionHandler {
  handleAction<A extends Action>(_action: A): Promise<A>;
}

export abstract class Action {
  action: string;
  protected readonly target: IActionHandler;

  constructor(target: IActionHandler) {
    this.target = target;
  }

  async dispatch(): Promise<this> {
    let result = this.target.handleAction(this);

    if (result instanceof Promise) return result;
    else return Promise.resolve(result);
  }
}

export abstract class BlockSettingChangedAction<T = any> extends Action {
  action: "setting-changed";
  readonly key: string;
  readonly value: T;

  constructor(target: IActionHandler, key: string, value: T) {
    super(target);
    this.key = key;
    this.value = value;
  }
}
