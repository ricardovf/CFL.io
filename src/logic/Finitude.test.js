import Grammar from './Grammar';
import { EMPTY, FINITE, INFINITE } from './Grammar';
import { ACCEPT_STATE, EPSILON } from './SymbolValidator';

describe('Grammar', () => {
  describe('finitude', () => {
    it('should return as empty language', () => {
      const grammar = Grammar.fromText(`S -> aS`);
      expect(grammar.getLanguageFinitude()).toBe(EMPTY);
    });

    it('should return a finite language', () => {
      const grammar = Grammar.fromText(`A -> B C E \nB -> b | d d | &\nC -> c\n E -> e B`);
      expect(grammar.getLanguageFinitude()).toBe(FINITE);
    });

    it('should return a inifnite language (list example)', () => {
      const grammar = Grammar.fromText(`A -> B C \nC -> + B C | &\nB -> D E\nE -> * D E | &\nD -> ( A ) | i`);
      expect(grammar.getLanguageFinitude()).toBe(INFINITE);
    });
  })
});
