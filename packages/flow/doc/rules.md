# Definitions

## Flows and Transformers

A Transformer processes data received via its Input ports and outputs the result on its Output ports.

## Ports

Transformers have metadata that declares a set of named input and output ports. As a minimum, ports have a name ('key'), an associated data-type and a direction (data-in / data-out).

A port may have additional restrictions such as min/max length, min/max values, and may additionally be marked as optional and/or primary. A 'primary' port is a preferred port that can be automatically selected when connections between transformers are inferred.

## Input Ports

When triggered, a transformer is executed with a data-map (set of key-value pairs) containing values for its input ports (marked as 'data-in'), identified via the port names.

Input ports may be marked as optional or primary, where 'optional' means that the transformer can be triggered, processing and outputting results even when there is no data for this port. In some cases, a default value for the missing input may be defined by the transformer.

## Output Ports

Correspondingly, when the transformer concludes processing, it outputs a data-map containing values for ports marked as 'data-out', using the ports names as keys. Output ports marked as 'optional' may not be present in the output data-map.

## Rules

The pipe operator `|>` between two nodes indicates a data flow from the source (left-hand) node to the target (right hand) node.

If both source and target have a single input and output port, data flows between those two ports, independent of the port names.

That port shall be used whenever a port name is not specified. Otherwise, 'primary' ports are given priority.

## References

A simple data reference `$get('key')` may be used to refer to an output within the same 'scope', where scope is defined as the Map or Flow enclosing the reference.

https://github.com/lightbend/config/blob/master/HOCON.md
https://mozilla-services.github.io/react-jsonschema-form/
