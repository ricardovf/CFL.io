import Grammar from './Grammar';
import { ACCEPT_STATE, EPSILON } from './SymbolValidator';

describe('Grammar', () => {
  describe('fromText', () => {
    it('should return invalid Grammar when empty text', () => {
      expect(Grammar.fromText('  ').isValid()).toBeFalsy();
      expect(Grammar.fromText('      ').isValid()).toBeFalsy();
      expect(Grammar.fromText('        ').isValid()).toBeFalsy();
      expect(Grammar.fromText('     \n   ').isValid()).toBeFalsy();
      expect(Grammar.fromText('  \r   \n   ').isValid()).toBeFalsy();
    });

    it('should return an invalid grammar on bad formed input', () => {
      // expect(Grammar.fromText(`Sa -> a | aS`).isValid()).toBeFalsy();
      // expect(Grammar.fromText(`S - a`).isValid()).toBeFalsy();
      // expect(Grammar.fromText(`S -> S`).isValid()).toBeFalsy();
      // expect(Grammar.fromText(`S a`).isValid()).toBeFalsy();
      expect(Grammar.fromText(`S -> aSS`).isValid()).toBeFalsy();
      // expect(
      //   Grammar.fromText(
      //     `S -> aB
      //     B -> S`
      //   ).isValid()
      // ).toBeFalsy();
      // expect(
      //   Grammar.fromText(
      //     `S -> a    |bS | aB
      //     ç
      //     B -> b | S`
      //   ).isValid()
      // ).toBeFalsy();
    });

    it('should return an valid grammar when missing non terminals productions', () => {
      expect(Grammar.fromText(`S -> aSB`).isValid()).toBeFalsy();
      expect(
        Grammar.fromText(
          `S -> a | a B
          B->a C|a S`
        ).isValid()
      ).toBeTruthy();
    });

    it('should return an invalid grammar S and epsilon exits on right side', () => {
      expect(Grammar.fromText(`S -> a | aS | &`).isValid()).toBeFalsy();
    });

    it('should return an valid grammar when there is terminal and non terminal recursive', () => {
      expect(Grammar.fromText(`S -> a S`).isValid()).toBeTruthy();
    });

    it('should return an invalid grammar when there is terminal and non terminal recursive and epsilon', () => {
      expect(Grammar.fromText(`S -> a | aS | &`).isValid()).toBeFalsy();
    });

    it('should return an valid grammar when there is terminal epsilon', () => {
      expect(Grammar.fromText(`S -> a | &`).isValid()).toBeTruthy();
    });

    it('should return valid grammar on simple regular grammar without epsilon', () => {
      // expect(Grammar.fromText(`S -> a | aS`).isValid()).toBeTruthy();
      // expect(Grammar.fromText(`S -> a`).isValid()).toBeTruthy();
      expect(
        Grammar.fromText(
          `S -> a    |b S | a B

          B -> b | a S`
        ).isValid()
      ).toBeTruthy();
    });

    it('should return valid grammar on simple regular grammar with epsilon', () => {
      expect(Grammar.fromText(`S -> a | ${EPSILON} `).isValid()).toBeTruthy();
      expect(Grammar.fromText(`S -> ${EPSILON}`).isValid()).toBeTruthy();
      expect(
        Grammar.fromText(`S -> ${EPSILON} |A | a | a S`).isValid()
      ).toBeTruthy();
      expect(
        Grammar.fromText(
          `S -> a | b B | ${EPSILON}
          B -> b | c`
        ).isValid()
      ).toBeTruthy();
    });

    it('should return an valid grammar on simple regular grammar with epsilon on the correct form', () => {
      expect(
        Grammar.fromText(`S -> ${EPSILON}${EPSILON}`).isValid()
      ).toBeTruthy();
      expect(
        Grammar.fromText(
          `S -> a | b B | ${EPSILON}
          B -> b | c S`
        ).isValid()
      ).toBeTruthy();
      expect(
        Grammar.fromText(
          `S -> a | b B
          B -> b | c | ${EPSILON}`
        ).isValid()
      ).toBeTruthy();
    });

    describe('validation', () => {
      it('should return valid grammar on a`s pair language', () => {
        const grammar = Grammar.fromText(`S -> a B\nB -> a S | a`);

        expect(grammar.isValid()).toBeTruthy();
      });

      it('should return valid grammar on a`s pair language with epsilon', () => {
        const grammar = Grammar.fromText(`M -> a B|&\nS -> a B\nB -> a S | a`);

        expect(grammar.isValid()).toBeTruthy();
      });
    });
  });
  describe('properties', () => {
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

    it('should not detect simple productions', () => {
      const grammar = Grammar.fromText(`S -> a S b | a b`);
      expect(grammar.hasSimpleProductions()).toBeFalsy();
    });

    it('should detect simple productions', () => {
      const grammar = Grammar.fromText(`S -> A | &\nA -> a S b | a b`);
      expect(grammar.hasSimpleProductions()).toBeTruthy();
    });

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

    it('should detect not fertile symbols', () => {
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

    it('should not remove useless symbols', () => {
      const grammar = Grammar.fromText(
        `S -> A a S | &\nA -> S A a | B b | C d\nB -> C B c | S A B a\nC -> B c | S C a | A b | &`
      );
      grammar.removeUselessSymbols();
      expect(grammar.hasInfertileSymbols()).toBeFalsy();
      expect(grammar.hasUnreachableSymbols()).toBeFalsy();
    });
  });
});
