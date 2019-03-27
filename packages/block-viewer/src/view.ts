const nonStandardAttributes = {
  class: "class",
  role: "role",
  ariaHidden: "aria-hidden",
  ariaLabel: "aria-label"
};

/**
 * Represents a rectangular area on the screen
 * and manages the content in that area.
 */
export class View {
  _$root: Element = null;
  _superview: View = null;
  _subviews: View[] = [];
  _model: object = null;
  _focus = false;
  _needsUpdate = false;

  /**
   * Creates element with given tag, attributes and children.
   */
  static createElement(
    type: string,
    attributes?: object,
    ...children: (HTMLElement | string)[]
  ): HTMLElement {
    const $element = document.createElement(type);

    // set element attributes
    Object.keys(attributes || {}).forEach(name => {
      const value = attributes[name];
      if (!nonStandardAttributes[name]) {
        // lowercase event attributes
        const attributeName =
          name.indexOf("on") === 0 ? name.toLowerCase() : name;
        $element[attributeName] = value;
      } else {
        // set non-standard attribute
        $element.setAttribute(nonStandardAttributes[name], value);
      }
    });

    children.forEach($child => {
      if ($child) {
        if (typeof $child === "string") $element.innerText = $child;
        else $element.appendChild($child);
      }
    });
    //else if (children) $element.appendChild(children);

    return $element;
  }

  /**
   * View constructor
   */
  constructor() {}

  /**
   * Returns root element.
   */
  getElement() {
    if (this._$root === null) {
      this._$root = this.render();
      this.didRender();
    }
    return this._$root;
  }

  /**
   * Rerenders the view.
   * Fluent interface
   */
  refresh() {
    const $oldRoot = this._$root;
    if ($oldRoot === null) {
      // only refresh if there is an existing element
      return this;
    }

    // render
    this._$root = null;
    this._$root = this.render();
    this.didRender();

    // append each subview to new root element
    this.getSubviews().forEach(this.appendSubviewElement);

    // replace root node in dom
    if ($oldRoot && $oldRoot.parentNode) {
      $oldRoot.parentNode.replaceChild(this._$root, $oldRoot);
    }

    return this;
  }

  /**
   * Renders the view.
   */
  protected render() {
    return View.createElement("div");
  }

  /**
   * Updates this view at next frame.
   * Fluent interface
   */
  setNeedsUpdate() {
    if (!this._needsUpdate) {
      this._needsUpdate = true;
      window.requestAnimationFrame(() => {
        this._needsUpdate = false;
        this.update();
      });
    }

    return this;
  }

  /**
   * Updates view on model change.
   * Fluent interface
   */
  protected update() {
    return this;
  }

  /**
   * Triggered after rendering root element.
   */
  didRender() {
    this.update();
  }

  /**
   * Layouts view and its subviews.
   * Fluent interface
   */
  layout(): View {
    this._subviews.forEach(subview => subview.layout());

    return this;
  }

  /**
   * Adds subview.
   * Fluent interface
   */
  addSubview(view: View) {
    // make sure view is detached
    view.removeFromSuperview();

    // add view to subviews
    this.appendSubviewElement(view);
    view.setSuperview(this);
    this._subviews.push(view);
  }

  /**
   * Returns subviews.
   */
  getSubviews(): View[] {
    return this._subviews;
  }

  /**
   * Injects subview's root element into own DOM structure.
   * Override this method to choose how to inject which kind of views.
   * Fluent interface
   */
  protected appendSubviewElement(view: View) {
    // default behaviour: append subview element to own root element
    if (view.getElement().parentNode !== this.getElement()) {
      this.getElement().appendChild(view.getElement());
    }

    return this;
  }

  /**
   * Remove subview.
   * Fluent interface
   */
  removeSubview(view: View) {
    const index = this._subviews.indexOf(view);
    if (index !== -1) {
      this._subviews.splice(index, 1);
      view.setSuperview(null);
      this.removeSubviewElement(view);
    }

    return this;
  }

  /**
   * Removes previously added subview element from own DOM structure.
   * Fluent interface
   */
  protected removeSubviewElement(view: View) {
    // remove subview element from its parent node
    const $element = view.getElement();
    if ($element.parentNode !== null) {
      $element.parentNode.removeChild(view.getElement());
    }

    return this;
  }

  /**
   * Remove self from superview.
   * Fluent interface
   */
  removeFromSuperview() {
    if (this._superview !== null) {
      this._superview.removeSubview(this);
    }

    return this;
  }

  /**
   * Returns superview.
   */
  getSuperview() {
    return this._superview;
  }

  /**
   * Sets superview.
   * Fluent interface
   */
  setSuperview(view: View) {
    this._superview = view;

    return this;
  }

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
  setFocus(focus: boolean) {
    if (focus !== this._focus) {
      this._focus = focus;
      if (focus) {
        // inform superview
        if (this._superview !== null) {
          this._superview.subviewDidFocus(this);
        }
        this.didFocus();
      } else {
        // blur subviews
        this._subviews.forEach(subview => subview.blur());
        this.didBlur();
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

  /**
   * Triggered when a subview receives focus.
   */
  subviewDidFocus(subview: View) {
    if (this.hasFocus()) {
      // blur other subviews
      this._subviews
        .filter(view => view !== subview)
        .forEach(view => view.blur());
    } else {
      this.focus();
    }
  }

  /**
   * Triggered when view receives focus.
   */
  protected didFocus() {}

  /**
   * Triggered when view loses focus.
   */
  protected didBlur() {}

  /**
   * Returns the model object that manages this view.
   */
  getModel() {
    return this._model;
  }

  /**
   * Returns true, if model is set.
   */
  hasModel() {
    return this._model !== null;
  }

  /**
   * Sets the model.
   * Fluent interface
   */
  setModel(model: object) {
    this._model = model;
    return this;
  }
}
