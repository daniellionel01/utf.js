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

[Zig](https://ziglang.org/) has a good unicode test suite for UTF-8 and UTF-16: https://github.com/ziglang/zig/blob/master/lib/std/unicode.zig that we ported over in [utf8.test.js](./test/utf8.test.js) and [utf16.test.js](./test/utf16.test.js)
