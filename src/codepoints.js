import { echo } from "./echo.js";
import { toBitArray, stringBits, sizedInt, bitArraySliceToInt, bitArraySlice } from "./gleam.js";
import { bitArrayUtf8Codepoint, bitArrayUtf8SequenceSize } from "./utf.js";

{
  // let assert <<x:utf8_codepoint>> = <<"a":utf8>>

  let _block;
  let $ = toBitArray([stringBits("a")]);
  let _size = bitArrayUtf8SequenceSize($, 0);

  if (_size !== -1 && $.bitSize === _size) {
    let x = bitArrayUtf8Codepoint($, 0, _size);
    _block = x;
  } else {
    _block = "no match";
  }

  echo(_block, undefined, "src/codepoints.js");
}

{
  // let assert <<x:utf8_codepoint>> = <<"💜":utf8>>

  let _block;
  let $ = toBitArray([stringBits("💜")]);
  let _size = bitArrayUtf8SequenceSize($, 0);

  if (_size !== -1 && $.bitSize === _size) {
    let x = bitArrayUtf8Codepoint($, 0, _size);
    _block = x;
  } else {
    _block = "no match";
  }

  echo(_block, undefined, "src/codepoints.js");
}

{
  // let assert <<prefix:3, x:utf8_codepoint, rest:bits>> =
  //   <<5:3, "💜":utf8, 21:5>>

  let _block;
  let $ = toBitArray([sizedInt(5, 3, true), stringBits("💜"), sizedInt(21, 5, true)]);

  let prefix;
  let x;
  let rest;

  let _size = bitArrayUtf8SequenceSize($, 3);

  if ($.bitSize >= 3 && _size !== -1) {
    prefix = bitArraySliceToInt($, 0, 3, true, false);
    x = bitArrayUtf8Codepoint($, 3, _size);
    rest = bitArraySlice($, 3 + _size);

    _block = [prefix, x, rest];
  } else {
    _block = "no match";
  }

  echo(_block, undefined, "src/codepoints.js");
}

{
  // echo case <<5:3, "💜":utf8, 21:5>> {
  //   <<prefix:3, x:utf8_codepoint, rest:bits>> -> "match"
  //   _ -> "no match"
  // }

  let _block;
  let $ = toBitArray([sizedInt(5, 3, true), stringBits("💜"), sizedInt(21, 5, true)]);

  let _size = bitArrayUtf8SequenceSize($, 3);

  if ($.bitSize >= 3 && _size !== -1) {
    let prefix = bitArraySliceToInt($, 0, 3, true, false);
    let x = bitArrayUtf8Codepoint($, 3, _size);
    let rest = bitArraySlice($, 3 + _size);

    _block = [prefix, x, rest];
  } else {
    _block = "no match";
  }

  echo(_block, undefined, "src/codepoints.js");
}

{
  // case <<"🇩🇪":utf8>> {
  //   <<first:utf8_codepoint, second:utf8_codepoint>> -> "match"
  //   _ -> "no match"
  // }

  let _block;
  let $ = toBitArray([stringBits("🇩🇪")]);

  let _size = bitArrayUtf8SequenceSize($, 0);

  if (_size !== -1) {
    let first = bitArrayUtf8Codepoint($, 0, _size);
    let _size$1 = bitArrayUtf8SequenceSize($, _size);

    if (_size$1 !== -1 && $.bitSize === _size + _size$1) {
      let second = bitArrayUtf8Codepoint($, _size, _size$1);

      _block = [first, second];
    } else {
      _block = "no match";
    }
  } else {
    _block = "no match";
  }

  echo(_block, undefined, "src/codepoints.js");
}
