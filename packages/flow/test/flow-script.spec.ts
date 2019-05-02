import "mocha";
import { expect } from "chai";
import { Flow } from "@cryptographix/flow";

let scripts: { id: string; script: string; log?: boolean }[] = [];
function addTest(id: string, script: string, log = false) {
  scripts.push({ id: id, script: script, log: log });
}

addTest(
  "Map of constant strings",
  `{
  id1: 'id1',
  id2: 'id2'
}`
);

addTest(
  "Map of constant integers",
  `{
  int0: 0,
  int10: 10,
  intminus100: -100,
  hex1234: 0x1234
}`
);

addTest(
  "Map of mixed constants",
  `{
  id1: 'id1',
  int22: 22,
  isTrue: true,
  isFalse: false
}`
);

addTest(
  "Hex constants",
  `{
  hex00: $hex('00'),
  hex1234: $hex('1234'),
  hexFFFF: $hex(' FF FF '),
  hex16bytes: $hex('00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F'),
  hex32bytes: $hex('00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  10 11 12 13 14 15 16 17 18 19 1A 1B 1C 1D 1E 1F')
}`
);

addTest(
  "base64 constants",
  `{
  b64_0000: $base64('0000'),
  b64_test: $base64('YSB0ZXN0IGJhc2U2NCBzdHJpbmc=')
}`
);

addTest(
  "$get/$set",
  `{
  id0: 0,
  id1: 100,
  id2: $get('id1')
} |> {
  id0: id0,
  id1: 200,
  id2: $get('id1') |> $set('id0')
}`,
  false
);

addTest(
  "Pipe consts to selector",
  `{
  id1: 'id1',
  id2: 'id2'
} |> { id1: id1, id2: id2 }`
);

addTest(
  "Pipe consts to identity selector-map",
  `{
  id1: 'id1',
  id2: 'id2'
} |> { id1, id2 }`
);

addTest(
  "Pipe consts to identity-selector to selector",
  `{
  id1: 'id1',
  id2: 'id2'
} |> { id1, id2 } |> { id1: id1, id2: id2 }`
);

/*nets.push(`
{
  key: {
    key: {
      key: HEX('IMK'),
      data: HEX('PAN')
    } |> DERIVE('Derive MKac',{algorithm:"DES2"}),
    data: HEX('ATC')
  } |> DERIVE('Derive SKac'),
  data: HEX('BUFFER')
} |> MAC('Generate AC')
  `);*/

describe("FlowScript parsing", () => {
  beforeEach(function() {
    //debugger;
  });
  scripts.forEach(net => {
    const log = net.log;

    describe("Script: " + net.id, () => {
      let flow: Flow;

      it("must parse to a flow graph", () => {
        flow = Flow.fromFlowScript(net.script);

        expect(flow)
          .to.be.an("object")
          .and.have.property("$type", "flow");
      });

      it("must be serializable to JSON", () => {
        const flowObj = Flow.toJSON(flow);

        if (log) console.log("result: ", JSON.stringify(flowObj, null, 2));
        expect(flowObj)
          .to.be.an("object")
          .and.have.property("$flow");
      });

      let serializedFlowScript: string;

      it("must be seriabilizable back to FlowScript", () => {
        serializedFlowScript = Flow.toFlowScript(flow);

        if (log) console.log("result: ", serializedFlowScript);
        expect(serializedFlowScript).to.be.a("string");
      });

      let newFlow: Flow;
      it("... which must be parsable", () => {
        newFlow = Flow.fromFlowScript(serializedFlowScript);

        if (log)
          console.log(
            "result: ",
            JSON.stringify(Flow.toJSON(newFlow), null, 2)
          );
        expect(newFlow)
          .to.be.an("object")
          .and.have.property("$type", "flow");
      });

      it("... which must be equal to previously serialized flow", () => {
        const reScripted = Flow.toFlowScript(newFlow);

        if (log) console.log("result: ", reScripted);
        expect(reScripted).to.be.equal(serializedFlowScript);
      });
    });
  });
});
