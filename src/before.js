import { toBitArray, stringBits, bitArraySliceToInt, sizedInt } from "./gleam.js";

// Every block is a simplified implementation of the JavaScript
// that the reference Gleam code generates through the compiler.

{
  // case <<"a":utf8>> {
  //   <<_:utf8>> -> "✓ match!"
  //   _ -> "✗ no match"
  // }
  let _block;
  let $ = toBitArray([stringBits("a")]);
  if ($.bitSize === 64) {
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
  if ($.bitSize === 64) {
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
  if ($.bitSize === 64) {
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
  if ($.bitSize === 64) {
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
  if ($.bitSize >= 64 && $.bitSize === 72 && $.byteAt(8) === 98) {
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
  if ($.bitSize >= 8 && $.byteAt(0) === 97 && $.bitSize === 72) {
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
  if ($.bitSize >= 16 && $.byteAt(0) === 97 && $.byteAt(1) === 98 && $.bitSize === 80) {
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
  if ($.bitSize >= 3 && $.bitSize === 67) {
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
  if ($.bitSize >= 3 && bitArraySliceToInt($, 0, 3, true, false) === 5 && $.bitSize === 67) {
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
  if ($.bitSize >= 3 && bitArraySliceToInt($, 0, 3, true, false) === 5 && $.bitSize === 67) {
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
  if ($.bitSize >= 64 && $.bitSize >= 128 && $.bitSize >= 192 && $.bitSize === 256) {
    _block = "✓ match!";
  } else {
    _block = "✗ no match";
  }
  console.log(_block);
}
