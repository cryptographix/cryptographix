import "mocha";
import * as chai from "chai";
import chaiBytes = require("chai-bytes");
chai.use(chaiBytes);

import {
  ByteArray,
  Transformer,
  BlockConfiguration,
  H2BA,
  BA2H
} from "@cryptographix/core";

interface Test<BC extends BlockConfiguration = {}> {
  name?: string;
  direction?: string;
  content: string | ByteArray;
  expectedResult: string | ByteArray;
  config: BC;
}

/**
 * Utility class for testing Transformer objects.
 */
export default class TransformerTester {
  /**
   * Runs tests on transformer invokable.
   */
  static test(
    TransformerInvokable: { new (): Transformer<any> },
    test: Test | Test[]
  ) {
    if (Array.isArray(test)) {
      // handle multiple tests
      return test.forEach(test =>
        TransformerTester.test(TransformerInvokable, test)
      );
    }

    if (!test.direction || test.direction === "both") {
      // handle test in both directions
      TransformerTester.test(TransformerInvokable, {
        name: test.name,
        config: test.config,
        direction: "encode",
        content: test.content,
        expectedResult: test.expectedResult
      });
      TransformerTester.test(TransformerInvokable, {
        name: test.name,
        config: test.config,
        direction: "decode",
        content: test.expectedResult,
        expectedResult: test.content
      });
      return;
    }

    // read direction from test entry
    const isEncoding = test.direction.toLowerCase() === "encode";

    // convert content to bytes
    const content =
      test.content instanceof ByteArray ? test.content : H2BA(test.content);

    // convert expected result to bytes
    const expectedResult =
      test.expectedResult instanceof ByteArray
        ? test.expectedResult
        : H2BA(test.expectedResult);

    // create content and result preview that will be logged
    const contentPreview = BA2H(content);
    const expectedResultPreview = BA2H(expectedResult);

    it(
      (test.name ? `${test.name} ` : "") +
        `should ${isEncoding ? "encode" : "decode"} ` +
        `"${isEncoding ? contentPreview : expectedResultPreview}" ` +
        `${isEncoding ? "=>" : "<="} ` +
        `"${isEncoding ? expectedResultPreview : contentPreview}"`,
      async () => {
        // create transformer brick instance
        const transformer = new TransformerInvokable();

        // apply settings, if any
        if (test.config) {
          transformer.config = test.config;
        }

        debugger;

        // trigger transformer encode or decode
        const result = transformer.transform<any, any>(
          { in: content, key: test.config["key"] },
          !isEncoding
        );

        return result.then(result => {
          // verify result
          chai.expect(result["out"]).equalBytes(expectedResult);
          // no view should have been created during this process
          //assert.strictEqual(transformer.hasView(), false)
        });
      }
    );
  }
}
