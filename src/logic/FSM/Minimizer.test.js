import Grammar from '../Grammar';
import { EPSILON } from '../SymbolValidator';
import FSM from '../FSM';
import {
  eliminateUnreachableStates,
  eliminateDeadStates,
  detectReachableStates,
  detectAliveStates,
  createPhiState,
  isMinimal,
  minimize,
} from './Minimizer';

describe('FSM', () => {
  describe('isMinimal', () => {
    it('should recognize all states as alive and reachable', async () => {
      const states = ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'Q1', to: 'Q2', when: '1' },
        { from: 'Q5', to: 'Q5', when: '1' },
        { from: 'Q0', to: 'Q2', when: '1' },
        { from: 'Q1', to: 'Q1', when: '0' },
        { from: 'Q3', to: 'Q5', when: '0' },
        { from: 'Q3', to: 'Q1', when: '0' },
        { from: 'Q4', to: 'Q3', when: '1' },
        { from: 'Q5', to: 'Q4', when: '0' },
        { from: 'Q4', to: 'Q1', when: '0' },
        { from: 'Q2', to: 'Q3', when: '0' },
        { from: 'Q2', to: 'Q4', when: '1' },
        { from: 'Q0', to: 'Q1', when: '0' },
      ];
      const initial = 'Q0';
      const finals = ['Q1'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      let reachableStates = [fsm.initial];
      let aliveStates = [];
      detectReachableStates(fsm.initial, reachableStates, fsm.transitions);
      for (let final of fsm.finals) {
        detectAliveStates(final, aliveStates, fsm.transitions);
      }
      expect(reachableStates.lenght).toBe(fsm.states.lenght);
      expect(aliveStates.lenght).toBe(fsm.states.lenght);
    });

    it('should eliminate dead and unreachable states', async () => {
      const states = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const alphabet = ['a', 'b'];
      const transitions = [
        { from: 'A', to: 'G', when: 'a' },
        { from: 'A', to: 'B', when: 'b' },
        { from: 'B', to: 'F', when: 'a' },
        { from: 'B', to: 'E', when: 'b' },
        { from: 'C', to: 'C', when: 'a' },
        { from: 'C', to: 'G', when: 'b' },
        { from: 'D', to: 'A', when: 'a' },
        { from: 'D', to: 'H', when: 'b' },
        { from: 'E', to: 'E', when: 'a' },
        { from: 'E', to: 'A', when: 'b' },
        { from: 'F', to: 'B', when: 'a' },
        { from: 'F', to: 'C', when: 'b' },
        { from: 'G', to: 'G', when: 'a' },
        { from: 'G', to: 'F', when: 'b' },
        { from: 'H', to: 'H', when: 'a' },
        { from: 'H', to: 'D', when: 'b' },
      ];
      const initial = 'A';
      const finals = ['A', 'G'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      eliminateUnreachableStates(fsm);
      eliminateDeadStates(fsm);
      expect(
        fsm.states
          .slice()
          .sort()
          .join(',')
      ).toBe(
        ['A', 'B', 'C', 'E', 'F', 'G']
          .slice()
          .sort()
          .join(',')
      );
    });

    it('should detect indefinition and create phi state', async () => {
      const states = ['S', 'A', 'BF', 'SF', 'C', 'BSF', 'AC'];
      const alphabet = ['a', 'b', 'c'];
      const transitions = [
        { from: 'S', to: 'A', when: 'a' },
        { from: 'S', to: 'BF', when: 'b' },
        { from: 'S', to: 'SF', when: 'c' },
        { from: 'A', to: 'SF', when: 'a' },
        { from: 'A', to: 'C', when: 'b' },
        { from: 'A', to: 'A', when: 'c' },
        { from: 'BF', to: 'A', when: 'a' },
        { from: 'BF', to: 'BSF', when: 'c' },
        { from: 'SF', to: 'A', when: 'a' },
        { from: 'SF', to: 'BF', when: 'b' },
        { from: 'SF', to: 'SF', when: 'c' },
        { from: 'C', to: 'SF', when: 'a' },
        { from: 'C', to: 'AC', when: 'c' },
        { from: 'BSF', to: 'A', when: 'a' },
        { from: 'BSF', to: 'BF', when: 'b' },
        { from: 'BSF', to: 'BSF', when: 'c' },
        { from: 'AC', to: 'SF', when: 'a' },
        { from: 'AC', to: 'C', when: 'b' },
        { from: 'AC', to: 'AC', when: 'c' },
      ];
      const initial = 'S';
      const finals = ['S', 'BF', 'SF', 'BSF'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      expect(fsm.hasIndefinition()).toBe(true);
      createPhiState(fsm);
      expect(fsm.states.includes('PHI')).toBeTruthy();
    });

    it('should fsm as non minimal', async () => {
      const states = ['S', 'AD', 'E', 'ABD', 'CE', 'ABE'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'S', to: 'AD', when: '0' },
        { from: 'S', to: 'E', when: '1' },
        { from: 'AD', to: 'ABD', when: '0' },
        { from: 'AD', to: 'CE', when: '1' },
        { from: 'E', to: 'E', when: '0' },
        { from: 'E', to: 'E', when: '1' },
        { from: 'ABD', to: 'ABD', when: '0' },
        { from: 'ABD', to: 'CE', when: '1' },
        { from: 'CE', to: 'ABE', when: '0' },
        { from: 'CE', to: 'E', when: '1' },
        { from: 'ABE', to: 'ABE', when: '0' },
        { from: 'ABE', to: 'CE', when: '1' },
      ];
      const initial = 'S';
      const finals = ['E', 'CE', 'ABE'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      expect(isMinimal(fsm)).toBeFalsy();
    });

    it('should minimize #1', async () => {
      const states = ['S', 'AD', 'E', 'ABD', 'CE', 'ABE'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'S', to: 'AD', when: '0' },
        { from: 'S', to: 'E', when: '1' },
        { from: 'AD', to: 'ABD', when: '0' },
        { from: 'AD', to: 'CE', when: '1' },
        { from: 'E', to: 'E', when: '0' },
        { from: 'E', to: 'E', when: '1' },
        { from: 'ABD', to: 'ABD', when: '0' },
        { from: 'ABD', to: 'CE', when: '1' },
        { from: 'CE', to: 'ABE', when: '0' },
        { from: 'CE', to: 'E', when: '1' },
        { from: 'ABE', to: 'ABE', when: '0' },
        { from: 'ABE', to: 'CE', when: '1' },
      ];
      const initial = 'S';
      const finals = ['E', 'CE', 'ABE'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.minimize();
      expect(isMinimal(fsm)).toBe(true);
    });

    it('should minimize #2', async () => {
      const states = ['S', 'A', 'B', 'C', 'F'];
      const alphabet = ['a', 'b', 'c'];
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
      const finals = ['S', 'F'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.minimize();
      expect(isMinimal(fsm)).toBe(true);
    });

    it('should minimize #3', async () => {
      const states = ['S', 'A', 'B', 'C', 'D', 'E'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'S', to: 'A', when: '0' },
        { from: 'S', to: 'D', when: '0' },
        { from: 'S', to: 'E', when: '1' },
        { from: 'A', to: 'A', when: '0' },
        { from: 'A', to: 'B', when: '0' },
        { from: 'A', to: 'C', when: '1' },
        { from: 'A', to: 'E', when: '1' },
        { from: 'B', to: 'B', when: '0' },
        { from: 'C', to: 'A', when: '0' },
        { from: 'C', to: 'B', when: '0' },
        { from: 'D', to: 'B', when: '0' },
        { from: 'D', to: 'D', when: '0' },
        { from: 'D', to: 'C', when: '1' },
        { from: 'E', to: 'E', when: '0' },
        { from: 'E', to: 'E', when: '1' },
      ];
      const initial = 'S';
      const finals = ['E'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.minimize();
      expect(isMinimal(fsm)).toBe(true);
    });

    it('should minimize #4', async () => {
      const states = ['Q0', 'Q1', 'Q2', 'Q3', 'Q4'];
      const alphabet = ['a', 'b'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: 'a' },
        { from: 'Q0', to: 'Q2', when: 'b' },
        { from: 'Q1', to: 'Q3', when: 'a' },
        { from: 'Q2', to: 'Q4', when: 'b' },
        { from: 'Q3', to: 'Q3', when: 'a' },
        { from: 'Q3', to: 'Q3', when: 'b' },
        { from: 'Q4', to: 'Q4', when: 'a' },
        { from: 'Q4', to: 'Q4', when: 'b' },
      ];
      const initial = 'Q0';
      const finals = ['Q3', 'Q4'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.minimize();
      expect(isMinimal(fsm)).toBe(true);
    });

    it('should minimize #5', async () => {
      const states = ['Q0', 'Q1', 'Q2', 'Q3'];
      const alphabet = ['a', 'b', 'c'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: 'a' },
        { from: 'Q1', to: 'Q2', when: 'b' },
        { from: 'Q2', to: 'Q3', when: 'c' },
      ];
      const initial = 'Q0';
      const finals = ['Q3'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.minimize();
      expect(isMinimal(fsm)).toBe(true);
    });

    it('should minimize #6', async () => {
      const states = ['Q0', 'Q1'];
      const alphabet = ['a'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: 'a' },
        { from: 'Q1', to: 'Q1', when: 'a' },
      ];
      const initial = 'Q0';
      const finals = ['Q0', 'Q1'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.minimize();
      expect(fsm.states.length).toBe(1);
      expect(isMinimal(fsm)).toBe(true);
    });

    it('should minimize #6', async () => {
      const states = ['Q0', 'Q1', 'Q2', 'Q3'];
      const alphabet = ['a', 'b', 'c'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: 'a' },
        { from: 'Q1', to: 'Q2', when: 'b' },
        { from: 'Q2', to: 'Q3', when: 'c' },
        { from: 'Q3', to: 'Q1', when: 'a' },
      ];
      const initial = 'Q0';
      const finals = [];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.minimize();
      expect(isMinimal(fsm)).toBe(true);
      expect(fsm.states.length).toBe(1);
    });

    it('should minimize #7', async () => {
      const states = ['A', 'B', 'C', 'D', 'E'];
      const alphabet = ['a', 'b'];
      const transitions = [
        { from: 'A', to: 'B', when: 'a' },
        { from: 'A', to: 'A', when: 'b' },
        { from: 'B', to: 'C', when: 'b' },
        { from: 'B', to: 'D', when: 'a' },
        { from: 'C', to: 'D', when: 'a' },
        { from: 'C', to: 'C', when: 'b' },
        { from: 'D', to: 'A', when: 'a' },
        { from: 'D', to: 'E', when: 'b' },
        { from: 'E', to: 'A', when: 'a' },
        { from: 'E', to: 'E', when: 'b' },
      ];
      const initial = 'A';
      const finals = ['B', 'C', 'D', 'E'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.minimize();
      expect(isMinimal(fsm)).toBe(true);
      expect(fsm.states.length).toBe(3);
    });

    it('should minimize #8', async () => {
      const states = ['Q0', 'Q1', 'Q2', 'Q3', 'Q4'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: '0' },
        { from: 'Q0', to: 'Q2', when: '1' },
        { from: 'Q1', to: 'Q1', when: '0' },
        { from: 'Q1', to: 'Q2', when: '1' },
        { from: 'Q2', to: 'Q4', when: '0' },
        { from: 'Q2', to: 'Q3', when: '1' },
        { from: 'Q3', to: 'Q1', when: '0' },
        { from: 'Q3', to: 'Q2', when: '1' },
        { from: 'Q4', to: 'Q2', when: '0' },
        { from: 'Q4', to: 'Q4', when: '1' },
      ];
      const initial = 'Q0';
      const finals = ['Q3'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.minimize();
      expect(isMinimal(fsm)).toBe(true);
      expect(fsm.states.length).toBe(4);
    });

    it('should minimize #9', async () => {
      const states = ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: '0' },
        { from: 'Q0', to: 'Q2', when: '1' },
        { from: 'Q1', to: 'Q1', when: '0' },
        { from: 'Q1', to: 'Q2', when: '1' },
        { from: 'Q2', to: 'Q3', when: '0' },
        { from: 'Q2', to: 'Q4', when: '1' },
        { from: 'Q3', to: 'Q5', when: '0' },
        { from: 'Q3', to: 'Q6', when: '1' },
        { from: 'Q4', to: 'Q1', when: '0' },
        { from: 'Q4', to: 'Q2', when: '1' },
        { from: 'Q5', to: 'Q3', when: '0' },
        { from: 'Q5', to: 'Q4', when: '1' },
        { from: 'Q6', to: 'Q5', when: '0' },
        { from: 'Q6', to: 'Q6', when: '1' },
      ];
      const initial = 'Q0';
      const finals = ['Q1'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.minimize();
      expect(isMinimal(fsm)).toBe(true);
      expect(fsm.states.length).toBe(4);
    });

    it('should minimize #10', async () => {
      const states = ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'];
      const alphabet = ['a', 'b', 'c'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: 'a' },
        { from: 'Q0', to: 'Q2', when: 'b' },
        { from: 'Q0', to: 'Q3', when: 'c' },
        { from: 'Q1', to: 'Q0', when: 'a' },
        { from: 'Q1', to: 'Q4', when: 'b' },
        { from: 'Q1', to: 'Q7', when: 'c' },
        { from: 'Q2', to: 'Q4', when: 'a' },
        { from: 'Q2', to: 'Q0', when: 'b' },
        { from: 'Q2', to: 'Q5', when: 'c' },
        { from: 'Q3', to: 'Q7', when: 'a' },
        { from: 'Q3', to: 'Q5', when: 'b' },
        { from: 'Q3', to: 'Q0', when: 'c' },
        { from: 'Q4', to: 'Q2', when: 'a' },
        { from: 'Q4', to: 'Q1', when: 'b' },
        { from: 'Q4', to: 'Q6', when: 'c' },
        { from: 'Q5', to: 'Q6', when: 'a' },
        { from: 'Q5', to: 'Q3', when: 'b' },
        { from: 'Q5', to: 'Q2', when: 'c' },
        { from: 'Q6', to: 'Q5', when: 'a' },
        { from: 'Q6', to: 'Q7', when: 'b' },
        { from: 'Q6', to: 'Q5', when: 'b' },
        { from: 'Q7', to: 'Q3', when: 'a' },
        { from: 'Q7', to: 'Q6', when: 'b' },
        { from: 'Q7', to: 'Q1', when: 'c' },
      ];
      const initial = 'Q0';
      const finals = ['Q6'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      fsm.minimize();
      expect(isMinimal(fsm)).toBe(true);
      expect(fsm.states.length).toBe(8);
    });

    it('should return an automata with correct alphabet and no final states when language is empty', () => {
      const states = ['S', 'C', 'Ã'];
      const alphabet = ['a', 'b', 'c'];
      const transitions = [
        { from: 'S', to: 'S', when: 'a' },
        { from: 'S', to: 'S', when: 'b' },
        { from: 'S', to: 'C', when: 'c' },
      ];
      const initial = 'S';
      const finals = ['Ã'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      fsm.minimize();
      fsm.ensureStatesNamesAreStandard();
      expect(fsm.states).toEqual(['A']);
      expect(fsm.initial).toEqual('A');
      expect(fsm.alphabet).toEqual(alphabet);
      expect(fsm.transitions).toEqual([
        { from: 'A', to: 'A', when: 'a' },
        { from: 'A', to: 'A', when: 'b' },
        { from: 'A', to: 'A', when: 'c' },
      ]);
      expect(fsm.finals).toEqual([]);
    });

    it('should return a minimal automata of ab*c?', () => {
      const states = ['A', 'B', 'C'];
      const alphabet = ['a', 'b', 'c'];
      const transitions = [
        { from: 'A', to: 'B', when: 'a' },
        { from: 'B', to: 'B', when: 'b' },
        { from: 'B', to: 'C', when: 'c' },
      ];
      const initial = 'A';
      const finals = ['B', 'C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      expect(fsm.isMinimal()).toBeTruthy();
    });
  });
});
