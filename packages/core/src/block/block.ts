import { IViewable, IView } from '../viewable';
import { ISchema, Schema, ISchemaProperty, IConstructable, schemaStore } from '../schema/index';

/**
 * Schema descriptor for a Block
 */
export interface IBlockSchema<BS extends BlockSettings> extends ISchema<Block<BS>> {
  type: 'block';

  name: string;

  namespace: string;

  title: string;

  category: string;

  settings: IConstructable<BS>;
}

/**
 * Block Settings store configuration items for a block
 *
 * BlockSettings can be serialized
 */
export abstract class BlockSettings {
//  static initSettings() {};
}

/*export interface IBlock<S extends BlockSettings> extends IViewable {
  settings: S;

  getSettingValue<RT>(key: keyof S): RT;

  settingChanged(setting: string, value: string ): boolean;
}*/

export abstract class Block<BS extends BlockSettings={}> implements IViewable /*implements IBlock<S>*/ {
  _view?: IView;

  constructor( ) {
    let blockSchema = schemaStore.ensure<IBlockSchema<BS>>( this.constructor );

    this._settings = new blockSchema.settings();
  }

  protected _settings: BS;

  get settings(): BS {
    return this._settings;
  }

  set settings( settings: BS ) {
    let blockSchema = schemaStore.ensure<IBlockSchema<BS>>( this.constructor );

    this._settings = Schema.initObjectFromClass<BS>( blockSchema.settings, settings );
    //console.log( 'Settings: ' + JSON.stringify( settings ))
  }

  getSettingSchema<TSchemaProp extends ISchemaProperty<any>>(key: keyof BS): TSchemaProp {
    let _schema = schemaStore.ensure( this._settings.constructor );
    let _schemaItem = _schema.properties[ key as string ] as TSchemaProp;

    return _schemaItem;
  }

  getSettingValue<RT=any>(key: keyof BS): RT {
    return this._settings[ key ] as unknown as RT;
  }

  settingChanged( _setting: string, _value: string ): boolean {
    return false;
  }
}


export class InvalidInputError extends Error {};
