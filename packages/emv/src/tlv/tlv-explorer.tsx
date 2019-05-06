import { ByteArray, View } from "@cryptographix/core";

import {
  TLVDatabase,
  TLVDatabaseEntry,
  RootTLVInfo,
  TLVInfo,
  TLV
} from "./tlv-database";

import { tags } from "./tlv-database/emv-db";

//import "./tlv-explorer.scss";

type TLVXMode = "decode" | "encode" | "lookup" | "dol";
type TLVXFormat = "auto" | "ber" | "dgi" | "ctv";

type DataFormat = "auto" | "hex" | "base64" | "text";

export class TLVExplorer extends View {
  tlvDatabase: TLVDatabase;

  constructor() {
    super();

    this.tlvDatabase = new TLVDatabase();
    this.rootTLVInfo = new RootTLVInfo(this.tlvDatabase);

    let entries = [];
    Object.keys(tags).forEach((t: any) => {
      entries.push(new TLVDatabaseEntry(t, tags[t].name, ""));
    });

    this.tlvDatabase.databaseEntries = this.tlvDatabase.databaseEntries.concat(
      entries
    );

    this.refreshMe();
  }

  private refreshMe() {
    this.tlvInputChanged(this.tlvInput);
  }

  mode: TLVXMode;
  tlvFormat: TLVXFormat = "ber";
  setTLVFormat(tlvFormat: string) {
    this.tlvFormat = TLVXParams.convertTLVFormat(tlvFormat);
    this.refresh();
  }

  /**
   * Route activation
   *
   * Setup Component from URL params
   **/
  activate(urlParams: any /*, router: Router*/) {
    let params = new TLVXParams(urlParams);

    this.mode = params.mode;
    this.tlvFormat = params.tlvFormat;

    //    console.log(JSON.stringify(params));
  }

  byteInputElement: Element;

  attached() {
    function getAll(selector) {
      return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
    }

    var $dropdowns = getAll(".dropdown:not(.is-hoverable)");

    if ($dropdowns.length > 0) {
      $dropdowns.forEach(function($el) {
        $el.addEventListener("click", function(event) {
          event.stopPropagation();
          $el.classList.toggle("is-active");
        });
      });

      document.addEventListener("click", function() {
        closeDropdowns();
      });
    }

    function closeDropdowns() {
      $dropdowns.forEach(function($el) {
        $el.classList.remove("is-active");
      });
    }

    console.log("attach: " + this.mode);
  }
  bind() {
    console.log("bind: " + this.mode);
  }

  private parseCTV(value: string): ByteArray {
    this.parseError = undefined;

    let bytes = new ByteArray();
    let off = 0;

    while (off < value.length) {
      if (" \t\n".indexOf(value[off]) >= 0) {
        off++;
        continue;
      }

      let tag = parseInt(value.substr(off, 4), 16);
      off += 4;
      let len = parseInt(value.substr(off, 5));
      off += 5;

      if (off + len > value.length) {
        this.parseError = "INVALID CTV";
        return;
      }

      let val = value.substr(off, len);
      off += len;
      let tlv = new TLV(tag, ByteArray.fromString(val, "utf8"));

      ByteArray.concat([bytes, tlv.byteArray]);
    }

    return bytes || bytes;
  }

  private parseHex(hexValue: string): ByteArray {
    this.parseError = undefined;

    let bytes: ByteArray;
    try {
      bytes = ByteArray.fromString(hexValue, "hex");
    } catch (E) {
      this.parseError = "INVALID HEX";
      return;
    }

    return bytes;
  }

  tlvInput: string;

  dolInput: string;

  dolBuffer: string;

  parseError: string;

  rootTLVInfo: RootTLVInfo;

  private dolProcessor: DOLProcessor = new DOLProcessor();

  private convertTLVInput(newValue: string): ByteArray {
    if (this.tlvFormat == "ctv") {
      return this.parseCTV(newValue);
    } else {
      return this.parseHex(newValue);
    }
  }

  processDOL(newValue: string) {
    let bytes = this.convertTLVInput(newValue);

    try {
      this.dolProcessor.tlvBytes = bytes;
    } catch (E) {
      this.parseError = "INVALID TLV DATA";
      return;
    }

    try {
      this.dolProcessor.dolToBuffer();

      this.dolBuffer = this.dolProcessor.dataBuffer.toString();
    } catch (E) {
      this.parseError = "INVALID DOL DATA";
      return;
    }
  }

  private decodeTLV(newValue: string) {
    switch (this.tlvFormat) {
      case "ber":
        this.rootTLVInfo.encoding = TLV.Encodings.EMV;
        break;
      case "dgi":
        this.rootTLVInfo.encoding = TLV.Encodings.DGI;
        break;
      case "ctv":
        this.rootTLVInfo.encoding = TLV.Encodings.EMV;
        break;
    }

    this.rootTLVInfo.expandDepth = this.tlvFormat == "ber" ? Infinity : 1;

    let bytes = new ByteArray();

    try {
      bytes = this.convertTLVInput(newValue);
    } catch (E) {
      this.rootTLVInfo.bytes = bytes;
      return;
    }

    try {
      this.rootTLVInfo.bytes = bytes;
    } catch (E) {
      this.parseError = "INVALID TLV DATA";
      return;
    }

    if (this.rootTLVInfo.children.length) {
      this.selectedTLVInfo = this.rootTLVInfo.children[0];

      //new TLVInfo(this.tlvDatabase, tlv, this.rootTLVInfo.encoding, 1);
    }
  }

  selectedTLVInfo: TLVInfo;

  // private doEncode() {
  //
  // }
  dataFormat: DataFormat = "hex";
  setDataFormat(dataFormat: string) {
    this.dataFormat = TLVXParams.convertDataFormat(dataFormat);
    this.refresh();
  }

  tlvInputChanged(newValue: string) {
    switch (this.mode) {
      case "decode":
        this.decodeTLV(newValue);
        break;

      case "dol":
        this.processDOL(newValue);
        break;
    }
  }

  private xx(infos: Array<TLVInfo>, indent: number): string {
    let text = "";
    for (let info of infos) {
      text += "  ".repeat(indent);
      text += info.tlv.tagAsHex + " " + info.tlv.lenAsHex;
      if (info.children.length)
        text += "\n" + this.xx(info.children, indent + 1);
      else text += " " + info.tlv.value.toString() + "\n";
    }

    return text;
  }

  reformatTLV() {
    let text = this.xx(this.rootTLVInfo.children, 0);
    this.tlvInput = text;
  }
  cleanupTLV() {
    let text = this.xx(this.rootTLVInfo.children, 0);
    this.tlvInput = text.replace(/ /g, "").replace(/\n/g, "");
  }

  render() {
    const view = this;

    return (
      <section class="panel-block">
        <div class="tree-pane" if="mode=='decode'">
          {this.rootTLVInfo.children.map(info => (
            <tlv-node tlv-info={info} />
          ))}
        </div>

        {this.rootTLVInfo.children.length == 0 ? (
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
                  (view.tlvInput =
                    "9505 3399AA55FF 700e 5a086271550000000001 5f340100")
                }
              >
                700e 5a086271550000000001 5f340100
              </a>
            </p>
          </div>
        ) : null}
      </section>
    );
  }
}

export class DOLProcessor {
  tlvBytes: ByteArray;
  dolBytes: ByteArray;
  dataBuffer: ByteArray;

  dolToBuffer() {
    //let tlvParser = new TLVParser(this.tlvBytes);
    //let dolParser = new TLVParser(this.tlvBytes, { extract: "tl" }); //TLV.Encodings.EMV
  }
}

interface TLVXParamHash {
  mode?: TLVXMode;
  tlvFormat?: TLVXFormat;
  context?: string;
}

export class TLVXParams implements TLVXParamHash {
  mode: TLVXMode;
  tlvFormat: TLVXFormat;
  context: string;

  constructor(params: TLVXParamHash = {}) {
    let defaults: TLVXParamHash = {
      mode: "decode",
      tlvFormat: "ber",
      context: ""
    };

    let xparams = Object.assign({}, defaults, params);

    this.mode = TLVXParams.convertMode(xparams.mode);
    this.tlvFormat = TLVXParams.convertTLVFormat(xparams.tlvFormat);
    this.context = xparams.context || "default";
  }

  static convertMode(value: string): TLVXMode {
    const values: TLVXMode[] = ["decode", "encode", "lookup", "dol"];

    let index = values.indexOf(value.toLowerCase() as TLVXMode);

    return values[index < 0 ? 0 : index];
  }

  static convertTLVFormat(value: string): TLVXFormat {
    const values: TLVXFormat[] = ["auto", "ber", "dgi", "ctv"];

    let index = values.indexOf(value.toLowerCase() as TLVXFormat);

    return values[index < 0 ? 0 : index];
  }

  static convertDataFormat(value: string): DataFormat {
    const values: DataFormat[] = ["auto", "hex", "base64", "text"];

    let index = values.indexOf(value.toLowerCase() as DataFormat);

    return values[index < 0 ? 0 : index];
  }
}

/*function render() {
  <main id="tlvx" class="tool">

    <header class="tool-header">
      <nav class="navbar is-light">
        <div class="navbar-brand">
          <div class="navbar-item">
            <span class="icon is-large has-text-info">
              <i class="fa fa-lg fa-wrench"></i>
            </span>
            <span class="subtitle is-3">
              TLV Explorer
            </span>
          </div>
          <div class="navbar-item">
          </div>
        </div>

        <div class="navbar-start" style="width: 150px;">
          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">
              <span class="icon is-large has-text-success">
                <i class="fa fa-lg fa-book"></i>
              </span>
              EMV
            </a>

            <div class="navbar-dropdown has-background-grey-darker">
              <div class="menu" style="padding: 0.5rem">
                <p class="menu-label">
                  EMV
                </p>
                <ul class="menu-list">
                  <li><a>EMV 4.3</a></li>
                  <li><a>M/Chip</a></li>
                  <li><a>VSDC</a></li>
                </ul>
                <p class="menu-label">
                  Contactless
                </p>
                <ul class="menu-list">
                  <li><a>Kernel 2</a></li>
                  <li><a>Kernel 3</a></li>
                </ul>
              </div>
            </div>

          </div>

        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="select">
              <select>
                <option>EMV</option>
                <option>M/Chip</option>
                <option>VSDC</option>
              </select>
            </div>
          </div>
          <div class="navbar-item">
            <div class="buttons has-addons" xstyle="padding-top: 8px; display: inline-block; border: 1px #ddd; border-radius: 3px; padding: 3px;">
              <a class="button {tlvFormat == 'ber' ? 'is-active is-primary':'is-secondary'}" onClick="setTLVFormat('ber')">BER</a>
              <a class="button {tlvFormat == 'dgi' ? 'is-active is-primary':'is-secondary'}" onClick="setTLVFormat('dgi')">DGI</a>
              <a class="button {tlvFormat == 'ctv' ? 'is-active is-primary':'is-secondary'}" onClick="setTLVFormat('ctv')">CTV</a>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <section class="tool-area" style="">
      <div show="parseError" style="border-radius: 5px; border-width: 2px; border-style: dashed; background-color: red; color: white; font-size: 20px; position: absolute; right: 0; top: 0;">
        <span class="xtooltip">{parseError}</span>
      </div>

      <section class="panel tool-panel">
        <header class="panel-heading">
          <nav class="navbar is-light">
            <div class="navbar-brand">
              <div class="navbar-item">
                <span class="icon is-medium has-border">
                  <i class="fa fa-terminal"></i>
                </span>
              </div>
              <div class="navbar-item">
                Byte Data Entry
              </div>
            </div>


            <div class="navbar-end">
              <div class="navbar-item" style="margin-right: 2em;">
                <div class="buttons has-addons is-small" >
                  <a class="button is-small {dataFormat == 'hex' ? 'is-active is-primary':'is-secondary'}" onClick="setDataFormat('hex')">HEX</a>
                  <a class="button is-small {dataFormat == 'base64' ? 'is-active is-primary':'is-secondary'}" onClick="setDataFormat('base64')">BASE64</a>
                  <a class="button is-small {dataFormat == 'text' ? 'is-active is-primary':'is-secondary'}" onClick="setDataFormat('text')">TEXT</a>
                </div>
              </div>

              <a class="navbar-item">
                <span class="icon is-medium has-border">
                  <i class="fa fa-lg fa-plus-square"></i>
                </span>
              </a>
              <a class="navbar-item">
                <span class="icon is-medium has-border">
                  <i class="fa fa-folder-open"></i>
                </span>
              </a>
              <a class="navbar-item">
                <span class="icon is-medium has-border">
                  <i class="fa fa-play"></i>
                </span>
              </a>
              <div class="navbar-item">
                <div class="dropdown is-right">
                  <div class="dropdown-trigger">
                    <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu">
                      <span>...</span>
                    </button>
                  </div>
                  <div class="dropdown-menu" id="dropdown-menu" role="menu">
                    <div class="dropdown-content">
                      <a href="#" class="dropdown-item">
                        Dropdown item
                      </a>
                      <a class="dropdown-item">
                        Other dropdown item
                      </a>
                      <a href="#" class="dropdown-item is-active">
                        Active dropdown item
                      </a>
                      <a href="#" class="dropdown-item">
                        Other dropdown item
                      </a>
                      <hr class="dropdown-divider">
                      <a href="#" class="dropdown-item">
                        With a divider
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </header>

        <section class="panel-block byte-input-pane" ref="byteInputElement">
          <textarea placeholder="Type or paste TLV data here"
            value="tlvInput & debounce:300" ref="byteInputElement">
          </textarea>
        </section>
      </section>

      <section class="tool-panel panel">
        <header class="panel-heading">
          <nav class="navbar is-light">
            <div class="navbar-brand">
              <div class="navbar-item">
                <span class="icon is-medium has-border">
                  <i class="fa fa-wrench"></i>
                </span>
              </div>
              <div class="navbar-item">
                Decoded TLV
              </div>
            </div>
          </nav>
        </header>

        <section class="panel-block">
          <div class="tree-pane" if="mode=='decode'">
            <div repeat.for="info of rootTLVInfo.childTLVInfos">
              <tlv-node tlv-info="info"></tlv-node>
            </div>

            <div if="rootTLVInfo.childTLVInfos.length == 0" style="height: 400px; border: 3px dotted #888; border-radius: 5px; padding: 10px;">
              <h3><i>Explore</i> mode</h3>
              <p>Decompose hexadecimal TLV data, and represent it as a tree.</p>
              Context sensitive lookup, ISO / EMV and different payment-card standards</p>
              <br/>
              <p>try something like <a onClick="tlvInput = '9505 3399AA55FF 700e 5a086271550000000001 5f340100'">700e 5a086271550000000001 5f340100</span></a>
            </div>
          </div>

          <div id="dol-input" if="mode=='dol'" class="hex-pane">
            <textarea id="dol-in" placeholder="Type or paste hexadecimal DOL (data-object-list) here"
              value="dolInput & debounce:300">
            </textarea>
          </div>

          <div id="dol-buffer" if="mode=='dol'" class="hex-pane">
            <textarea id="dol-in" placeholder="Type or paste hexadecimal DOL (data-object-list) here"
              value="dolBuffer & debounce:300">
            </textarea>

            <div if="rootTLVInfo.childTLVInfos.length == 0" >
              <h3><i>Explore</i> mode</h3>
              <p>Decompose TLV data, and represent it as a tree.</br>
              <p>Context sensitive lookup, ISO / EMV and different payment-card standards</p>
              <p>Handles standard BER, GlobalPlatform DGI and custom CTV encodings</p>
              <br/>
              <p>Try something like <a click="tlvInput = '700e 5a086271550000000001 5f340100'">700e 5a086271550000000001 5f340100</span></a>
            </div>
          </div>
        </section>
      </section>

      <section class="tool-panel panel">
        <header class="panel-heading">
          <nav class="navbar is-light">
            <div class="navbar-brand">
              <div class="navbar-item">
                <span class="icon is-medium has-border">
                  <i class="fa fa-sign-out-alt"></i>
                </span>
              </div>
              <div class="navbar-item">
                TLV Details
              </div>
            </div>
          </nav>
        </header>
        <section class="panel-block" style="padding: 0.5rem; display: block;">
          <div class="field has-addons">
            <p class="control">
              <a class="button is-static" style="width: 8rem">
                <span class="icon"><i class="fas fa-tag"></i></span>
                <span><b>Tag</b></span>
              </a>
            </p>
            <p class="control">
              <input class="input has-background-light" readonly type="text" value="{selectedTLVInfo.tlv.tagAsHex}">
            </p>
            <p class="control is-expanded">
              <input class="input has-background-light" readonly type="text" placeholder="Description" value="TVR - Terminal Verification Results">
            </p>
          </div>

          <div class="field has-addons">
            <p class="control">
              <a class="button is-static" style="width: 8rem" >
                <span class="icon"><i class="fas fa-file-alt"></i></span>
                <span><b>Value</b></span>
              </a>
            </p>
            <p class="control has-icons-right is-expanded">
              <input class="input has-background-light" readonly type="text" value="{selectedTLVInfo.tlv.value.toString()}">
              <span class="icon is-medium is-right">
              </span>
            </p>
          </div>
        </section>
        <section class="panel-block" style="padding: 0.5rem">
          <tlv-details-panel tlv-info="selectedTLVInfo" if="selectedTLVInfo"></tlv-details-panel>
        </section>
      </section>
    </section>
  </main>

}
*/
