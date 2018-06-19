import { EPSILON } from '../SymbolValidator';
import * as R from 'ramda';
import { findMatchOfFromStartOfString } from '../helpers';
import SymbolValidator from '../SymbolValidator';
import { first } from './First';

/**
 * @param grammar
 * @param input
 * @param _calculatedFirsts
 * @return {*}
 */
export function firstNT(grammar, input, _calculatedFirsts = {}) {
  if (!grammar.isValid()) return [];

  // If input is not non terminal, we return empty firstNT
  if (!grammar.Vn.includes(input)) return [];

  const nonTerminal = input;

  if (nonTerminal) {
    if (!_calculatedFirsts[nonTerminal]) _calculatedFirsts[nonTerminal] = [];
    else return _calculatedFirsts[nonTerminal];

    if (grammar.P[nonTerminal]) {
      const productions = grammar.P[nonTerminal];
      for (let production of productions) {
        let y = production.split(' ');
        for (let i = 0; i < y.length; i++) {
          let yk = y[i];
          let ykFirst = first(grammar, yk, _calculatedFirsts);

          if (grammar.Vn.includes(yk)) _calculatedFirsts[nonTerminal].push(yk);

          if (!ykFirst.includes(EPSILON)) break;

          let ykFirstNT = firstNT(grammar, yk, _calculatedFirsts);

          _calculatedFirsts[nonTerminal] = R.union(
            _calculatedFirsts[nonTerminal],
            R.filter(SymbolValidator.isValidNonTerminal, ykFirstNT)
          );
        }
      }
    }

    return _calculatedFirsts[nonTerminal].sort();
  }

  return [];
}
