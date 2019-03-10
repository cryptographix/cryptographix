export function from( data: string | any[], fmt?: 'hex' ): Uint8Array {
  if ( typeof data === 'string')
    return Buffer.from( data, fmt )
  else
    return Buffer.from( data );
}

export function toString( bytes: Uint8Array, fmt?: 'hex' ): string {
  return Buffer.from(bytes).toString( fmt );
}

export function shiftBitsLeft( bytesIn: Uint8Array ): Uint8Array {
  let bytesOut = Buffer.alloc( bytesIn.length );
  let bitIn = 0;

  for( let idx = bytesIn.length - 1; idx >= 0; --idx ) {
    let byte = bytesIn[ idx ];
    bytesOut[idx] = ( byte << 1 ) | bitIn;
    bitIn = ( byte >> 7 );
  }

  return bytesOut;
}

export function xor( bytesA: Uint8Array, bytesB: Uint8Array ): Uint8Array {
  let bytesOut = Buffer.alloc( bytesA.length );

  for( let idx = bytesOut.length - 1; idx >= 0; --idx ) {
    let byte = bytesA[ idx ];
    bytesOut[idx] = byte ^ bytesB[ idx ];
  }

  return bytesOut;
}

export function concat( bytes: Uint8Array[] ): Uint8Array {

  let size = bytes.reduce( (acc,item) => { return acc+item.length }, 0 );
  let bytesOut = Buffer.alloc( size );
  let out = 0;

  bytes.forEach( (item) => {
    bytesOut.set( item, out );
    out += item.length;
  });

  return bytesOut;
}

const ByteArray = {
  from,
  toString,
  shiftBitsLeft,
  xor,
  concat,
};

export { ByteArray };
