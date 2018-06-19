import Grammar from './Grammar';
import { ACCEPT_STATE, EPSILON } from './SymbolValidator';

describe('Grammar', () => {
  describe('epsilon', () => {
    it('should detect epsilon free', () => {
      const grammar = Grammar.fromText(`S -> a S b | ab`);
      expect(grammar.isEpsilonFree()).toBeTruthy();
    });

    it('should detect epsilon free with epsilon on initial symbol', () => {
      const grammar = Grammar.fromText(`S -> A | &\nA -> a A b | a b`);
      expect(grammar.isEpsilonFree()).toBeTruthy();
    });

    it('should not detect epsilon free with epsilon on initial symbol', () => {
      const grammar = Grammar.fromText(`S -> A | &\nA -> a S b | a b`);
      expect(grammar.isEpsilonFree()).toBeFalsy();
    });

    it('should not detect epsilon free with non terminal producing epsilon', () => {
      const grammar = Grammar.fromText(`S -> A \nA -> a S b | a b | &`);
      expect(grammar.isEpsilonFree()).toBeFalsy();
    });
  });
});
