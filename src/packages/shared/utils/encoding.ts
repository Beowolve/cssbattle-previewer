const NON_GRAPHIC_CHARACTERS = new Set<string>([
  "\u00AD",
  "\u061C",
  "\u070F",
  "\u08E2",
  "\u180E",
  "\u200B",
  "\u200C",
  "\u200D",
  "\u200E",
  "\u200F",
  "\u202A",
  "\u202B",
  "\u202D",
  "\u202E",
  "\u202C",
  "\u2060",
  "\u2061",
  "\u2062",
  "\u2063",
  "\u2064",
  "\u2066",
  "\u2067",
  "\u2068",
  "\u2069",
  "\u206A",
  "\u206B",
  "\u206C",
  "\u206D",
  "\u206E",
  "\u206F",
  "\uFFF9",
  "\uFFFA",
  "\uFFFB",
  "\u{13430}",
  "\u{13431}",
  "\u{13432}",
  "\u{13433}",
  "\u{13434}",
  "\u{13435}",
  "\u{13436}",
  "\u{13437}",
  "\u{13438}",
  "\u{1BCA0}",
  "\u{1BCA1}",
  "\u{1BCA2}",
  "\u{1BCA3}",
  "\u{1D173}",
  "\u{1D174}",
  "\u{1D175}",
  "\u{1D176}",
  "\u{1D177}",
  "\u{1D178}",
  "\u{1D179}",
  "\u{1D17A}",
  "\u2000",
  "\u2001",
  "\u2002",
  "\u2003",
  "\u2004",
  "\u2005",
  "\u2006",
  "\u2007",
  "\u2008",
  "\u2009",
  "\u200A",
  "\u205F",
  "\u00A0",
  "\u3000",
  "\u202F",
  "\u180B",
  "\u180C",
  "\u180D",
  "\u2028",
  "\u0000"
]);

export function decodeHtmlEntities(inputValue: string): string {
  if (typeof document === "undefined") {
    return inputValue;
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = inputValue;
  return textarea.value;
}

export function encodeInvisibleChars(inputValue: string): string {
  let encodedValue = "";

  for (const character of inputValue) {
    const codePoint = character.codePointAt(0);

    if (typeof codePoint !== "number") {
      continue;
    }

    if (codePoint === 0x09 || codePoint === 0x0a || codePoint === 0x0d) {
      encodedValue += character;
      continue;
    }

    const shouldEncode =
      codePoint < 32 ||
      (codePoint > 126 && codePoint < 160) ||
      codePoint > 0xe0000 ||
      NON_GRAPHIC_CHARACTERS.has(character);

    if (!shouldEncode) {
      encodedValue += character;
      continue;
    }

    const hex = codePoint.toString(16).toUpperCase().padStart(4, "0");
    encodedValue += `&#x${hex};`;
  }

  return encodedValue;
}
