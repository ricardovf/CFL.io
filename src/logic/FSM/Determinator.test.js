import Grammar from '../Grammar';
import { EPSILON } from '../SymbolValidator';
import FSM from '../FSM';

describe('FSM', () => {
  describe('isDeterministic', () => {
    it('should recognize FSM as deterministic', async () => {
      const fsm = Grammar.fromText(`S -> aB\nB -> aS | b`).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.isDeterministic).toBeTruthy();
    });

    it('should NOT recognize FSM as deterministic', async () => {
      const fsm = Grammar.fromText(`S -> aA\nA -> aS | aA | a`).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.isDeterministic()).toBeFalsy();
    });

    it('should NOT recognize automata as deterministic', async () => {
      const fsm = Grammar.fromText(`S -> aA | b | &\nA -> aA | a`).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.isDeterministic()).toBeFalsy();
    });

    it('should recognize automata as NOT deterministic when there is EPSILON + normal symbol ', () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['a', 'b', EPSILON];
      const transitions = [
        { from: 'A', to: 'D', when: 'a' },
        { from: 'D', to: 'A', when: 'b' },
        { from: 'B', to: 'B', when: 'b' },
        { from: 'B', to: 'A', when: 'a' },
        { from: 'B', to: 'C', when: EPSILON },
        { from: 'A', to: 'B', when: 'b' },
      ];
      const initial = 'A';
      const finals = ['A'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      expect(fsm.isDeterministic()).toBeFalsy();
    });

    it('should recognize automata as deterministic when there is ONLY EPSILON ', () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['a', 'b', EPSILON];
      const transitions = [
        { from: 'A', to: 'D', when: 'a' },
        { from: 'D', to: 'B', when: EPSILON },
      ];
      const initial = 'A';
      const finals = ['A'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      expect(fsm.isDeterministic()).toBeTruthy();
    });
  });

  describe('determination', () => {
    it('should determinate a simple FSM', async () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['a', 'b'];
      const transitions = [
        { from: 'A', to: 'A', when: 'a' },
        { from: 'A', to: 'A', when: 'b' },
        { from: 'A', to: 'B', when: 'a' },
        { from: 'B', to: 'C', when: 'b' },
        { from: 'C', to: 'D', when: 'b' },
      ];
      const initial = 'A';
      const finals = ['D'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.determinate();
      expect(fsm.isDeterministic()).toBeTruthy();
      expect(fsm.initial).toEqual('A');
      expect(fsm.states).toEqual(['A', 'AB', 'AC', 'AD']);
      expect(fsm.finals).toEqual(['AD']);
    });

    it('should NOT determinate', async () => {
      const states = ['A', 'B', 'C'];
      const alphabet = ['a', 'b'];
      const transitions = [
        { from: 'A', to: 'B', when: 'a' },
        { from: 'B', to: 'C', when: 'b' },
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.determinate();
      expect(fsm.isDeterministic()).toBeTruthy();
    });

    it('should determinate with epsilon', async () => {
      const states = ['S', 'A', 'B', 'C', 'F'];
      const alphabet = [EPSILON, 'a', 'b', 'c'];
      const transitions = [
        { from: 'S', to: 'A', when: 'a' },
        { from: 'S', to: 'B', when: 'b' },
        { from: 'S', to: 'F', when: 'b' },
        { from: 'S', to: 'S', when: 'c' },
        { from: 'S', to: 'F', when: 'c' },
        { from: 'A', to: 'S', when: 'a' },
        { from: 'A', to: 'F', when: 'a' },
        { from: 'A', to: 'C', when: 'b' },
        { from: 'A', to: 'A', when: 'c' },
        { from: 'B', to: 'A', when: 'a' },
        { from: 'B', to: 'B', when: 'c' },
        { from: 'B', to: 'S', when: 'c' },
        { from: 'B', to: 'F', when: 'c' },
        { from: 'C', to: 'S', when: 'a' },
        { from: 'C', to: 'F', when: 'a' },
        { from: 'C', to: 'A', when: 'c' },
        { from: 'C', to: 'C', when: 'c' },
      ];
      const initial = 'S';
      const finals = ['F'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.determinate();
      expect(fsm.isDeterministic()).toBeTruthy();
    });
  });
});
