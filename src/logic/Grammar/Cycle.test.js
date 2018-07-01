import Grammar from '../Grammar';
import { ACCEPT_STATE, EPSILON } from '../SymbolValidator';
import {
  eliminateInfertileSymbolsWithSteps,
  eliminateSimpleProductionsWithSteps,
} from './Operations';
import { removeSimpleProductions } from './SimpleProductions';
import { firstNT } from './FirstNT';

describe('Cycle', () => {
  describe('detect cycles', () => {
    it('should detect cycles 1', () => {
      const grammar = Grammar.fromText(`S -> a | S`);
      expect(grammar.hasCycle()).toBeTruthy();
    });

    it('should detect cycles 2', () => {
      const grammar = Grammar.fromText(`S -> S`);
      expect(grammar.hasCycle()).toBeTruthy();
    });

    it('should detect cycles 3', () => {
      const grammar = Grammar.fromText(
        `S -> a | B
        B -> S`
      );
      expect(grammar.hasCycle()).toBeTruthy();
    });

    it('should detect cycles 4 with epsilon', () => {
      const grammar = Grammar.fromText(
        `S -> a | B C
        B -> S
        C -> &`
      );
      expect(grammar.hasCycle()).toBeTruthy();
    });

    it('should NOT detect cycles 6 with epsilon', () => {
      const grammar = Grammar.fromText(
        `S -> a | B C D
        B -> S
        C -> &
        D -> a`
      );
      expect(grammar.hasCycle()).toBeFalsy();
    });

    it('should detect cycles 5', () => {
      const grammar = Grammar.fromText(
        `P -> d P | M L
          M -> m ; M | &
          L -> C ; L | &
          C -> id ( E ) | id = E | b P e | C
          E -> E + id | id`
      );
      expect(grammar.hasCycle()).toBeTruthy();
    });

    it('should not detect cycles KVC', () => {
      const grammar = Grammar.fromText(
        `P -> B | P ; B
          B -> K V C
          K -> & | c K
          V -> & | v V
          C -> & | C com | b C e | b K V ; C e`
      );
      expect(grammar.hasCycle()).toBeFalsy();
    });

    it('should not detect cycles begin', () => {
      const grammar = Grammar.fromText(
        `P -> begin D C end
        D -> & | int I
        I -> & | , id I
        C -> C ; T = E | T = E | com
        E -> E + T | T
        T -> id | id [ E ]`
      );
      expect(grammar.hasCycle()).toBeFalsy();
    });
  });
});
