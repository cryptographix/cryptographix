import { createElement } from "./helpers";

export interface View<TParentView extends View<any> = any> {
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
  layoutView(): void;

  /**
   * Triggered when view receives focus.
   */
  viewFocused?(): void;

  /**
   * Triggered when view loses focus.
   */
  viewBlurred?(): void;
}

/**
 * Represents a rectangular area on the screen
 * and manages the content in that area.
 */
export abstract class View<TParentView extends View<any> = any> {
  static createElement = createElement;

  _$element: HTMLElement = null;
  _parentView: TParentView = null;
  _childViews: View<any>[] = [];
  _focus = false;
  _needsUpdate = false;

  get element() {
    return this._$element ? this._$element : (this._$element = this.render());
  }

  /**
   * Updates this view at next frame.
   * Fluent interface
   */
  triggerUpdate() {
    let refresh = true;

    if (!this._needsUpdate) {
      this._needsUpdate = true;
      window.requestAnimationFrame(() => {
        this._needsUpdate = false;

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
   * Fluent interface
   */
  refresh() {
    const $oldElement = this._$element;

    // Only rerender if already bound
    if ($oldElement) {
      // force re-render
      this._$element = null;

      const $el = this.element;

      // replace root node in dom
      if ($oldElement && $oldElement.parentNode) {
        $oldElement.parentNode.replaceChild($el, $oldElement);
      }
    }

    return this;
  }

  /**
   * Add child View.
   * Fluent interface
   */
  addChildView(view: View, nextView?: View) {
    // make sure view is detached
    if (this._parentView !== null) {
      this._parentView.removeChildView(this);
    }

    // Render and insert into DOM
    if (this._$element) {
      let $newChild = view.render();

      if (nextView) {
        this.element.insertBefore($newChild, nextView.element);
      } else this._$element.appendChild($newChild);
    }

    view._parentView = this;

    this._childViews.push(view);
  }

  /**
   * Returns child views.
   */
  get children(): View[] {
    return this._childViews;
  }

  /**
   * Render all child Views
   *
   * Helper for use within render functions, passed as 3rd param to createElement
   */
  protected renderChildViews(): HTMLElement[] {
    let result = [];

    this.children.forEach(child => {
      result.push(child.element);
    });

    return result;
  }

  /**
   * Remove child View.
   * Fluent interface
   */
  removeChildView(view: View) {
    const index = this._childViews.indexOf(view);

    if (index !== -1) {
      const $element = this._$element;

      this._childViews.splice(index, 1);
      view._parentView = null;

      if ($element.parentNode) {
        // Remove from DOM!
        $element.parentNode.removeChild($element);
      }
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
   * Fluent interface
   */
  focus() {
    return this.setFocus(true);
  }

  /**
   * Release this view's focus.
   * Fluent interface
   */
  blur() {
    return this.setFocus(false);
  }

  /**
   * Sets focus.
   * Fluent interface
   */
  private setFocus(focus: boolean) {
    if (focus !== this._focus) {
      this._focus = focus;
      if (focus) {
        // inform superview
        if (this._parentView) {
          //this._parentView.subviewDidFocus(this);
        }
        this.viewFocused && this.viewFocused();
      } else {
        // blur subviews
        this._childViews.forEach(subview => subview.blur());
        this.viewBlurred && this.viewBlurred();
      }
    }

    return this;
  }

  /**
   * Returns true, if view or one of the subviews has focus.
   */
  hasFocus() {
    return this._focus;
  }

  /*****************************************************************************
   *
   * Methods to be overridden by subclasses
   *
   ****************************************************************************/

  /**
   * Renders the view.
   */
  public abstract render(): HTMLElement;

  /**
   * Handle viewport updates
   */
  public layoutView(): void {
    this.children.forEach(child => child.layoutView());
  }
}
