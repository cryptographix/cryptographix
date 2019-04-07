//import { Block as XBlock } from "@cryptographix/core";

//class Block extends XBlock implements BlockActionReceiver {
//  handleAction<BA extends BlockAction>(_action: BA): void {}
//}

export interface AnyAction extends Action {}

export interface IActionHandler {
  handleAction<TAction extends Action = AnyAction>(
    _action: TAction
  ): AnyAction | Promise<AnyAction>;
}

export abstract class Action<TID = any> {
  action: "action" | string;

  protected readonly __target: IActionHandler;

  protected readonly __id: TID;

  constructor(target: IActionHandler, id?: TID) {
    this.__target = target;
    this.__id = id;
  }

  async dispatchTo(target: IActionHandler): Promise<AnyAction> {
    let result = target.handleAction(this);

    if (result instanceof Promise) return result;
    else return Promise.resolve(result);
  }

  async dispatch(): Promise<AnyAction> {
    return this.dispatchTo(this.__target);
  }
}

export abstract class BlockSettingChangedAction<T = any> extends Action {
  action: "block-setting-changed";
  readonly key: string;
  readonly value: T;

  constructor(target: IActionHandler, id: object, key: string, value: T) {
    super(target, id);
    this.action = "block-setting-changed";

    this.key = key;
    this.value = value;
  }
}
