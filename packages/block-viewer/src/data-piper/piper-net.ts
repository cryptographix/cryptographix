import { IActionHandler, AnyAction, BA2H } from "@cryptographix/core";
import { PropertyValueChanged } from "@cryptographix/dom-view";

import { BlockInputAction } from "../actions/block-input-action";

type Actions = BlockInputAction | PropertyValueChanged;

export class PiperNet implements IActionHandler {
  handleAction(action: AnyAction) {
    let act = action as Actions;

    switch (act.action) {
      case "property-value-changed": {
        console.log("Input from", act.key, "=>", BA2H(act.value));
        break;
      }
    }

    return action;
  }
}
