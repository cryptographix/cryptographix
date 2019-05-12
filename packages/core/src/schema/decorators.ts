import { IConstructable, Omit } from "./helpers";
import { ISchema, IObjectSchema } from "./schema";
import {
  ISchemaProperty,
  IBooleanSchemaProp,
  IIntegerSchemaProp,
  IStringSchemaProp,
  IEnumSchemaProp,
  IBytesSchemaProp,
  IObjectSchemaProp,
  ISchemaPropPortInfo
} from "./property";
import { schemaStore } from "./schema-store";

/**
 * Decorator to annotate a schema.
 *
 * Schemas are indexed by class (the target constructor)
 */
export function schema(meta: Omit<IObjectSchema, "properties" | "type"> = {}) {
  return function(target: any) {
    let schema = schemaStore.ensure<IObjectSchema>(target);

    schema = {
      ...schema,
      type: "object",
      name: target.name,
      ...meta
    };

    schemaStore.set(target, schema);
  };
}

/**
 * Decorator to annotate a schema property.
 *
 * Schemas are indexed by class (the target constructor) and hold
 * a hash-map of item (property) descriptors
 */
export function schemaProp<T>(propOptions: ISchemaProperty<T>, extra?: object) {
  return function(target: any, propertyKey: string) {
    let schema: ISchema = schemaStore.ensure(
      target.constructor as IConstructable
    );
    let existingProps = schema.properties[propertyKey] || {};
    const schemaProp = propOptions || {};
    const type = existingProps["type"] || (propOptions && propOptions.type);

    let itemProps = {
      ...existingProps,
      ...schemaProp,
      ...(extra || {}),
      type,
      name: propertyKey
    };

    schema.properties[propertyKey] = itemProps;

    //    console.log(propertyKey + " => " + JSON.stringify(namedItem) )
    //    console.log("target" + " => " + JSON.stringify(target) )
    //    console.log("constr" + " => " + JSON.stringify(target.constructor) )
  };
}

/**
 *
 */
export function booleanProp(a: Omit<IBooleanSchemaProp, "type" | "name"> = {}) {
  return schemaProp<boolean>({ ...a, type: "boolean" });
}

/**
 *
 */
//export function numberProp(a: Omit<INumberSchemaProp, "type" | "name"> = {}) {
//  return schemaProp<number>({ ...a, type: "number" });
//}
export function integerProp(a: Omit<IIntegerSchemaProp, "type" | "name"> = {}) {
  return schemaProp<number>({ ...a, type: "integer" });
}

/**
 *
 */
export function stringProp(a: Omit<IStringSchemaProp, "type" | "name"> = {}) {
  return schemaProp<string>({ ...a, type: "string" });
}

/**
 *
 */
export function enumProp(a: Omit<IEnumSchemaProp, "type" | "name">) {
  return schemaProp<string>({ ...a, type: "enum" });
}

/**
 *
 */
export function bytesProp(a: Omit<IBytesSchemaProp, "type" | "name"> = {}) {
  return schemaProp<ArrayBuffer>({ ...a, type: "bytes" });
}

/**
 *
 */
export function objectProp<TO extends Object>(
  objectType: IConstructable<TO>,
  a: Omit<IObjectSchemaProp, "type" | "name"> = {}
) {
  // Make sure there's a schema for this class
  schemaStore.ensure(objectType);

  return schemaProp({ ...a, type: objectType });
}

/**
 *
 */
export function isPort(io: ISchemaPropPortInfo) {
  return schemaProp<any>(null, { io: io });
}
