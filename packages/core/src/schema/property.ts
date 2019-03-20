import { ISchema } from '.';

/**
 * Base descriptor for a property defined by Schema
 *
 * To be extended by specific typed schema items
 */
export interface ISchemaProperty<Type> {
  //
  type: string | ISchema<Type>;

  //
  name?: string;

  //
  label?: string;

  //
  ignore?: boolean;

  //
  viewWidth?: number;

  //
  priority?: number;

  //
  optional?: boolean;

  //
  defaultValue?: Type;

  //
  converter?: {
    fromJSON( name: string, obj: object ): Type;
    toJSON( prop: Type ): any;
  };
}

/**
 *
 */
export interface IBooleanSchemaProp extends ISchemaProperty<boolean> {
  type: 'boolean';

  //
  trueLabel?: string;

  //
  falseLabel?: string;
}

/**
 *
 */
export interface IStringSchemaProp extends ISchemaProperty<string> {
  type: 'string';

  //
  minLength?: number;

  //
  maxLength?: number;
}

/**
 *
 */
export interface INumberSchemaProp extends ISchemaProperty<number> {
  type: 'number';

  //
  integer?: boolean;

  //
  min?: number;

  //
  max?: number;

  //
  step?: number;
}

/**
 *
 */
export interface IEnumSchemaProp extends ISchemaProperty<string> {
  type: 'enum';

  //
  options: {
    //tring]: string;
  }
}

/**
 *
 */
export interface IBytesSchemaProp extends ISchemaProperty<ArrayBuffer> {
  type: 'bytes';

  //
  minSize?: number;

  //
  maxSize?: number;
}

/**
 *
 */
export interface IObjectSchemaProp<TO extends Object = {}> extends ISchemaProperty<TO> {
  //
  type: ISchema<TO>;
}

export type ISchemaPropertyType = IBooleanSchemaProp | IStringSchemaProp | INumberSchemaProp | IEnumSchemaProp | IBytesSchemaProp | IObjectSchemaProp;
