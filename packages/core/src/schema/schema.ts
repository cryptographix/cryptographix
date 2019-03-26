import { IConstructable } from "./helpers";
import { ByteArray } from "./byte-array";
import { /*ISchemaProperty, */ ISchemaPropertyType } from "./property";
import { schemaStore } from "./schema-store";

/**
 * Base Schema descriptor for any Object
 */
export interface ISchema<TO = Object> {
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

/*function defaultValueForType<Type, PropType extends ISchemaProperty<Type>>( propInfo: PropType ) {
  let value;

  switch( propInfo.type ) {
    case 'boolean': value = false; break;
    case 'number': value = propInfo.min || 0; break;
    case 'string': value = ''; break;
    case 'enum': value = Object.keys(propInfo.options)[0] || ""; break;
    case 'bytes': value = ByteArray.from([]); break;
  }

  return value;
}*/

/**
 * Static helpers for Schemas
 */
export abstract class Schema {
  /**
   *
   */
  static initObjectFromClass<TO>(
    target: IConstructable<TO>,
    initObject?: TO
  ): TO {
    let schema = schemaStore.ensure<ISchema<TO>>(target);

    return Schema.initObjectFromSchema(schema, initObject || {});
  }

  /**
   *
   */
  static initObjectFromSchema<TO, TSchema extends ISchema<TO>>(
    schema: TSchema,
    initObject: Object = {}
  ): TO {
    let object = new schema.target();

    // Initialize each property from Schema information
    // Precedence:
    //   1. initObject parameter
    //   2. initial value from class
    //   3. default value from schema property.default
    //   4. the default for property type
    Object.entries(schema.properties).forEach(([key, propInfo]) => {
      let value = initObject[key] || object[key] || propInfo.default;

      if (propInfo.type instanceof Object) {
        // initialize sub-object
        value = Schema.initObjectFromSchema(propInfo.type, value);
      } else if (!value && !propInfo.optional) {
        // no initial or default value .. use default for type
        switch (propInfo.type) {
          case "boolean":
            value = false;
            break;
          case "number":
            value = propInfo.min || 0;
            break;
          case "string":
            value = "";
            break;
          case "enum":
            value = Object.keys(propInfo.options)[0] || "";
            break;
          case "bytes":
            value = ByteArray.from([]);
            break;
        }
      }

      if (value) object[key] = value;
    });

    return object;
  }
}

/**
 * Schema descriptor that describes a serializable Object
 */
export interface IObjectSchema<TO extends Object = {}> extends ISchema {
  type: "object";

  serializer?: {
    // serialize to a JSON object
    toJSON?(data: TO): Object;

    // serialize to a byte buffer
    toBytes?(data: TO): ByteArray;

    // deserialize from a JSON object
    fromJSON?(obj?: Object): TO;

    // deserialize from a byte buffer
    fromBytes?(raw: ByteArray): TO;
  };
}
