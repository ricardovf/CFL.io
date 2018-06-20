import SymbolValidator, { EPSILON } from '../SymbolValidator';
import { first } from './First';

export const DIRECT = 'direct';
export const INDIRECT = 'indirect';

/**
 * @param grammar {Grammar}
 */
export function eliminateLeftRecursion(grammar) {
  // eliminate direct and indirect
}

/**
 * Returns the recursions for all non terminals in the form:
 *
 * { A: {
 *    direct: ['A B'],
 *    indirect: ['E a', 'C A']
 * }, B: {
 *    indirect: ['S a']
 * } }
 *
 * @param grammar
 * @return {Object}
 */
export function getLeftRecursions(grammar) {
  if (!grammar.isValid()) return {};

  let recursions = {};

  for (let A of grammar.Vn) {
    if (grammar.P[A]) {
      for (let production of grammar.P[A]) {
        let y = production.split(' ');

        for (let i = 0; i < y.length; i++) {
          let B = y[i];

          // Check for direct recursion
          if (i === 0 && B === A) {
            recursions[A] = recursions[A] || {};
            recursions[A][DIRECT] = recursions[A][DIRECT] || [];
            recursions[A][DIRECT].push(production);
            break;
          }

          // Check for indirect recursion

          // If symbol is not a non terminal, lets break, as can not have an indirect recursion
          if (!SymbolValidator.isValidNonTerminal(B)) break;

          // Lets check if we can reach A using B
          if (_canDeriveAsFirst(grammar, B, A)) {
            recursions[A] = recursions[A] || {};
            recursions[A][INDIRECT] = recursions[A][INDIRECT] || [];
            recursions[A][INDIRECT].push(production);
            break;
          }

          // If first(B) does not contain &
          if (!first(grammar, B).includes(EPSILON)) break;
        }
      }
    }
  }

  return recursions;
}

/**
 * Checks if B and derive A with A on the left
 * @param grammar
 * @param B
 * @param A
 * @param checked
 * @return {boolean}
 * @private
 */
function _canDeriveAsFirst(grammar, B, A, checked = []) {
  if (!grammar.isValid()) return false;

  if (checked.includes(B + '->' + A)) return false;

  checked[B + '->' + A] = true;

  if (B === A) return true;

  if (grammar.P[B]) {
    for (let production of grammar.P[B]) {
      let y = production.split(' ');

      for (let i = 0; i < y.length; i++) {
        let Y = y[i];

        // Check for direct recursion
        if (i === 0 && Y === A) {
          return true;
        }

        // If symbol is not a non terminal, lets break, as can not have an indirect recursion
        if (!SymbolValidator.isValidNonTerminal(Y)) break;

        // If first(Y) does not contain &
        if (!first(grammar, Y).includes(EPSILON)) break;

        let Beta = i + 1 < y.length ? y.slice(i + 1).join() : undefined;

        if (Beta && _canDeriveAsFirst(grammar, Beta, A, checked)) return true;
      }
    }
  }

  return false;
}
