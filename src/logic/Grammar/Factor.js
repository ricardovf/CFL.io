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
 * Note that only the first factor (length 1) is returned, not all possible lengths
 * as we will try to factor step by step
 *
 * @param grammar {Grammar}
 * @return {Object}
 */
export function getFactors(grammar) {
  if (!grammar.isValid()) return {};

  let factors = {};

  for (let A of grammar.Vn) {
    if (grammar.P[A] && grammar.P[A].length > 1) {
      // Capture all the firsts (without epsilon) and group by them the terminals
      let firsts = R.invert(
        R.dissoc(
          EPSILON,
          R.mergeAll(
            R.map(production => {
              return {
                [production]: R.without([EPSILON], first(grammar, production)),
              };
            }, grammar.P[A])
          )
        )
      );

      R.forEachObjIndexed((productions, terminal) => {
        if (terminal.includes(',')) {
          // multiple associations with this 'terminal' (ex: a,b
          for (let t of terminal.split(',')) {
            // We merge this productions with the productions of each terminal
            firsts[t] = R.union(firsts[t] || [], productions);
          }

          firsts = R.dissoc(terminal, firsts);
        }
      }, firsts);

      // Only when we have more then 1 production its not factored
      firsts = R.filter(v => v.length > 1, firsts);

      // Extract direct and indirect factors
      R.forEachObjIndexed((productions, terminal) => {
        const isFirstCharNonTerminal = R.any(production => {
          return SymbolValidator.isValidNonTerminal(production[0]);
        }, productions);

        const type = isFirstCharNonTerminal ? INDIRECT : DIRECT;

        factors[A] = factors[A] || {};
        factors[A][type] = factors[A][type] || {};
        factors[A][type][terminal] = factors[A][type][terminal] || [];
        factors[A][type][terminal] = R.union(
          factors[A][type][terminal],
          productions
        ).sort();
      }, firsts);
    }
  }

  factors = _removeFactorsWithSingleProduction(factors);
  factors = _expandFactorsToMaxLength(factors);

  return factors;
}

function _expandFactorsToMaxLength(factors) {
  let finalFactors = {};
  R.forEachObjIndexed((AFactors, A) => {
    if (AFactors[DIRECT]) {
      R.forEachObjIndexed((productions, B) => {
        // Try to find the biggest common start of strings
        const max = R.tail(R.map(R.length, productions).sort());
        for (let i = B.length; i < max; i++) {
          if (
            R.all(p => {
              return p.slice(0, B.length).trim() === B.trim();
            }, productions)
          ) {
            B = R.head(productions)
              .slice(0, i)
              .trim();
          } else {
            break;
          }
        }

        finalFactors[A] = finalFactors[A] || {};
        finalFactors[A][DIRECT] = finalFactors[A][DIRECT] || {};
        finalFactors[A][DIRECT][B] = finalFactors[A][DIRECT][B] || [];
        finalFactors[A][DIRECT][B] = productions;
      }, AFactors[DIRECT]);
    }

    // Copy indirect factors
    if (AFactors[INDIRECT]) {
      finalFactors[A] = finalFactors[A] || {};
      finalFactors[A][INDIRECT] = AFactors[INDIRECT];
    }
  }, factors);

  return finalFactors;
}

function _removeFactorsWithSingleProduction(factors) {
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
