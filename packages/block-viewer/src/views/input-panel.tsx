import { ByteArray, H2BA, BA2H } from "@cryptographix/core";
import { View } from "@cryptographix/dom-view";
import { IActionHandler, Action } from "@cryptographix/core";

export class InputPanel extends View {
  protected readonly target: IActionHandler;
  protected value: ByteArray;

  constructor(target: IActionHandler, initValue?: ByteArray) {
    super();
    this.target = target;
    this.value = initValue ? initValue : ByteArray.from([]);
  }

  inputValueChanged(evt: Event) {
    let value = (evt.target as HTMLInputElement).value;
    try {
      let byteValue = H2BA(value);

      let act = new class extends Action {
        type: "input";
        data = {
          in: byteValue
        };
      }(this.target);

      act.dispatch();
    } catch (E) {
      //this.setError("fudeo");
    }
  }

  render() {
    return (
      <div class="field">
        <div class="control">
          <textarea
            class="textarea"
            spellcheck="false"
            onInput={this.inputValueChanged.bind(this)}
            onFocus={(_evt: Event) => this.focus()}
            onBlur={(_evt: Event) => this.blur()}
            placeholder="Byte input"
            value={BA2H(this.value)}
          />
        </div>
      </div>
    );
  }
}
