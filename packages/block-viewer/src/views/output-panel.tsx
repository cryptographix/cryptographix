import { Transformer, ByteArray, IBytesSchemaProp } from "@cryptographix/core";
//import { IActionHandler } from "@cryptographix/core";
import { View, BlockView } from "@cryptographix/core";
import { PropertyView } from "./property-view";

export class OutputTransformer extends Transformer {
  _key: string;

  constructor(initConfig: {
    key: string;
    title: string;
    initValue?: ByteArray;
  }) {
    super(initConfig.initValue);

    const key = (this._key = initConfig.key);

    const propInfo = {
      name: key,
      type: "bytes",
      title: initConfig.title,
      ui: {
        widget: "multiline",
        lines: 5
      },
      io: {
        type: "data-in"
      }
    };

    this[key] = initConfig.initValue
      ? initConfig.initValue
      : ByteArray.from([]);

    this.helper.updatePortSchema(key, propInfo);
    this.helper.inPortKeys.push(key);
  }

  async trigger() {
    this.view.triggerUpdate();

    return Promise.resolve();
  }
}

export class OutputPanel extends BlockView<OutputTransformer> {
  block: OutputTransformer;

  constructor(params: { key: string; output: OutputTransformer }) {
    let { key, output } = params;

    super({ block: output });

    const propRef = {
      target: output,
      key: key,
      propertyType: output.helper.getPortSchema<IBytesSchemaProp>(key)
    };

    //    this.addChildView( new PropertyView( {handler={this.handler} propRef={propRef} readOnly={true} />
    this.addChildView(
      new PropertyView({
        handler: this.handler,
        propRef: propRef,
        readOnly: true
      })
    );
  }

  updateView() {
    this.children[0].refresh();
    return false;
  }

  render() {
    return <fragment>{this.renderChildViews()}</fragment>;
  }
}

/*export function OutputPanel(params: {
  key: string;
  output: OutputTransformer;
}) {
  let { key, output } = params;

  const propRef = {
    target: output,
    key: key,
    propertyType: output.helper.getPortSchema<IBytesSchemaProp>(key)
  };

  return <PropertyView handler={output} propRef={propRef} readOnly={true} />;
}*/
