import { echo } from "./echo.js";
import { toBitArray, stringBits, bitArraySliceToInt, sizedInt } from "./gleam.js";
import { bitArrayUtf8Codepoint, bitArrayUtf8SequenceSize } from "./utf.js";

{
  // case <<"a":utf8>> {
  //   <<_:utf8>> -> "match!"
  //   _ -> "no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("a")]);
  let _size = bitArrayUtf8SequenceSize($, 0);
  if (_size !== -1 && $.bitSize === _size) {
    _block = "match!";
  } else {
    _block = "no match";
  }
  echo(_block);
}
{
  // case <<"é":utf8>> {
  //   <<_:utf8>> -> "match!"
  //   _ -> "no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("é")]);
  let _size = bitArrayUtf8SequenceSize($, 0);

  if (_size !== -1 && $.bitSize === _size) {
    _block = "match!";
  } else {
    _block = "no match";
  }

  echo(_block);
}

{
  // case <<"€":utf8>> {
  //   <<_:utf8>> -> "match!"
  //   _ -> "no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("€")]);
  let _size = bitArrayUtf8SequenceSize($, 0);

  if (_size !== -1 && $.bitSize === _size) {
    _block = "match!";
  } else {
    _block = "no match";
  }

  echo(_block);
}

{
  // case <<"💜":utf8>> {
  //   <<_:utf8>> -> "match!"
  //   _ -> "no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("💜")]);
  let _size = bitArrayUtf8SequenceSize($, 0);

  if (_size !== -1 && $.bitSize === _size) {
    _block = "match!";
  } else {
    _block = "no match";
  }

  echo(_block);
}

{
  // case <<"ab":utf8>> {
  //   <<_:utf8, "b":utf8>> -> "match!"
  //   _ -> "no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("ab")]);
  let _size = bitArrayUtf8SequenceSize($, 0);

  if (_size !== -1 && $.bitSize === _size + 8 && $.byteAt(_size / 8) === 98) {
    _block = "match!";
  } else {
    _block = "no match";
  }

  echo(_block);
}

{
  // case <<"ab":utf8>> {
  //   <<"a":utf8, _:utf8>> -> "match!"
  //   _ -> "no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("ab")]);
  let _size = bitArrayUtf8SequenceSize($, 8);

  if ($.bitSize >= 8 && $.byteAt(0) === 97 && _size !== -1 && $.bitSize === 8 + _size) {
    _block = "match!";
  } else {
    _block = "no match";
  }

  echo(_block);
}
{
  // case <<"abc":utf8>> {
  //   <<"ab":utf8, _:utf8>> -> "match!"
  //   _ -> "no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("abc")]);
  let _size = bitArrayUtf8SequenceSize($, 16);

  if ($.bitSize >= 16 && $.byteAt(0) === 97 && $.byteAt(1) === 98 && _size !== -1 && $.bitSize === 16 + _size) {
    _block = "match!";
  } else {
    _block = "no match";
  }

  echo(_block);
}
{
  // case <<5:3, "a":utf8>> {
  //   <<_:size(3), _:utf8>> -> "match!"
  //   _ -> "no match"
  // }
  let _block;
  let $ = toBitArray([sizedInt(5, 3, true), stringBits("a")]);
  let _size = bitArrayUtf8SequenceSize($, 3);

  if ($.bitSize >= 3 && _size !== -1 && $.bitSize === 3 + _size) {
    _block = "match!";
  } else {
    _block = "no match";
  }

  echo(_block);
}

{
  // case <<5:3, "a":utf8>> {
  //   <<5:size(3), _:utf8>> -> "match!"
  //   _ -> "no match"
  // }
  let _block;
  let $ = toBitArray([sizedInt(5, 3, true), stringBits("a")]);
  let _size = bitArrayUtf8SequenceSize($, 3);

  if ($.bitSize >= 3 && bitArraySliceToInt($, 0, 3, true, false) === 5 && _size !== -1 && $.bitSize === 3 + _size) {
    _block = "match!";
  } else {
    _block = "no match";
  }

  echo(_block);
}

{
  // case <<5:3, "💜":utf8>> {
  //   <<5:size(3), _:utf8>> -> "match!"
  //   _ -> "no match"
  // }
  let _block;
  let $ = toBitArray([sizedInt(5, 3, true), stringBits("💜")]);
  let _size = bitArrayUtf8SequenceSize($, 3);

  if ($.bitSize >= 3 && bitArraySliceToInt($, 0, 3, true, false) === 5 && _size !== -1 && $.bitSize === 3 + _size) {
    _block = "match!";
  } else {
    _block = "no match";
  }

  echo(_block);
}

{
  // case <<"aé€💜":utf8>> {
  //   <<_:utf8, _:utf8, _:utf8, _:utf8>> -> "match!"
  //   _ -> "no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("aé€💜")]);

  let _size = bitArrayUtf8SequenceSize($, 0);
  let _size$1 = _size === -1 ? -1 : bitArrayUtf8SequenceSize($, _size);

  let _size$2 = _size$1 === -1 ? -1 : bitArrayUtf8SequenceSize($, _size + _size$1);

  let _size$3 = _size$2 === -1 ? -1 : bitArrayUtf8SequenceSize($, _size + _size$1 + _size$2);

  if (
    _size !== -1 &&
    _size$1 !== -1 &&
    _size$2 !== -1 &&
    _size$3 !== -1 &&
    $.bitSize === _size + _size$1 + _size$2 + _size$3
  ) {
    _block = "match!";
  } else {
    _block = "no match";
  }

  echo(_block);
}

{
  // let assert <<x:utf8_codepoint>> = <<"💜":utf8>>

  let $ = toBitArray([stringBits("💜")]);

  let _size = bitArrayUtf8SequenceSize($, 0);

  if (_size !== -1 && $.bitSize === _size) {
    let x = bitArrayUtf8Codepoint($, 0, _size);

    echo(["size", _size, "codepoint", x], "utf8_codepoint", "src/after.js", 220);
  } else {
    echo("no match");
  }
}

{
  for (const character of ["a", "é", "€", "💜", "🇩🇪"]) {
    const $ = toBitArray([stringBits(character)]);
    const _size = bitArrayUtf8SequenceSize($, 0);

    if (_size !== -1 && $.bitSize === _size) {
      const codepoint = bitArrayUtf8Codepoint($, 0, _size);

      echo([character, _size, codepoint]);
    }
  }
}
