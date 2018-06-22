import Grammar from '../Grammar';
import { EPSILON } from '../SymbolValidator';

describe('Factor', () => {
  describe('Detect factors', () => {
    it('should return empty when in a invalid grammar', () => {
      const grammar = Grammar.fromText('S -> aSS | aSB');
      expect(grammar.isValid()).toBeFalsy();
      expect(grammar.isFactored()).toBeTruthy();
      expect(grammar.canBeFactored(10)).toBeTruthy();
    });

    it('should return the correct status of factorization on simple grammar 1', () => {
      const grammar = Grammar.fromText(
        `S -> a S | a B | d S
       B -> b B | b`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.isFactored()).toBeFalsy();
      expect(grammar.getFactors()).toEqual({
        S: {
          direct: {
            a: ['a B', 'a S'],
          },
        },
        B: {
          direct: {
            b: ['b', 'b B'],
          },
        },
      });
    });

    it('should return the correct status of indirect factorization on simple grammar 2', () => {
      const grammar = Grammar.fromText(
        `S -> A | a S
       A -> & | a A c`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.isFactored()).toBeFalsy();
      expect(grammar.getFactors()).toEqual({
        S: {
          indirect: {
            a: ['A', 'a S'],
          },
        },
      });

      // Expect that it can be factored in 1 step, because its direct
      // expect(grammar.canBeFactored(1)).toBeTruthy();
    });

    it('should return the correct status of indirect factorization on simple grammar 3', () => {
      const grammar = Grammar.fromText(
        `S -> A | a S | a A | b A | b S
       A -> & | a A c | B B
       B -> b B`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.isFactored()).toBeFalsy();
      expect(grammar.getFactors()).toEqual({
        S: { indirect: { a: ['A', 'a A', 'a S'], b: ['A', 'b A', 'b S'] } },
      });
    });

    it('should return the correct status of indirect factorization on simple grammar 3', () => {
      const grammar = Grammar.fromText(
        `S -> A B | B C
       A -> a A | &
       B -> b B | d
       C -> c C | c`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.isFactored()).toBeFalsy();
      expect(grammar.getFactors()).toEqual({
        C: { direct: { c: ['c', 'c C'] } },
        S: { indirect: { b: ['A B', 'B C'], d: ['A B', 'B C'] } },
      });
    });

    it('should return the correct status of direct factorization on if grammar', () => {
      const grammar = Grammar.fromText(
        `C -> com | if E then C | if E then C else C
       E -> exp`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.isFactored()).toBeFalsy();
      expect(grammar.getFactors()).toEqual({
        C: { direct: { 'if E then C': ['if E then C', 'if E then C else C'] } },
      });
    });

    it('should return the correct status of indirect factorization on simple grammar 4', () => {
      const grammar = Grammar.fromText(
        `S -> A B | B C
       A -> a A | &
       B -> b B | d
       C -> c C | c | ba B | ba a B`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.isFactored()).toBeFalsy();
      expect(grammar.getFactors()).toEqual({
        C: { direct: { c: ['c', 'c C'], ba: ['ba B', 'ba a B'] } },
        S: { indirect: { b: ['A B', 'B C'], d: ['A B', 'B C'] } },
      });
    });
  });

  describe('Remove factors', () => {
    it('should remove factors on simple grammar 1', () => {
      const grammar = Grammar.fromText(
        `S -> a S | a B | d S
       B -> b B | b`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.isFactored()).toBeFalsy();
      // Expect that it can be factored in 1 step, because its direct
      expect(grammar.canBeFactored(0)).toBeFalsy();
      expect(grammar.canBeFactored(1)).toBeTruthy();
    });

    it('should remove indirect factors factors on simple grammar 2', () => {
      const grammar = Grammar.fromText(
        `S -> A | a S
       A -> & | a A c`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.isFactored()).toBeFalsy();

      // Expect that it can be factored in 2 steps
      expect(grammar.canBeFactored(1)).toBeFalsy();
      expect(grammar.canBeFactored(2)).toBeTruthy();
    });

    it('should remove indirect factors factors on simple grammar 3', () => {
      const grammar = Grammar.fromText(
        `S -> A | a S | a A | b A | b S
       A -> & | a A c | B B
       B -> b B`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.isFactored()).toBeFalsy();

      // Expect that it can be factored in 2 steps
      expect(grammar.canBeFactored(1)).toBeFalsy();
      expect(grammar.canBeFactored(2)).toBeTruthy();
    });

    it('should remove indirect/direct factors on simple grammar 4', () => {
      const grammar = Grammar.fromText(
        `S -> A B | B C
       A -> a A | &
       B -> b B | d
       C -> c C | c`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.isFactored()).toBeFalsy();

      // Expect that it can be factored in 1 step, because its direct
      expect(grammar.canBeFactored(1)).toBeFalsy();
      expect(grammar.canBeFactored(2)).toBeFalsy();
      expect(grammar.canBeFactored(3)).toBeTruthy();
    });

    it('should remove direct factorization on if grammar', () => {
      const grammar = Grammar.fromText(
        `C -> com | if E then C | if E then C else C
       E -> exp`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.isFactored()).toBeFalsy();

      // Expect that it can be factored in 1 step, because its direct
      expect(grammar.canBeFactored(0)).toBeFalsy();
      expect(grammar.canBeFactored(1)).toBeTruthy();
      grammar.removeFactors(1);
      expect(grammar.isFactored()).toBeTruthy();
      expect(grammar.nonTerminals()).toEqual(['C', 'C0', 'E']);
      expect(grammar.rules()).toEqual({
        C: ['com', 'if E then C C0'],
        C0: [EPSILON, 'else C'],
        E: ['exp'],
      });
    });

    it('should remove the factors on simple grammar 4', () => {
      const grammar = Grammar.fromText(
        `S -> A B | B C
       A -> a A | &
       B -> b B | d
       C -> c C | c | ba B | ba a B`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.isFactored()).toBeFalsy();

      // Expect that it can be factored in 1 step, because its direct
      expect(grammar.canBeFactored(0)).toBeFalsy();
      expect(grammar.canBeFactored(1)).toBeFalsy();
      expect(grammar.canBeFactored(5)).toBeTruthy();
      grammar.removeFactors(5);
      expect(grammar.isFactored()).toBeTruthy();
    });
  });
});
