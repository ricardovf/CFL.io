import SymbolValidator, { EPSILON } from '../SymbolValidator';
import { first } from './First';
import * as R from 'ramda';
import { makeNewUniqueNonTerminalName } from '../helpers';

export const DIRECT = 'direct';
export const INDIRECT = 'indirect';

/**
 * @param originalGrammar {Grammar}
 * @param maxSteps
 * @return {boolean}
 */
export function canBeFactored(originalGrammar, maxSteps) {
  const grammar = originalGrammar.clone();

  if (grammar.isFactored()) return true;

  removeFactors(grammar, maxSteps);

  return grammar.isFactored();
}

/**
 * Removes the most factors possible in the max steps given
 *
 * @param grammar {Grammar}
 * @param maxSteps
 */
export function removeFactors(grammar, maxSteps) {
  let loops = 0;

  while (!grammar.isFactored()) {
    if (++loops > maxSteps) return;

    // If we have left recursion, we must eliminate in order to be able to factor
    if (grammar.hasLeftRecursion()) {
      grammar.removeLeftRecursion();

      if (grammar.hasLeftRecursion()) {
        throw new Error(
          'Could not remove left recursion, so we can not factor. Its probably a bug, please review!'
        );
      }
    }

    const factors = grammar.getFactors();

    // Remove direct factors
    let removedAnyDirect = false;

    R.forEachObjIndexed((nTFactors, nT) => {
      // We only remove the factors of one non terminal
      if (removedAnyDirect) return;

      if (nTFactors[DIRECT]) {
        R.forEachObjIndexed((productions, alpha) => {
          const newNT = makeNewUniqueNonTerminalName(grammar.Vn, nT);
          grammar.addNonTerminal(newNT);

          // Remove productions A -> α β | α γ
          grammar.P[nT] = R.without(productions, grammar.P[nT] || []);

          // Add A -> α A’
          grammar.P[nT].push(`${alpha} ${newNT}`.trim());

          // Add A’ -> β | γ
          grammar.P[newNT] = R.uniq(
            R.union(
              grammar.P[newNT] || [],
              R.map(p => {
                let newP = p.slice(alpha.length).trim();
                if (newP === '') newP = EPSILON;
                return newP;
              }, productions)
            )
          ).sort();
        }, nTFactors[DIRECT]);

        removedAnyDirect = true;
      }
    }, factors);

    // We break here cause we wanna count the steps of factoring
    if (removedAnyDirect) break;

    // Remove indirect factors
  }
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
        // productions = R.map(R.trim, productions);

        // Try to find the biggest common start of strings
        const max = R.tail(R.map(R.length, productions).sort());

        let commonStart;
        let i = B.length;
        do {
          commonStart = productions[0].slice(0, i);

          if (
            !R.all(
              p =>
                p.length >= commonStart.length && p.slice(0, i) === commonStart
            )(productions)
          ) {
            commonStart = productions[0].slice(0, i - 1);
            break;
          }
        } while (i++ < max);

        B = commonStart.trim();

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
