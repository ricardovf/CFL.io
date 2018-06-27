import Grammar from '../Grammar';
import { EPSILON } from '../SymbolValidator';

describe('Left Recursion', () => {
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
        A: { indirect: ['S c'] },
        B: { indirect: ['C d'] },
        C: { indirect: ['D E'] },
        E: { indirect: ['D B'] },
        S: { indirect: ['A a'] },
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

    it('should remove left recursions on grammar 8a', () => {
      const grammar = Grammar.fromText(
        `P -> B | P ; B
         B -> K V C
         K -> & | c K
         V -> & | v V
         C -> & | C com | b C e | b K V ; C e`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();
      grammar.removeLeftRecursion();
      expect(grammar.hasLeftRecursion()).toBeFalsy();

      const rules = grammar.rules();

      expect(grammar.nonTerminals()).toEqual(
        ['P', 'B', 'K', 'V', 'C', 'P0', 'C0'].sort()
      );
      expect(grammar.initialSymbol()).toEqual('P');

      expect(rules.P).toEqual(['B P0']);
      expect(rules.P0).toEqual(['; B P0', '&'].sort());
      expect(rules.C).toEqual(['b K V ; C e C0', 'b C e C0', 'C0'].sort());
      expect(rules.C0).toEqual(['com C0', '&'].sort());
    });

    it('should remove left recursions on grammar 8b', () => {
      const grammar = Grammar.fromText(
        `P -> begin D C end
        D -> & | int I
        I -> & | , id I
        C -> C ; T = E | T = E | com
        E -> E + T | T
        T -> id | id [ E ]`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();

      const leftRecursions = grammar.getLeftRecursions();
      expect(leftRecursions).toEqual({
        C: { direct: ['C ; T = E'] },
        E: { direct: ['E + T'] },
      });

      grammar.removeLeftRecursion();
      expect(grammar.hasLeftRecursion()).toBeFalsy();

      const rules = grammar.rules();

      expect(grammar.nonTerminals()).toEqual(
        ['P', 'D', 'I', 'C', 'E', 'C0', 'E0', 'T'].sort()
      );
      expect(grammar.initialSymbol()).toEqual('P');

      expect(rules.P).toEqual(['begin D C end']);
      expect(rules.D).toEqual(['&', 'int I']);
      expect(rules.I).toEqual(['&', ', id I']);
      expect(rules.C).toEqual(['T = E C0', 'com C0']);
      expect(rules.C0).toEqual(['&', '; T = E C0']);
      expect(rules.E).toEqual(['T E0']);
      expect(rules.E0).toEqual(['&', '+ T E0']);
      expect(rules.T).toEqual(['id', 'id [ E ]']);
    });

    it('should remove left indirect epsilon recursions on grammar 1', () => {
      const grammar = Grammar.fromText(
        ` S -> & | B S
          B -> C | C D | D
          C -> S
          D -> a`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();

      // const c = grammar.clone();

      const leftRecursions = grammar.getLeftRecursions();
      expect(leftRecursions).toEqual({
        B: { indirect: ['C', 'C D'] },
        C: { indirect: ['S'] },
        S: { indirect: ['B S'] },
      });

      grammar.removeLeftRecursion();
      expect(grammar.hasLeftRecursion()).toBeFalsy();

      // const rules = grammar.rules();
      //
      // expect(grammar.nonTerminals()).toEqual(['S', 'B', 'C', 'D'].sort());
      // expect(grammar.initialSymbol()).toEqual('S');

      // expect(rules.S).toEqual(['begin D C end']);
      // expect(rules.B).toEqual(['&', 'int I']);
      // expect(rules.C).toEqual(['&', ', id I']);
      // expect(rules.D).toEqual(['T = E C0', 'com C0']);
    });

    it('should remove left indirect epsilon recursions on grammar 2 and turn into S -> &', () => {
      const grammar = Grammar.fromText(
        ` S -> B
          B -> C
          C -> & | S`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();

      const leftRecursions = grammar.getLeftRecursions();
      expect(leftRecursions).toEqual({
        B: { indirect: ['C'] },
        C: { indirect: ['S'] },
        S: { indirect: ['B'] },
      });

      grammar.removeLeftRecursion();
      expect(grammar.hasLeftRecursion()).toBeFalsy();
      expect(grammar.rules()).toEqual({ S: [EPSILON] });
    });

    it('should remove left indirect epsilon recursions on grammar 3', () => {
      const grammar = Grammar.fromText(
        ` S -> B
          B -> C
          C -> & | S | a`
      );
      expect(grammar.isValid()).toBeTruthy();
      expect(grammar.hasLeftRecursion()).toBeTruthy();

      const leftRecursions = grammar.getLeftRecursions();
      expect(leftRecursions).toEqual({
        B: { indirect: ['C'] },
        C: { indirect: ['S'] },
        S: { indirect: ['B'] },
      });

      grammar.removeLeftRecursion();
      expect(grammar.hasLeftRecursion()).toBeFalsy();

      const rules = grammar.rules();

      expect(grammar.nonTerminals()).toEqual(['S'].sort());
      expect(grammar.initialSymbol()).toEqual('S');
      expect(grammar.rules()).toEqual({ S: ['a', EPSILON] });
    });
  });
});
