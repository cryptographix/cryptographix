import 'mocha';
import { expect } from 'chai';
import { schemaStore } from '@cryptographix/core';

import { X, Y, Z, ZZ } from './object-schema-test-data';

describe( 'Schemas', ()=> {
  it( 'schema store', ()=> {

    let schema = schemaStore.get( X );
    //console.log( 'X:' + JSON.stringify( schema, null, 2 ) );

    expect( schema ).to.exist; //('Schema for X not found');

    schema = schemaStore.get( Y );
    //console.log( 'Y:' + JSON.stringify( schema, null, 2 ) );

    expect( schema ).to.exist;
    expect( schema ).to.include({name: 'Y' } );
    expect( schema ).to.include({namespace: 'cryptographix.org/objects' } );

    schema = schemaStore.get( Z );
    //console.log( 'Z:' + JSON.stringify( schema, null, 2 ) );

    expect( schema ).to.exist;
    expect( schema ).to.include({name: 'Z' } );
    expect( schema.properties ).to.exist;
    expect( schema.properties ).to.have.keys(['bool','num','text','option','bytes','obj']);

    //console.log( 'Z.obj:' + JSON.stringify( schema.properties["obj"], null, 2 ) );

    schema = schemaStore.get( ZZ );
    //console.log( 'ZZ:' + JSON.stringify( schema, null, 2 ) );

    expect( schema ).to.exist;
    expect( schema ).to.include({description: 'Class ZZ' } );
    expect( schema.properties ).to.exist;
    expect( schema.properties ).to.have.keys(['z','num']);

    //console.log( 'ZZ.z:' + JSON.stringify( schema.properties["z"], null, 2 ) );
  })
} );
