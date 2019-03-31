import {
  ByteArray,
  IBytesSchemaProp,
  ISchemaPropertyType
} from "@cryptographix/core";
import { View, PropertyView } from "@cryptographix/dom-view";
import { IActionHandler } from "@cryptographix/core";

export class InputPanel extends View {
  protected readonly handler: IActionHandler;
  protected value: ByteArray;

  constructor(handler: IActionHandler, initValue?: ByteArray) {
    super();
    this.handler = handler;
    this.value = initValue ? initValue : ByteArray.from([]);

    let propInfo: IBytesSchemaProp = {
      type: "bytes",
      title: "Data to Encrypt",
      ui: {
        widget: "multiline",
        label: "Input Data",
        lines: 5
      }
    };

    let propView = new PropertyView(handler, {
      target: this,
      key: "value",
      propertyType: propInfo as ISchemaPropertyType
    });

    this.addChildView(propView);
  }

  render() {
    return <div>{this.renderChildViews()}</div>;
  }
}
