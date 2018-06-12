import FSM from '../FSM';

describe('FSM', () => {
  describe('toGrammar', () => {
    it('should transform FSM to grammar #1', async () => {
      const states = ['Q1', 'Q0', 'Q6', 'Q5', 'Q2', 'Q3', 'Q4'];
      const alphabet = ['a', 'b', 'c'];
      const transitions = [
        { from: 'Q1', to: 'Q0', when: 'a' },
        { from: 'Q1', to: 'Q6', when: 'b' },
        { from: 'Q1', to: 'Q5', when: 'c' },
        { from: 'Q0', to: 'Q1', when: 'a' },
        { from: 'Q0', to: 'Q2', when: 'b' },
        { from: 'Q0', to: 'Q3', when: 'c' },
        { from: 'Q6', to: 'Q4', when: 'a' },
        { from: 'Q6', to: 'Q4', when: 'b' },
        { from: 'Q6', to: 'Q3', when: 'c' },
        { from: 'Q5', to: 'Q4', when: 'a' },
        { from: 'Q5', to: 'Q2', when: 'b' },
        { from: 'Q5', to: 'Q4', when: 'c' },
        { from: 'Q2', to: 'Q4', when: 'a' },
        { from: 'Q2', to: 'Q4', when: 'b' },
        { from: 'Q2', to: 'Q5', when: 'c' },
        { from: 'Q3', to: 'Q4', when: 'a' },
        { from: 'Q3', to: 'Q6', when: 'b' },
        { from: 'Q3', to: 'Q4', when: 'c' },
        { from: 'Q4', to: 'Q4', when: 'a' },
        { from: 'Q4', to: 'Q4', when: 'b' },
        { from: 'Q4', to: 'Q4', when: 'c' },
      ];
      const initial = 'Q1';
      const finals = ['Q0', 'Q6', 'Q5'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      const grammar = fsm.toGrammar();
      for (let nonTerminal in grammar.P) {
        expect(grammar.P[nonTerminal]).toBeDefined();
      }
    });

    it('should transform FSM to grammar #2', async () => {
      const states_ = ['A', 'B', 'C', 'D'];
      const alphabet_ = ['0', '1'];
      const transitions_ = [
        { from: 'A', to: 'B', when: '0' },
        { from: 'A', to: 'C', when: '1' },
        { from: 'B', to: 'B', when: '0' },
        { from: 'B', to: 'C', when: '1' },
        { from: 'C', to: 'D', when: '0' },
        { from: 'C', to: 'A', when: '1' },
        { from: 'D', to: 'C', when: '0' },
        { from: 'D', to: 'D', when: '1' },
      ];
      const initial_ = 'A';
      const finals_ = ['B'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);
      const grammar = fsm_.toGrammar();
      for (let nonTerminal in grammar.P) {
        expect(grammar.P[nonTerminal]).toBeDefined();
      }
    });

    it('should transform FSM to grammar #3', async () => {
      const states_ = ['A', 'B'];
      const alphabet_ = ['a', 'b'];
      const transitions_ = [
        { from: 'A', to: 'B', when: 'a' },
        { from: 'A', to: 'A', when: 'b' },
        { from: 'B', to: 'A', when: 'a' },
        { from: 'B', to: 'B', when: 'b' },
      ];

      const initial_ = 'A';
      const finals_ = ['A'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);
      const grammar = fsm_.toGrammar();
      for (let nonTerminal in grammar.P) {
        expect(grammar.P[nonTerminal]).toBeDefined();
      }
    });
  });
});
