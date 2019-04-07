import { FlowNode } from "./flow-node";

export class RootNode extends FlowNode {
  //
  protected _root?: FlowNode;

  constructor(root: FlowNode = null) {
    super();

    this.root = root;
    if (root) root.parent = this;
  }

  /**
   *
   */
  get root(): FlowNode {
    return this.root;
  }

  /**
   *
   */
  setInput(data: object) {
    this.root.setInput(data);

    return this;
  }

  /**
   *
   */
  getOutput(): object {
    return this.root.getOutput();
  }

  /**
   *
   */
  setup() {
    this.root.setup();

    return this;
  }

  /**
   *
   */
  tearDown() {
    this.root.tearDown();

    return this;
  }

  /**
   *
   */
  get canTrigger() {
    return super.canTrigger && !!this.root && this.root.canTrigger;
  }

  /**
   *
   */
  trigger(): Promise<boolean> {
    return this.root.trigger();
  }
}

/**
  SubFlow types
    Parallel

    Sequential:
      List of nodes  'Pipe'
      In: Bus = Port[]
      Out: Bus = Port[]

      wire up In to first Node in sequence
      wire up last-node to Out

    DataBus -> Port Rendezvous
      Terminal = Ports

    Node:
      execCycle = 0
      On data-in do
        inArrived |= (1 << portIndex)
        in[ portID ] = data
        when ( inArrived & maskArrived ) == maskArrived
          exec trigger:  busy=true
          execCycle = runner.cycle
      On data-out do
        busy = false
        propagate data


  Licks
    Startup: Send `{}` to root node
      Sets ''
    Lick: For each node whose state = 'IDLE'

 */
