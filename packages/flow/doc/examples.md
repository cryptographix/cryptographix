### Example

`HEX() |> { plain: $$, key: HEX() } |> ENC() |> HEX()`

```
Flow:
  Pipeline:
    Transform: HEX
    // $$ = { bytes }:
    Splitter:
      plain:
        Data: $$       // only/primary from previous
      key:
        Transform: HEX
    // $$ = { in, key }:
    Transform: ENC
    // $$ = { out  }:
    Transform: HEX
```

```
{ plain: HEX({title:'Data to Encrypt'}),
  key: HEX({title:'Key Data'})
} |> ENC()
  |> HEX( {title:'Encrypted Data'} )
```

## EMV Cryptogram Generation

IMK
PAN
ATC
BUFFER

```
MK: {
  key: IMK,
  data: PAN
} |> DERIVE();

SKac: {
  key: MK,
  data: ATC
} |> DERIVE();

AC = {
  key: SKac,
  data: buffer
} |> MAC();
```

```
MK: ;

SKac: ;

AC = {
  key: {
    key: {
      key: HEX('IMK'),
      data: HEX('PAN')
    } |> DERIVE(),
    data: HEX('ATC')
  } |> DERIVE(),
  data: HEX('BUFFER')
} |> MAC();
```
