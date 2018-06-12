import { EPSILON } from '../SymbolValidator';
import FSM from '../FSM';

describe('FSM', () => {
  describe('Epsilon', () => {
    it('should remove epsilon transitions', async () => {
      const states = ['A', 'B', 'C'];
      const alphabet = [EPSILON, 'a', 'b', 'c'];
      const transitions = [
        { from: 'A', to: 'A', when: 'a' },
        { from: 'A', to: 'B', when: EPSILON },
        { from: 'B', to: 'B', when: 'b' },
        { from: 'B', to: 'C', when: EPSILON },
        { from: 'C', to: 'C', when: 'c' },
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.eliminateEpsilonTransitions();
      expect(fsm.hasEpsilonTransitions()).toBeFalsy();
    });

    it('should remove the epsilon from the alphabet', async () => {
      const states = ['S', 'Z'];
      const alphabet = [EPSILON, 'a'];
      const transitions = [
        { from: 'S', to: 'Z', when: 'a' },
        { from: 'Z', to: 'Z', when: EPSILON },
      ];
      const initial = 'S';
      const finals = ['Z'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      expect(fsm.hasEpsilonTransitions()).toBeTruthy();

      fsm.eliminateEpsilonTransitions();

      expect(fsm.hasEpsilonTransitions()).toBeFalsy();
      expect(fsm.initial).toEqual('S');
      expect(fsm.alphabet).toEqual(['a']);
      expect(fsm.finals).toEqual(['Z']);
      expect(fsm.transitions).toEqual([{ from: 'S', to: 'Z', when: 'a' }]);
    });

    it('should remove epsilon transitions that go to itself', async () => {
      const states = ['S', 'Z'];
      const alphabet = [EPSILON, 'a'];
      const transitions = [
        { from: 'S', to: 'Z', when: 'a' },
        { from: 'Z', to: 'Z', when: EPSILON },
      ];
      const initial = 'S';
      const finals = ['Z'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      expect(fsm.hasEpsilonTransitions()).toBeTruthy();

      fsm.eliminateEpsilonTransitions();

      expect(fsm.hasEpsilonTransitions()).toBeFalsy();
      expect(fsm.initial).toEqual('S');
      expect(fsm.finals).toEqual(['Z']);
      expect(fsm.transitions).toEqual([{ from: 'S', to: 'Z', when: 'a' }]);
    });

    it('should remove epsilon transitions and not remove the state, even there is no transactions related to it', async () => {
      const states = ['S', 'Z'];
      const alphabet = [EPSILON];
      const transitions = [{ from: 'S', to: 'Z', when: EPSILON }];
      const initial = 'S';
      const finals = ['Z'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      expect(fsm.hasEpsilonTransitions()).toBeTruthy();

      fsm.eliminateEpsilonTransitions();

      expect(fsm.hasEpsilonTransitions()).toBeFalsy();
      expect(fsm.initial).toEqual('S');
      expect(fsm.states).toEqual(['S', 'Z']);
      expect(fsm.finals).toEqual(['Z', 'S']);
    });

    it('should remove epsilon transitions and not create a new initial state if not needed, but change the finals', async () => {
      const states = ['S', 'B', 'O', 'Z'];
      const alphabet = [EPSILON, 'a'];
      const transitions = [
        { from: 'S', to: 'B', when: 'a' },
        { from: 'S', to: 'Z', when: EPSILON },
        { from: 'B', to: 'O', when: 'a' },
      ];
      const initial = 'S';
      const finals = ['Z'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      expect(fsm.hasEpsilonTransitions()).toBeTruthy();

      fsm.eliminateEpsilonTransitions();

      expect(fsm.hasEpsilonTransitions()).toBeFalsy();
      expect(fsm.initial).toEqual('S');
      expect(fsm.transitions).toEqual([
        { from: 'S', to: 'B', when: 'a' },
        { from: 'B', to: 'O', when: 'a' },
      ]);
      expect(fsm.finals).toEqual(['Z', 'S']);
    });

    it('should remove epsilon transitions but create a new initial state if needed', async () => {
      const states = ['S', 'B', 'O', 'Z'];
      const alphabet = [EPSILON, 'a'];
      const transitions = [
        { from: 'S', to: 'B', when: 'a' },
        { from: 'S', to: 'Z', when: EPSILON },
        { from: 'B', to: 'O', when: 'a' },
        { from: 'B', to: 'S', when: 'a' },
      ];
      const initial = 'S';
      const finals = ['Z', 'B', 'O'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      expect(fsm.hasEpsilonTransitions()).toBeTruthy();

      fsm.eliminateEpsilonTransitions();

      expect(fsm.hasEpsilonTransitions()).toBeFalsy();
      expect(fsm.initial).toEqual('S');
      expect(fsm.finals).toEqual(['Z', 'B', 'O', 'S']);
    });

    it('should not remove any transitions if there is no epsilon transition', async () => {
      const states = ['A', 'B', 'C'];
      const alphabet = [EPSILON, 'a', 'b', 'c'];
      const transitions = [
        { from: 'A', to: 'B', when: 'b' },
        { from: 'B', to: 'C', when: 'c' },
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.eliminateEpsilonTransitions();
      expect(fsm.initial).toEqual('A');
      expect(fsm.finals).toEqual(['C']);
      expect(fsm.transitions).toEqual([
        { from: 'A', to: 'B', when: 'b' },
        { from: 'B', to: 'C', when: 'c' },
      ]);
    });

    it('should remove epsilon from a*b', () => {
      const states = ['A', 'B', 'C'];
      const alphabet = ['a', 'b', EPSILON];
      const transitions = [
        { from: 'A', to: 'B', when: EPSILON },
        { from: 'B', to: 'B', when: 'a' },
        { from: 'B', to: 'C', when: 'b' },
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.eliminateEpsilonTransitions();
      expect(fsm.initial).toEqual('A');
      expect(fsm.finals).toEqual(['C']);
      expect(fsm.alphabet).toEqual(['a', 'b']);
      expect(fsm.transitions).toEqual([
        { from: 'A', to: 'A', when: 'a' },
        { from: 'A', to: 'C', when: 'b' },
      ]);
    });
  });
});
