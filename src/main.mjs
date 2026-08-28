import { toBitArray, stringBits } from "./gleam.mjs";

function main() {
  let $ = toBitArray([stringBits("a")]);
  if ($.bitSize === 64) {
    return "this is utf8!";
  } else {
    return "this is not.";
  }
}
main();
