import { ISchema, ISchemaProp, IBooleanSchemaProp, INumberSchemaProp, IStringSchemaProp, IEnumSchemaProp, IBytesSchemaProp } from './schema'

export class SchemaStorage {

  protected items = new Map<object, ISchema>();

  public has(target: object) {
    return this.items.has(target);// || !!this.findParentSchema(target);
  }

  public get<S extends ISchema>(target: object): S {
    const schema = this.items.get(target);// || this.findParentSchema(target);

    if (!schema) {
      throw new Error("Cannot get schema for current target");
    }

    return schema as S;
  }

  /**
   * Creates new schema
   */
  public create( target: object ) {
    // Initialize default schema
    const schema = { items: {} } as ISchema;

    // Get and assign schema from parent
    /*const parentSchema = this.findParentSchema(target);
    if (parentSchema) {
      Object.assign(schema, parentSchema);
      schema.items = {};
      for (const name in parentSchema.items) {
        schema.items[name] = Object.assign({}, parentSchema.items[name]);
      }
    }*/

    schema.target = target as any;

    return schema;
  }

  public set(target: object, schema: ISchema) {
    this.items.set(target, schema);

    return this;
  }

  /*protected findParentSchema(target: object): ISchema | null {
    const parent = (target as any).__proto__;

    if (parent) {
      const schema = this.items.get(parent);
      return schema || this.findParentSchema(parent);
    }

    return null;
  }*/
}

export const schemaStore = new SchemaStorage();

/*export function schema( opts: { name: string } ) {
  return function (target: object) {
    let schema: ISchema;

    console.log( 'Schema decorator called for ' + opts.name );
    console.log( target.constructor )
    console.log( JSON.stringify(target))

    if (!schemaStore.has(target)) {
      schema = schemaStore.create(target);
//      schemaStore.set(target.constructor, schema);
    }
  }
}*/

/**
 * Decorator to annotate a schema property.
 *
 * Schemas are indexed by class (the target constructor) and hold
 * a hash-map of item (property) descriptor
**/
export function schemaProp( propOptions: ISchemaProp ) {
  return function (target: any, propertyKey: string) {
    let schema: ISchema;

    if (schemaStore.has(target.constructor)) {
      schema = schemaStore.get(target.constructor);
    }

    if ( !schema || (schema.target !== target.constructor) ) {
      schema = schemaStore.create(target.constructor);
      schemaStore.set(target.constructor, schema);
    }

    let namedItem = {
      ...propOptions,
      name: propertyKey,
      target: target
    }

    schema.items[propertyKey] = namedItem;

      //target.enumerable = opts.defaultValue;
    //console.log(propertyKey + " => " + JSON.stringify(namedItem) )
  }
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function booleanProp( a: Omit<IBooleanSchemaProp, "type"|"name"> = {} ) {
  return schemaProp( { ...a, type: 'boolean' } )
}

export function numberProp( a: Omit<INumberSchemaProp, "type"|"name"> = {} ) {
  return schemaProp( { ...a, type: 'number' } )
}

export function stringProp( a: Omit<IStringSchemaProp, "type"|"name"> = {} ) {
  return schemaProp( { ...a, type: 'string' } )
}

export function enumProp( a: Omit<IEnumSchemaProp, "type"|"name"> ) {
  return schemaProp( { ...a, type: 'enum' } )
}

export function bytesProp( a: Omit<IBytesSchemaProp, "type"|"name"> = {} ) {
  return schemaProp( { ...a, type: 'bytes' } )
}
