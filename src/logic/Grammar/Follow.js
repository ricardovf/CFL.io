import { END, EPSILON } from '../SymbolValidator';
import * as R from 'ramda';
import { findMatchOfFromStartOfString } from '../helpers';
import { first } from './First';

/**
 * @param grammar
 * @param input
 * @return {*}
 */
export function follow(grammar, input) {
  if (!grammar.isValid()) return [];

  // If input is not in Vn
  if (!grammar.Vn.includes(input)) return [];

  let _follow = {};

  // 1 – Se A é o símbolo inicial da gramática -> $ ∈ Follow(A)
  if (grammar.S && grammar.Vn.includes(grammar.S)) {
    if (!_follow[grammar.S]) _follow[grammar.S] = [];
    _follow[grammar.S].push(END);
  }

  let loops = 0;
  do {
    let previousFollow = R.clone(_follow);

    for (let A of grammar.Vn) {
      if (grammar.P[A]) {
        for (let production of grammar.P[A]) {
          let y = production.split(' '); // a B C c
          for (let i = 0; i < y.length; i++) {
            let B = y[i];
            let Beta = i + 1 < y.length ? y.slice(i + 1).join('') : undefined;
            let BetaFirst = Beta ? first(grammar, Beta) : [];

            // We only run this on the first loop
            // 2 – Se A -> α B β ∈ P ∧ β ≠ ε -> adicione first(β) em Follow(B)
            if (loops === 0) {
              if (grammar.Vn.includes(B) && Beta) {
                _follow[B] = R.union(
                  _follow[B] || [],
                  R.without([EPSILON], BetaFirst)
                );
              }
            }

            // 3 – Se A -> αB (ou A->αBβ, onde ε ∈ First(β)) ∈ P -> adicione Follow(A) em Follow(B)
            if (
              grammar.Vn.includes(B) &&
              (Beta === undefined || BetaFirst.includes(EPSILON))
            ) {
              _follow[B] = R.union(_follow[B] || [], _follow[A] || []);
            }
          }
        }
      }
    }

    loops++;

    // If _follow did not change anymore, we break
    if (R.equals(previousFollow, _follow)) break;
  } while (true);

  return _follow[input] ? _follow[input].sort() : [];
}
