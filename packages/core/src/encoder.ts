import { BlockSettings, Block } from './block/block';

export interface Encoder<S extends BlockSettings> {
  transform(content: Uint8Array, isEncode: boolean): Promise<Uint8Array>;
}

export abstract class Encoder<S extends BlockSettings> extends Block<S> implements Encoder<S> {

  encode( content: Uint8Array ): Promise<Uint8Array> {
    return this.transform(content, true);
  }

  decode( content: Uint8Array ): Promise<Uint8Array> {
    return this.transform(content, false);
  };
}

/*export class BlockSettingHelper<S extends BlockSettings, TItem extends ISchemaProp> {
  protected _block: Block<S>;
  protected _key: keyof S;
  protected _schema: ISchema;
  protected _SchemaProp: TItem;

  constructor( block: Block<S>, key: keyof S ) {
    this._block = block;
    this._key = key;

    this._SchemaProp = block.getSettingSchema<TItem>( key );
  }
}*/
