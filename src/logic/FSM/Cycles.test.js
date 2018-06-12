import Grammar from '../Grammar';
import FSM from '../FSM';

describe('FSM', () => {
  describe('cycles', () => {
    it('should recognize loop in automata', async () => {
      const fsm = Grammar.fromText(`S -> aS`).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.hasCycle(fsm.initial)).toBeTruthy();
    });

    it('should recognize cycle in automata', async () => {
      // -> q0 -> q1 -> q2 -> q3
      //    ^           |
      //    |___________|
      const fsm = Grammar.fromText(
        `S -> aA | b\nA -> aB \nC -> aS | b`
      ).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.hasCycle(fsm.initial)).toBeTruthy();
    });

    it('should NOT recognize cycle in automata', async () => {
      const fsm = Grammar.fromText(`S -> a | b`).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.hasCycle()).toBeFalsy();
    });

    it('should NOT recognize cycle in automata', async () => {
      const fsm = Grammar.fromText(`S -> a | b`).getFSM();
      expect(fsm).toBeDefined();
      expect(fsm.hasCycle()).toBeFalsy();
    });
  });
});
