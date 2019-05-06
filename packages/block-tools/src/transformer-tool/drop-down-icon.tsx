import { View } from "@cryptographix/core";

/**
 *
 */
export class DropdownIcon extends View {
  options = ["HEX", "BASE64", "UTF8"];
  onChangeCallback: (option: string) => void;

  constructor(props: {
    onChange: (option: string) => void;
    options: string[];
  }) {
    super();

    this.options = props.options;

    this.option = props.options[0];

    this.onChangeCallback = props.onChange;
  }

  option: string;

  onChange(evt: Event) {
    this.option = evt.target["title"];

    if (this.onChangeCallback) this.onChangeCallback(this.option);

    this.refresh();
  }

  render() {
    return (
      <a
        class="icon has-text-white has-dropdown is-unselectable"
        title="Input Format"
      >
        <span class="is-unselectable" style="padding-right: 5px">
          {this.option}
        </span>
        <ul class="byte-property-dropdown">
          {this.options.map(opt => (
            <li title={opt} onclick={this.onChange.bind(this)}>
              {opt}
            </li>
          ))}
        </ul>
      </a>
    );
  }
}
