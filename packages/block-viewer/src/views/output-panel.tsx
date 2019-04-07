import { Transformer, ByteArray, IBytesSchemaProp } from "@cryptographix/core";
import { IActionHandler } from "@cryptographix/core";
import { View, BlockView } from "@cryptographix/core";
import { PropertyView } from "./property-view";

export class OutputTransformer extends Transformer {
  key: string;
  value: ByteArray;
  propInfo: IBytesSchemaProp;

  constructor(key: string, title: string, initValue?: ByteArray) {
    super();

    this.key = key;

    this.propInfo = {
      name: key,
      type: "bytes",
      title, //: "Data to Encrypt",
      ui: {
        widget: "multiline",
        //label: "Input Data",
        lines: 5
      }
    };

    this.value = initValue ? initValue : ByteArray.from([]);
  }

  async trigger() {
    this.view.updateView();

    return Promise.resolve();
  }
}

export class OutputPanel extends BlockView {
  protected model: OutputTransformer;

  constructor(handler: IActionHandler, model: OutputTransformer) {
    super(handler, model);

    this.model = model;

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
