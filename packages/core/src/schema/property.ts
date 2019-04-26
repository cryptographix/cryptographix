import { ISchema } from ".";
import { ByteArray } from "./byte-array";

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
  type?: "trigger" | "data-in" | "data-out" | ISchema<object>;

  //
  primary?: boolean;

  //
  reversible?: boolean;
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

/*type RecursiveSchema<A extends Object> = {
  1: never;
  0: ISchema<A>;
}[A extends [] ? 1 : 0];*/

export type AlmostAnySchemaProperty =
  | IBooleanSchemaProp
  | IStringSchemaProp
  | IIntegerSchemaProp
  | IEnumSchemaProp
  | IBytesSchemaProp;

/**
 *
 */
export type AnySchemaProperty = AlmostAnySchemaProperty | IObjectSchemaProp;

/**
 *
 */
export type SchemaPropertyDataType =
  | boolean
  | string
  | number
  | ByteArray
  | Object;

export type FilterSchemaProps<Base> = {
  [Key in keyof Base]: Base[Key] extends SchemaPropertyDataType
    ? /*Base[Key] extends Function
      ? never
      : */ Base[Key]
    : never
};

/**
 *
 */
export interface ISchemaPropReference {
  target: object;
  key: string;
  propertyType: AnySchemaProperty;
}
