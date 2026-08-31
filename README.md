# utf.js

Implementations for validating UTF-8, UTF-16 and UTF-32 sequences in JavaScript.

This project is an effort related to [Gleam](https://gleam.run/). Gleam is a programming language that compiles to Erlang and JavaScript. Erlang natively supports pattern matching on UTF sequences, but there is no such API in JavaScript runtimes (Browser, Node, Deno, Bun).

If you want to learn more about the bit array syntax in Gleam, check out the official tour: https://tour.gleam.run/data-types/bit-arrays/. There is also this blog article: https://gearsco.de/blog/bit-array-syntax/

In short, you can write this in Gleam:

```gleam
pub fn main() {
  let input = <<"a":utf8>>

  case input {
    <<_:utf8>> -> "this is utf8!"
    _ -> "this is not."
  }
}
```

`<<_:utf8>>` here should match one valid UTF-8 sequence on both Erlang and any JavaScript runtime.

You can also combine UTF sequences with other bit array segments:

```gleam
pub fn main() {
  let assert <<a:3, _:utf8_codepoint, rest:bits>> =
    <<5:3, "a":utf8, 21:5>>
}
```

## Methodology

The closest platform API for validating UTF sequences in JavaScript runtimes is [TextDecoder](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder) with the `{ fatal: true }` option. When `decode()` gets invalid input, it throws an error instead of replacing the invalid data.

There are a few issues with this:

- `TextDecoder` does not support UTF-32, so we would still need our own implementation for that.
- `TextDecoder` creates a JavaScript string. We only need to validate one sequence and determine its size.
- `decode()` does not return the size of the sequence.
- With `{ fatal: true }`, invalid input causes `decode()` to throw an error. Throwing and catching an error is more expensive than returning an error value.

The rules that define valid UTF-8 sequences are specified in RFC 3629: https://www.rfc-editor.org/rfc/rfc3629

Erlang also validates UTF sequences directly in its bit syntax implementation: https://github.com/erlang/otp/blob/15f5565172ad3c5d55370cbf2385c49d7c219a6a/erts/emulator/beam/erl_bits.c#L21299

In the [gleam_app](./gleam_app/) directory, I took the generated JavaScript from Gleam code that contains `case` statements which match on `<<_:utf8>>`. See [app.gleam](./gleam_app/src/app.gleam) for that code.

The generated JavaScript was simplified and can be found in [before.js](./src/before.js).

To check a bit array for valid UTF sequences, you can use `bitArrayUtf8SequenceSize`, `bitArrayUtf16SequenceSize` or `bitArrayUtf32SequenceSize` from [utf.js](./src/utf.js).

The same examples from `before.js` were changed to use those functions in [after.js](./src/after.js).

You can see the output by running:

```sh
mise run before
mise run after
```

## Testing

[Zig](https://ziglang.org/) has useful Unicode tests for UTF-8 and UTF-16: https://github.com/ziglang/zig/blob/master/lib/std/unicode.zig

Some of these tests were ported to [utf8.test.js](./test/utf8.test.js) and [utf16.test.js](./test/utf16.test.js).

Run the test suite with:

```sh
mise run test
```

## Performance

You can run:

```sh
mise run bench
```

to benchmark UTF-8, UTF-16 and UTF-32 validation with a range of valid and invalid inputs.

At the moment there is no useful baseline or comparison, so the benchmark numbers do not show if these functions are faster or slower than another implementation.
