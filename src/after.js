import { stringBits, toBitArray } from "./gleam.js";

let $;
let utf8Size;

$ = toBitArray([stringBits("a")]);
utf8Size = bitArrayUtf8Size($, 0);
console.log("$", "a", "bitSize", $.bitSize, "utf8Size", utf8Size);

$ = toBitArray([stringBits("é")]);
utf8Size = bitArrayUtf8Size($, 0);
console.log("$", "é", "bitSize", $.bitSize, "utf8Size", utf8Size);

$ = toBitArray([stringBits("€")]);
utf8Size = bitArrayUtf8Size($, 0);
console.log("$", "€", "bitSize", $.bitSize, "utf8Size", utf8Size);

$ = toBitArray([stringBits("💜")]);
utf8Size = bitArrayUtf8Size($, 0);
console.log("$", "💜", "bitSize", $.bitSize, "utf8Size", utf8Size);
