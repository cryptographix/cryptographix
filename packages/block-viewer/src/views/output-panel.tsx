import { Transformer, ByteArray, IBytesSchemaProp } from "@cryptographix/core";
import { IActionHandler } from "@cryptographix/core";
import { View, BlockView, BlockViewParams } from "@cryptographix/core";
import { PropertyView } from "./property-view";

export class OutputTransformer extends Transformer {
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
      name: "value",
      type: "bytes",
      title,
      ui: {
        widget: "multiline",
        lines: 5
      }
    };

    this.value = initValue ? initValue : ByteArray.from([]);
  }

  async trigger() {
    this.view.triggerUpdate();

    return Promise.resolve();
  }
}

export class OutputPanel extends BlockView<OutputTransformer> {
  block: OutputTransformer;

  constructor(params: BlockViewParams<OutputTransformer>) {
    super(params);
  }

  updateView() {
    return true; // rerender
  }

  render() {
    const propRef = {
      target: this.block,
      key: "value",
      propertyType: this.block.propInfo
    };

    return (
      <PropertyView handler={this.handler} propRef={propRef} readOnly={true} />
    );
  }
}
