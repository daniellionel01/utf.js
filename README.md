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
| 1 byte | 4.64 ns | 4.27 ns | 61.23 ns |
| 2 bytes | 10.87 ns | 10.11 ns | 41.62 ns |
| 3 bytes | 11.22 ns | 10.58 ns | 38.16 ns |
| 4 bytes | 13.15 ns | 12.41 ns | 49.78 ns |
| unaligned 4 bytes | 31.36 ns | 23.93 ns | 73.38 ns |
| invalid lead | 6.19 ns | 5.82 ns | 33.23 ns |
| invalid continuation | 8.54 ns | 7.56 ns | 35.86 ns |

Bar length is log-scaled relative to the fastest benchmark in the section.

```
benchmark                                         avg
-----------------------------------------------------
1 byte                                        4.64 ns
2 bytes               ████████▉              10.87 ns
3 bytes               █████████▎             11.22 ns
4 bytes               ██████████▉            13.15 ns
unaligned 4 bytes     ████████████████████   31.36 ns
invalid lead          ███                     6.19 ns
invalid continuation  ██████▍                 8.54 ns
```

### utf16

| benchmark | avg | min | max |
| --- | --- | --- | --- |
| 1 code unit | 7.59 ns | 6.63 ns | 40.69 ns |
| 1 code unit big endian | 7.13 ns | 6.45 ns | 40.24 ns |
| U+FFFF | 9.03 ns | 7.52 ns | 37.31 ns |
| surrogate pair | 12.12 ns | 11.14 ns | 47.25 ns |
| surrogate pair big endian | 11.00 ns | 10.07 ns | 47.71 ns |
| unaligned surrogate pair | 25.30 ns | 20.14 ns | 209.35 ns |
| invalid low surrogate | 7.81 ns | 7.04 ns | 34.73 ns |
| invalid dangling high surrogate | 7.99 ns | 7.28 ns | 34.78 ns |
| invalid high high | 11.12 ns | 10.46 ns | 35.48 ns |
| scan 1000 ascii code units | 39.56 µs | 35.83 µs | 353.33 µs |
| scan 1000 mixed code units | 16.16 µs | 15.96 µs | 16.36 µs |
| scan 300 emoji code units | 8.26 µs | 8.16 µs | 8.42 µs |

Bar length is log-scaled relative to the fastest benchmark in the section.

```
benchmark                                                    avg
----------------------------------------------------------------
1 code unit                      ▏                       7.59 ns
1 code unit big endian                                   7.13 ns
U+FFFF                           ▌                       9.03 ns
surrogate pair                   █▎                     12.12 ns
surrogate pair big endian        █                      11.00 ns
unaligned surrogate pair         ██▉                    25.30 ns
invalid low surrogate            ▎                       7.81 ns
invalid dangling high surrogate  ▎                       7.99 ns
invalid high high                █                      11.12 ns
scan 1000 ascii code units       ████████████████████   39.56 µs
scan 1000 mixed code units       █████████████████▉     16.16 µs
scan 300 emoji code units        ████████████████▍       8.26 µs
```

### utf32

| benchmark | avg | min | max |
| --- | --- | --- | --- |
| ascii | 11.40 ns | 10.63 ns | 33.41 ns |
| ascii big endian | 10.88 ns | 10.17 ns | 41.46 ns |
| U+10FFFF | 8.98 ns | 8.21 ns | 102.55 ns |
| U+10FFFF big endian | 12.66 ns | 11.63 ns | 47.40 ns |
| unaligned | 25.27 ns | 23.75 ns | 60.86 ns |
| invalid surrogate | 12.10 ns | 11.39 ns | 34.45 ns |
| invalid above max | 11.92 ns | 11.22 ns | 35.32 ns |
| scan 1000 ascii code points | 48.22 µs | 44.17 µs | 145.08 µs |
| scan 1000 mixed code points | 19.71 µs | 19.54 µs | 20.22 µs |
| scan 300 emoji code points | 9.50 µs | 9.42 µs | 9.63 µs |

Bar length is log-scaled relative to the fastest benchmark in the section.

```
benchmark                                                avg
------------------------------------------------------------
ascii                        ▌                      11.40 ns
ascii big endian             ▌                      10.88 ns
U+10FFFF                                             8.98 ns
U+10FFFF big endian          ▊                      12.66 ns
unaligned                    ██▍                    25.27 ns
invalid surrogate            ▊                      12.10 ns
invalid above max            ▋                      11.92 ns
scan 1000 ascii code points  ████████████████████   48.22 µs
scan 1000 mixed code points  █████████████████▉     19.71 µs
scan 300 emoji code points   ████████████████▎       9.50 µs
```

<!-- bench-results:end -->
