# Definitions

## Transformers

A Transformer processes data received via its input ports and outputs the processing result via its output ports.

## Ports

Transformers have metadata that declares a set of named input and output ports. As a minimum, ports have a name ('key'), an associated data-type and a direction (data-in / data-out).

A port may have additional restrictions such as min/max length, min/max values, etc. Ports may additionally be marked as optional or primary.

A 'primary' port is a preferred port that can be automatically selected when connections between transformers are inferred.

## Inputs

A transformer is executed with a hash-map containing values for ports marked as 'data-in', using the port name as the key. Input ports may additionally be marked as optional or primary.

An 'optional' port MAY be missing from the hash-map, since the transformer is still able to process without receiving any data on that port. In some cases, the transformer may use a default value.

## Outputs

Correspondingly, when the transformer concludes processing, it outputs a hash map containing values for ports marked as 'data-out', using the port name as the key. Output ports marked as 'optional' MAY not be present in the output hash-map.

## Rules

The chaining operator `|>` pipes the a data-map into the next element,
If a Transformer has a single input or output port, that port shall be used whenever a port name is not specified. Otherwise, 'primary' ports are given priority.

## References

A simple data reference `${key}` may be used to refer to an output within the same 'scope', where scope is defined as the closest Map / Splitter enclosing the reference.

https://github.com/lightbend/config/blob/master/HOCON.md
https://mozilla-services.github.io/react-jsonschema-form/
