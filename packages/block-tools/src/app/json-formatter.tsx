import { View } from "@cryptographix/core";

export class JSONFormatterView extends View {
  constructor() {
    super();
  }

  render(): HTMLElement {
    return (
      <View.Fragment>
        <section class="hero formatter">
          <div class="hero-body">
            <div class="container">
              <form>
                <div class="columns">
                  <div class="column errorholder" />
                </div>
                <div class="columns is-desktop">
                  <div class="column is-hidden-touch is-2 hint has-text-white">
                    <i class="fa fa-share fa-5x"> </i> <br />
                    <br />
                    <p>Paste in JSON or a URL and away you go.</p>
                  </div>

                  <div class="column is-8">
                    <div class="field ">
                      <label class="label has-text-white">JSON Data/URL</label>
                      <div class="control">
                        <textarea
                          rows="5"
                          id="jsondata"
                          name="jsondata"
                          class="textarea"
                          placeholder="Textarea"
                        />
                        <div
                          class="overlay is-bottom-right"
                          style="bottom: 5px; right: 15px;"
                        >
                          <a>
                            <span class="icon is-medium">
                              <i class="fas fa-trash-alt"> </i>
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="column is-2 options">
                    <div class="field">
                      <label class="label has-text-white">JSON Standard</label>
                      <div class="control">
                        <div class="select">
                          <select>
                            <option value="1" selected="">
                              RFC 4627
                            </option>
                            <option value="2">RFC 7159</option>
                            <option value="3">ECMA-404</option>
                            <option value="0">Do Not Validate</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div class="field">
                      <label class="label has-text-white">JSON Template</label>
                      <div class="control">
                        <div class="select">
                          <select>
                            <option value="0">4 Space Tab</option>
                            <option value="1" selected="">
                              3 Space Tab
                            </option>
                            <option value="2">2 Space Tab</option>
                            <option value="4">1 Tab Tab</option>
                            <option value="3">Compact</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div class="is-hidden-touch has-text-white">
                      <br />
                      <i class="fas fa-share fa-rotate-180 fa-5x"> </i>
                    </div>
                  </div>
                </div>
                <div class="columns">
                  <div class="column is-8 is-offset-2 has-text-centered">
                    <button
                      type="button"
                      id="process"
                      class="button is-large is-info"
                      data-loading-text="<i class='fa fa-cog fa-spin'> </i>"
                    >
                      Process
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section class="hero results">
          <div class="hero-body">
            <div class="container">
              <div class="columns">
                <div class="column has-text-centered" />
              </div>
            </div>
            <div class="result container-result-1">
              <div class="container">
                <div class="columns is-centered">
                  <div class="column is-10-desktop">
                    <div class="top">
                      <div class="left">
                        <h3>#1</h3>
                      </div>
                      <div class="middle">
                        <div class="name">
                          <div>
                            <span class="tip" title="Click to Edit">
                              April 26th 2019, 11:20:34 pm
                            </span>
                            <i class="fa fa-pencil"> </i>
                            <input class="form-control input-sm" type="text" />
                          </div>
                        </div>
                        <div class="url">
                          <div>
                            <span> </span>
                          </div>
                        </div>
                      </div>
                      <div class="right">
                        <div
                          class="buttons has-background-grey-dark"
                          style="border-radius: 3px;"
                        >
                          <a
                            class="icon is-medium has-text-white  btn-result btn-copy"
                            data-title="Copy to Clipboard"
                          >
                            <i class="fas fa-file-alt"> </i>
                          </a>
                          <a
                            class="icon is-medium has-text-white btn-result btn-download"
                            title="Download as File"
                          >
                            <i class="fas fa-download"> </i>
                          </a>
                          <a
                            class="icon is-medium has-text-white  btn-result btn-collapse-data"
                            title="Collapse All Nodes"
                          >
                            <i class="fas fa-minus-square"> </i>
                          </a>
                          <a
                            class="icon is-medium has-text-white btn-result btn-expand-data"
                            title="Expand All Nodes"
                          >
                            <i class="fas fa-plus-square"> </i>
                          </a>
                          <a
                            class="icon is-medium has-text-white btn-result btn-collapse-window"
                            title="Collapse Result"
                          >
                            <i class="far fa-caret-square-up"> </i>
                          </a>
                          <a
                            class="icon is-medium has-text-white btn-result btn-expand-window"
                            title="Expand Results"
                          >
                            <i class="fas fa-caret-square-down"> </i>
                          </a>
                          <a
                            class="icon is-medium has-text-white btn-result btn-close"
                            title="Close Result"
                          >
                            <i class="fas fa-times"> </i>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div class="bottom collapseable">
                      <div class="validity validity-valid">
                        Valid JSON (<span>RFC 4627</span>)
                      </div>
                      <span class="labels">Validator Output</span>
                      <ul class="errors list-unstyled">
                        <li>
                          <i class="fa fa-fw fa-exclamation-circle"> </i>
                          <strong>Error:</strong>
                          <a data-structure="s-9">
                            Strings should be wrapped in double quotes.
                          </a>
                          <em>[Code 17, Structure 9]</em>
                        </li>
                        <li>
                          <i class="fa fa-fw fa-exclamation-circle"> </i>
                          <strong>Error:</strong>
                          <a data-structure="s-13">
                            Strings should be wrapped in double quotes.
                          </a>
                          <em>[Code 17, Structure 13]</em>
                        </li>
                      </ul>

                      <span class="labels">Formatted JSON Data</span>

                      <div class="jsonholder ui-resizable">
                        <div tabindex="-1" class="json">
                          <span class="sBrace structure-1" id="s-1">
                            A{" "}
                            <a>
                              {" "}
                              <i class="far fa-plus-square"> </i>{" "}
                            </a>
                          </span>
                          <br />
                          <span>&nbsp;&nbsp;</span>
                          <span class="sObjectK" id="s-2">
                            "id"
                          </span>
                          <span class="sColon" id="s-3">
                            :
                          </span>
                          <span class="sObjectV" id="s-4">
                            "this"
                          </span>
                          <span class="sComma" id="s-5">
                            ,
                          </span>{" "}
                          <br />
                          <span> &nbsp;&nbsp;</span>
                          <span class="sObjectK" id="s-6">
                            "obj"
                          </span>
                          <span class="sColon" id="s-7">
                            :
                          </span>
                          <span class="sBrace structure-2" id="s-8">
                            B{" "}
                            <a>
                              {" "}
                              <i class="far fa-minus-square"> </i>{" "}
                            </a>
                          </span>
                          <br />
                          <span>&nbsp;&nbsp;</span> <span>&nbsp;&nbsp;</span>
                          <span class="sObjectK" id="s-9">
                            <span class="error">val</span>
                          </span>
                          <span class="sColon" id="s-10">
                            :
                          </span>
                          <span class="sObjectV" id="s-11">
                            100
                          </span>
                          <span class="sComma" id="s-12">
                            ,
                          </span>{" "}
                          <br />
                          <span>&nbsp;&nbsp;</span> <span>&nbsp;&nbsp;</span>
                          <span class="sObjectK" id="s-13">
                            <span class="error">name</span>
                          </span>
                          <span class="sColon" id="s-14">
                            :
                          </span>
                          <span class="sObjectV" id="s-15">
                            "a&nbsp;name"
                          </span>
                          <br />
                          <span>&nbsp;&nbsp;</span>
                          <span class="sBrace structure-2" id="s-16">
                            }
                          </span>{" "}
                          <br />
                          <span class="sBrace structure-1" id="s-17">
                            }
                          </span>
                        </div>

                        <div
                          class="buttons has-background-grey-dark"
                          style="border-radius: 3px;"
                        >
                          <a
                            class="icon is-medium has-text-white btn-result btn-shrink"
                            title="Shrink Result"
                          >
                            <i class="fas fa-minus"> </i>
                          </a>
                          <a
                            class="icon is-medium has-text-white btn-result btn-grow"
                            title="Grow Result"
                          >
                            <i class="fas fa-plus"> </i>
                          </a>
                          <a
                            class="icon is-medium has-text-white btn-result btn-fullscreen"
                            title="Fullscreen"
                          >
                            <i class="fas fa-arrows-alt"> </i>
                          </a>
                        </div>
                        <div
                          class="ui-resizable-handle ui-resizable-s"
                          style="z-index: 90;"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="section about">
          <div class="container has-text-centered">
            <div class="columns">
              <div class="column">
                <h2 class="title">About</h2>
                <hr />
              </div>
            </div>
            <div class="columns is-centered">
              <div class="column is-6-desktop is-10-tablet">
                <p>
                  The
                  <a href="#" title="JSON Formatter &amp; Validator">
                    JSON Formatter
                  </a>
                  was created to help with debugging. As JSON data is often
                  output without line breaks to save space, it is extremely
                  difficult to actually read and make sense of it. This little
                  tool hoped to solve the problem by formatting the JSON data so
                  that it is easy to read and debug by human beings.
                </p>

                <p>
                  Shortly after it was created, JSON validation was added
                  following the description set out by Douglas Crockford of
                  <a title="Visit json.org" href="https://json.org/">
                    json.org
                  </a>{" "}
                  in
                  <a
                    title="Visit the RFC 4627 JSON Standard"
                    href="https://www.ietf.org/rfc/rfc4627.txt?number=4627"
                  >
                    RFC 4627
                  </a>
                  . It has since been expanded to also validate both current
                  competing JSON standards
                  <a
                    title="Visit the RFC 7159 JSON Standard"
                    href="https://tools.ietf.org/html/rfc7159"
                  >
                    RFC 7159
                  </a>
                  and
                  <a
                    title="Visit the ECMA-404 JSON Standard"
                    href="https://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf"
                  >
                    ECMA-404
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      </View.Fragment>
    );
  }
}
