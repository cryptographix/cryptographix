import { View } from "../view-core/index";
import { PropertyListView } from "./property-list-view";

import {
  ISchemaPropertyType,
  IBooleanSchemaProp,
  IEnumSchemaProp,
  ISchemaPropUI
} from "@cryptographix/core";
import { BA2H, H2BA } from "@cryptographix/core";

export class PropertyView extends View<PropertyListView> {
  //
  protected _$field: HTMLElement;

  //
  protected _ui: ISchemaPropUI;

  //
  protected _message: string;

  constructor(
    public target: object,
    public key: string,
    public propInfo: ISchemaPropertyType
  ) {
    super();

    this._ui = {
      hint: "",
      widget: "",
      columns: 12,
      style: "",
      className: "",
      label: this.propInfo.title || this.key,
      ...propInfo.ui
    };
  }

  clearError() {
    if (this._message) {
      this.triggerUpdate();
      this._message = null;
    }
  }
  setError(s: string) {
    this._message = s;
    this.triggerUpdate();
  }

  _first = false;
  render() {
    const errClass = this._message ? " field--invalid" : "";
    //TODO: first
    return (
      <div
        class={`field ${errClass} ${this._ui.className} ${
          this._first ? " setting--first" : ""
        }`}
        onFocus={(_evt: Event) => this.focus()}
        onBlur={(_evt: Event) => this.blur()}
      >
        {this.renderLabel()}
        {(this._$field = this.renderProp())}
        {(this._$message = this.renderMessage())}
      </div>
    );
  }

  /**
   * Renders label.
   */
  renderLabel() {
    return <label class="label">{this._ui.label}</label>;
  }

  /**
   * Renders message.
   */
  _$message: any;
  renderMessage() {
    if (this._message) {
      return <p class="help is-danger">{this._message}</p>;
    } else if (this._ui.hint) {
      return <p class="help is-info">{this._ui.hint}</p>;
    }
  }

  notifyValueChanged(key: string) {
    this._parentView.propertyUpdated(key);
  }

  stringValueChanged(evt: any) {
    this.clearError();
    let value = (evt.target as HTMLInputElement).value;
    this.target[this.key] = value;
    this.notifyValueChanged(this.key);
  }

  getId() {
    return this.key;
  }

  byteValueChanged(evt: Event) {
    this.clearError();
    let value = (evt.target as HTMLInputElement).value;
    try {
      this.target[this.key] = H2BA(value);
      this.notifyValueChanged(this.key);
    } catch (E) {
      this.setError("fudeo");
    }
  }

  boolValueChanged(evt: Event) {
    this.clearError();
    let value = (evt.target as HTMLInputElement).checked;

    this.target[this.key] = value;
    this.notifyValueChanged(this.key);
  }

  renderBoolean(propInfo: IBooleanSchemaProp, value: boolean) {
    return (
      <div class="control has-icons-right">
        <label class="checkbox">
          <input
            type="checkbox"
            value={this.target[this.key]}
            onChange={this.boolValueChanged.bind(this)}
            checked={value}
          />
          {propInfo.title}
        </label>
      </div>
    );
  }

  renderEnum(propInfo: IEnumSchemaProp, value: string) {
    if (this._ui.widget === "radio") {
      const $$radio = [];

      // render each option
      Object.entries(propInfo.options).map(([key, label]) => {
        const $radio = (
          <label class="radio">
            <input
              type="radio"
              name={this.getId()}
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
        <div class="control has-icons-right">
          <span class="select" style="width: 100%">
            <select
              //onclick={this.valueDidChange}
              onChange={this.stringValueChanged.bind(this)}
              class="input"
              placeholder="Enum input"
              value={this.target[this.key]}
              onFocus={(_evt: Event) => this.focus()}
              onBlur={(_evt: Event) => this.blur()}
            >
              {$options}
            </select>
          </span>
          <span class="icon is-small is-right">
            <i class="fas fa-check" />
          </span>
        </div>
      );
    }
  }

  renderProp() {
    const value = this.target[this.key];

    switch (this.propInfo.type) {
      case "number":
        return (
          <div class="control has-icons-right">
            <input
              class="input"
              type="number"
              onChange={this.stringValueChanged.bind(this)}
              onFocus={(_evt: Event) => this.focus()}
              onBlur={(_evt: Event) => this.blur()}
              placeholder="Num input"
              value={value}
            />
          </div>
        );

      case "string":
        return (
          <div class="control has-icons-right">
            <input
              class="input"
              type="text"
              onChange={this.stringValueChanged.bind(this)}
              onFocus={(_evt: Event) => this.focus()}
              onBlur={(_evt: Event) => this.blur()}
              placeholder="Text input"
              value={value}
            />
          </div>
        );

      case "enum":
        return this.renderEnum(this.propInfo, value);

      case "boolean":
        return this.renderBoolean(this.propInfo, value);

      case "bytes":
        return (
          <div class="control has-icons-right">
            <input
              class="input"
              type="text"
              spellcheck="false"
              onInput={this.byteValueChanged.bind(this)}
              onFocus={(_evt: Event) => this.focus()}
              onBlur={(_evt: Event) => this.blur()}
              placeholder="Byte input"
              value={BA2H(value)}
            />
          </div>
        );
    }
  }

  updateView(): boolean {
    const $field = this.element;

    // Set focus modifier
    $field.classList.toggle("field--focus", this.hasFocus());

    // Add invalid modifier
    $field.classList.toggle("field--invalid", !true || !!this._message);

    // Remove old message, if any
    if (this._$message) {
      this._$message.remove();
      this._$message = null;
    }

    // Create new message, if any
    this._$message = this.renderMessage();
    if (this._$message) {
      this.element.appendChild(this._$message);
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
