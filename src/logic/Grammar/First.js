import { EPSILON } from '../SymbolValidator';
import * as R from 'ramda';
import { findMatchOfFromStartOfString } from '../helpers';

/**
 * @todo deal with recursion
 * @param grammar
 * @param input
 * @param _calculatedFirsts
 * @return {*}
 */
export function first(grammar, input, _calculatedFirsts = {}) {
  if (!grammar.isValid()) return [];

  // Se α = a β ∴ first (α) = {a}
  if (grammar.Vt.includes(input)) return [input];

  // Se α = ε ∴ first (α) = ε
  if (input === EPSILON) return [EPSILON];

  // Se α = B β ∴ first (α) = ???

  // If first part of input is terminal
  const maybeTerminal = findMatchOfFromStartOfString(input, grammar.Vt);
  if (maybeTerminal) return [maybeTerminal];

  // If first part of input is non terminal
  const maybeNonTerminal = findMatchOfFromStartOfString(input, grammar.Vn);

  /**
   * X  y1 y2 ... yk ∈ P
   * First (y1) ∈ First (X)
   * Se ε ∈ First (y1) ⇒ First (y2) também ∈ first(X)
   * Se ε ∈ First (y2) ⇒ ...
   * Se ε ∈ First (yk) ⇒ ε também ∈ First(X)!!!
   */
  if (maybeNonTerminal) {
    if (!_calculatedFirsts[maybeNonTerminal])
      _calculatedFirsts[maybeNonTerminal] = [];
    else return _calculatedFirsts[maybeNonTerminal];

    if (grammar.P[maybeNonTerminal]) {
      const productions = grammar.P[maybeNonTerminal];
      for (let production of productions) {
        let y = production.split(' ');
        for (let i = 0; i < y.length; i++) {
          let yk = y[i];
          let ykFirst = first(grammar, yk, _calculatedFirsts);

          _calculatedFirsts[maybeNonTerminal] = R.union(
            _calculatedFirsts[maybeNonTerminal],
            R.without([EPSILON], ykFirst)
          );

          if (!ykFirst.includes(EPSILON)) {
            break;
          }

          // If its the last symbol of the production and we have epsilon in first
          if (i === y.length - 1) {
            _calculatedFirsts[maybeNonTerminal].push(EPSILON);
          }
        }
      }
    }

    return _calculatedFirsts[maybeNonTerminal].sort();
  }

  return [];
}
