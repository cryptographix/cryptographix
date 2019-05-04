import {
  View,
  Action,
  IActionHandler,
  Transformer,
  IConstructable,
  ByteArray,
  H2BA
} from "@cryptographix/core";
import { PropertyView } from "@cryptographix/flow-views";
//import { TransformerNode } from "@cryptographix/flow";
//import { InputPanel } from "../views/input-panel";

export class TransformerToolView extends View implements IActionHandler {
  //
  transformer: Transformer;

  execButton: ExecButton;

  //
  constructor(
    protected props: { transCtor: IConstructable<Transformer>; config?: {} }
  ) {
    super();

    const { transCtor, config } = props;

    this.transformer = new transCtor(config);

    this.transformer["in"] = H2BA(
      "11 11 22 22 33 33 44 44 11 11 22 22 33 33 44 44"
    );
    this.transformer["key"] = H2BA(
      "11 11 22 22 33 33 44 44 11 11 22 22 33 33 44 44"
    );
    this.transformer["iv"] = H2BA(
      "11 11 22 22 33 33 44 44 11 11 22 22 33 33 44 44"
    );
  }

  updateView() {
    alert("Hi");
    this.execButton.refresh();

    return false;
  }

  canExecute() {
    try {
      return this.transformer.canTrigger;
    } catch (e) {
      return false;
    }
  }

  done: boolean = false;
  async onExecute() {
    try {
      await this.transformer.trigger().then(() => {
        this.done = true;
        this.refresh();

        let $el = this.resultView.element;
        $el.scrollIntoView();

        //window.scrollTo(0, $el.win);
      });
    } catch (e) {
      alert(e.toString());
    }
  }

  propertyViews: { [index: string]: View } = {};

  resultView: View;

  render(): HTMLElement {
    const helper = this.transformer.helper;

    /*    this.execButton = new ExecButton({
      text: "Process",
      enabled: this.canExecute(),
      onExecute: async () => {
        await this.onExecute();
      }
    });*/

    this.propertyViews = {};

    this.propertyViews = Object.keys(helper.configSchema.properties)
      // Ignore 'shared' block properties
      .filter(key => !helper.isSchemaProperty(key))
      .reduce<{
        [index: string]: View;
      }>((prev, key) => {
        prev[key] = (
          <PropertyView
            handler={this}
            propRef={{
              target: this.transformer.config,
              key: key,
              propertyType: helper.getPropSchema(key)
            }}
          />
        );

        return prev;
      }, this.propertyViews);

    this.propertyViews = helper.inPortKeys
      // Ignore 'shared' block properties
      //      .filter(key => helper.isSchemaProperty(key))
      .reduce<{
        [index: string]: View;
      }>((prev, key) => {
        let transformer = this.transformer;
        let view: PropertyView;

        view = (
          <PropertyView
            handler={this}
            propRef={{
              target: this.transformer,
              key: key,
              propertyType: this.transformer.helper.getPropSchema(key)
            }}
          >
            <a
              class="icon has-text-white is-unselectable"
              title="Copy to Clipboard"
              onClick={() => {
                let $el = view.element.getElementsByTagName("textarea")[0];
                $el.select();
                document.execCommand("copy");
              }}
            >
              <i class="fas fa-copy" />
            </a>
            <a
              class="icon has-text-white is-unselectable"
              title="Upload as File"
              onClick={() => {
                let dropOrOpenView: DropOrOpen;

                view.addChildView(
                  (dropOrOpenView = (
                    <DropOrOpen
                      onReadData={data => {
                        dropOrOpenView.close();
                        //view.removeChildView(dropOrOpenView);
                        transformer[key] = new ByteArray(data);
                        view.refresh();
                      }}
                    />
                  ))
                );
              }}
            >
              <i class="fas fa-upload" />
            </a>
            <DropdownIcon
              onChange={option => {
                view.options["format"] = option;
                view.refresh();
              }}
              options={["HEX", "BASE64", "UTF8"]}
            />
            <a
              class="icon has-text-white is-unselectable"
              title="Clear"
              onClick={() => {
                transformer[key] = new ByteArray();
                view.refresh();
              }}
            >
              <i class="fas fa-trash-alt" />
            </a>
          </PropertyView>
        );

        prev[key] = view;

        return prev;
      }, this.propertyViews);

    return (
      <View.Fragment>
        <section style="background-color: #2980b9; padding: 1rem 0.5rem 3rem 0.5rem;">
          <div class="container">
            <div class="columns is-centered">
              <div class="column is-6-desktop is-9-tablet has-text-centered has-text-white">
                <p class="subtitle has-text-grey-lighter" spellcheck="false">
                  {helper.schema.markdown.prompt}
                </p>
              </div>
            </div>
            <div class="columns is-centered">
              <div
                class="column is-hidden-touch hint has-text-white"
                style="align-self: center"
              >
                <i class="fa fa-share fa-5x"> </i> <br />
                <p />
              </div>

              <div class="transform-inputs column is-7-desktop is-8-tablet">
                {Object.entries(this.propertyViews)
                  .filter(([key]) => helper.isSchemaProperty(key))
                  .map(([_key, view]) => (
                    <div class="transform-input">{view}</div>
                  ))}
              </div>

              <div class="column transform-config is-3">
                {Object.entries(this.propertyViews)
                  .filter(([key]) => !helper.isSchemaProperty(key))
                  .map(([_key, view]) => view)}
              </div>
            </div>

            <div class="columns  is-centered">
              <div class="column is-8 has-text-centered">
                {
                  (this.execButton = (
                    <ExecButton
                      text="Process"
                      enabled={this.canExecute()}
                      onExecute={async () => {
                        await this.onExecute();
                      }}
                    />
                  ))
                }
              </div>
            </div>
          </div>
        </section>

        {this.done
          ? (this.resultView = (
              <Results handler={this} transformer={this.transformer} />
            ))
          : null}

        <About helper={helper} />
      </View.Fragment>
    );
  }

  handleAction(action: Action) {
    switch (action.action) {
      case "property:value-changed":
        action.action = "config:property-changed";

      case "config:property-changed": {
        action.dispatchTo(this.transformer);

        Object.keys(this.propertyViews).forEach(key => {
          let propInfo = this.transformer.helper.getPropSchema(key);
          let $el = this.propertyViews[key].element;

          if ($el) {
            // 'Ignored' elements to be hidden
            $el.style.display = propInfo.ignore ? "none" : "inherit";
          }
        });
        break;
      }
    } //

    this.execButton.setEnabled(this.canExecute());

    return null;
  }
}

/**
 *
 */
class DropdownIcon extends View {
  options = ["HEX", "BASE64", "UTF8"];
  onChangeCallback: (option: string) => void;

  constructor(props: {
    onChange: (option: string) => void;
    options: string[];
  }) {
    super();

    this.options = props.options;

    this.option = props.options[0];

    this.onChangeCallback = props.onChange;
  }

  option: string;

  onChange(evt: Event) {
    this.option = evt.target["title"];

    if (this.onChangeCallback) this.onChangeCallback(this.option);

    this.refresh();
  }

  render() {
    return (
      <a
        class="icon has-text-white has-dropdown is-unselectable"
        title="Input Format"
      >
        <span class="is-unselectable" style="padding-right: 5px">
          {this.option}
        </span>
        <ul class="byte-property-dropdown">
          {this.options.map(opt => (
            <li title={opt} onclick={this.onChange.bind(this)}>
              {opt}
            </li>
          ))}
        </ul>
      </a>
    );
  }
}

/**
 *
 */
function About(props: { helper: any }) {
  const { helper } = props;

  return (
    <section class="section about">
      <div class="container  has-background-white has-text-centered">
        <div class="columns">
          <div class="column">
            <h2 class="title">About</h2>
            <hr />
          </div>
        </div>
        <div class="columns is-centered">
          <div class="column is-6-desktop is-10-tablet">
            <p>{helper.schema.markdown.about}</p>
            <p>{helper.schema.markdown.learnMore}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 *
 */
class ExecButton extends View {
  constructor(
    protected props: {
      text: string;
      enabled: boolean;
      onExecute: (view: View) => void;
    }
  ) {
    super();
  }

  setEnabled(enabled: boolean): void {
    this.props.enabled = enabled;
    this.triggerUpdate();
  }

  protected render() {
    return (
      <button
        type="button"
        id="process"
        class="button is-large is-info"
        disabled={!this.props.enabled}
        onClick={() => {
          this.props.onExecute(this);
        }}
      >
        {this.props.text}
      </button>
    );
  }
}

function Results(props: { handler: IActionHandler; transformer: Transformer }) {
  let { transformer } = props;
  let { helper } = transformer;

  let propertyViews = helper.outPortKeys
    // Ignore 'shared' block properties
    .filter(key => helper.isSchemaProperty(key))
    .reduce<{
      [index: string]: View;
    }>((prev, key) => {
      const view: PropertyView = (
        <PropertyView
          readOnly
          propRef={{
            target: transformer,
            key: key,
            propertyType: helper.getPropSchema(key)
          }}
        >
          <a
            class="icon has-text-white is-unselectable"
            title="Copy to Clipboard"
            onClick={() => {
              let $el = view.element.getElementsByTagName("textarea")[0];
              $el.select();
              document.execCommand("copy");
            }}
          >
            >
            <i class="fas fa-copy" />
          </a>
          <a
            class="icon has-text-white is-unselectable"
            title="Download as File"
          >
            <i class="fas fa-download" />
          </a>
          <DropdownIcon
            onChange={option => {
              view.options["format"] = option;
              view.refresh();
            }}
            options={["HEX", "BASE64", "UTF8"]}
          />
        </PropertyView>
      );

      prev[key] = view;

      return prev;
    }, {});

  return (
    <section
      class="section"
      style="background-color: #2990b9; padding: 3rem 0.5rem 3rem 0.5rem;"
    >
      <div class="container">
        <div class="columns is-desktop">
          <div
            class="column is-hidden-touch is-2 hint has-text-white"
            style="align-self: center"
          >
            <i class="fa fa-share fa-flip-vertical fa-5x"> </i> <br />
            <p />
          </div>

          <div class="column is-7">
            {/*  <div class="level">
              <div class="level-left" />
              <div class="level-right" style="min-width: 220px; width: 200px">
                <div
                  class="level-item buttons has-background-grey-dark"
                  style="border-radius: 3px;"
                >
                  <a
                    class="icon is-medium has-text-white  btn-result btn-copy"
                    data-title="Copy to Clipboard"
                  >
                    <i class="fas fa-file-alt"> </i>
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
            </div>*/}
            <div class="transform-outputs">
              {Object.entries(propertyViews).map(([_key, view]) => (
                <div class="transform-output">{view}</div>
              ))}
              <div
                class="buttons has-background-grey-dark"
                style="border-radius: 3px; display: none"
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

var readFiles = function(files: FileList): Promise<ArrayBuffer> {
  const file = files[0];
  const reader = new FileReader();

  let resolve: (res: ArrayBuffer) => any;
  let reject: (reason: any) => any;

  reader.onload = (event: ProgressEvent) => {
    resolve((event.target as any).result as ArrayBuffer);
  };

  reader.onerror = event => {
    reader.abort();

    reject(event);
  };

  //alert(file.name);
  reader.readAsArrayBuffer(file);
  return new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
};

export class DropOrOpen extends View {
  protected isVisible = true;

  onReadData: (data: ArrayBuffer) => void;

  constructor(props: { onReadData: (data: ArrayBuffer) => void }) {
    super();

    this.onReadData = props.onReadData;
    //
  }

  close() {
    this.isVisible = false;
    this.refresh();
  }

  render() {
    let modal: DropOrOpen = this;
    let dropZone: View;

    function onKeyDown(evt: KeyboardEvent) {
      if (evt.which == 13) {
        evt.preventDefault();
      } else if (evt.which == 27) {
        evt.preventDefault();

        modal.isVisible = false;
        modal.refresh();
      }
    }

    return (
      this.isVisible && (
        <div class="modal is-active" style="z-index: 2000">
          <div class="modal-background has-background-grey" />
          <div
            class="modal-content"
            onKeyDown={onKeyDown}
            onKeyPress={onKeyDown}
          >
            {
              (dropZone = (
                <div
                  class="view-object-drop-zone"
                  style="color:#666; display: block"
                  onDrop={(evt: Event) => {
                    evt.preventDefault();
                    (evt.currentTarget as HTMLElement).classList.remove("drop");

                    readFiles((evt as DragEvent).dataTransfer.files).then(
                      data => modal.onReadData(data)
                    );

                    return false;
                  }}
                  onDragOver={(evt: DragEvent) => {
                    (evt.currentTarget as HTMLElement).classList.add("drop");
                    return false;
                  }}
                  onDragLeave={(evt: DragEvent) => {
                    (evt.currentTarget as HTMLElement).classList.remove("drop");
                    return false;
                  }}
                >
                  <span style="line-height: 200px; text-align: center;">
                    Drag and drop file here
                  </span>
                </div>
              ))
            }
            <div
              id="type-zone"
              class="view-object-drop-zone"
              style="display: none;"
            >
              <textarea
                id="type-in"
                style="overflow: hidden; color: #222; width: 100%; height: 100%; valign: none;"
              />
            </div>

            <div
              class="file is-fullwidth"
              style="border: 1px solid #ccc; padding: 2px;"
            >
              <label class="file-label">
                <input
                  class="file-input"
                  type="file"
                  name="resume"
                  onChange={evt => {
                    //var files = evt.currentTarget.files;

                    //if (files.length) readFiles(files);
                    readFiles(evt.currentTarget.files).then(data =>
                      modal.onReadData(data)
                    );

                    //evt.currentTarget.files = [];
                  }}
                />
                <span class="file-cta">
                  <span class="file-icon">
                    <i class="fas fa-upload" />
                  </span>
                  <span class="file-label">Choose a file…</span>
                </span>
              </label>
            </div>
          </div>

          <button
            class="modal-close is-large"
            aria-label="close"
            onClick={() => {
              modal.isVisible = false;
              modal.refresh();
            }}
          />
        </div>
      )
    );
  }
}

/*const $ = el => {
  document.getElementById(el);
};

function showhideDropArea(showDrop) {
  if (showDrop) {
    $("#type-zone").hide();
    $("#drop-zone").show();
    $("#xx > .bootstrap-filestyle").show();
    $("#btn-select-files").show();
    $("#btn-process-text").hide();
  } else {
    $("#drop-zone").hide();
    $("#type-zone").show();
    $("#xx > .bootstrap-filestyle").hide();
    $("#btn-process-text").show();
    $("#btn-select-files").hide();
  }
}

$("#btn-select-files").change(function() {
  var files = $(this).prop("files");

  if (files.length) readFiles(files);

  $(this).val("");
});

var dropZone = document.getElementById("drop-zone");
var uploadForm = document.getElementById("js-upload-form");

var readFiles = function(files) {
  var file = files[0],
    reader = new FileReader();

  reader.onload = function(event) {
    //handleALU(event.target.result);
  };

  alert(file.name);
  reader.readAsArrayBuffer(file);
};

uploadForm.addEventListener("submit", function(e) {
  var files = $("#btn-select-files").prop("files");
  e.preventDefault();

  if (files.length) readFiles(files);
});

dropZone.ondrop = function(e) {
  e.preventDefault();
  this.className = "view-object-drop-zone";

  readFiles(e.dataTransfer.files);

  return false;
};

dropZone.ondragover = function() {
  this.className = "view-object-drop-zone drop";
  return false;
};

dropZone.ondragleave = function() {
  this.className = "view-object-drop-zone";
  return false;
};*/
