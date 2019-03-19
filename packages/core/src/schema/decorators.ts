import {
  IConstructable,
  IObjectSchema,
  ISchema,
  ISchemaProperty,
  IBooleanSchemaProp,
  INumberSchemaProp,
  IStringSchemaProp,
  IEnumSchemaProp,
  IBytesSchemaProp,
  IObjectSchemaProp,

  Omit,

  schemaStore
} from '.';

/**
 * Decorator to annotate a schema.
 *
 * Schemas are indexed by class (the target constructor)
 */
export function schema( meta: Omit<IObjectSchema, 'target'|'properties'|'type'> = {} ) {
  return function( target: IConstructable<Object> ) {
    let schema = schemaStore.ensure<IObjectSchema>( target );

    schema = {
      ...schema,
      type: 'object',
      name: target.name,
      ...meta
    }

    schemaStore.set( target, schema );
  }
}

/**
 * Decorator to annotate a schema property.
 *
 * Schemas are indexed by class (the target constructor) and hold
 * a hash-map of item (property) descriptor
 */
export function schemaProp<T>( propOptions: ISchemaProperty<T> ) {
  return function (target: any, propertyKey: string) {

    let schema: ISchema = schemaStore.ensure( target.constructor );

    let namedItem = {
      ...propOptions,
      type: propOptions.type || target.constructor,
      //name: propertyKey,
      //target: target
    }

    schema.properties[ propertyKey ] = namedItem;

//    console.log(propertyKey + " => " + JSON.stringify(namedItem) )
//    console.log("target" + " => " + JSON.stringify(target) )
//    console.log("constr" + " => " + JSON.stringify(target.constructor) )
  }
}

/**
 *
 */
export function booleanProp( a: Omit<IBooleanSchemaProp, "type"|"name"> = {} ) {
  return schemaProp<boolean>( { ...a, type: 'boolean' } )
}

/**
 *
 */
export function numberProp( a: Omit<INumberSchemaProp, "type"|"name"> = {} ) {
  return schemaProp<number>( { ...a, type: 'number' } )
}

/**
 *
 */
export function stringProp( a: Omit<IStringSchemaProp, "type"|"name"> = {} ) {
  return schemaProp<string>( { ...a, type: 'string' } )
}

/**
 *
 */
export function enumProp( a: Omit<IEnumSchemaProp, "type"|"name"> ) {
  return schemaProp<string>( { ...a, type: 'enum' } )
}

/**
 *
 */
export function bytesProp( a: Omit<IBytesSchemaProp, "type"|"name"> = {} ) {
  return schemaProp<ArrayBuffer>( { ...a, type: 'bytes' } )
}

/**
 *
 */
export function objectProp<TO extends Object>( objectType: IConstructable<TO>, a: Omit<IObjectSchemaProp, "type"|"name"> = { }  ) {
  let objectSchema = schemaStore.ensure( objectType );

  return schemaProp( { ...a, type: objectSchema } );
}
