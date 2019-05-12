import { IConstructable } from "./helpers";
import { ByteArray } from "./byte-array";
import { AnySchemaProperty } from "./property";
import { schemaStore } from "./schema-store";

/**
 * Base Schema descriptor for any Object
 */
export interface ISchema {
  //
  type: string;

  //
  name?: string;

  //
  description?: string;

  //
  namespace?: string;

  //
  properties: { [key: string]: AnySchemaProperty };
}

/**
 * Static helpers for Schemas
 */
export abstract class Schema {
  /**
   *
   */
  static getSchemaForObject<TSchema extends ISchema>(target: {
    constructor: Function;
  }): TSchema {
    const cls = target.constructor as IConstructable;

    let schema = schemaStore.ensure<TSchema>(cls);

    return schema;
  }

  /**
   *
   */
  static getSchemaForClass<TO, TSchema extends ISchema>(
    target: IConstructable<TO>
  ): TSchema {
    let schema = schemaStore.ensure<TSchema>(target);

    return schema;
  }

  /**
   *
   */
  static initObjectFromClass<TO>(
    target: IConstructable<TO>,
    initObject: Partial<TO> = {}
  ): TO {
    let schema = schemaStore.ensure<ISchema>(target);
    let obj = new target();

    // Initialize each property from Schema information
    // Precedence:
    //   1. initObject parameter
    //   2. initial value from class
    //   3. "default" value from schema property.default
    //   4. the default for property type
    Object.entries(schema.properties).forEach(([key, propInfo]) => {
      Schema.initPropertyFromPropertyType<TO>(
        propInfo,
        obj,
        key as keyof TO,
        initObject[key]
      );
    });

    return obj;
  }

  static initPropertyFromPropertyType<TO = object>(
    propInfo: AnySchemaProperty,
    obj: TO,
    key: keyof TO,
    initValue?: any,
    useDefaultForType: boolean = true
  ): void {
    let value =
      initValue !== undefined
        ? initValue
        : obj[key] !== undefined
        ? obj[key]
        : propInfo.default;

    if (propInfo.type instanceof Object) {
      // initialize sub-object
      value = Schema.initObjectFromClass(propInfo.type, value);
    } else if (value === undefined && !propInfo.optional && useDefaultForType) {
      // no initial or default value .. use default for type
      switch (propInfo.type) {
        case "boolean":
          value = false;
          break;

        case "integer":
          value = propInfo.min || 0;
          break;

        case "string":
          value = "";
          break;

        case "enum":
          const values = Object.keys(propInfo.options);
          value = (values.length > 0 && values[0]) || "";
          break;

        case "bytes":
          value = ByteArray.from([]);
          break;
      }
    }

    if (value !== undefined) obj[key] = value;
  }

  static getPropertiesForObject(
    target: object,
    filterFn?: (item: AnySchemaProperty) => boolean
  ) {
    let schema = Schema.getSchemaForObject(target);

    let props = Object.entries(schema.properties);

    props = props
      .filter(([_key, propInfo]) => !propInfo.ignore)
      .filter(([_key, propInfo]) => {
        return !filterFn || filterFn(propInfo);
      });

    return new Map(props);
  }

  static getPropertiesForClass(target: IConstructable) {
    let schema = schemaStore.ensure<ISchema>(target);

    return Object.entries(schema.properties);
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
