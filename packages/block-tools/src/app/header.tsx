import { View } from "@cryptographix/core";

export class Header extends View {
  render() {
    return (
      <header>
        <nav
          style="box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1),
        0 0 0 1px rgba(10, 10, 10, 0.1); "
          class="navbar is-light"
          role="navigation"
          aria-label="main navigation"
        >
          <div class="navbar-brand">
            <a class="navbar-item" href="https://cryptographix.org/tools">
              <img
                src="https://cryptographix.org/static/images/logo/logo-compact-139x30.png"
                width="112"
                height="28"
              />
            </a>

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
              <a class="navbar-item">
                <h1 class="title has-text-info">Block Explorer</h1>
              </a>
            </div>

            <div class="navbar-end">
              <div class="navbar-item">
                <div class="buttons">
                  <a class="button is-primary">
                    {" "}
                    <strong>Sign up</strong>{" "}
                  </a>
                  <a class="button is-light"> Log in </a>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}
