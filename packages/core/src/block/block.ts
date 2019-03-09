import { IViewable, IView } from '../viewable';
import { ISchemaProp, schemaStore } from '../schema';

export abstract class BlockSettings {
}

export interface IBlock<S extends BlockSettings> extends IViewable {
  settings: S;

  getSettingValue<RT>(key: keyof S): RT;

  settingChanged(setting: string, value: string ): boolean;
}

export abstract class Block<S extends BlockSettings> implements IBlock<S> {
  _view?: IView;

  constructor( ) {
  }

  protected _settings: S;

  get settings(): S {
    return this._settings;
  }

  set settings( settings: S ) {
    this._settings = settings;
    //console.log( 'Settings: ' + JSON.stringify( settings ))
  }

  getSettingSchema<TItem extends ISchemaProp>(key: keyof S): TItem {
    let _schema = schemaStore.get( this._settings.constructor );
    let _schemaItem = _schema.items[ key as string ] as unknown as TItem;

    return _schemaItem;
  }

  getSettingValue<RT=any>(key: keyof S): RT {
    return this._settings[ key ] as unknown as RT;
  }

  settingChanged( _setting: string, _value: string ): boolean {
    return false;
  }
}


export class InvalidInputError extends Error {};

/*interface BlockSettingConstructor {
  new<S extends BlockSettings>(): S;
}*/
