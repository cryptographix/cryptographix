import { ISchema } from ".";
import { ByteArray } from "./byte-array";

/**
 * Descriptor for a property defined by Schema
 *
 * To be extended by specific typed schema items, such as Boolean, Bytes or Object
 */
export interface ISchemaProperty<
  Type = any,
  UIProps extends ISchemaPropUI = any,
  IOProps extends ISchemaPropPortInfo = any
> {
  // Name of property type, used to identify the type of the property, and to
  // sub-class 'extended' SchemaProperties. Must be one of:
  //     boolean, integer, enum, string, bytes
  //   or a sub-schema describing an object
  //
  type: string | ISchema<Type>;

  /* present if property is an array
  array?: {
    //
    minItems?: number;
    //
    maxItems?: number;
  };*/

  // property name on object
  name?: string;

  // friendly name for user
  title?: string;

  // brief description
  description?: string;

  // do not set, get, use or validate property
  ignore?: boolean;

  // property is optional .. undefined is a valid value
  optional?: boolean;

  // default value for property
  default?: Type;

  // additional attributes for user-interface
  ui?: UIProps;

  // additional properties for input/output (i.e. ports)
  io?: IOProps;

  // custom to/from JSON converters
  converter?: {
    fromJSON(name: string, obj: object): Type;
    toJSON(prop: Type): any;
  };

  // custom validator
  validator?: (value: Type) => boolean;
}

/**
 *
 */
export interface ISchemaPropPortInfo {
  //
  type?: "trigger" | "data-in" | "data-out" | ISchema<object>;

  //
  primary?: boolean;

  //
  //reversible?: boolean;
}

/**
 *
 */
export interface ISchemaPropUI {
  //
  widget?: string;

  // friendly name for UI field
  label?: string;

  // brief 'hint' about property use or restrictions
  hint?: string;

  //
  style?: string;

  //
  className?: string;

  // layout on a 12-column grid.
  columns?: number;
}

/**
 * A boolean property
 */
export interface IBooleanSchemaProp extends ISchemaProperty<boolean> {
  type: "boolean";

  // user-friendly name for when value is TRUE
  trueLabel?: string;

  // user-friendly name for when value is FALSE
  falseLabel?: string;
}

/**
 * An UTF-8 coded string property
 */
export interface IStringSchemaProp extends ISchemaProperty<string> {
  type: "string";

  // Optional minimum-length
  minLength?: number;

  // Optional maximum-length
  maxLength?: number;
}

/**
 * An integer property
 */
export interface IIntegerSchemaProp extends ISchemaProperty<number> {
  type: "integer";

  // Optional minimum-value
  min?: number;

  // Optional maximum-value
  max?: number;

  // Optional step-size between min and max
  step?: number;
}

/**
 * An enumerated type property [value:string] -> [description:string]
 */
export interface IEnumSchemaProp extends ISchemaProperty<string> {
  type: "enum";

  // Hash-map of option values/description
  options: {
    // [index:string]: string;
  };
}

/**
 * A variable-length array of bytes
 */
export interface IBytesSchemaProp extends ISchemaProperty<ArrayBuffer> {
  type: "bytes";

  // Optional minimum-length
  minLength?: number;

  // Optional maximum-length
  maxLength?: number;
}

/**
 * An object-shaped property. References a sub-schema that describes the object
 * structure. Multiple-level objects are allowed, since a sub-schema property
 * may also be an object.
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

/**
 * Union of Property Schema Types.
 * Note: Sometimes this type cannot be returned from a func/method, since
 * Typescript chokes on recursive type-definitions (ObjectSchemaProp .. )
 *
 *   export type AnySchemaProperty = AlmostAnySchemaProperty | IObjectSchemaProp;
 */
export type AnySchemaProperty =
  | IBooleanSchemaProp
  | IStringSchemaProp
  | IIntegerSchemaProp
  | IEnumSchemaProp
  | IBytesSchemaProp
  | IObjectSchemaProp;

export type SchemaPropertyDataType =
  | boolean
  | string
  | number
  | ByteArray
  | Object;

/**
 * Helper to allow partial schemas
 */
export type FilterSchemaProps<Base> = {
  [Key in keyof Base]: Base[Key] extends SchemaPropertyDataType
    ? /*Base[Key] extends Function
      ? never
      : */ Base[Key]
    : never
};

/**
 * A schema-enhanced reference to a Property
 */
export interface ISchemaPropReference {
  target: object;
  key: string;
  propertyType: AnySchemaProperty;
}
