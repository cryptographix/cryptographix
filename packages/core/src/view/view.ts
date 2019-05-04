import { Writable } from "../schema/index";
import { IActionHandler } from "../dispatcher/action";
import * as Helpers from "./helpers";

export interface View {
  /**
   * Renders the view.
   */
  //render?(): HTMLElement;

  /**
   * Update view on 'model' change
   */
  updateView?(): boolean;

  /**
   * Handle viewport updates
   */
  layoutView(): this;

  /**
   * Triggered when view receives focus.
   */
  viewFocused?(): void;

  /**
   * Triggered when view loses focus.
   */
  viewBlurred?(): void;
}

export interface ViewParams<T = any> {
  handler?: IActionHandler;
  children?: View.ViewNode[];
  ref?: (instance: T) => void;
}

/**
 * Represents a rectangular area on the screen
 * and manages the content in that area.
 */
export abstract class View<TViewParams extends ViewParams = ViewParams> {
  readonly handler: IActionHandler = null;

  $element: View.ViewNode = null;
  parentView: View = null;
  readonly childViews: View<any>[] = [];
  hasFocus = false;
  needsUpdate = false;

  static viewCount = 0;
  constructor(params?: TViewParams) {
    const { handler = undefined } = params || {};

    this.handler = handler;

    console.log("++Views:", ++View.viewCount);
  }

  destroy() {
    Writable(this).handler = null;

    this.childViews.forEach(this.removeChildView);
    console.log("--Views:", --View.viewCount);
  }

  get element() {
    let $element = this.$element || (this.$element = this.render());

    if ($element instanceof View) {
      this.$element = $element.element;

      (($element as unknown) as View).destroy();
    }

    return this.$element;
  }

  /**
   * Updates this view at next frame.
   * @fluent
   */
  triggerUpdate() {
    let refresh = true;

    if (!this.needsUpdate) {
      this.needsUpdate = true;
      window.requestAnimationFrame(() => {
        this.needsUpdate = false;

        if (this.updateView) {
          refresh = this.updateView();
        }
        if (refresh) this.refresh();
      });
    }

    return this;
  }

  /**
   * Rerenders the view.
   * @fluent
   */
  refresh() {
    const $oldElement = this.element;

    // Only rerender if already bound
    if ($oldElement) {
      // force re-render
      this.$element = null;

      const $el = this.element;

      if (!this.parentView && !$oldElement.parentNode) {
        // Root view .. remount
        View.mount($oldElement, this);
      } else {
        if ($oldElement && $oldElement.parentNode) {
          let $parentNode = $oldElement.parentNode;

          if ($el) $parentNode.replaceChild($el, $oldElement);
          else $parentNode.removeChild($oldElement);
        }
      }
    }

    return this;
  }

  /**
   * Add child View.
   * Fluent interface
   */
  addChildView(view: View, nextView?: View) {
    if (!view) return this;

    // make sure view is detached
    if (this.parentView !== null) {
      this.parentView.removeChildView(this);
    }

    const $element = this.$element;

    // Render child and insert into DOM
    // .. only insert if we're already rendered
    if ($element) {
      let $newChild = view.render();

      if ($newChild) {
        if (nextView && nextView.element) {
          $element.insertBefore($newChild, nextView.element);
        } else $element.appendChild($newChild);
      }
    }

    view.parentView = this;

    this.childViews.push(view);

    return this;
  }

  /**
   * Returns child views.
   */
  get children(): View[] {
    return this.childViews;
  }

  /**
   * Render all child Views
   *
   * Helper for use within render functions, passed as 3rd param to createElement
   */
  protected renderChildViews(): View.ViewNode[] {
    return View.renderViews(this.children);
  }

  /**
   * Remove child View.
   * Fluent interface
   */
  removeChildView(view: View) {
    const index = this.childViews.indexOf(view);

    if (index !== -1) {
      const $element = this.$element;

      this.childViews.splice(index, 1);
      view.parentView = null;

      if ($element && $element.parentNode) {
        // Remove from DOM!
        $element.parentNode.removeChild($element);
      }

      view.destroy();
    }

    return this;
  }

  /*****************************************************************************
   *
   * Focus/Blur handling
   *
   ****************************************************************************/

  /**
   * Focus this view.
   * @fluent
   */
  focus() {
    return this.setFocus(true);
  }

  /**
   * Release this view's focus.
   * @fluent
   */
  blur() {
    return this.setFocus(false);
  }

  /**
   * Sets focus.
   * @fluent
   */
  private setFocus(focus: boolean) {
    if (focus !== this.hasFocus) {
      this.hasFocus = focus;
      if (focus) {
        // inform superview
        if (this.parentView) {
          //this.parentView.subviewDidFocus(this);
        }
        this.viewFocused && this.viewFocused();
      } else {
        // blur subviews
        this.childViews.forEach(subview => subview.blur());
        this.viewBlurred && this.viewBlurred();
      }
    }

    return this;
  }

  /*****************************************************************************
   *
   * Methods to be overridden by subclasses
   *
   ****************************************************************************/

  /**
   * Renders the view.
   */
  protected abstract render(): View.ViewNode;

  /**
   * Handle viewport updates
   * @fluent
   */
  public layoutView(): this {
    this.children.forEach(child => child.layoutView());

    return this;
  }
}

export namespace View {
  export type ViewNode = HTMLElement | SVGElement;

  export type ChildNode =
    | HTMLElement
    | SVGElement
    | DocumentFragment
    | View
    | string
    | boolean
    | undefined;

  export const Fragment = Helpers.Fragment;
  export const createElement = Helpers.createElement;

  /**
   * Render multiple views
   */
  export function renderViews(views: Iterable<View>): HTMLElement[] {
    let result = [];

    for (let view of views) {
      result.push(view.element);
    }

    return result;
  }

  /*export function addChildren($element: ViewNode, children: ChildNode[]) {
    //View.appendChildNode
    children.forEach($child => {
      if ($child instanceof Element) {
        // example:
        $element.appendChild($child);
      } else if (typeof $child === "string") {
        $element.appendChild(document.createTextNode($child));
      } else if (Array.isArray($child)) {
        // example: <div>{items}</div>
        addChildren($element, $child);
      } else if ($child === false) {
        // allow conditional display using && operator
      }
    });
  }*/

  /**
   * Append a child onto a DOM Node
   *
   */
  export function appendChild($node: Node, $child: ChildNode | ChildNode[]) {
    if ($child instanceof View) {
      // Lazy view rendering .. its render time ..
      $node.appendChild($child.element);
    } else if ($child instanceof Node) {
      // .. a DOM node .. just append it
      $node.appendChild($child);
    } else if (typeof $child == "string") {
      // .. a string .. must create a DOM TextNode
      $node.appendChild(document.createTextNode($child));
    } else if (Array.isArray($child)) {
      // .. an array .. append all elements
      // example: <div>{items}</div>
      Array.from($child).forEach($item => {
        appendChild($node, $item);
      });
    } else if ($child === false) {
      // ... allow conditional display using && operator
    }
  }

  /**
   * Mount a View onto a DOM node
   */
  export function mount(
    $rootElement: HTMLElement | SVGElement,
    rootView: View
  ) {
    let $root = rootView.element;

    // Cleanup
    while ($rootElement.lastChild) {
      $rootElement.removeChild($rootElement.lastChild);
    }

    // Gotta have something to mount!
    if (!$root) return;
    /*
if ($root instanceof DocumentFragment) {
  let $fake = document.createElement("View");
  appendChild($fake, $root);

  rootView.$element = $fake;

  $root = $fake;
}

*/
    $rootElement.appendChild($root);
  }
}

export class ElementView extends View {
  constructor($el: View.ViewNode | View) {
    super();

    if ($el instanceof View) this.$element = $el.element;
    else this.$element = $el;
  }

  render() {
    return this.$element;
  }
}
