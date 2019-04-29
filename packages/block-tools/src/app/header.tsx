import { View, ViewParams } from "@cryptographix/core";

export interface HeaderParams extends ViewParams {
  hideBrand?: boolean;
  menuItems: string[];
  selectedItem?: number;
  onMenuItemChange: (index: number) => void;
}

export class Header extends View<HeaderParams> {
  //attrs: HeaderParams;

  constructor(public props: HeaderParams) {
    super();

    //
  }

  dropClicked(evt: Event) {
    alert("here");
  }
  render() {
    let me = this;

    return (
      <header>
        <nav
          style="box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1),
        0 0 0 1px rgba(10, 10, 10, 0.1); z-index: 2000"
          class="navbar is-light"
          role="navigation"
          aria-label="main navigation"
        >
          <div class="navbar-brand">
            {!this.props.hideBrand && (
              <a class="navbar-item" href="https://cryptographix.org/tools">
                <img
                  class=" "
                  src="/assets/static/images/cgx-brand/cgx-logo.png"
                  style="max-height: 3rem"
                />
              </a>
            )}

            <a
              role="button"
              class="navbar-burger burger"
              aria-label="menu"
              aria-expanded="false"
              data-target="navbarBasicExample"
            >
              <span aria-hidden="true" /> <span aria-hidden="true" />
              <span aria-hidden="true" />
            </a>
          </div>

          <div id="navbarBasicExample" class="navbar-menu">
            <div class="navbar-start">
              <div class="navbar-item has-dropdown is-hoverable">
                <a class="navbar-link">
                  {/*<span class="icon is-large has-text-success">
                    <i class="fas fa-play-circle fa-2x" />
                  </span>*/}
                  <a
                    class="has-text-info"
                    style="font-size: 1.5rem; text-transform: uppercase;"
                  >
                    {this.props.menuItems[this.props.selectedItem | 0]}
                  </a>
                </a>

                <div class="navbar-dropdown">
                  {this.props.menuItems
                    .filter(
                      item =>
                        item != this.props.menuItems[this.props.selectedItem]
                    )
                    .map(item => (
                      <a
                        class="navbar-item has-text-info"
                        style="font-size: 1rem; text-transform: uppercase;"
                        onXClick={this.dropClicked.bind(this)}
                        onClick={(evt: Event) => {
                          let item = (evt.currentTarget as HTMLAnchorElement)
                            .text;
                          const index = me.props.menuItems.indexOf(item);
                          me.props.selectedItem = index;
                          me.triggerUpdate();
                          me.props.onMenuItemChange(index);

                          //alert((evt.currentTarget as any).text); //me.props.selectedItem=
                        }}
                      >
                        {item}
                      </a>
                    ))}

                  <hr class="navbar-divider" />
                  <a class="navbar-item">
                    <span class="icon is-large has-text-success">
                      <i class="fas fa-play-circle fa-2x"> </i>
                    </span>
                    <span style="padding-left: 1rem"> Report an issue </span>
                  </a>
                </div>
              </div>
            </div>

            <div class="navbar-end">
              <div class="navbar-item">
                <div class="buttons">
                  <a class="button is-primary is-disabled" disabled>
                    {" "}
                    <strong>Sign up</strong>{" "}
                  </a>
                  <a class="button is-light is-disabled" disabled>
                    {" "}
                    Log in{" "}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}
