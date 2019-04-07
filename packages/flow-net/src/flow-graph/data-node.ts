import { FlowNode } from "./flow-node";

/**
 *
 */
export class DataNode extends FlowNode {
  //
  _result: Promise<any> = null;

  /**
   *
  constructor(public parentNode: FlowNode) {
    super(parentNode);
  }
  */

  /**
   *
   */
  setup() {
    return super.setup();
  }

  /**
   *
   */
  tearDown() {
    return super.tearDown();
  }

  /**
   *
   */
  get canTrigger(): boolean {
    return this.status == "idle";
  }

  /**
   *
   */
  async trigger(_reverse?: boolean) {
    if (!this.canTrigger) return Promise.reject("Unable to trigger");

    this.output = {
      ...this.input
    };

    return Promise.resolve(true);
  }
}
