import { Block, BlockSettings } from './block';

export interface BlockMeta {
  name: string;
  namespace: string;
  title: string;
  category: string;
  type: string;
  settings: { new(): BlockSettings }
}

type BlockConstructor = { new(): Block<any>; };

export class BlockFactory {
  private _blockRegistry: Map<typeof Block, BlockMeta>;

  constructor() {
    this._blockRegistry = new Map<typeof Block, BlockMeta>();
  }

  register(meta: BlockMeta, blockConstructor: BlockConstructor ) {
    this._blockRegistry.set( blockConstructor, meta );
  }
}

export const blockFactory = new BlockFactory();

export function block( meta: BlockMeta ) {
  return function( target: BlockConstructor ) {
    blockFactory.register( meta, target );
  }
}
