import Grammar from '../Grammar';

describe('First', () => {
  describe('Detection', () => {
    it('should return empty when in a invalid grammar', () => {
      const grammar = Grammar.fromText('S -> aSS | aSB');
      expect(grammar.isValid()).toBeFalsy();
      expect(grammar.getLeftRecursions()).toEqual({});
    });

    it('should return the correct direct left recursions on simple grammar 1', () => {
      const grammar = Grammar.fromText(
        `S -> A B C | S C
        A -> a A | &
        B -> b | b C
        C -> C a | C C b | C C c`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();

      const leftRecursions = grammar.getLeftRecursions();
      expect(leftRecursions).toEqual({
        S: {
          direct: ['S C'],
        },
        C: {
          direct: ['C a', 'C C b', 'C C c'].sort(),
        },
      });
    });

    it('should return the correct direct left recursions on simple grammar 2', () => {
      const grammar = Grammar.fromText(
        `E -> E + T | T
       T -> T * F | F
       F -> ( E ) | id`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();

      const leftRecursions = grammar.getLeftRecursions();
      expect(leftRecursions).toEqual({
        E: {
          direct: ['E + T'],
        },
        T: {
          direct: ['T * F'],
        },
      });
    });

    it('should return the correct indirect left recursions on simple grammar 3', () => {
      const grammar = Grammar.fromText(
        `S -> A a
       A -> S c | d
       B -> C d
       C -> D E
       D -> & | a
       E -> a | D B`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();

      const leftRecursions = grammar.getLeftRecursions();
      expect(leftRecursions).toEqual({
        S: {
          indirect: ['A a'],
        },
        A: {
          indirect: ['S c'],
        },
        B: {
          indirect: ['C d'],
        },
        C: {
          indirect: ['D E'],
        },
      });
    });

    it('should return the correct direct and indirect left recursions on simple grammar 4', () => {
      const grammar = Grammar.fromText(
        `S -> B | a S
       B -> C | a
       C -> B | C a | b`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();

      const leftRecursions = grammar.getLeftRecursions();
      expect(leftRecursions).toEqual({
        B: { indirect: ['C'] },
        C: { direct: ['C a'], indirect: ['B'] },
      });
    });
  });

  describe('Removal', () => {
    it('should NOT remove left recursions on a grammar that will generate indirect left recursion after the direct is taken and it turns invalid', () => {
      const grammar = Grammar.fromText(
        `S -> A B C | S C
        A -> a A | &
        B -> b | b C
        C -> C a | C C b | C C c`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();
      grammar.removeLeftRecursion();

      // This grammar will became empty/invalid when we try to remove left recursions, cause
      // we will make it own/própria
      expect(grammar.isValid()).toBeFalsy();
      expect(grammar.hasLeftRecursion()).toBeFalsy();
    });

    it('should remove direct left recursions on simple grammar 2', () => {
      const grammar = Grammar.fromText(
        `E -> E + T | T
       T -> T * F | F
       F -> ( E ) | id`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();
      grammar.removeLeftRecursion();
      expect(grammar.hasLeftRecursion()).toBeFalsy();
    });

    it('should remove indirect left recursions on simple grammar 3', () => {
      const grammar = Grammar.fromText(
        `S -> A a
       A -> S c | d
       B -> C d
       C -> D E
       D -> & | a
       E -> a | D B`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();
      grammar.removeLeftRecursion();
      expect(grammar.hasLeftRecursion()).toBeFalsy();
    });

    it('should remove direct and indirect left recursions on simple grammar 4', () => {
      const grammar = Grammar.fromText(
        `S -> B | a S
       B -> C | a
       C -> B | C a | b`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();
      grammar.removeLeftRecursion();
      expect(grammar.hasLeftRecursion()).toBeFalsy();
    });

    it('should remove indirect left recursions on simple grammar 5', () => {
      const grammar = Grammar.fromText(
        `S -> A a
         A -> S c | d`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();
      grammar.removeLeftRecursion();
      expect(grammar.hasLeftRecursion()).toBeFalsy();
    });
  });
});
