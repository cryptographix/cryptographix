import { Action, IActionHandler } from "../dispatcher/action";

/**
 * Inform block of startup
 */
export class BlockStartup extends Action {
  action: "block:startup" = "block:startup";
}

/**
 * Inform block of shutdown
 */
export class BlockShowdown extends Action {
  action: "block:shutdown" = "block:shutdown";
}

/**
 * Informs Block of property change
 */
export class BlockPropertyChanged extends Action {
  action: "block:property-changed" = "block:property-changed";

  key: string;
  value: any;
}

/**
 * Block has changed status
 */
export class BlockStatusChanged extends Action {
  action: "block:status-changed" = "block:status-changed";

  constructor(handler: IActionHandler, id: object, status: string) {
    super(handler, id);

    this.status = status;
  }

  status: string;
}

/**
 * Informs Block of config property change
 */
export class ConfigPropertyChanged extends Action {
  action: "config:property-changed";

  key: string;
  value: any;
}
