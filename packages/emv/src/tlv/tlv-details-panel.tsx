import { View } from "@cryptographix/core";
import { TLVInfo } from "./tlv-database";

export class TLVDetailsPanel extends View {
  tlvInfo: TLVInfo;

  constructor(props: { tlv: TLVInfo }) {
    super();

    this.tlvInfo = props.tlv;
    this.tlvInfoChanged();
  }

  tlvInfoChanged() {
    this.tvrBit = [];

    for (let i = 0; i < 5; ++i) {
      for (let j = 0; j < 8; ++j) {
        let val = this.tlvInfo.tlv.value[i] & (1 << (7 - j));
        if (val) this.tvrBit.push(i * 8 + j);
      }
    }
  }

  bitNames = {
    0: [
      "Cash",
      "Goods",
      "Services",
      "Cashback",
      "Inquiry",
      "Transfer",
      "Payment",
      "Administrative"
    ],
    1: ["RFU", "RFU", "RFU", "RFU", "RFU", "RFU", "RFU", "RFU"],
    2: [
      "Numeric Keys",
      "Alphabetic Keys",
      "Command Keys",
      "Function Keys",
      "RFU",
      "RFU",
      "RFU",
      "RFU"
    ],
    3: [
      "Print, attendant",
      "Print, cardholder",
      "Display, attendant",
      "Display, cardholder",
      "RFU",
      "RFU",
      "Code Table 10",
      "Code Table 9"
    ],
    4: [
      "Code Table 8",
      "Code Table 7",
      "Code Table 6",
      "Code Table 5",
      "Code Table 4",
      "Code Table 3",
      "Code Table 2",
      "Code Table 1"
    ]
  };

  tvrBit: number[] = [];
  bitToIndex(i, j): number {
    return i * 8 + j;
  }

  updateCounter: number = 0;

  hasBit(i, j) {
    return this.tvrBit.indexOf(this.bitToIndex(i, j)) >= 0;
  }

  tvrBitChanged(newValue /*, oldValue*/) {
    console.log("changed" + newValue);
  }

  selectedTab = 0;

  render() {
    let view = this;
    const tabs = [0, 1, 2, 3, 4];
    const bits = [0, 1, 2, 3, 4, 5, 6, 7];

    return (
      <section class="panel">
        <header class="panel-heading is-size-6 has-background-grey-light">
          <div class="tabs">
            {tabs.map(tab => (
              <ul>
                <li class={this.selectedTab == tab ? "is-active" : ""}>
                  <a
                    onClick={evt => {
                      view.selectedTab = tab;
                      view.refresh();
                    }}
                  >
                    {`Byte ${tab + 1}`}
                  </a>
                </li>
              </ul>
            ))}
          </div>
        </header>

        {tabs.map(i => (
          <section
            style={`display: ${i == this.selectedTab ? "block" : "none"}`}
          >
            <p
              class="panel-heading is-size-6"
              style="padding: 0.5em; background-color: #ccc;"
            >
              <b>
                {i == 0
                  ? "Transaction Type Capability"
                  : i == 1
                  ? "Transaction Type Capability #"
                  : i == 2
                  ? "Terminal Data Input Capability"
                  : i == 3
                  ? "Terminal Data Output Capability"
                  : i == 4
                  ? "Terminal Data Output Capability"
                  : ""}
              </b>
            </p>
            <div class="panel-block">
              <table class="tvr">
                <tbody>
                  <tr>
                    <th>b8</th>
                    <th>b7</th>
                    <th>b6</th>
                    <th>b5</th>
                    <th>b4</th>
                    <th>b3</th>
                    <th>b2</th>
                    <th>b1</th>
                    <th>Description</th>
                  </tr>
                  {bits.map(j => (
                    <tr>
                      <td>{j == 0 ? (this.hasBit(i, j) ? "1" : "0") : " "}</td>
                      <td>{j == 1 ? (this.hasBit(i, j) ? "1" : "0") : " "}</td>
                      <td>{j == 2 ? (this.hasBit(i, j) ? "1" : "0") : " "}</td>
                      <td>{j == 3 ? (this.hasBit(i, j) ? "1" : "0") : " "}</td>
                      <td>{j == 4 ? (this.hasBit(i, j) ? "1" : "0") : " "}</td>
                      <td>{j == 5 ? (this.hasBit(i, j) ? "1" : "0") : " "}</td>
                      <td>{j == 6 ? (this.hasBit(i, j) ? "1" : "0") : " "}</td>
                      <td>{j == 7 ? (this.hasBit(i, j) ? "1" : "0") : " "}</td>
                      <td>
                        <span class={this.hasBit(i, j) ? "bgset" : "bgunset"}>
                          {this.bitNames[i][j]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </section>
    );
  }
}
