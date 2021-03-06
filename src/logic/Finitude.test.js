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
      const grammar = Grammar.fromText(
        `A -> B C E \nB -> b | d d | &\nC -> c\n E -> e B`
      );
      expect(grammar.getLanguageFinitude()).toBe(FINITE);
    });

    it('should return a inifnite language', () => {
      const grammar = Grammar.fromText(`S -> B | a S\nB ->a`);
      expect(grammar.getLanguageFinitude()).toBe(INFINITE);
    });

    it('should return a inifnite language (list example 1)', () => {
      const grammar = Grammar.fromText(
        `A -> B C \nC -> + B C | &\nB -> D E\nE -> * D E | &\nD -> ( A ) | i`
      );
      expect(grammar.getLanguageFinitude()).toBe(INFINITE);
    });

    it('should return a inifnite language (list example 2)', () => {
      const grammar = Grammar.fromText(
        `S -> a S | B D\nB -> b B | &\nD -> d D d | c`
      );
      expect(grammar.getLanguageFinitude()).toBe(INFINITE);
    });

    it('should return a empty language (list example 3)', () => {
      const grammar = Grammar.fromText(
        `S -> a S | B D\nB -> b B | &\nD -> d D d | cE\n E -> B D E`
      );
      expect(grammar.getLanguageFinitude()).toBe(EMPTY);
    });

    it('should return a finite language (list example 4)', () => {
      const grammar = Grammar.fromText(
        `S -> a S | B D\nB -> b E | &\nD -> d E d | cE\n E -> e e`
      );
      expect(grammar.getLanguageFinitude()).toBe(EMPTY);
    });

    it('should return a finite language (list example 5)', () => {
      const grammar = Grammar.fromText(
        `S -> a B | &\nB -> B D | b\nD -> a D d `
      );
      expect(grammar.getLanguageFinitude()).toBe(FINITE);
    });

    it('should return a empty language for invalid grammar', () => {
      const grammar = Grammar.fromText(`S -> A | B c\nB -> B B`);
      expect(grammar.getLanguageFinitude()).toBe(EMPTY);
    });

    it('should return a cycle in grammar', () => {
      const grammar = Grammar.fromText(`
          P -> d P | M L
          M -> m ; M | &
          L -> C ; L | &
          C -> id ( E ) | id = E | b P e | C
          E -> E + id | id`);
      expect(grammar.hasCycle()).toBeTruthy();
    });

    it('should not return a cycle in grammar', () => {
      const grammar = Grammar.fromText(`
        P -> begin D C end
        D -> & | int I
        I -> & | , id I
        C -> C ; T = E | T = E | com
        E -> E + T | T
        T -> id | id [ E ]`);
      expect(grammar.hasCycle()).toBeFalsy();
    });
  });
});
