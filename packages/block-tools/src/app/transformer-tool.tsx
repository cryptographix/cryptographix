import {
  View,
  Action,
  IActionHandler,
  Transformer,
  IConstructable,
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
      });
    } catch (e) {
      alert(e.toString());
    }
  }

  propertyViews: { [index: string]: View } = {};

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
        const view = (
          <PropertyView
            handler={this}
            propRef={{
              target: this.transformer,
              key: key,
              propertyType: this.transformer.helper.getPropSchema(key)
            }}
          >
            <a class="icon has-text-white" title="Paste from Clipboard">
              <i class="fas fa-paste" />
            </a>
            <a class="icon has-text-white" title="Upload as File">
              <i class="fas fa-upload" />
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
      }, this.propertyViews);

    return (
      <View.Fragment>
        <section style="background-color: #2980b9; padding: 1rem 0.5rem 3rem 0.5rem;">
          <div class="container">
            <div class="columns is-centered">
              <div class="column is-6-desktop has-text-centered has-text-white">
                <p class="subtitle has-text-grey-lighter">
                  {helper.schema.markdown.prompt}
                </p>
              </div>
            </div>
            <div class="columns is-desktop">
              <div
                class="column is-hidden-touch is-2 hint has-text-white"
                style="align-self: center"
              >
                <i class="fa fa-share fa-5x"> </i> <br />
                <p />
              </div>

              <div class="transform-inputs column is-7">
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

        {this.done ? (
          <Results handler={this} transformer={this.transformer} />
        ) : null}

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
      <a class="icon has-text-white has-dropdown" title="Input Format">
        <span style="padding-right: 5px">{this.option}</span>
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
          {/*<a class="icon has-text-white" title="Copy to Clipboard">
            <i class="fas fa-copy" />
          </a>
          <a class="icon has-text-white" title="Download as File">
            <i class="fas fa-download" />
          </a>*/}
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
