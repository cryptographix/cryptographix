import { View, Action, IActionHandler } from "@cryptographix/core";

import {
  ISchemaPropReference,
  IBooleanSchemaProp,
  IBytesSchemaProp,
  IEnumSchemaProp,
  IStringSchemaProp,
  ISchemaPropUI
} from "@cryptographix/core";
import { ByteArray } from "@cryptographix/core";

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

  //
  public options: {};

  constructor(props: {
    handler?: IActionHandler;
    propRef: ISchemaPropReference;
    readOnly?: boolean;
    options?: {};
  }) {
    super(props);

    const { propRef, readOnly, options } = props;

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

    this.options = options || {};

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

  msgTimer: any;
  clearError() {
    if (this.msgTimer) {
      clearTimeout(this.msgTimer);
      this.msgTimer = null;
    }

    if (this.message) {
      this.message = null;

      this.triggerUpdate();
    }
  }

  setError(s: string) {
    //    let view = this;
    this.msgTimer = setTimeout(() => {
      this.message = s;
      this.triggerUpdate();
    }, 350);
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
        onFocus={(_evt: Event) => this.focus()}
        onBlur={(_evt: Event) => this.blur()}
      >
        {this.renderLabel()}
        {(this.$field = this.renderProp())}
      </div>
    );
  }

  /**
   * Renders label.
   */
  renderLabel() {
    return <label class="label has-text-white">{this.ui.label}</label>;
  }

  /**
   * Renders message.
   */
  protected $message: any;
  renderMessage() {
    if (this.message) {
      return <p class="field--warning">{this.message}</p>;
    } /*else if (this.ui.hint) {
      return <p class="help is-info">{this.ui.hint}</p>;
    }*/
  }

  enumValueChanged(evt: any, propInfo: IEnumSchemaProp) {
    try {
      this.clearError();
      let value = (evt.target as HTMLInputElement).value;

      propInfo.validator(value, propInfo);

      this.value = value;
    } catch (e) {
      this.setError((e as Error).message);
    }
  }

  stringValueChanged(evt: any, propInfo: IStringSchemaProp) {
    try {
      this.clearError();
      let value = (evt.target as HTMLInputElement).value;

      propInfo.validator(value, propInfo);

      this.value = value;
    } catch (e) {
      this.setError((e as Error).message);
    }
  }

  private byteFormat: any;

  byteValueChanged(evt: Event, propInfo: IBytesSchemaProp) {
    this.clearError();
    let valueAsString = (evt.target as HTMLInputElement).value;

    try {
      let value = ByteArray.fromString(valueAsString, this.byteFormat);

      propInfo.validator(value, propInfo);

      this.value = value;
    } catch (e) {
      this.setError((e as Error).message);
    }
  }

  boolValueChanged(evt: Event, propInfo: IBooleanSchemaProp) {
    this.clearError();

    let $el = evt.currentTarget as HTMLInputElement;

    try {
      let value = $el.value != "false";

      propInfo.validator(value, propInfo);

      this.value = value;
    } catch (e) {
      this.setError((e as Error).message);
    }
  }

  renderBoolean(propInfo: IBooleanSchemaProp, value: boolean) {
    let view = this;

    if (this.ui.widget === "radio") {
      const options = {
        false: propInfo.falseLabel || "false",
        true: propInfo.trueLabel || "true"
      };
      const $$radio = [];

      // render each option
      Object.entries(options).map(([key, label]) => {
        let isTrueOption = key != "false";

        const $radio = (
          <span>
            <input
              type="radio"
              name="radio"
              value={isTrueOption}
              id={"radio-" + key}
              checked={isTrueOption == value}
              onChange={(evt: Event) => view.boolValueChanged(evt, propInfo)}
            />
            <label htmlFor={"radio-" + key} style="text-transform: uppercase">
              {label}
            </label>
          </span>
        );

        $$radio.push($radio);
      });

      return (
        <div class="control">
          <div class="radio">{$$radio}</div>
        </div>
      );
    }

    return (
      <div class="control has-icons-right">
        <label class="checkbox">
          <input
            type="checkbox"
            value={this.value}
            onChange={(evt: Event) => view.boolValueChanged(evt, propInfo)}
            checked={value}
          />
          {propInfo.title}
        </label>
      </div>
    );
  }

  renderEnum(propInfo: IEnumSchemaProp, value: string) {
    let view = this;

    if (this.ui.widget === "radio") {
      const $$radio = [];

      // render each option
      Object.entries(propInfo.options).map(([key, label]) => {
        let checked =
          key.toLowerCase() == value.toLowerCase() ? "true" : undefined;

        const $radio = (
          <label class="radio">
            <input
              type="radio"
              name={this.propRef.key}
              value={key}
              onChange={(evt: Event) => view.enumValueChanged(evt, propInfo)}
              checked={checked}
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
        let selected =
          key.toLowerCase() == value.toLowerCase() ? "true" : undefined;

        return (
          <option value={key} title={label || ""} selected={selected}>
            {label}
          </option>
        );
      });

      if (value == "") {
        $options.unshift(
          <option value="" selected disabled hidden>
            Choose here
          </option>
        );
      }
      //<option value="" selected disabled hidden>Choose here</option>

      return (
        <div class="control">
          <span class="select" style="width: 100%">
            <select
              onChange={(evt: Event) => view.enumValueChanged(evt, propInfo)}
              class="input"
              placeholder={this.ui.hint}
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

  renderBytes(propInfo: IBytesSchemaProp, value: ByteArray) {
    let view = this;

    let $inner: HTMLElement;

    this.byteFormat = (this.options["format"] || "hex").toLowerCase();

    const valString = ByteArray.toString(value, this.byteFormat);

    if (this.ui.widget == "multiline") {
      let lines = (this.ui as any).lines;
      let rows = lines != null ? lines || 5 : undefined;

      $inner = (
        <textarea
          class="textarea bytes"
          spellcheck="false"
          onInput={(evt: Event) => view.byteValueChanged(evt, propInfo)}
          onFocus={(_evt: Event) => this.focus()}
          onBlur={(_evt: Event) => this.blur()}
          placeholder={this.ui.hint}
          rows={rows}
          value={valString}
        />
      ).element;
    } else {
      $inner = (
        <input
          class="input bytes"
          type="text"
          spellcheck="false"
          onInput={(evt: Event) => view.byteValueChanged(evt, propInfo)}
          onFocus={(_evt: Event) => this.focus()}
          onBlur={(_evt: Event) => this.blur()}
          placeholder={this.ui.hint}
          value={valString}
        />
      ).element;
    }

    if (this.ui["readOnly"]) {
      $inner.setAttribute("readonly", "true");
    }

    return (
      <div class="control">
        {this.children.length > 0 && (
          <div class="byte-property-buttons buttons is-unselectable">
            {this.children}
          </div>
        )}
        {$inner}
      </div>
    );
  }

  renderString(propInfo: IStringSchemaProp, value: string) {
    let view = this;

    let $inner: HTMLElement;

    if (this.ui.widget == "multiline") {
      let lines = (this.ui as any).lines;
      let rows = lines != null ? lines || 5 : undefined;

      $inner = (
        <textarea
          class="textarea text"
          spellcheck="false"
          onChange={(evt: Event) => view.stringValueChanged(evt, propInfo)}
          onKeyUp={(evt: Event) => view.stringValueChanged(evt, propInfo)}
          onFocus={(_evt: Event) => this.focus()}
          onBlur={(_evt: Event) => this.blur()}
          placeholder={this.ui.hint}
          rows={rows}
          value={value || ""}
          readonly={this.ui["readOnly"]}
        />
      );
    } else {
      $inner = (
        <input
          class="input text"
          type="text"
          spellcheck="false"
          onChange={(evt: Event) => view.stringValueChanged(evt, propInfo)}
          onKeyUp={(evt: Event) => view.stringValueChanged(evt, propInfo)}
          onFocus={(_evt: Event) => this.focus()}
          onBlur={(_evt: Event) => this.blur()}
          placeholder={this.ui.hint}
          value={value || ""}
          readonly={this.ui["readOnly"]}
        />
      );
    }

    //if (this.ui["readOnly"]) {
    //  $inner.setAttribute("readonly", "true");
    //}

    return <div class="control">{$inner}</div>;
  }

  renderProp() {
    let view = this;

    const value = this.value;
    const propInfo = this.propRef.propertyType;

    switch (propInfo.type) {
      case "number":
        return (
          <div class="control xxhas-icons-right">
            <input
              class="input"
              type="number"
              onChange={(evt: Event) => view.stringValueChanged(evt, propInfo)}
              onFocus={(_evt: Event) => this.focus()}
              onBlur={(_evt: Event) => this.blur()}
              placeholder={this.ui.hint}
              value={value || "0"}
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
    const $field = this.element as HTMLElement;

    // Set focus modifier
    //$field.classList.toggle("field--focus", this.hasFocus);

    // Add invalid modifier
    $field.classList.toggle("field--invalid", !true || !!this.message);

    // Remove old message, if any
    if (this.$message) {
      this.$message.element.remove();
      this.$message = null;
    }

    // Create new message, if any
    this.$message = this.renderMessage();
    if (this.$message) {
      //this.element.appendChild(this.$message.element);
      $field.children[1].appendChild(this.$message.element);
    }

    return false;
  }

  viewFocused() {
    //  this.triggerUpdate();
  }
  viewBlurred() {
    //  this.triggerUpdate();
  }
}
