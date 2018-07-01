import Grammar from '../Grammar';
import { ACCEPT_STATE, EPSILON } from '../SymbolValidator';
import {
  eliminateInfertileSymbolsWithSteps,
  eliminateSimpleProductionsWithSteps,
} from './Operations';
import { removeSimpleProductions } from './SimpleProductions';

describe('Grammar', () => {
  describe('simple productions', () => {
    it('should not detect simple productions', () => {
      const grammar = Grammar.fromText(`S -> a S b | a b`);
      expect(grammar.hasSimpleProductions()).toBeFalsy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should detect simple productions', () => {
      const grammar = Grammar.fromText(`S -> A | &\nA -> a S b | a b`);
      expect(grammar.hasSimpleProductions()).toBeTruthy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should remove simple productions', () => {
      const grammar = Grammar.fromText(
        `S -> a S | A\nA -> b A | b\nB -> c B c | c c | S | C\nC -> d C | d`
      );
      grammar.removeSimpleProductions();
      expect(grammar.hasSimpleProductions()).toBeFalsy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should remove simple productions (list example 1)', () => {
      const grammar = Grammar.fromText(
        `S -> Z | &\nZ -> A b B | A D | A b | b B | b | A | D\nA -> a A | B | a \nB -> Z B D | C D | Z B | C | D | Z D | Z | B D | B\nC -> c C | A Z | c | A | Z\nD -> d D | d`
      );
      grammar.removeSimpleProductions();
      expect(grammar.hasSimpleProductions()).toBeFalsy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should remove simple productions (list example 2)', () => {
      const grammar = Grammar.fromText(`S -> L = R | R\nL -> * R | id\nR ->L`);
      grammar.removeSimpleProductions();
      expect(grammar.hasSimpleProductions()).toBeFalsy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should remove simple productions (list example 2)', () => {
      const grammar = Grammar.fromText(
        `S ->F G H\nF -> G | a\nG -> d G | H | b\nH -> c`
      );
      grammar.removeSimpleProductions();
      expect(grammar.hasSimpleProductions()).toBeFalsy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should eliminate useless without duplication (ricardo example 2) using steps', () => {
      // const grammar = Grammar.fromText(`S -> B | a | a S`);
      // expect(grammar.hasSimpleProductions()).toBeTruthy();
      // const steps = eliminateSimpleProductionsWithSteps(grammar);
      // expect(grammar.hasSimpleProductions()).toBeFalsy();
      // expect(grammar.areProductionsUnique()).toBeTruthy();
    });

    it('should remove simple productions recursive 1', () => {
      const grammar = Grammar.fromText(`S -> a | S`);
      expect(grammar.hasSimpleProductions()).toBeTruthy();
      grammar.removeSimpleProductions();
      expect(grammar.hasSimpleProductions()).toBeFalsy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
      expect(grammar.rules()).toEqual({
        S: ['a'],
      });
    });

    it('should remove simple productions recursive 2', () => {
      const grammar = Grammar.fromText(`S -> S`);
      expect(grammar.hasSimpleProductions()).toBeTruthy();
      grammar.removeSimpleProductions();
      expect(grammar.hasSimpleProductions()).toBeFalsy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
      expect(grammar.rules()).toEqual({});
      expect(grammar.isValid()).toBeFalsy();
    });

    it('should remove simple productions recursive 3', () => {
      const grammar = Grammar.fromText(
        `S -> a | B
        B -> S`
      );
      expect(grammar.hasSimpleProductions()).toBeTruthy();
      grammar.removeSimpleProductions();
      expect(grammar.hasSimpleProductions()).toBeFalsy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
      expect(grammar.rules()).toEqual({
        S: ['a'],
        B: ['a'],
      });
    });

    it('should remove simple productions recursive 4', () => {
      const grammar = Grammar.fromText(
        `S -> a | BC
        B -> S
        C -> &`
      );
      expect(grammar.hasSimpleProductions()).toBeTruthy();
      grammar.removeSimpleProductions();
      expect(grammar.hasSimpleProductions()).toBeFalsy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
      expect(grammar.rules()).toEqual({
        S: ['a'],
      });
    });

    it('should remove simple productions recursive 5', () => {
      const grammar = Grammar.fromText(
        `P -> d P | M L
          M -> m ; M | &
          L -> C ; L | &
          C -> id ( E ) | id = E | b P e | C
          E -> E + id | id`
      );
      expect(grammar.hasSimpleProductions()).toBeTruthy();
      grammar.removeSimpleProductions();
      expect(grammar.hasSimpleProductions()).toBeFalsy();
      expect(grammar.areProductionsUnique()).toBeTruthy();
      expect(grammar.rules()).toEqual({
        P: ['M L', 'd P'],
        M: ['&', 'm ; M'],
        L: ['&', 'C ; L'],
        C: ['b P e', 'id ( E )', 'id = E'],
        E: ['E + id', 'id'],
      });
    });
  });
});
