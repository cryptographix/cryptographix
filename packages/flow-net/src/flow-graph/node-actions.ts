import { Action } from "@cryptographix/core";

export class NodeSetupAction extends Action {
  action: "node-setup" = "node-setup";
}

export class NodeTeardownAction extends Action {
  action: "node-teardown" = "node-teardown";
}

export class PortDataInAction<T = any> extends Action {
  action: "port-data-in" = "port-data-in";

  name: string;
  portIndex?: number;

  data: T;
}
