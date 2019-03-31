import { View } from "../view-core/index";

export class RootView extends View {
  bindRoot($element: HTMLElement) {
    this._$element = $element;
  }

  render() {
    // Render children into DOM
    const $childElements = this.renderChildren();
    Object.entries($childElements).forEach(([_key, $item]) => {
      this._$element.appendChild($item);
    });

    return this._$element;
  }
}
