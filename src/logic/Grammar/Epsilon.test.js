import Grammar from '../Grammar';
import { ACCEPT_STATE, EPSILON } from '../SymbolValidator';
import { toEpsilonFreeWithSteps } from './Operations';

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
      expect(grammar.isEpsilonFree()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should transform to epsilon free (list example 2)', () => {
      const grammar = Grammar.fromText(
        `S -> & | A | a
         B -> S`
      );
      expect(grammar.isEpsilonFree()).toBeFalsy();
      grammar.toEpsilonFree();
      expect(grammar.isEpsilonFree()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should transform to epsilon a crazy example', () => {
      const grammar = Grammar.fromText(
        `S -> B
         B -> B1
         B1 -> & | S`
      );
      expect(grammar.isEpsilonFree()).toBeFalsy();
      grammar.toEpsilonFree();
      expect(grammar.isEpsilonFree()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
      const rules = grammar.rules();
      expect(grammar.S).toEqual('S0');
      expect(grammar.Vn).toEqual(['B', 'B1', 'S', 'S0']);
      expect(grammar.Vt).toEqual(['&']);
      expect(rules).toEqual({
        B: ['B1'],
        B1: ['S'],
        S: ['B'],
        S0: ['&', 'S'],
      });
      grammar.toOwn();
    });

    it('should transform to epsilon a crazy example using steps', () => {
      let grammar = Grammar.fromText(
        `S -> B
         B -> B1
         B1 -> & | S`
      );

      let steps = toEpsilonFreeWithSteps(grammar);

      grammar = steps[steps.length - 1];

      expect(grammar.isEpsilonFree()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
      const rules = grammar.rules();
      expect(grammar.S).toEqual('S0');
      expect(grammar.Vn).toEqual(['B', 'B1', 'S', 'S0']);
      expect(grammar.Vt).toEqual(['&']);
      expect(rules).toEqual({
        B: ['B1'],
        B1: ['S'],
        S: ['B'],
        S0: ['&', 'S'],
      });
    });

    it('should transform to epsilon a crazy example (with simple names)', () => {
      const grammar = Grammar.fromText(
        `S -> B
         B -> C
         C -> & | S`
      );
      expect(grammar.isEpsilonFree()).toBeFalsy();
      grammar.toEpsilonFree();
      expect(grammar.isEpsilonFree()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
      const rules = grammar.rules();
      expect(grammar.S).toEqual('S0');
      expect(grammar.Vn).toEqual(['B', 'C', 'S', 'S0']);
      expect(grammar.Vt).toEqual(['&']);
      expect(rules).toEqual({
        S: ['B'],
        B: ['C'],
        C: ['S'],
        S0: ['&', 'S'],
      });
    });

    it('should transform to epsilon a crazy example 2', () => {
      const grammar = Grammar.fromText(
        `S -> A B C
         A -> & | a
         B -> & | b
         C -> c`
      );
      expect(grammar.isEpsilonFree()).toBeFalsy();
      grammar.toEpsilonFree();
      expect(grammar.isEpsilonFree()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
      const rules = grammar.rules();
      expect(grammar.S).toEqual('S');
      expect(grammar.Vn).toEqual(['A', 'B', 'C', 'S']);
      expect(grammar.Vt).toEqual(['&', 'a', 'b', 'c']);
      expect(rules).toEqual({
        S: ['A B C', 'A C', 'B C', 'C'],
        A: ['a'],
        B: ['b'],
        C: ['c'],
      });
    });

    it('should transform to epsilon a crazy example 3', () => {
      const grammar = Grammar.fromText(
        `S -> B | a
         B -> & | S | b`
      );
      expect(grammar.isEpsilonFree()).toBeFalsy();
      grammar.toEpsilonFree();
      expect(grammar.isEpsilonFree()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
      const rules = grammar.rules();
      expect(grammar.S).toEqual('S0');
      expect(grammar.Vn).toEqual(['B', 'S', 'S0']);
      expect(grammar.Vt).toEqual(['&', 'a', 'b']);
      expect(rules).toEqual({
        S0: ['&', 'S'],
        S: ['B', 'a'],
        B: ['S', 'b'],
      });
    });

    it('should transform to epsilon a crazy example 3 using steps', () => {
      let grammar = Grammar.fromText(
        `S -> B | a
         B -> & | S | b`
      );

      let steps = toEpsilonFreeWithSteps(grammar);

      grammar = steps[steps.length - 1];

      expect(grammar.isEpsilonFree()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
      const rules = grammar.rules();
      expect(grammar.S).toEqual('S0');
      expect(grammar.Vn).toEqual(['B', 'S', 'S0']);
      expect(grammar.Vt).toEqual(['&', 'a', 'b']);
      expect(rules).toEqual({
        S0: ['&', 'S'],
        S: ['B', 'a'],
        B: ['S', 'b'],
      });
    });
  });
});
