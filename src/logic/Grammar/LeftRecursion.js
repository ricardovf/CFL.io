import SymbolValidator, { EPSILON } from '../SymbolValidator';
import { first } from './First';
import * as R from 'ramda';
import { makeNewUniqueNonTerminalName } from '../helpers';
import { firstNT } from './FirstNT';

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
        // If the grammar became invalid, we update the grammar and return;
        if (!grammar.isOwn()) {
          let clonedOwn = grammar.clone();
          clonedOwn.toOwn();
          if (!clonedOwn.isValid()) {
            grammar.toOwn();
            break;
          }

          if (grammar.hasCycle()) {
            grammar.removeSimpleProductions();
            continue; //lets continue to refresh the list of recursions
          }
        }

        _removeDirectLeftRecursions(grammar, recursions);
      }
    } else {
      // No more recursions!
      break;
    }

    // temporary
    if (loops++ > 25) {
      throw new Error(
        'Could not remove left recursion after 25 iterations, something must be wrong! Maybe a bug?'
      );
    }
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
            `${production
              .slice(nT.length)
              .replace(EPSILON, '')} ${newNT}`.trim()
          );
          grammar.P[newNT].push(EPSILON);
        } else {
          // A -> β1A' | β2A' | ... | βmA’
          grammar.P[nT].push(
            `${production.replace(EPSILON, '')} ${newNT}`.trim()
          );
          created.push(`${production.replace(EPSILON, '')} ${newNT}`.trim());
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
    // It might have became invalid, so we just return
    if (!grammar.isValid()) return;

    if (!grammar.isOwn()) {
      throw new Error(
        'Grammar should be own (própria) to be able to remove indirect left recursion, but the step to make it own has failed to do so! The grammar is: \n ' +
          grammar.getFormattedText()
      );
    }

    // we return and wait to be called again with a new set of recursions
    return;
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

              grammar.P[Ai] = R.uniq(
                R.without([iProduction], grammar.P[Ai])
              ).sort();
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
 * Checks if B can derive A with A on the left
 * @param grammar
 * @param B
 * @param A
 * @param checked
 * @return {boolean}
 * @private
 */
function _canDeriveAsFirst(grammar, B, A, checked = []) {
  if (!grammar.isValid()) return false;

  return firstNT(grammar, B).includes(A);
}

function _haveIndirectLeftRecursions(recursions) {
  return R.flatten(R.values(R.map(R.keys, recursions))).includes(INDIRECT);
}
