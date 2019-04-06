import { Transformer, block } from "@cryptographix/core";

class MessageDigestConfig {}

//@block({})
export class MessageDigestBlock extends Transformer<MessageDigestConfig> {
  /**
   * Constructor
   */
  constructor() {
    super();
  }

  async trigger() {}
}
