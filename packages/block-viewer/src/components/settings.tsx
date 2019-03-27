import { ISchemaPropertyType, BA2H } from "@cryptographix/core";
import { View } from "../view";

export class Settings extends View {
  constructor(
    public obj: object,
    public key: string,
    public propInfo: ISchemaPropertyType
  ) {
    super();
  }

  clicked(o) {
    alert("clicked: " + o);
  }

  renderProp() {
    switch (this.propInfo.type) {
      case "number":
        return (
          <input
            onclick={this.clicked}
            class="input"
            type="text"
            placeholder="Num input"
            value={this.obj[this.key]}
          />
        );

      case "string":
        return (
          <input
            class="input"
            type="text"
            placeholder="Text input"
            value={this.obj[this.key]}
          />
        );

      case "enum":
        return (
          <input
            onclick={this.clicked}
            class="input"
            type="text"
            placeholder="Enum input"
            value={this.obj[this.key]}
          />
        );

      case "boolean":
        return (
          <input
            class="input"
            type="text"
            placeholder="Bool input"
            value={this.obj[this.key]}
          />
        );

      case "bytes":
        return (
          <input
            class="input"
            type="text"
            placeholder="Byte input"
            value={BA2H(this.obj[this.key])}
          />
        );
    }
  }

  render() {
    return (
      <div class="field">
        <label class="label">{this.propInfo.title || this.key}</label>
        <div class="control">{this.renderProp()}</div>
      </div>
    );
  }
}
