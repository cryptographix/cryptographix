import { Block } from "./block/block";
import { BlockConfiguration } from "./block/block-config";

export interface Encoder<BS extends BlockConfiguration> {
  transform(content: Uint8Array, isEncode: boolean): Promise<Uint8Array>;
}

export abstract class Encoder<BS extends BlockConfiguration> extends Block<BS>
  implements Encoder<BS> {
  async encode(content: Uint8Array): Promise<Uint8Array> {
    return this.transform(content, true);
  }

  async decode(content: Uint8Array): Promise<Uint8Array> {
    return this.transform(content, false);
  }
}

/*export class BlockSettingHelper<S extends BlockConfiguration, TItem extends ISchemaProp> {
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
