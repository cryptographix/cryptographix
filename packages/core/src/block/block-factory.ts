import { IConstructable, Omit, schemaStore } from '../index';
import { Block, IBlockSchema } from './block';

/*export class BlockFactory {
  private _blockRegistry: Map<typeof Block, BlockMeta>;

  constructor() {
    this._blockRegistry = new Map<typeof Block, BlockMeta>();
  }

  register(meta: BlockMeta, blockConstructor: BlockConstructor ) {
    this._blockRegistry.set( blockConstructor, meta );
  }
}

export const blockFactory = new BlockFactory();*/

export function block( meta: Omit<IBlockSchema, 'target'|'properties'|'type'> ) {
  return function( target: IConstructable<Block> ) {
    let schema = schemaStore.ensure<IBlockSchema>( target, 'block' );

    schema = {
      ...schema,
      ...meta,
    };

    schemaStore.set( target, schema );
  }
}
