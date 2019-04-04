import { Action } from "../dispatcher/action";

/**
 * Inform block of startup
 */
export class BlockStartup extends Action {
  action: "block:startup";
}

/**
 * Inform block of shutdown
 */
export class BlockShowdown extends Action {
  action: "block:shutdown";
}

/**
 * Informs Block of property change
 */
export class BlockPropertyChanged extends Action {
  action: "block:property-changed";

  key: string;
  value: any;
}

/**
 * Informs Block of config property change
 */
export class ConfigPropertyChanged extends Action {
  action: "config:property-changed";

  key: string;
  value: any;
}
