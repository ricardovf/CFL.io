import Grammar from './Grammar';
import { ACCEPT_STATE, EPSILON } from './SymbolValidator';

describe('Grammar', () => {
  describe('simple productions', () => {
    it('should not detect simple productions', () => {
      const grammar = Grammar.fromText(`S -> a S b | a b`);
      expect(grammar.hasSimpleProductions()).toBeFalsy();
    });

    it('should detect simple productions', () => {
      const grammar = Grammar.fromText(`S -> A | &\nA -> a S b | a b`);
      expect(grammar.hasSimpleProductions()).toBeTruthy();
    });

    it('should remove simple productions', () => {
      const grammar = Grammar.fromText(
        `S -> a S | A\nA -> b A | b\nB -> c B c | c c | S | C\nC -> d C | d`
      );
      grammar.removeSimpleProductions();
      expect(grammar.hasSimpleProductions()).toBeFalsy();
    });

    it('should remove simple productions (list example)', () => {
      const grammar = Grammar.fromText(
        `S -> Z | &\nZ -> A b B | A D | A b | b B | b | A | D\nA -> a A | B | a \nB -> Z B D | C D | Z B | C | D | Z D | Z | B D | B\nC -> c C | A Z | c | A | Z\nD -> d D | d`
      );
      grammar.removeSimpleProductions();
      expect(grammar.hasSimpleProductions()).toBeFalsy();
    });
  });
});
