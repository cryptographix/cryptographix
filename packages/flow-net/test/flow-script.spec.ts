import "mocha";
//import { expect } from "chai";
import { FlowParser, Flow } from "@cryptographix/flow-net";

let nets = [];

nets.push(`
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
  `);

describe("Parse nets to graph", () => {
  beforeEach(function() {
    //debugger;
  });
  nets.forEach(net => {
    it("Parse: " + net, () => {
      const parser = new FlowParser(net);

      let res = parser.parseFlow();

      console.log("result: ", JSON.stringify(res, null, 2));
    });
  });
});

describe("Parse nets to graph to JSON", () => {
  beforeEach(function() {
    //debugger;
  });
  nets.forEach(net => {
    it("Parse: " + net, () => {
      const graph = Flow.fromFlowString(net);

      console.log("result: ", JSON.stringify(Flow.toJSON(graph), null, 2));
    });
  });
});

describe("Parse net strings to graph and back again", () => {
  beforeEach(function() {
    //debugger;
  });
  nets.forEach(net => {
    it("Parse: " + net, () => {
      const graph = Flow.fromFlowString(net);

      console.log("result: ", Flow.toFlowString(graph));
    });
  });
});
