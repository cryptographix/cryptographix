import { Transformer, ByteArray, IBytesSchemaProp } from "@cryptographix/core";
import { IActionHandler, Action } from "@cryptographix/core";
import { View /*BlockView,  BlockViewParams */ } from "@cryptographix/core";
import { PropertyView, PropertyValueChanged } from "./properties/property-view";

export class InputTransformer extends Transformer implements IActionHandler {
  public _key: string;

  constructor(initConfig: {
    key: string;
    title: string;
    initValue?: ByteArray;
  }) {
    super(initConfig.initValue);

    const key = (this._key = initConfig.key);

    let propInfo = {
      name: key,
      type: "bytes",
      title: initConfig.title,
      ui: {
        widget: "multiline",
        lines: 5
      },
      io: {
        type: "data-out"
      }
    };

    this[key] = initConfig.initValue
      ? initConfig.initValue
      : ByteArray.from([]);

    this.helper.updatePropSchema(key, propInfo);
  }

  private _firstTime = true;

  pendingTrigger: {
    resolve: any;
    reject: any;
  } = null;

  async trigger() {
    let result = new Promise<void>((resolve, reject) => {
      if (this._firstTime) {
        this._firstTime = false;
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

/*export class InputPanel extends BlockView<InputTransformer> {
  block: InputTransformer;

  constructor(params: BlockViewParams<InputTransformer>) {
    super(params);
  }

  render() {
    const propRef = {
      target: this.block,
      key: "value",
      propertyType: this.block.propInfo
    };

    return <PropertyView handler={this.handler} propRef={propRef} />;
  }
}*/

export function InputPanel(params: { key: string; input: InputTransformer }) {
  let { key, input } = params;

  const propRef = {
    target: input,
    key: key,
    propertyType: input.helper.getPropSchema<IBytesSchemaProp>(key)
  };

  return <PropertyView handler={input} propRef={propRef} />;
}
