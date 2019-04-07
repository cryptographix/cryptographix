import { Action } from "@cryptographix/core";

export class NodeSetupAction extends Action {
  action: "node-setup" = "node-setup";
}

export class NodeTeardownAction extends Action {
  action: "node-teardown" = "node-teardown";
}
