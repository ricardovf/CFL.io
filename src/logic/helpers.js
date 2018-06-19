import * as R from 'ramda';

export function multiTrim(input, noSpaces = true, noLines = false) {
  return input
    .trim()
    .replace(/\|\|+/g, '|')
    .replace(/\|$/g, '')
    .trim()
    .replace(
      /[ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g,
      noSpaces ? '' : ' '
    )
    .replace(/\n\n+/g, '\n')
    .split('\n')
    .map(line => {
      return line.trim();
    })
    .join(noLines ? '' : '\n')
    .trim();
}
export function multiTrimNoLines(input) {
  return multiTrim(input, true, true);
}

export function removeDoubleSpaces(input) {
  return input.replace(/\s\s+/g, ' ');
}

/**
 * Get the match of the maximum length from symbols that match the beginning of the input
 *
 * @param input
 * @param symbols
 */
export function findMatchOfFromStartOfString(input, symbols) {
  return R.last(
    R.sortBy(R.length, R.filter(t => input.indexOf(t) === 0, symbols))
  );
}
