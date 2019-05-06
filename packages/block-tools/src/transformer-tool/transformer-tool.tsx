import {
  View,
  Action,
  IActionHandler,
  Transformer,
  IConstructable,
  AnySchemaProperty,
  H2BA
} from "@cryptographix/core";

import { PropertyView } from "@cryptographix/flow-views";
import { InputBytesView } from "./input-bytes-view";
import { OutputBytesView } from "./output-bytes-view";
import { TLVInfo, TLVNode } from "@cryptographix/emv";

export class TransformerToolView extends View implements IActionHandler {
  //
  transformer: Transformer;

  //
  execButton: ExecButton;

  //
  constructor(
    protected props: { transCtor: IConstructable<Transformer>; config?: {} }
  ) {
    super();

    const { transCtor, config } = props;

    this.transformer = new transCtor(config);

    switch (transCtor.name) {
      case "SecretKeyEncrypter": {
        this.transformer["in"] = H2BA(
          "11 11 22 22 33 33 44 44 11 11 22 22 33 33 44 44"
        );
        this.transformer["key"] = H2BA(
          "11 11 22 22 33 33 44 44 11 11 22 22 33 33 44 44"
        );
        this.transformer["iv"] = H2BA(
          "11 11 22 22 33 33 44 44 11 11 22 22 33 33 44 44"
        );

        break;
      }

      case "TLVDecoder": {
        this.transformer["data"] = H2BA(
          " 700e 5a086271550000000001 5f340100 9505FFFFFFFFFF"
        );
      }
    }

    this.onExecute();
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
        const view = InputBytesView(this, this.transformer, key);

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
                    <div
                      class={
                        "transform-input" /*+ (key == "in" ? " fullscreen" : "")*/
                      }
                    >
                      {view}
                    </div>
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

/*<div
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
</div>*/

function OutputTreeView(transformer: Transformer, key: string) {
  let tlvInfos: TLVInfo[] = transformer[key];

  const view = (
    <section class="panel-block">
      <div class="tree-pane">
        {tlvInfos && tlvInfos.map(info => <TLVNode node={info} mode="tree" />)}
      </div>

      {tlvInfos && tlvInfos.length == 0 ? (
        <div style="height: 400px; border: 3px dotted #888; border-radius: 5px; padding: 10px;">
          <h3>
            <i>Explore</i> mode
          </h3>
          <p>Decompose hexadecimal TLV data, and represent it as a tree.</p>
          <p>
            Context sensitive lookup, ISO / EMV and different payment-card
            standards
          </p>
          <br />
          <p>
            try something like
            <a
              onClick={
                null
                /*(view.tlvInput =
                  "9505 3399AA55FF 700e 5a086271550000000001 5f340100")*/
              }
            >
              700e 5a086271550000000001 5f340100
            </a>
          </p>
        </div>
      ) : null}
    </section>
  );

  return view;
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
      const schema: AnySchemaProperty = helper.getPropSchema(key);

      const view =
        schema.type == "bytes"
          ? OutputBytesView(props.handler, transformer, key)
          : OutputTreeView(transformer, key);

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
            <div class="transform-outputs">
              {Object.entries(propertyViews).map(([_key, view]) => (
                <div class="transform-output">{view}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
