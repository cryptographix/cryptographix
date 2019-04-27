import { IConstructable } from "../index";
import { View, ViewParams } from "./view";

const svgElements = {
  circle: true,
  clipPath: true,
  defs: true,
  ellipse: true,
  g: true,
  image: true,
  line: true,
  linearGradient: true,
  mask: true,
  path: true,
  pattern: true,
  polygon: true,
  polyline: true,
  radialGradient: true,
  rect: true,
  stop: true,
  svg: true,
  text: true,
  tspan: true
};

export const Fragment = (attributes: ViewParams) => {
  let $node = document.createDocumentFragment();

  if (attributes.children) {
    attributes.children.forEach($item => {
      View.appendChildNode($node, $item);
    });

    return $node;
  }
};

type FunctionView<VP extends ViewParams = any> = (_props: VP) => View.ViewNode;

const attribAliasMap = {
  htmlFor: "for",
  class: "class",
  className: "class",
  role: "role",
  ariaHidden: "aria-hidden",
  ariaLabel: "aria-label",
  defaultValue: "value",
  defaultChecked: "checked"
};

/**
 * Creates element with given tag, attributes and children.
 */
export function createElement(
  type: string | IConstructable<View> | FunctionView,
  attributes?: object,
  ...children: (View.ChildNode)[]
): View.ViewNode {
  attributes = attributes || {};

  let $node: View.ViewNode;

  // Component (class or Function)
  if (typeof type == "function") {
    // Pass children (if attributes has none)
    if (attributes["children"] === undefined)
      attributes = { ...attributes, children: children };

    // Class-style View must have render method
    if (type.prototype && type.prototype.render) {
      let view = new (type as IConstructable<View>)(attributes);
      type = (type as IConstructable).name;

      // Implement "ref" attribute (from UIBuilder)
      const ref = attributes["ref"];
      if (ref) {
        if (typeof ref === "function") {
          ref(view);
        } else {
          throw new Error("'ref' must be a function");
        }
      }

      // render-it
      $node = view.element;
    } else {
      // simple function
      $node = (type as FunctionView)(attributes || {});
      type = (type as Function).name;
    }
  } else {
    // Create HTML or SVG element
    let $element = svgElements.hasOwnProperty(type)
      ? document.createElementNS("http://www.w3.org/2000/svg", type)
      : document.createElement(type);

    // set element attributes
    Object.entries(attributes)
      // ignore null/undefined attributes
      .filter(([_key, value]) => value != null)
      // map 'alias' names
      .map(([name, value]) => {
        return [
          attribAliasMap.hasOwnProperty(name) ? attribAliasMap[name] : name,
          value
        ];
      })
      // lowercase event attribute name
      .map(([name, value]) => {
        return [name.indexOf("on") === 0 ? name.toLowerCase() : name, value];
      })
      .forEach(([name, value]) => {
        if (name === "ref") {
          // UIBuilder-style refs
          if (typeof value === "function") {
            value($element);
          } else {
            throw new Error("'ref' must be a function");
          }
        } else if (name.indexOf("data-") === 0) {
          // Example: <div data-element=.../> - must set on dataset property
          $element.dataset[name.slice(5)] = value;
        } else if (name === "style" && typeof value === "object") {
          // Example: <div style={{height: "20px"}}></div>
          for (const styleName in value) {
            $element.style[styleName] = value[styleName];
          }
        } else if (name in $element && typeof value === "object") {
          // pass object-valued attributes to Web Components
          $element[name] = value; // value is set without any type conversion
          /*} else if (eventMap.hasOwnProperty(prop)) {
          node[eventMap[prop]] = value; } */
        } else if (typeof value === "function") {
          $element.addEventListener(name, value);
        } else {
          // set normal attributes on element
          $element.setAttribute(name, value);
        }
      });

    children.forEach($item => {
      View.appendChildNode($element, $item);
    });

    $node = $element;
  }

  return $node;
}

// From: UIBuilder
/*
const attribMap = {
  htmlFor: "for",
  className: "class",
  defaultValue: "value",
  defaultChecked: "checked"
};

const eventMap = {
  // Clipboard events
  onCopy: "oncopy",
  onCut: "oncut",
  onPaste: "onpaste",
  // Keyboard events
  onKeyDown: "onkeydown",
  onKeyPress: "onkeypress",
  onKeyUp: "onkeyup",
  // Focus events
  onFocus: "onfocus",
  onBlur: "onblur",
  // Form events
  onChange: "onchange",
  onInput: "oninput",
  onSubmit: "onsubmit",
  // Mouse events
  onClick: "onclick",
  onContextMenu: "oncontextmenu",
  onDoubleClick: "ondblclick",
  onDrag: "ondrag",
  onDragEnd: "ondragend",
  onDragEnter: "ondragenter",
  onDragExit: "ondragexit",
  onDragLeave: "ondragleave",
  onDragOver: "ondragover",
  onDragStart: "ondragstart",
  onDrop: "ondrop",
  onMouseDown: "onmousedown",
  onMouseEnter: "onmouseenter",
  onMouseLeave: "onmouseleave",
  onMouseMove: "onmousemove",
  onMouseOut: "onmouseout",
  onMouseOver: "onmouseover",
  onMouseUp: "onmouseup",
  // Selection events
  onSelect: "onselect",
  // Touch events
  onTouchCancel: "ontouchcancel",
  onTouchEnd: "ontouchend",
  onTouchMove: "ontouchmove",
  onTouchStart: "ontouchstart",
  // UI events
  onScroll: "onscroll",
  // Wheel events
  onWheel: "onwheel",
  // Media events
  onAbort: "onabort",
  onCanPlay: "oncanplay",
  onCanPlayThrough: "oncanplaythrough",
  onDurationChange: "ondurationchange",
  onEmptied: "onemptied",
  onEncrypted: "onencrypted",
  onEnded: "onended",
  onLoadedData: "onloadeddata",
  onLoadedMetadata: "onloadedmetadata",
  onLoadStart: "onloadstart",
  onPause: "onpause",
  onPlay: "onplay",
  onPlaying: "onplaying",
  onProgress: "onprogress",
  onRateChange: "onratechange",
  onSeeked: "onseeked",
  onSeeking: "onseeking",
  onStalled: "onstalled",
  onSuspend: "onsuspend",
  onTimeUpdate: "ontimeupdate",
  onVolumeChange: "onvolumechange",
  onWaiting: "onwaiting",
  // Image events
  onLoad: "onload",
  onError: "onerror"
};

export class Component<P> {
  constructor(protected props: P) {}

  public render(): Element {
    return null;
  }
}

export interface Props<T> {
  children?: any;
  ref?: (instance: T) => void;
}

type FP<P> = (_props: P) => Element;

function clone<T>(obj: T): T {
  let target = <T>{};
  for (const field in obj) {
    if (obj.hasOwnProperty(field)) {
      target[field] = obj[field];
    }
  }
  return target;
}

export function xcreateElement<P extends Props<Component<P>>>(
  type: string | IConstructable<Component<P>> | FP<P>,
  props: P,
  ...children: any[]
): View.Element | View.Element[] {
  props = props || <P>{};
  let node: View.Element;
  if (type === Fragment) {
    return children;
  } else if (typeof type === "function") {
    // Is it a component class or a functional component?
    const _props = clone(props);
    _props.children = children;
    if (type.prototype.render) {
      // Is it a component class?
      const component: Component<P> = new (type as IConstructable<
        Component<P>
      >)(_props);
      node = component.render();
      applyComponentProps<P>(component, props);
    } else {
      // It is a functional component
      node = (<FP<P>>type)(_props);
    }
  } else {
    // It is an HTML or SVG element
    if (svgElements[type]) {
      node = document.createElementNS("http://www.w3.org/2000/svg", type);
    } else {
      node = document.createElement(type);
    }
    applyElementProps(node, props);
    appendChildrenRecursively(node, children);
  }
  return node;
}

function appendChildrenRecursively(node: View.Element, children: any[]): void {
  for (const child of children) {
    if (child instanceof Node) {
      // Is it an HTML or SVG element?
      node.appendChild(child);
    } else if (Array.isArray(child)) {
      // example: <div>{items}</div>
      appendChildrenRecursively(node, child);
    } else if (child === false) {
      // The value false is ignored, to allow conditional display using && operator
    } else if (child != null) {
      // if item is not null or undefined
      node.appendChild(document.createTextNode(child));
    }
  }
}

function applyElementProps(node: View.Element, props: Object): void {
  for (const prop in props) {
    const value = props[prop];
    if (value == null)
      // if value is null or undefined
      continue;
    if (prop === "ref") {
      if (typeof value === "function") {
        value(node);
      } else {
        throw new Error("'ref' must be a function");
      }
    } else if (eventMap.hasOwnProperty(prop)) {
      node[eventMap[prop]] = value;
    } else if (typeof value === "function") {
      node.addEventListener(prop, value);
    } else if (prop === "style" && typeof value === "object") {
      // Example: <div style={{height: "20px"}}></div>
      for (const styleName in value) {
        (<HTMLElement>node).style[styleName] = value[styleName];
      }
    } else {
      const name = attribMap.hasOwnProperty(prop) ? attribMap[prop] : prop;
      if (name in node && typeof value === "object") {
        // pass object-valued attributes to Web Components
        node[name] = value; // value is set without any type conversion
      } else {
        node.setAttribute(name, value); // value will be converted to string
      }
    }
  }
}

function applyComponentProps<P>(component: Component<P>, props: Object): void {
  const ref = props["ref"];
  if (ref) {
    if (typeof ref === "function") {
      ref(component);
    } else {
      throw new Error("'ref' must be a function");
    }
  }
}
*/
