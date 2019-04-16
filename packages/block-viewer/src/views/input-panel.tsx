import { Transformer, ByteArray, IBytesSchemaProp } from "@cryptographix/core";
import { IActionHandler, Action } from "@cryptographix/core";
import { View, BlockView } from "@cryptographix/core";
import { PropertyView, PropertyValueChanged } from "./property-view";

export class InputTransformer extends Transformer implements IActionHandler {
  key: string;
  value: ByteArray;
  propInfo: IBytesSchemaProp;

  constructor(
    key: string,
    title: string,
    initValue?: ByteArray,
    handler?: IActionHandler
  ) {
    super(initValue, handler);

    this.key = key;

    this.propInfo = {
      name: key,
      type: "bytes",
      title,
      ui: {
        widget: "multiline",
        lines: 5
      }
    };

    this.value = initValue ? initValue : ByteArray.from([]);
  }

  firstTime = true;

  pendingTrigger: {
    resolve: any;
    reject: any;
  } = null;

  async trigger() {
    let result = new Promise<void>((resolve, reject) => {
      if (this.firstTime) {
        this.firstTime = false;
        resolve();
      } else
        this.pendingTrigger = {
          resolve,
          reject
        };
    });

    return result;
  }

  handleAction(action: Action) {
    let act = action as PropertyValueChanged;
    switch (act.action) {
      case "property:value-changed": {
        console.log("changed: ", act.key, " to ", this[act.key]);
        if (this.pendingTrigger) {
          this.pendingTrigger.resolve();
          this.pendingTrigger = null;
        }
      }
    }

    return null;
  }
}

export class InputPanel extends BlockView<InputTransformer> {
  constructor(handler: IActionHandler, model: InputTransformer) {
    super(handler, model);

    let propView = new PropertyView(handler, {
      target: model,
      key: "value",
      propertyType: model.propInfo // as ISchemaPropertyType
    });

    this.addChildView(propView);
  }

  render() {
    return <div>{this.renderChildViews()}</div>;
  }
}
