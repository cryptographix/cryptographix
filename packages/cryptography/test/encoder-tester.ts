import "mocha";
import * as chai from "chai";
import chaiBytes = require("chai-bytes");
chai.use(chaiBytes);

import {
  ByteArray,
  Encoder,
  BlockConfiguration,
  H2BA,
  BA2H
} from "@cryptographix/core";

interface Test<S extends BlockConfiguration = {}> {
  name?: string;
  direction?: string;
  content: string | ByteArray;
  expectedResult: string | ByteArray;
  settings: S;
}

/**
 * Utility class for testing Encoder objects.
 */
export default class EncoderTester {
  /**
   * Runs tests on encoder invokable.
   */
  static test(EncoderInvokable: { new (): Encoder<any> }, test: Test | Test[]) {
    if (Array.isArray(test)) {
      // handle multiple tests
      return test.forEach(test => EncoderTester.test(EncoderInvokable, test));
    }

    if (!test.direction || test.direction === "both") {
      // handle test in both directions
      EncoderTester.test(EncoderInvokable, {
        name: test.name,
        settings: test.settings,
        direction: "encode",
        content: test.content,
        expectedResult: test.expectedResult
      });
      EncoderTester.test(EncoderInvokable, {
        name: test.name,
        settings: test.settings,
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
        // create encoder brick instance
        const encoder = new EncoderInvokable();

        // apply settings, if any
        if (test.settings) {
          encoder.settings = test.settings;
        }

        // trigger encoder encode or decode
        const result = isEncoding
          ? encoder.encode(content)
          : encoder.decode(content);

        return result.then(result => {
          // verify result
          chai.expect(result).equalBytes(expectedResult);
          // no view should have been created during this process
          //assert.strictEqual(encoder.hasView(), false)
        });
      }
    );
  }
}
