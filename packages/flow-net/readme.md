# Pipeliner

Pipes "data" messages along a network of processing blocks that transform data in some way. Blocks are represented by functions, `B()`, and that may have parameters, `B(cfg)`, where `cfg` is a constant "JSON" parameter object.

## Sequences

Blocks receive and send data, and are arranged in sequences, called pipeline.
A sequence is always processed from left to right, such that the first block receives and transforms data, and the result is passed on to the next block in the sequence, and so on. A pipeline operator `|>` is used to indicate data flow. As an example, the result of sequence `B1() |> B2() |> B3()` will be the result of B3 processing the output from block B2, which processed the output from B1 which processed the (if any) input data.

This same sequence can be written `( B1() |> B2() |> B3() )`, using brackets for clarity.

## JSON and constant values

Constants or JSON may be used as data inputs.
For example: `"a string" |> B()`
or `{ int: 1, str: 'hello' } |> B()`

## Data flow

All sequences (and a single block is the simplest type of sequence) are fed either the result of any preceding sequence, the value of a link reference, a specified constant value, or in the absence of anything else, an initial NULL input value. A sequence will only execute when its initial block received an input value.

Data flows from initial blocks (the first in a sequence), constants or links, and flows towards any successive blocks in the sequence.

Care must be taken to avoid infinite feedback loops, and also to avoid deadlock, where a link references a 'future' value that depends on the linked value being processed.

## Links

Intermediate results may be labelled and linked to from other parts of the pipe. `B1() |> $ref1` identifies the output of `B1()` as `ref1`. The output of a label is equal to it's input, so we can write `B1() |> $ref1 |> B2()`

Links reference labels, and use the `#ref` syntax. Links can be used to either start a sequence, as in `#ref |> B1()` or as part of a JSON object, for example:
`{ action: "encrypt", data: #contents }`, where `#contents` is a reference to a labelled value in some other part of the flow.

## Parallelism

Parallel processing can be specified by a hash-map of Block sequences:
`{ B1(), B2() |> B3(), ... ]`, such that both sequences ( B1 and B2|>B3 ) are executed in parallel. Any input value to the {} is replicated to all sub-sequences, such that they each receive the same input data.

## Joins

Parallel sequences can be joined using link references and JSON.

## JSON mode

In "JSON" mode, array syntax is used to indicate a pipeline.
[ B1(), B2(), B3() ]

Primary ports
