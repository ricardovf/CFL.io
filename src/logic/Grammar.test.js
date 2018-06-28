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

  describe('Tokenize', () => {
    it('should return the correct tokens on a simple grammar', () => {
      const grammar = Grammar.fromText(
        `S -> A B C
        A -> a A | &
        B -> b B | A C d
        C -> c C | &`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.tokenizeString('uwoqdwqopd')).toEqual([]);
      expect(grammar.tokenizeString('EEE')).toEqual([]);
      expect(grammar.tokenizeString('')).toEqual([]);
      expect(grammar.tokenizeString('abcd')).toEqual(['a', 'b', 'c', 'd']);
      expect(grammar.tokenizeString('Cd')).toEqual(['C', 'd']);
      expect(grammar.tokenizeString('C')).toEqual(['C']);
      expect(grammar.tokenizeString('CaB')).toEqual(['C', 'a', 'B']);
      expect(grammar.tokenizeString('aaB')).toEqual(['a', 'a', 'B']);
      expect(grammar.tokenizeString('BB')).toEqual(['B', 'B']);
    });
  });

  describe('own', () => {
    it('should make turn into invalid when making to own', () => {
      const grammar = Grammar.fromText(`S -> B`);
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.isOwn()).toBeFalsy();
      grammar.toOwn();
      expect(grammar.isValid()).toBeFalsy();
      expect(grammar.isOwn()).toBeFalsy();
    });
  });
});
