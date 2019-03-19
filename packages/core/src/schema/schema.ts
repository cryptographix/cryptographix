import { IConstructable, ByteArray, ISchemaPropertyType, schemaStore } from '.';

/**
 * Base Schema descriptor for any Object
 */
export interface ISchema<TO=Object> {
  //
  type: string;

  // Constructor for the class described by this schema
  target: IConstructable<TO>;

  //
  name?: string;

  //
  description?: string;

  //
  namespace?: string;

  //
  properties: { [key: string]: ISchemaPropertyType };
}

/**
 * Static helpers for Schemas
 */
export abstract class Schema {
  static initObjectFromClass<TO>( target: IConstructable<TO>, initObject?: TO ): TO {
    let schema = schemaStore.ensure<ISchema<TO>>( target );

    return Schema.initObjectFromSchema( schema, initObject || {} );
  }

  static initObjectFromSchema<TO, TSchema extends ISchema<TO>>( schema: TSchema, initObject: Object = {} ): TO {
    let object = new schema.target();

//    console.log( "initObjectFromSchema" );

    Object.entries( schema.properties ).forEach( ([key, propInfo]) => {
      if ( propInfo.type instanceof Object ) {
        object[ key ] = Schema.initObjectFromSchema( propInfo.type, initObject[ key ] );
      }
      else {
        // use initObject
        if ( initObject[ key ] ) {
          object[ key ] = initObject[ key ];
        }
        else {
          let value = propInfo.defaultValue;

          if ( !value ) {
            switch( propInfo.type ) {
              case 'boolean': value = false; break;
              case 'number': value = propInfo.min || 0; break;
              case 'string': value = ''; break;
              case 'enum': value = propInfo.options.elements[0]; break;
              case 'bytes': value = ByteArray.from( [] ); break;
            }
          }

          object[ key ] = value;
        }
      }

//      console.log(key + " :> ", propInfo);
    } );

    return {
      ...object,
      ...initObject,
    }
  }
}

/**
 * Schema descriptor that describes a serializable Object
 */
export interface IObjectSchema<TO extends Object = {}> extends ISchema {
  type: 'object';

  serializer?: {
    // serialize to a JSON object
    toJSON?( data: TO ): Object;

    // serialize to a byte buffer
    toBytes?( data: TO ): ByteArray;

    // deserialize from a JSON object
    fromJSON?( obj?: Object ): TO;

    // deserialize from a byte buffer
    fromBytes?( raw: ByteArray ): TO;
  }
}
