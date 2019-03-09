import { ISerializer } from './serializer';

export interface IEmptyConstructor<T=any> {
  new():T;
}

export interface ISchema {
  target: IEmptyConstructor<any>;
  name?: string;
  items?: { [key: string]: ISchemaProp };
}

/**
 * Base descriptor for a property defined by Schema
 *
 * To be extended by specific typed schema items
 */
export interface ISchemaProp<T=any> {
  type: string | { new(): T };

  name?: string;

  label?: string;

  ignore?: boolean;

  viewWidth?: number;

  optional?: boolean;

  defaultValue?: T;

  converter?: ISerializer<T>;
}

export interface IBooleanSchemaProp extends ISchemaProp<boolean> {
  type: 'boolean';
  trueLabel?: string;
  falseLabel?: string;
}

export interface IStringSchemaProp extends ISchemaProp<string> {
  type: 'string';
  minLength?: number;
  maxLength?: number;
}

export interface INumberSchemaProp extends ISchemaProp<number> {
  type: 'number';
  integer?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export interface IEnumSchemaProp extends ISchemaProp<string> {
  type: 'enum';
  options: {
    elements: string[];
    labels: string[];
  }
}

export interface IBytesSchemaProp extends ISchemaProp<ArrayBuffer> {
  type: 'bytes';
  minSize?: number;
  maxSize?: number;
  stepSize?: number;
}

export interface IObjectSchemaProp<T=any> extends ISchemaProp<T> {
  type: { new(): T };
}
