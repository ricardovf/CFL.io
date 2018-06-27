import Grammar from '../Grammar';
import { ACCEPT_STATE, EPSILON } from '../SymbolValidator';

describe('Grammar', () => {
  describe('epsilon', () => {
    it('should detect epsilon free', () => {
      const grammar = Grammar.fromText(`S -> a S b | ab`);
      expect(grammar.isEpsilonFree()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should not detect epsilon free', () => {
      const grammar = Grammar.fromText(`S -> a S0 | a | &\nS0 -> b`);
      expect(grammar.isEpsilonFree()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should detect epsilon free with epsilon on initial symbol', () => {
      const grammar = Grammar.fromText(`S -> A | &\nA -> a A b | a b`);
      expect(grammar.isEpsilonFree()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should not detect epsilon free with epsilon on initial symbol', () => {
      const grammar = Grammar.fromText(`S -> A | &\nA -> a S b | a b`);
      expect(grammar.isEpsilonFree()).toBeFalsy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should not detect epsilon free with non terminal producing epsilon', () => {
      const grammar = Grammar.fromText(`S -> A \nA -> a S b | a b | &`);
      expect(grammar.isEpsilonFree()).toBeFalsy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should transform to epsilon free', () => {
      const grammar = Grammar.fromText(
        `S -> A a S | &\nA -> S A a | C d\nC -> S C a | A b | &`
      );
      grammar.toEpsilonFree();
      expect(grammar.isEpsilonFree()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should transform to epsilon free (list example 1)', () => {
      const grammar = Grammar.fromText(
        `S -> A b B | A D\nA -> a A | B\nB -> S B D | C D\nC -> c C | A S | & \nD -> d D | &`
      );
      grammar.toEpsilonFree();
      // expect(grammar.hasEpsilonTransitions()).toBeTruthy();
      expect(grammar.isEpsilonFree()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should transform to epsilon free (list example 2)', () => {
      const grammar = Grammar.fromText(
        `S -> & | A | a\nB -> S`
      );
      expect(grammar.hasEpsilonTransitions()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });
  });
});
