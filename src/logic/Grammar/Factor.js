import SymbolValidator, { EPSILON } from '../SymbolValidator';
import { first } from './First';
import * as R from 'ramda';

export const DIRECT = 'direct';
export const INDIRECT = 'indirect';

/**
 * @param grammar
 * @param steps
 * @return {boolean}
 */
export function canBeFactored(grammar, steps) {
  // If we have left recursion, we must eliminate in order to be able to factor
  // if (grammar.hasLeftRecursion()) grammar.eliminateLeftRecursion();

  return false;
}

/**
 * @param grammar
 * @return {boolean}
 */
export function isFactored(grammar) {
  return R.isEmpty(getFactors(grammar));
}

/**
 * Returns the factors for all non terminals in the form:
 *
 * { A: {
 *    direct: {
 *      'a': ['a B', 'a C']
 *      'A': ['A D', 'A A S']
 *    },
 *    indirect: {
 *      'a': ['E a', 'C a']
 *      'ac': ['E a', 'C a']
 *    }
 * }, B: {
 *    indirect: {
 *      'b': ['S B a', 'C D a']
 *    }
 * } }
 *
 * @param grammar {Grammar}
 * @return {Object}
 */
export function getFactors(grammar) {
  if (!grammar.isValid()) return {};

  let factors = {};

  for (let A of grammar.Vn) {
    if (grammar.P[A] && grammar.P[A].length > 1) {
      for (let production of grammar.P[A]) {
        let y = production.split(' ');

        if (y.length) {
          let B = y[0];
          factors[A] = factors[A] || {};
          factors[A][DIRECT] = factors[A][DIRECT] || {};
          factors[A][DIRECT][B] = factors[A][DIRECT][B] || [];
          factors[A][DIRECT][B].push(production);
        }

        // for (let i = 0; i < y.length; i++) {
        //   let B = y[i];
        //
        //   // If symbol is not a non terminal, lets break, as can not have an indirect recursion
        //   if (!SymbolValidator.isValidNonTerminal(B)) break;
        //
        //   // Lets check if we can reach A using B
        //   if (_canDeriveAsFirst(grammar, B, A)) {
        //     factors[A] = factors[A] || {};
        //     factors[A][INDIRECT] = factors[A][INDIRECT] || [];
        //     factors[A][INDIRECT].push(production);
        //     break;
        //   }
        //
        //   // If first(B) does not contain &
        //   if (!first(grammar, B).includes(EPSILON)) break;
        // }
      }
    }
  }

  // Filter factors that have only one production
  let finalFactors = {};
  R.forEachObjIndexed((AFactors, A) => {
    if (AFactors[DIRECT]) {
      R.forEachObjIndexed((productions, B) => {
        if (productions.length > 1) {
          finalFactors[A] = finalFactors[A] || {};
          finalFactors[A][DIRECT] = finalFactors[A][DIRECT] || {};
          finalFactors[A][DIRECT][B] = finalFactors[A][DIRECT][B] || [];
          finalFactors[A][DIRECT][B] = productions;
        }
      }, AFactors[DIRECT]);
    }

    if (AFactors[INDIRECT]) {
      R.forEachObjIndexed((productions, B) => {
        if (productions.length > 1) {
          finalFactors[A] = finalFactors[A] || {};
          finalFactors[A][INDIRECT] = finalFactors[A][INDIRECT] || {};
          finalFactors[A][INDIRECT][B] = finalFactors[A][INDIRECT][B] || [];
          finalFactors[A][INDIRECT][B] = productions;
        }
      }, AFactors[INDIRECT]);
    }
  }, factors);

  return finalFactors;
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
