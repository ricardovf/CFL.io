import Grammar from '../Grammar';
import { ACCEPT_STATE, EPSILON } from '../SymbolValidator';

describe('Grammar', () => {
  describe('useless symbols', () => {
    it('should not detect unreachable symbols', () => {
      const grammar = Grammar.fromText(`S -> A | &\nA -> a S b | a b`);
      expect(grammar.hasUnreachableSymbols()).toBeFalsy();
    });

    it('should detect unreachable symbols', () => {
      const grammar = Grammar.fromText(
        `S -> A | &\nA -> a S b | a b\nB -> c B | c`
      );
      expect(grammar.hasUnreachableSymbols()).toBeTruthy();
    });

    it('should detect only fertile symbols', () => {
      const grammar = Grammar.fromText(
        `S -> A | &\nA -> a S b | a b\nB -> c B | c`
      );
      expect(grammar.hasInfertileSymbols()).toBeFalsy();
    });

    it('should detect infertile symbols', () => {
      const grammar = Grammar.fromText(
        `S -> A | &\nA -> a S b | a b\nB -> c B | c\nC -> c C`
      );
      expect(grammar.hasInfertileSymbols()).toBeTruthy();
    });

    it('should remove infertile symbols', () => {
      const grammar = Grammar.fromText(
        `S -> A | &\nA -> a S b C | a b\nC -> c C`
      );
      grammar.removeInfertileSymbols();
      expect(grammar.hasInfertileSymbols()).toBeFalsy();
    });

    it('should not remove infertile symbols', () => {
      const grammar = Grammar.fromText(
        `S -> A | &\nA -> a S b C | a b\nC -> c C | c`
      );
      grammar.removeInfertileSymbols();
      expect(grammar.hasInfertileSymbols()).toBeFalsy();
    });

    it('should remove infertile symbols (list example)', () => {
      const grammar = Grammar.fromText(
        `S -> A a S| &\nA -> S A a | B b | C d\nB -> C B c | S A B a\nC -> B c | S C a | A b | &`
      );
      grammar.removeInfertileSymbols();
      expect(grammar.hasInfertileSymbols()).toBeFalsy();
    });

    it('should remove unreachable symbols', () => {
      const grammar = Grammar.fromText(
        `S -> A | &\nA -> a S b | a b\nC -> c C | c`
      );
      grammar.removeUnreachableSymbols();
      expect(grammar.hasUnreachableSymbols()).toBeFalsy();
    });

    it('should not remove unreachable symbols', () => {
      const grammar = Grammar.fromText(
        `S -> A | &\nA -> a S b C | a b\nC -> c C | c`
      );
      grammar.removeUnreachableSymbols();
      expect(grammar.hasUnreachableSymbols()).toBeFalsy();
    });

    it('should remove useless symbols', () => {
      const grammar = Grammar.fromText(
        `S -> A a S | &\nA -> S A a | B b | C d\nB -> C B c | S A B a\nC -> B c | S C a | A b | &`
      );
      grammar.removeUselessSymbols();
      expect(grammar.hasInfertileSymbols()).toBeFalsy();
      expect(grammar.hasUnreachableSymbols()).toBeFalsy();
    });
  });
});
