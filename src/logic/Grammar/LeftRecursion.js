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
  let loops = 0;
  do {
    const recursions = getLeftRecursions(grammar);

    if (!R.isEmpty(recursions)) {
      if (_haveIndirectLeftRecursions(recursions)) {
        _removeIndirectLeftRecursions(grammar, recursions);
      } else {
        _removeDirectLeftRecursions(grammar, recursions);
      }
    } else {
      // No more recursions!
      break;
    }

    // temporary
    if (loops++ > 100) break;
  } while (true);
}

/**
 * @param grammar
 * @param recursions
 * @private
 */
function _removeDirectLeftRecursions(grammar, recursions) {
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

      if (grammar.P[nT] && grammar.P[nT].length === 0) grammar.P[nT] = [newNT];

      grammar.P[nT] = R.uniq(grammar.P[nT]).sort();
      grammar.P[newNT] = R.uniq(grammar.P[newNT]).sort();
    }
  }, recursions);
}

/**
 * @param grammar {Grammar}
 * @param recursions
 * @private
 */
function _removeIndirectLeftRecursions(grammar, recursions) {
  // Make sure its a own grammar (Gramática Própria)
  if (!grammar.isOwn()) {
    grammar.toOwn();

    if (!grammar.isOwn())
      throw new Error(
        'Grammar should be own (própria) to be able to remove indirect left recursion, but the step to make it own has failed to do so! The grammar is: \n ' +
          grammar.getFormattedText()
      );
  }

  // 1 – Ordene os não-terminais de G em uma ordem
  let Vn = [...grammar.Vn].sort();
  for (let i = 0; i < Vn.length; i++) {
    const Ai = Vn[i];

    for (let j = 0; j < i; j++) {
      const Aj = Vn[j];

      if (grammar.P[Ai]) {
        for (let iProduction of grammar.P[Ai]) {
          let iProductionArray = iProduction.split(' ');

          if (iProductionArray[0] === Aj) {
            if (grammar.P[Aj]) {
              for (let jProduction of grammar.P[Aj]) {
                let newProduction = `${
                  jProduction === EPSILON ? '' : jProduction
                } ${iProduction.slice(Ai.length).trim()}`.trim();

                grammar.P[Ai].push(newProduction);
              }

              grammar.P[Ai] = R.without([iProduction], grammar.P[Ai]);
            }
          }
        }
      }
    }

    // Gotta recalculate recursions, cause the grammar might have changed
    recursions = getLeftRecursions(grammar);

    // Elimine as rec. esq. Diretas das Ai – produções
    if (recursions[Ai] && recursions[Ai][DIRECT]) {
      _removeDirectLeftRecursions(grammar, {
        [Ai]: {
          [DIRECT]: recursions[Ai][DIRECT],
        },
      });
    }
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

function _haveIndirectLeftRecursions(recursions) {
  return R.flatten(R.values(R.map(R.keys, recursions))).includes(INDIRECT);
}
