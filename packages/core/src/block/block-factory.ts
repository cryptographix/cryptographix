import { IConstructable, Omit, schemaStore } from '../schema/index';
import { Block, BlockSettings, IBlockSchema } from './block';

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

export function block<BS extends BlockSettings>( meta: Omit<IBlockSchema<BS>, 'target'|'properties'|'type'> ) {
  return function( target: IConstructable<Block> ) {
    let schema = schemaStore.ensure<IBlockSchema<BS>>( target, 'block' );

    schema = {
      ...schema,
      ...meta,
    };

    schemaStore.set( target, schema );
  }
}
