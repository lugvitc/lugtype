/**
 * Removes accents from a string.
 * https://ricardometring.com/javascript-replace-special-characters
 * @param str The input string.
 * @returns A new string with accents removed.
 */
export function replaceSpecialChars(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents
}

/**
 * Converts a camelCase string to words separated by spaces.
 * @param str The camelCase string to convert.
 * @returns The string with spaces inserted before capital letters and converted to lowercase.
 */
export function camelCaseToWords(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toLowerCase();
}

/**
 * Returns the last character of a string.
 * @param word The input string.
 * @returns The last character of the input string, or an empty string if the input is empty.
 */
export function getLastChar(word: string): string {
  try {
    return word.charAt(word.length - 1);
  } catch {
    return "";
  }
}

/**
 * Replaces a character at a specific index in a string.
 * @param str The input string.
 * @param index The index at which to replace the character.
 * @param chr The character to insert at the specified index.
 * @returns A new string with the character at the specified index replaced.
 */
export function replaceCharAt(str: string, index: number, chr: string): string {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param str The input string.
 * @returns A new string with the first letter of each word capitalized.
 */
export function capitalizeFirstLetterOfEachWord(str: string): string {
  return str
    .split(/ +/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

/**
 * Capitalizes the first letter of a string.
 * @param str The input string.
 * @returns A new string with the first letter capitalized.
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * @param text String to split
 * @param delimiters Single character delimiters.
 */
export function splitByAndKeep(text: string, delimiters: string[]): string[] {
  const splitString: string[] = [];
  let currentToken: string[] = [];
  const delimiterSet = new Set<string>(delimiters);

  for (const char of text) {
    if (delimiterSet.has(char)) {
      if (currentToken.length > 0) {
        splitString.push(currentToken.join(""));
      }
      splitString.push(char);
      currentToken = [];
    } else {
      currentToken.push(char);
    }
  }

  if (currentToken.length > 0) {
    splitString.push(currentToken.join(""));
  }

  return splitString;
}
