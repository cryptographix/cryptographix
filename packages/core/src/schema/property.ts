import { ISchema } from ".";

/**
 * Base descriptor for a property defined by Schema
 *
 * To be extended by specific typed schema items
 */
export interface ISchemaProperty<
  Type = any,
  UIProps extends ISchemaPropUI = any,
  IOProps extends ISchemaPropPortInfo = any
> {
  //
  type: string | ISchema<Type>;

  //
  array?: {
    //
    minItems?: number;
    //
    maxItems?: number;
  };

  // property name on object
  name?: string;

  //
  title?: string;

  //
  description?: string;

  //
  ignore?: boolean;

  //
  optional?: boolean;

  //
  default?: Type;

  //
  ui?: UIProps;

  //
  io?: IOProps;

  //
  converter?: {
    fromJSON(name: string, obj: object): Type;
    toJSON(prop: Type): any;
  };
}

export interface ISchemaPropPortInfo {
  //
  type?: "in" | "out" | ISchema<object>;
}

export interface ISchemaPropUI {
  //
  widget?: string;

  //
  label?: string;

  //
  hint?: string;

  //
  style?: string;

  //
  className?: string;

  //
  columns?: number;
}

/**
 *
 */
export interface IBooleanSchemaProp extends ISchemaProperty<boolean> {
  type: "boolean";

  //
  trueLabel?: string;

  //
  falseLabel?: string;
}

/**
 *
 */
export interface IStringSchemaProp extends ISchemaProperty<string> {
  type: "string";

  //
  minLength?: number;

  //
  maxLength?: number;
}

/**
 *
 */
export interface IIntegerSchemaProp extends ISchemaProperty<number> {
  type: "integer";

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
  type: "enum";

  //
  options: {
    //tring]: string;
  };
}

/**
 *
 */
export interface IBytesSchemaProp extends ISchemaProperty<ArrayBuffer> {
  type: "bytes";

  //
  minSize?: number;

  //
  maxSize?: number;
}

/**
 *
 */
export interface IObjectSchemaProp<TO extends Object = {}>
  extends ISchemaProperty<TO> {
  //
  type: ISchema<TO>;
}

/**
 *
 */
export type ISchemaPropertyType =
  | IBooleanSchemaProp
  | IStringSchemaProp
  | IIntegerSchemaProp
  | IEnumSchemaProp
  | IBytesSchemaProp
  | IObjectSchemaProp;

/**
 *
 */
export interface ISchemaPropReference {
  target: object;
  key: string;
  propertyType: ISchemaPropertyType;
}
