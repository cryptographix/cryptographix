import {
  View,
  IConstructable,
  Block,
  IBlockSchema,
  Schema
} from "@cryptographix/core";
import * as CR from "@cryptographix/cryptography";
import { TLVDecoder } from "@cryptographix/emv";

interface ToolInfo {
  block: IConstructable<Block>;
  color?: string;
  icon?: string;
  disabled?: boolean;
}

export class BlockToolChooser extends View {
  renderCard(tool: ToolInfo) {
    const schema = Schema.getSchemaForClass(tool.block) as IBlockSchema;

    return (
      <div class="column">
        <a
          href={`#block-tool/${tool.block.name}`}
          class={tool.disabled ? "disabled" : null}
        >
          <div
            class="card"
            style={`background-color: #${tool.disabled ? "AAA" : tool.color} `}
          >
            <header class="card-header has-text-lightgrey">
              <p class="card-header-icon">
                <i class={`fas ${tool.icon} fa-2x`} />
              </p>
              <p class="card-header-title is-size-5 has-text-light">
                {schema.title}
              </p>
            </header>
            <div class="card-content" style="padding: 1rem; min-height: 120px;">
              <p
                class="content has-text-light"
                style="font-size: 90%; display: block"
              >
                {schema.markdown.prompt}
              </p>
            </div>
          </div>
        </a>
      </div>
    );
  }

  tools: { [index: string]: ToolInfo } = {
    enc: {
      block: CR.SecretKeyEncrypter,
      color: "ee7220",
      icon: "fa-pencil-ruler"
    },

    mac: {
      block: CR.SecretKeyAuthenticator,
      color: "00AAEE",
      icon: "fa-wrench",
      disabled: true
    },

    generator: {
      block: CR.SecretKeyGenerator,
      color: "A6D608",
      icon: "fa-hammer",
      disabled: true
    },

    derive: {
      block: CR.SecretKeyDerivator,
      color: "FFE302",
      icon: "fa-toolbox",
      disabled: true
    },

    tlv: { block: TLVDecoder, color: "FF5F00", icon: "fa-tools" }
  };

  render() {
    return (
      <section class="hero tool-cards">
        <div class="hero-body container">
          <div class="columns is-multiline is-variable is-3">
            {Object.keys(this.tools).map(name =>
              this.renderCard(this.tools[name])
            )}
            ;
          </div>
        </div>
      </section>
    );
  }
}
