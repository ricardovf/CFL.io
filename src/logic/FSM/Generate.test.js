import Grammar from '../Grammar';
import { EPSILON } from '../SymbolValidator';
import * as R from 'ramda';
import FSM from '../FSM';

describe('FSM', () => {
  describe('generate', () => {
    it('should accept only integers bigger then 0 and less or equal 100 as max size', async () => {
      const fsm = Grammar.fromText(`S -> aS | a`).getFSM();

      expect(fsm).toBeDefined();
      expect(() => fsm.generate(null)).toThrow();
      expect(() => fsm.generate(undefined)).toThrow();
      expect(() => fsm.generate(-1)).toThrow();
      expect(() => fsm.generate(-100)).toThrow();
      expect(() => fsm.generate('10')).toThrow();
      expect(() => fsm.generate(0)).toThrow();
      expect(() => fsm.generate(101)).toThrow();
      expect(() => fsm.generate(1011)).toThrow();
    });

    it('should generate an empty language when the grammar has no final state', async () => {
      const fsm = Grammar.fromText(`S -> aB\nB -> aS`).getFSM();

      expect(fsm).toBeDefined();
      expect(fsm.generate(1).length).toEqual(0);
      expect(fsm.generate(10).length).toEqual(0);
      expect(fsm.generate(50).length).toEqual(0);
    });

    it('should generate any amount of a`s on the simple grammar S->aS|a', async () => {
      const fsm = Grammar.fromText(`S -> aS | a`).getFSM();

      expect(fsm).toBeDefined();
      expect(fsm.generate(1)).toEqual(['a']);
      expect(fsm.generate(2)).toEqual(['a', 'aa']);
      expect(fsm.generate(3)).toEqual(['a', 'aa', 'aaa']);
      expect(fsm.generate(4)).toEqual(['a', 'aa', 'aaa', 'aaaa']);
      expect(fsm.generate(5)).toEqual(['a', 'aa', 'aaa', 'aaaa', 'aaaaa']);
      expect(fsm.generate(100).length).toEqual(100);
      expect(R.uniq(fsm.generate(50)).length).toEqual(50);
    });

    it('should generate not generate more sentences then there is on a finite language', async () => {
      const fsm = Grammar.fromText(`S -> a | aB\nB -> a`).getFSM();

      expect(fsm).toBeDefined();
      expect(fsm.generate(1)).toEqual(['a']);
      expect(fsm.generate(2)).toEqual(['a', 'aa']);
      expect(fsm.generate(3)).toEqual(['a', 'aa']);
      expect(fsm.generate(4)).toEqual(['a', 'aa']);
      expect(fsm.generate(5)).toEqual(['a', 'aa']);
      expect(fsm.generate(50)).toEqual(['a', 'aa']);
      expect(fsm.generate(100)).toEqual(['a', 'aa']);
    });

    it('should generate the empty sentence when it have epsilon on the first production', async () => {
      const fsm = Grammar.fromText(
        `Z -> aB | ${EPSILON}
        S -> aB
        B -> aS | a`
      ).getFSM();

      expect(fsm).toBeDefined();
      expect(fsm.generate(1)).toEqual(['']);
      expect(fsm.generate(2)).toEqual(['', 'aa']);
      expect(fsm.generate(3)).toEqual(['', 'aa']);
      expect(fsm.generate(4)).toEqual(['', 'aa', 'aaaa']);
      expect(fsm.generate(5)).toEqual(['', 'aa', 'aaaa']);
      expect(fsm.generate(50).includes('')).toBeTruthy();
    });

    it('should generate all a`s pairs on the pairs a`s language', async () => {
      const fsm = Grammar.fromText(`S -> aB\nB -> aS | a`).getFSM();

      expect(fsm).toBeDefined();
      expect(fsm.generate(1)).toEqual([]);
      expect(fsm.generate(2)).toEqual(['aa']);
      expect(fsm.generate(3)).toEqual(['aa']);
      expect(fsm.generate(4)).toEqual(['aa', 'aaaa']);
      expect(fsm.generate(5)).toEqual(['aa', 'aaaa']);
      expect(fsm.generate(6)).toEqual(['aa', 'aaaa', 'aaaaaa']);
    });

    it('should not enter an infinite loop when we have cycles with epsilon transitions', async () => {
      const states = ['A', 'B', 'C'];
      const alphabet = [EPSILON];
      const transitions = [
        { from: 'A', to: 'B', when: EPSILON },
        { from: 'B', to: 'C', when: EPSILON },
        { from: 'C', to: 'A', when: EPSILON },
      ];
      const initial = 'A';
      const finals = [];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      expect(fsm.generate(1)).toEqual([]);
      expect(fsm.generate(2)).toEqual([]);
      expect(fsm.generate(3)).toEqual([]);
      expect(fsm.generate(4)).toEqual([]);
      expect(fsm.generate(5)).toEqual([]);
      expect(fsm.generate(50)).toEqual([]);
      expect(fsm.generate(100)).toEqual([]);
    });
  });
});
