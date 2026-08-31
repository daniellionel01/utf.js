import { toBitArray, stringBits, bitArraySliceToInt, sizedInt } from "./gleam.js";
import { bitArrayUtf8SequenceSize } from "./utf8.js";

/*
All valid UTF-8 Characters:

1 byte	a	U+0061	61
2 bytes	é	U+00E9	C3 A9
3 bytes	€	U+20AC	E2 82 AC
4 bytes	💜	U+1F49C	F0 9F 92 9C
*/

function main() {
  let $;

  /*
    case <<"a":utf8>> {
      <<_:utf8>> -> "this is utf8!"
      _ -> "this is not."
    }
  */
  $ = toBitArray([stringBits("a")]);
  if ($.bitSize === 64) {
    console.log("this is utf8!");
  } else {
    console.log("this is not.");
  }

  /*
    case <<"é":utf8>> {
      <<_:utf8>> -> "this is utf8!"
      _ -> "this is not."
    }
  */
  $ = toBitArray([stringBits("é")]);
  if ($.bitSize === 64) {
    console.log("this is utf8!");
  } else {
    console.log("this is not.");
  }

  /*
    case <<"€":utf8>> {
      <<_:utf8>> -> "this is utf8!"
      _ -> "this is not."
    }
  */
  $ = toBitArray([stringBits("€")]);
  if ($.bitSize === 64) {
    console.log("this is utf8!");
  } else {
    console.log("this is not.");
  }

  /*
    case <<"💜":utf8>> {
      <<_:utf8>> -> "this is utf8!"
      _ -> "this is not."
    }
  */
  $ = toBitArray([stringBits("💜")]);
  if ($.bitSize === 64) {
    console.log("this is utf8!");
  } else {
    console.log("this is not.");
  }

  /*
    case <<"ab":utf8>> {
      <<_:utf8, "b":utf8>> -> "this is utf8!"
      _ -> "this is not."
    }
  */
  $ = toBitArray([stringBits("ab")]);
  if ($.bitSize >= 64 && $.bitSize === 72 && $.byteAt(8) === 98) {
    console.log("this is utf8!");
  } else {
    console.log("this is not.");
  }

  /*
    case <<"ab":utf8>> {
      <<"a":utf8, _:utf8>> -> "this is utf8!"
      _ -> "this is not."
    }
  */
  $ = toBitArray([stringBits("ab")]);
  if ($.bitSize >= 8 && $.byteAt(0) === 97 && $.bitSize === 72) {
    console.log("this is utf8!");
  } else {
    console.log("this is not.");
  }

  /*
    case <<"abc":utf8>> {
      <<"ab":utf8, _:utf8>> -> "this is utf8!"
      _ -> "this is not."
    }
  */
  $ = toBitArray([stringBits("abc")]);
  if ($.bitSize >= 16 && $.byteAt(0) === 97 && $.byteAt(1) === 98 && $.bitSize === 80) {
    console.log("this is utf8!");
  } else {
    console.log("this is not.");
  }

  /*
    case <<5:3, "a":utf8>> {
      <<_:size(3), _:utf8>> -> "this is utf8!"
      _ -> "this is not."
    }
  */
  $ = toBitArray([sizedInt(5, 3, true), stringBits("a")]);
  if ($.bitSize >= 3 && $.bitSize === 67) {
    console.log("this is utf8!");
  } else {
    console.log("this is not.");
  }

  /*
    case <<5:3, "a":utf8>> {
      <<5:size(3), _:utf8>> -> "this is utf8!"
      _ -> "this is not."
    }
  */
  $ = toBitArray([sizedInt(5, 3, true), stringBits("a")]);
  if ($.bitSize >= 3 && bitArraySliceToInt($, 0, 3, true, false) === 5 && $.bitSize === 67) {
    console.log("this is utf8!");
  } else {
    console.log("this is not.");
  }

  /*
    case <<5:3, "💜":utf8>> {
      <<5:size(3), _:utf8>> -> "this is utf8!"
      _ -> "this is not."
    }
  */
  $ = toBitArray([sizedInt(5, 3, true), stringBits("💜")]);
  if ($.bitSize >= 3 && bitArraySliceToInt($, 0, 3, true, false) === 5 && $.bitSize === 67) {
    console.log("this is utf8!");
  } else {
    console.log("this is not.");
  }

  /*
    case <<"aé€💜":utf8>> {
      <<_:utf8, _:utf8, _:utf8, _:utf8>> -> "this is utf8!"
      _ -> "this is not."
    }
  */
  $ = toBitArray([stringBits("aé€💜")]);
  if ($.bitSize >= 64 && $.bitSize >= 128 && $.bitSize >= 192 && $.bitSize === 256) {
    console.log("this is utf8!");
  } else {
    console.log("this is not.");
  }

  let utf8Size;

  $ = toBitArray([stringBits("a")]);
  utf8Size = bitArrayUtf8SequenceSize($, 0);
  console.log("$", "a", "bitSize", $.bitSize, "utf8Size", utf8Size);

  $ = toBitArray([stringBits("é")]);
  utf8Size = bitArrayUtf8SequenceSize($, 0);
  console.log("$", "é", "bitSize", $.bitSize, "utf8Size", utf8Size);

  $ = toBitArray([stringBits("€")]);
  utf8Size = bitArrayUtf8SequenceSize($, 0);
  console.log("$", "€", "bitSize", $.bitSize, "utf8Size", utf8Size);

  $ = toBitArray([stringBits("💜")]);
  utf8Size = bitArrayUtf8SequenceSize($, 0);
  console.log("$", "💜", "bitSize", $.bitSize, "utf8Size", utf8Size);
}
main();
