import {
  View,
  Action,
  IActionHandler,
  Transformer,
  IConstructable
} from "@cryptographix/core";
import { PropertyView } from "@cryptographix/flow-views";
//import { TransformerNode } from "@cryptographix/flow";
//import { InputPanel } from "../views/input-panel";

export class TransformerToolView extends View implements IActionHandler {
  //
  transformer: Transformer;

  execButton: ExecButton;

  //
  constructor(protected props: { transCtor: IConstructable<Transformer> }) {
    super();

    this.transformer = new props.transCtor();
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

  async onExecute() {
    try {
      await this.transformer.trigger();
      alert("ok: " + this.transformer[this.transformer.helper.outPortKeys[0]]);
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
      .filter(key => helper.isSchemaProperty(key))
      .reduce<{
        [index: string]: View;
      }>((prev, key) => {
        prev[key] = (
          <div class="transform-input">
            <PropertyView
              handler={this}
              propRef={{
                target: this.transformer,
                key: key,
                propertyType: this.transformer.helper.getPropSchema(key)
              }}
            />
          </div>
        );

        return prev;
      }, this.propertyViews);

    return (
      <View.Fragment>
        <section class="hero">
          <div
            class="hero-body"
            style="background-color: #2980b9; padding: 1rem 0.5rem 3rem 0.5rem;"
          >
            <div class="container">
              <form>
                <div class="columns is-centered">
                  <div class="column is-6-desktop has-text-centered has-text-white">
                    <p class="subtitle has-text-grey-lighter">
                      {" "}
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

                    {/*<div class="is-hidden-touch has-text-white">
                      <br />
                      <i class="fas fa-share fa-rotate-180 fa-5x"> </i>
                    </div>*/}
                  </div>
                </div>
                <div class="columns">
                  <div class="column is-8 is-offset-2 has-text-centered">
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
              </form>
            </div>
          </div>
        </section>

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

function Results(transformer: Transformer) {
  return (
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
                    <div tabindex="-1" class="json" />

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
  );
}
