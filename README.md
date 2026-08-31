# utf.js

JavaScript functions that validate UTF-8, UTF-16, and UTF-32 sequences.

This project is related to [Gleam](https://gleam.run/). Gleam compiles to Erlang and JavaScript.

Erlang supports pattern matching on UTF sequences. JavaScript runtimes such as browsers, Node.js, Deno, and Bun do not provide the same API.

For more information about Gleam bit arrays, see the [official Gleam tour](https://tour.gleam.run/data-types/bit-arrays/) and this [article about bit array syntax](https://gearsco.de/blog/bit-array-syntax/).

For example, you can write this in Gleam:

```gleam
pub fn main() {
  let input = <<"a":utf8>>

  case input {
    <<_:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }
}
```

`<<_:utf8>>` must match one valid UTF-8 sequence on both the Erlang and JavaScript targets.

UTF sequences can also start at positions that are not byte-aligned:

```gleam
pub fn main() {
  let assert <<a:3, _:utf8_codepoint, rest:bits>> =
    <<5:3, "a":utf8, 21:5>>
}
```

## Method

JavaScript runtimes provide `TextDecoder` for text decoding. With the `{ fatal: true }` option, `decode()` throws an error when the input contains invalid data.

`TextDecoder` is not a good fit for this work because:

- `TextDecoder` does not support UTF-32.
- `TextDecoder` creates a JavaScript string. We only need to validate one sequence and get its size.
- `decode()` does not return the size of the sequence.
- Invalid input causes `decode()` to throw an error. Throwing and catching an error has a higher cost than a normal return value.

The rules for valid UTF-8 sequences are defined in [RFC 3629](https://www.rfc-editor.org/rfc/rfc3629).

Erlang also validates UTF sequences in its bit syntax implementation:

https://github.com/erlang/otp/blob/15f5565172ad3c5d55370cbf2385c49d7c219a6a/erts/emulator/beam/erl_bits.c#L21299

The [gleam_app](./gleam_app/) directory contains Gleam code with `case` expressions that match on `<<_:utf8>>`.

See [app.gleam](./gleam_app/src/app.gleam) for the Gleam source code.

A simplified version of the generated JavaScript is in [before.js](./src/before.js).

The following functions return the size of one valid UTF sequence in a bit array:

- `bitArrayUtf8SequenceSize`
- `bitArrayUtf16SequenceSize`
- `bitArrayUtf32SequenceSize`

The functions are in [utf.js](./src/utf.js).

The examples in [after.js](./src/after.js) use these functions.

Run the examples with:

```sh
mise run before
mise run after
```

## Testing

[Zig](https://ziglang.org/) has tests for UTF-8 and UTF-16 in its Unicode library:

https://github.com/ziglang/zig/blob/master/lib/std/unicode.zig

Some of these tests were ported to:

- [utf8.test.js](./test/utf8.test.js)
- [utf16.test.js](./test/utf16.test.js)

Run the tests with:

```sh
mise run test
```

## Performance

Run the benchmarks with:

```sh
mise run bench
```

The benchmarks test UTF-8, UTF-16, and UTF-32 with valid and invalid input.

There is no useful baseline or comparison yet. For this reason, the benchmark results do not show if these functions are faster or slower than another implementation.
