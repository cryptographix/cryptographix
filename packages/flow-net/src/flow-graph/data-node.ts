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
    super.setup();
  }

  /**
   *
   */
  tearDown() {
    super.tearDown();
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

    this._output = {
      ...this._input
    };

    return Promise.resolve(true);
  }
}
