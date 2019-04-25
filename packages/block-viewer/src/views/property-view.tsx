import { View, Action, IActionHandler } from "@cryptographix/core";

import {
  ISchemaPropReference,
  IBooleanSchemaProp,
  IBytesSchemaProp,
  IEnumSchemaProp,
  IStringSchemaProp,
  ISchemaPropUI
} from "@cryptographix/core";
import { BA2H, H2BA, ByteArray } from "@cryptographix/core";

export class PropertyValueChanged extends Action<object> {
  action: "property:value-changed" = "property:value-changed";

  constructor(
    target: IActionHandler,
    id: object,
    public key: string,
    public value: any
  ) {
    super(target, id);
  }
  //
}

export class PropertyView extends View {
  //
  protected propRef: ISchemaPropReference;

  //
  protected $field: HTMLElement;

  //
  protected ui: ISchemaPropUI;

  //
  protected message: string;

  constructor(params: {
    handler?: IActionHandler;
    propRef: ISchemaPropReference;
    readOnly?: boolean;
  }) {
    super(params);

    const { propRef, readOnly } = params;

    this.propRef = propRef;

    this.ui = {
      hint: "",
      widget: "",
      columns: 12,
      style: "",
      className: "",
      readOnly: readOnly || false,
      label: propRef.propertyType.title || propRef.key,
      ...propRef.propertyType.ui
    };

    if (this.value != undefined) {
      let self = this;

      window.requestAnimationFrame(() => {
        self.notifyValueChanged();
      });
    }
  }

  get value() {
    return this.propRef.target[this.propRef.key];
  }

  set value(value: any) {
    this.propRef.target[this.propRef.key] = value;

    this.notifyValueChanged();
  }

  notifyValueChanged() {
    const prop = this.propRef;

    const act = new PropertyValueChanged(
      this.handler,
      prop.target,
      prop.key,
      this.value
    );

    if (this.handler) act.dispatch();
  }

  get key() {
    return this.propRef.key;
  }

  clearError() {
    if (this.message) {
      this.triggerUpdate();

      this.message = null;
    }
  }
  setError(s: string) {
    this.message = s;
    this.triggerUpdate();
  }

  _first = false;
  render() {
    const errClass = this.message ? " field--invalid" : "";
    //TODO: first
    return (
      <div
        class={`field ${errClass} ${this.ui.className} ${
          this._first ? " field--first" : ""
        }`}
        style="padding-left: 0.5rem; padding-right: 0.5rem;"
        onFocus={(_evt: Event) => this.focus()}
        onBlur={(_evt: Event) => this.blur()}
      >
        {this.renderLabel()}
        {(this.$field = this.renderProp())}
        {(this.$message = this.renderMessage())}
      </div>
    );
  }

  /**
   * Renders label.
   */
  renderLabel() {
    return <label class="label">{this.ui.label}</label>;
  }

  /**
   * Renders message.
   */
  protected $message: any;
  renderMessage() {
    if (this.message) {
      return <p class="help is-danger">{this.message}</p>;
    } else if (this.ui.hint) {
      return <p class="help is-info">{this.ui.hint}</p>;
    }
  }

  stringValueChanged(evt: any) {
    this.clearError();
    let value = (evt.target as HTMLInputElement).value;
    this.value = value;
  }

  byteValueChanged(evt: Event) {
    this.clearError();
    let value = (evt.target as HTMLInputElement).value;
    try {
      this.value = H2BA(value);
    } catch (E) {
      this.setError("fudeo");
    }
  }

  boolValueChanged(evt: Event) {
    this.clearError();
    let value = (evt.target as HTMLInputElement).checked;

    this.value = value;
  }

  renderBoolean(propInfo: IBooleanSchemaProp, value: boolean) {
    return (
      <div class="control has-icons-right">
        <label class="checkbox">
          <input
            type="checkbox"
            value={this.value}
            onChange={this.boolValueChanged.bind(this)}
            checked={value}
          />
          {propInfo.title}
        </label>
      </div>
    );
  }

  renderEnum(propInfo: IEnumSchemaProp, value: string) {
    if (this.ui.widget === "radio") {
      const $$radio = [];

      // render each option
      Object.entries(propInfo.options).map(([key, label]) => {
        const $radio = (
          <label class="radio">
            <input
              type="radio"
              name={this.propRef.key + "-" + key}
              value={key}
              onChange={this.stringValueChanged.bind(this)}
              checked={value == key}
            />
            {label}
          </label>
        );

        $$radio.push($radio);
      });

      return $$radio;
    } else {
      // create option for each element
      const $options = Object.entries(propInfo.options).map(([key, label]) => {
        return (
          <option value={key} title={label || ""}>
            {label}
          </option>
        );
      });

      return (
        <div class="control">
          <span class="select" style="width: 100%">
            <select
              onChange={this.stringValueChanged.bind(this)}
              class="input"
              placeholder={this.ui.hint}
              value={this.value}
              onFocus={(_evt: Event) => this.focus()}
              onBlur={(_evt: Event) => this.blur()}
            >
              {$options}
            </select>
          </span>
        </div>
      );
    }
  }

  renderBytes(_propInfo: IBytesSchemaProp, value: ByteArray) {
    let $inner: HTMLElement;

    if (this.ui.widget == "multiline") {
      let lines = (this.ui as any).lines;
      let rows = lines != null ? lines || 5 : undefined;

      $inner = (
        <textarea
          class="textarea bytes"
          spellcheck="false"
          onInput={this.byteValueChanged.bind(this)}
          onFocus={(_evt: Event) => this.focus()}
          onBlur={(_evt: Event) => this.blur()}
          placeholder={this.ui.hint}
          rows={rows}
          value={BA2H(value)}
        />
      );
    } else {
      $inner = (
        <input
          class="input bytes"
          type="text"
          spellcheck="false"
          onInput={this.byteValueChanged.bind(this)}
          onFocus={(_evt: Event) => this.focus()}
          onBlur={(_evt: Event) => this.blur()}
          placeholder={this.ui.hint}
          value={BA2H(value)}
        />
      );
    }

    if (this.ui["readOnly"]) {
      $inner.setAttribute("readonly", "true");
    }

    return <div class="control">{$inner}</div>;
  }

  renderString(_propInfo: IStringSchemaProp, value: string) {
    let $inner: HTMLElement;

    if (this.ui.widget == "multiline") {
      let lines = (this.ui as any).lines;
      let rows = lines != null ? lines || 5 : undefined;

      $inner = (
        <textarea
          class="textarea text"
          spellcheck="false"
          onChange={this.stringValueChanged.bind(this)}
          onKeyUp={this.stringValueChanged.bind(this)}
          onFocus={(_evt: Event) => this.focus()}
          onBlur={(_evt: Event) => this.blur()}
          placeholder={this.ui.hint}
          rows={rows}
          value={value || ""}
        />
      );
    } else {
      $inner = (
        <input
          class="input text"
          type="text"
          spellcheck="false"
          onChange={this.stringValueChanged.bind(this)}
          onKeyUp={this.stringValueChanged.bind(this)}
          onFocus={(_evt: Event) => this.focus()}
          onBlur={(_evt: Event) => this.blur()}
          placeholder={this.ui.hint}
          value={value || ""}
        />
      );
    }

    if (this.ui["readOnly"]) {
      $inner.setAttribute("readonly", "true");
    }

    return <div class="control">{$inner}</div>;
  }

  renderProp() {
    const value = this.value;
    const propInfo = this.propRef.propertyType;

    switch (propInfo.type) {
      case "number":
        return (
          <div class="control xxhas-icons-right">
            <input
              class="input"
              type="number"
              onChange={this.stringValueChanged.bind(this)}
              onFocus={(_evt: Event) => this.focus()}
              onBlur={(_evt: Event) => this.blur()}
              placeholder={this.ui.hint}
              value={value || 0}
            />
          </div>
        );

      case "string":
        return this.renderString(propInfo, value || "");

      case "enum":
        return this.renderEnum(propInfo, value || "");

      case "boolean":
        return this.renderBoolean(propInfo, value || false);

      case "bytes":
        return this.renderBytes(propInfo, value || ByteArray.alloc(0));
    }
  }

  updateView(): boolean {
    const $field = this.element;

    // Set focus modifier
    $field.classList.toggle("field--focus", this.hasFocus);

    // Add invalid modifier
    $field.classList.toggle("field--invalid", !true || !!this.message);

    // Remove old message, if any
    if (this.$message) {
      this.$message.remove();
      this.$message = null;
    }

    // Create new message, if any
    this.$message = this.renderMessage();
    if (this.$message) {
      this.element.appendChild(this.$message);
    }

    return false;
  }

  viewFocused() {
    this.triggerUpdate();
  }
  viewBlurred() {
    this.triggerUpdate();
  }
}
