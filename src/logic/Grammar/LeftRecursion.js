import SymbolValidator, { EPSILON } from '../SymbolValidator';
import { first } from './First';
import * as R from 'ramda';
import { makeNewUniqueNonTerminalName } from '../helpers';

export const DIRECT = 'direct';
export const INDIRECT = 'indirect';

/**
 * @param grammar {Grammar}
 */
export function removeLeftRecursion(grammar) {
  // eliminate direct and indirect
  const recursions = getLeftRecursions(grammar);

  if (!R.isEmpty(recursions)) {
    R.forEachObjIndexed((nTRecursions, nT) => {
      if (nTRecursions[DIRECT]) {
        // A -> Aα1 | Aα2 | ... | Aαn | β1 | β2 | ... | βm
        const newNT = makeNewUniqueNonTerminalName(grammar.Vn, nT);
        grammar.addNonTerminal(newNT);

        let created = [];

        for (let production of grammar.P[nT]) {
          if (created.includes(production)) continue;

          if (nTRecursions[DIRECT].includes(production)) {
            // A’ -> α1A’ | α2A’ | ... | αnA’ | ε
            grammar.P[newNT] = grammar.P[newNT] || [];
            grammar.P[newNT].push(
              `${production.slice(nT.length)} ${newNT}`.trim()
            );
            grammar.P[newNT].push(EPSILON);
          } else {
            // A -> β1A' | β2A' | ... | βmA’
            grammar.P[nT].push(`${production} ${newNT}`.trim());
            created.push(`${production} ${newNT}`.trim());
          }

          grammar.P[nT] = R.without([production], grammar.P[nT]);
        }

        grammar.P[nT] = R.without(nTRecursions[DIRECT], grammar.P[nT]);

        if (grammar.P[nT] && grammar.P[nT].length === 0)
          grammar.P[nT] = [newNT];

        grammar.P[nT] = R.uniq(grammar.P[nT]).sort();
        grammar.P[newNT] = R.uniq(grammar.P[newNT]).sort();
      }
    }, recursions);
  }
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
