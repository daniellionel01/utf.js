import { toBitArray, stringBits, bitArraySliceToInt, sizedInt } from "./gleam.js";
import { bitArrayUtf8Size } from "./utf.js";

{
  // case <<"a":utf8>> {
  //   <<_:utf8>> -> "✓ match!"
  //   _ -> "✗ no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("a")]);
  let _size = bitArrayUtf8Size($, 0);
  if (_size !== -1 && $.bitSize === _size) {
    _block = "✓ match!";
  } else {
    _block = "✗ no match";
  }
  console.log(_block);
}
{
  // case <<"é":utf8>> {
  //   <<_:utf8>> -> "✓ match!"
  //   _ -> "✗ no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("é")]);
  let _size = bitArrayUtf8Size($, 0);

  if (_size !== -1 && $.bitSize === _size) {
    _block = "✓ match!";
  } else {
    _block = "✗ no match";
  }

  console.log(_block);
}

{
  // case <<"€":utf8>> {
  //   <<_:utf8>> -> "✓ match!"
  //   _ -> "✗ no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("€")]);
  let _size = bitArrayUtf8Size($, 0);

  if (_size !== -1 && $.bitSize === _size) {
    _block = "✓ match!";
  } else {
    _block = "✗ no match";
  }

  console.log(_block);
}

{
  // case <<"💜":utf8>> {
  //   <<_:utf8>> -> "✓ match!"
  //   _ -> "✗ no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("💜")]);
  let _size = bitArrayUtf8Size($, 0);

  if (_size !== -1 && $.bitSize === _size) {
    _block = "✓ match!";
  } else {
    _block = "✗ no match";
  }

  console.log(_block);
}

{
  // case <<"ab":utf8>> {
  //   <<_:utf8, "b":utf8>> -> "✓ match!"
  //   _ -> "✗ no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("ab")]);
  let _size = bitArrayUtf8Size($, 0);

  if (_size !== -1 && $.bitSize === _size + 8 && $.byteAt(_size / 8) === 98) {
    _block = "✓ match!";
  } else {
    _block = "✗ no match";
  }

  console.log(_block);
}

{
  // case <<"ab":utf8>> {
  //   <<"a":utf8, _:utf8>> -> "✓ match!"
  //   _ -> "✗ no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("ab")]);
  let _size = bitArrayUtf8Size($, 8);

  if ($.bitSize >= 8 && $.byteAt(0) === 97 && _size !== -1 && $.bitSize === 8 + _size) {
    _block = "✓ match!";
  } else {
    _block = "✗ no match";
  }

  console.log(_block);
}
{
  // case <<"abc":utf8>> {
  //   <<"ab":utf8, _:utf8>> -> "✓ match!"
  //   _ -> "✗ no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("abc")]);
  let _size = bitArrayUtf8Size($, 16);

  if ($.bitSize >= 16 && $.byteAt(0) === 97 && $.byteAt(1) === 98 && _size !== -1 && $.bitSize === 16 + _size) {
    _block = "✓ match!";
  } else {
    _block = "✗ no match";
  }

  console.log(_block);
}
{
  // case <<5:3, "a":utf8>> {
  //   <<_:size(3), _:utf8>> -> "✓ match!"
  //   _ -> "✗ no match"
  // }
  let _block;
  let $ = toBitArray([sizedInt(5, 3, true), stringBits("a")]);
  let _size = bitArrayUtf8Size($, 3);

  if ($.bitSize >= 3 && _size !== -1 && $.bitSize === 3 + _size) {
    _block = "✓ match!";
  } else {
    _block = "✗ no match";
  }

  console.log(_block);
}

{
  // case <<5:3, "a":utf8>> {
  //   <<5:size(3), _:utf8>> -> "✓ match!"
  //   _ -> "✗ no match"
  // }
  let _block;
  let $ = toBitArray([sizedInt(5, 3, true), stringBits("a")]);
  let _size = bitArrayUtf8Size($, 3);

  if ($.bitSize >= 3 && bitArraySliceToInt($, 0, 3, true, false) === 5 && _size !== -1 && $.bitSize === 3 + _size) {
    _block = "✓ match!";
  } else {
    _block = "✗ no match";
  }

  console.log(_block);
}

{
  // case <<5:3, "💜":utf8>> {
  //   <<5:size(3), _:utf8>> -> "✓ match!"
  //   _ -> "✗ no match"
  // }
  let _block;
  let $ = toBitArray([sizedInt(5, 3, true), stringBits("💜")]);
  let _size = bitArrayUtf8Size($, 3);

  if ($.bitSize >= 3 && bitArraySliceToInt($, 0, 3, true, false) === 5 && _size !== -1 && $.bitSize === 3 + _size) {
    _block = "✓ match!";
  } else {
    _block = "✗ no match";
  }

  console.log(_block);
}

{
  // case <<"aé€💜":utf8>> {
  //   <<_:utf8, _:utf8, _:utf8, _:utf8>> -> "✓ match!"
  //   _ -> "✗ no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("aé€💜")]);

  let _size = bitArrayUtf8Size($, 0);
  let _size$1 = _size === -1 ? -1 : bitArrayUtf8Size($, _size);

  let _size$2 = _size$1 === -1 ? -1 : bitArrayUtf8Size($, _size + _size$1);

  let _size$3 = _size$2 === -1 ? -1 : bitArrayUtf8Size($, _size + _size$1 + _size$2);

  if (
    _size !== -1 &&
    _size$1 !== -1 &&
    _size$2 !== -1 &&
    _size$3 !== -1 &&
    $.bitSize === _size + _size$1 + _size$2 + _size$3
  ) {
    _block = "✓ match!";
  } else {
    _block = "✗ no match";
  }

  console.log(_block);
}
