/**
 * Creates element with given tag, attributes and children.
 */
export function createElement(
  type: string,
  attributes?: object,
  ...children: (HTMLElement | string | object)[]
): HTMLElement {
  const nonStandardAttributes = {
    class: "class",
    role: "role",
    ariaHidden: "aria-hidden",
    ariaLabel: "aria-label"
  };

  const $element = document.createElement(type);

  // set element attributes
  Object.keys(attributes || {}).forEach(name => {
    const value = attributes[name];

    if (value != undefined) {
      if (!nonStandardAttributes[name]) {
        // set data- attributes on dataset property
        if (name.indexOf("data-") === 0) {
          $element.dataset[name.slice(5)] = value;
        } else {
          // set normal attributes on element

          // lowercase event attribute name
          const attributeName =
            name.indexOf("on") === 0 ? name.toLowerCase() : name;

          $element[attributeName] = value;
        }
      } else {
        // set non-standard attribute
        $element.setAttribute(nonStandardAttributes[name], value);
      }
    }
  });

  children.forEach($child => {
    if ($child) {
      if (typeof $child === "string")
        $element.appendChild(document.createTextNode($child));
      else if ($child instanceof HTMLElement) $element.appendChild($child);
      else {
        Object.entries($child).forEach(([_key, $item]) => {
          $element.appendChild($item);
        });
      }
    }
  });
  //else if (children) $element.appendChild(children);

  return $element;
}
