import "mocha";
//import { expect } from "chai";
import { FlowParser, Tokenizer } from "@cryptographix/flow";

let s: string[] = [];

s.push("a bb cc dd\n1234 5678 9876");
s.push("a\nbb\r\ncc\n\rdd");
s.push("[1,2,3,4]");
s.push("{a:1,b:2,c:3,d:4}");
s.push("'literal'");
s.push('"literal"');

function tokenize(s: string) {
  let tokens = [];
  let tokenizer = new Tokenizer();

  tokenizer.startParse(s);

  while (!tokenizer.isEOF) tokens.push(tokenizer.nextToken());

  return tokens;
}

describe("Tokenizer", () => {
  beforeEach(function() {
    //debugger;
  });
  s.forEach(ss => {
    it("must tokenize: " + ss, () => {
      console.log(tokenize(ss));
    });
  });

  //expect( schema ).to.exist; //('Schema for X not found');
});

let values = [];
values.push("1234");
values.push("'a string'");
values.push("{}");
values.push('{ id1: "string" }');
values.push('{ id1: "s1", id2: "s2"}');
values.push('{ id1: { id1_1: "s1.1" }, id2: "s2"}');
//values.push('{ id1: [ "id1_1", "s1.1" ], id2: "s2"}');

describe("Parse const values", () => {
  beforeEach(function() {
    //debugger;
  });
  values.forEach(pp => {
    it("Parse: " + pp, () => {
      const parser = new FlowParser(pp);

      let flow = parser.parseFlow();
      console.log("result: ", JSON.stringify(flow.toJSON(), null, 2));
    });
  });
});

/*let pars = [];
pars.push("[]");
pars.push("[ 1 ]");
pars.push("[ 1, 2, 3 ]");
pars.push("[ \"s1\", 's2' ]");
pars.push('[ "id1", { id1_1: "s1.1" }, "id2", "s2"]');
describe("Parse arrays", () => {
  beforeEach(function() {
    //debugger;
  });
  pars.forEach(pp => {
    it("Parse: " + pp, () => {
      const parser = new FlowParser(pp);

      let flow = parser.parseFlow();
      console.log("result: ", JSON.stringify(flow.toJSON(), null, 2));
    });
  });
});*/

let blks = [];
blks.push("A()");
blks.push("A() |> B()");
blks.push("A() |> B() |> C() |> D() |> E() |> F()");
blks.push("A({}) |> B({}) |> C({}) |> D({}) |> E({}) |> F({})");
blks.push("A({a:1, b:2}) |> B()");

describe("Parse pipelines", () => {
  beforeEach(function() {
    //debugger;
  });
  blks.forEach(bb => {
    it("Parse: " + bb, () => {
      const parser = new FlowParser(bb);

      let flow = parser.parseFlow();
      console.log("result: ", JSON.stringify(flow.toJSON(), null, 2));
    });
  });
});
