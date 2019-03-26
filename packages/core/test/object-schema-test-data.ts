import {
  schema,
  booleanProp,
  numberProp,
  stringProp,
  enumProp,
  bytesProp,
  objectProp,
  ByteArray,
  H2BA
} from "@cryptographix/core";

// Simple Class, no properties
@schema({ serializer: {} })
export class X {
  private _priv: string;
  protected prot: string;
  public pub: string;

  constructor() {
    this._priv = "private";
    this.prot = "protected";
    this.pub = "public";
  }
}

@schema({
  description: "All prop types, no default values",
  namespace: "cryptographix.org/objects"
})
export class Y {
  @booleanProp()
  bool: boolean;

  @numberProp()
  num: number;

  @stringProp()
  text: string;

  @bytesProp()
  bytes: ByteArray;

  @enumProp({ options: { "1": "one", "2": "two", "3": "three" } })
  option: string;

  @objectProp(X)
  obj: X;
}

@schema({
  description: "All prop types with default values",
  namespace: "cryptographix.org/objects"
})
export class Z {
  @booleanProp({ default: true })
  bool: boolean;

  @numberProp({ default: 99 })
  num: number;

  @stringProp({ default: "a string" })
  text: string;

  @bytesProp({ default: H2BA("0123456789abcdef"), minSize: 8 })
  bytes: ByteArray;

  // @enumProp( { options: { elements: [ "1","2","3" ], labels: [ "one", "two", "three" ] }} )
  @enumProp({ options: { "1": "one", "2": "two", "3": "three" } })
  option: string;

  @objectProp(Y, {
    default: {
      bool: false,
      num: 1,
      text: "hello",
      bytes: H2BA("deadbeef"),
      option: "1"
    }
  })
  obj: Y;
}

@schema({ description: "Class ZZ", namespace: "cryptographix.org/objects" })
export class ZZ {
  @objectProp(Z)
  z: Z;

  @numberProp({ default: 100, ui: { int: 1234 } })
  num: Number;
}

/*
let x = Schema.initObjectFromClass( X, { } );
console.log( "X => ", x );

let y1 = Schema.initObjectFromClass( Y );
console.log( "Y1 => ", y1 );
let y2 = Schema.initObjectFromClass( Y, { num: 1234, bool: true, text: 'texty', option: "3", bytes: H2BA('0000'), obj: {  } } );
console.log( "Y2 => ", y2 );

let zzs = schemaStore.get( ZZ );
//console.log( "zzs => ", zzs );

let zz = Schema.initObjectFromSchema( zzs );
console.log( "ZZ => ", zz );
*/
