import { View } from "@cryptographix/core";

export class RootView extends View {
  constructor($element: HTMLElement) {
    super();

    this.$element = $element;
  }

  render() {
    // Render children into DOM
    const $childElements = this.renderChildViews();
    Object.entries($childElements).forEach(([_key, $item]) => {
      this.$element.appendChild($item);
    });

    return this.$element;
  }
}
