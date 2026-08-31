# utf.js

Implementations of validating UTF-8, UTF-16 and UTF-32 segments in JavaScript.

This project is an effort related to [Gleam](https://gleam.run/). It is a programming language, that compiles to Erlang and JavaScript. Erlang natively supports pattern matching on UTF segments, however there is no native API in JavaScript (Browser, Node, Deno, Bun) to do the same.

If you want to learn about more advanced usage of the bit array syntax in Gleam, checkout the official tour: https://tour.gleam.run/data-types/bit-arrays/. And also this blog article: https://gearsco.de/blog/bit-array-syntax/

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

`<<_:utf8>>` here should match any valid UTF-8 segment on both Erlang and any JavaScript runtime.

You can also match on bit arrays directly:

```gleam
pub fn main() {
  let assert <<a:3, _:utf8_codepoint, rest:bits>> = <<5:3, "a":utf8, 21:5>>
}
```

## Methodology

The only platform native way of validating UTF segments in JavaScript runtimes is to use `TextDecoder` with the `{ fatal: true }` option. That way, when you `decode` a string, it will throw an Error.

There are a few issues with this:

- It does not support UTF-32, so we would have to come up with our own implementation for that.
- `TextDecoder` will not be as performant as a hand-rolled implementation.
- Using a `try { } catch { }` block itself has some overhead in the VM.

The specification and byte table that define a valid UTF-8 segment, is not too complicated: https://tools.ietf.org/html/rfc3629.

It is also how Erlang implements its validation under the hood: https://github.com/erlang/otp/blob/15f5565172ad3c5d55370cbf2385c49d7c219a6a/erts/emulator/beam/erl_bits.c#L21299

## Testing

[Zig](https://ziglang.org/) has a nice and extensive unicode test for UTF-8 and UTF-16: https://github.com/ziglang/zig/blob/master/lib/std/unicode.zig that we ported over in [utf8.test.js](./test/utf8.test.js) and [utf16.test.js](./test/utf16.test.js)

## Performance

<!-- bench-results:start -->

Results from Apple M2 Pro, Node v26.8.1, 2026-08-31. Benchmark results are machine-dependent; regenerate them with `mise bench-readme`.

### utf8

| benchmark | avg | min | max |
| --- | --- | --- | --- |
| 1 byte | 4.48 ns | 4.26 ns | 28.02 ns |
| 2 bytes | 10.70 ns | 9.91 ns | 38.92 ns |
| 3 bytes | 11.07 ns | 10.55 ns | 37.46 ns |
| 4 bytes | 12.99 ns | 12.41 ns | 42.08 ns |
| unaligned 4 bytes | 30.88 ns | 22.98 ns | 68.35 ns |
| invalid lead | 6.11 ns | 5.83 ns | 30.61 ns |
| invalid continuation | 8.16 ns | 7.34 ns | 32.22 ns |

### utf16

| benchmark | avg | min | max |
| --- | --- | --- | --- |
| 1 code unit | 7.54 ns | 6.76 ns | 40.33 ns |
| 1 code unit big endian | 7.12 ns | 6.37 ns | 35.89 ns |
| U+FFFF | 9.06 ns | 7.51 ns | 34.75 ns |
| surrogate pair | 11.92 ns | 11.12 ns | 32.13 ns |
| surrogate pair big endian | 11.68 ns | 11.02 ns | 74.58 ns |
| unaligned surrogate pair | 23.81 ns | 19.82 ns | 58.56 ns |
| invalid low surrogate | 8.04 ns | 7.33 ns | 34.78 ns |
| invalid dangling high surrogate | 8.32 ns | 7.41 ns | 34.11 ns |
| invalid high high | 11.59 ns | 10.89 ns | 40.04 ns |
| scan 1000 ascii code units | 38.52 µs | 34.92 µs | 150.42 µs |
| scan 1000 mixed code units | 15.73 µs | 15.64 µs | 15.85 µs |
| scan 300 emoji code units | 8.09 µs | 7.98 µs | 8.25 µs |

### utf32

| benchmark | avg | min | max |
| --- | --- | --- | --- |
| ascii | 11.49 ns | 10.60 ns | 33.78 ns |
| ascii big endian | 9.33 ns | 8.51 ns | 36.37 ns |
| U+10FFFF | 8.62 ns | 8.20 ns | 31.40 ns |
| U+10FFFF big endian | 10.39 ns | 9.78 ns | 30.46 ns |
| unaligned | 25.18 ns | 23.67 ns | 66.93 ns |
| invalid surrogate | 11.98 ns | 11.22 ns | 37.67 ns |
| invalid above max | 11.61 ns | 11.07 ns | 35.00 ns |
| scan 1000 ascii code points | 47.68 µs | 43.54 µs | 158.54 µs |
| scan 1000 mixed code points | 20.16 µs | 19.97 µs | 20.52 µs |
| scan 300 emoji code points | 9.69 µs | 9.62 µs | 9.75 µs |

<!-- bench-results:end -->
