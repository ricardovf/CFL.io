import FSM from '../FSM';
import {
  concatenation,
  difference,
  intersection,
  negation,
  reverse,
  union,
  closure,
} from './Operator';

describe('FSM', () => {
  describe('operators', () => {
    it('should unite two FSM #1', async () => {
      const states = ['Q0', 'Q1', 'Q2'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: '0' },
        { from: 'Q1', to: 'Q2', when: '1' },
      ];
      const initial = 'Q0';
      const finals = ['Q2'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['Q0'];
      const alphabet_ = ['a'];
      const transitions_ = [{ from: 'Q0', to: 'Q0', when: 'a' }];
      const initial_ = 'Q0';
      const finals_ = ['Q0'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = union(fsm, fsm_);
      expect(await newFsm.recognize('01')).toBeTruthy();
      expect(await newFsm.recognize('a')).toBeTruthy();
      expect(await newFsm.recognize('a1')).toBeFalsy();
    });

    it('should unite two FSM #2', async () => {
      const states = ['Q0', 'Q1'];
      const alphabet = ['0'];
      const transitions = [{ from: 'Q0', to: 'Q1', when: '0' }];
      const initial = 'Q0';
      const finals = ['Q1'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['Q0', 'Q1'];
      const alphabet_ = ['1'];
      const transitions_ = [{ from: 'Q0', to: 'Q1', when: '1' }];
      const initial_ = 'Q0';
      const finals_ = ['Q1'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = union(fsm, fsm_);
      expect(await newFsm.recognize('01')).toBeFalsy();
    });

    it('should unite two FSM #3', async () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'A', to: 'A', when: '0' },
        { from: 'A', to: 'B', when: '1' },
        { from: 'B', to: 'D', when: '0' },
        { from: 'B', to: 'C', when: '1' },
        { from: 'C', to: 'A', when: '0' },
        { from: 'C', to: 'B', when: '1' },
        { from: 'D', to: 'B', when: '0' },
        { from: 'D', to: 'D', when: '1' },
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

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

      const newFsm = union(fsm, fsm_);
      expect(await newFsm.recognize('11')).toBeTruthy();
      expect(await newFsm.recognize('0')).toBeTruthy();
      expect(await newFsm.recognize('110')).toBeTruthy();
    });

    it('should concat two FSM #1', async () => {
      const states = ['Q0', 'Q1', 'Q2'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: '0' },
        { from: 'Q1', to: 'Q2', when: '1' },
      ];
      const initial = 'Q0';
      const finals = ['Q2'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['Q0'];
      const alphabet_ = ['a'];
      const transitions_ = [{ from: 'Q0', to: 'Q0', when: 'a' }];
      const initial_ = 'Q0';
      const finals_ = ['Q0'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = concatenation(fsm, fsm_);
      expect(await newFsm.recognize('01a')).toBeTruthy();
    });

    it('should concat two FSM #2', async () => {
      const states = ['Q0', 'Q1'];
      const alphabet = ['0'];
      const transitions = [{ from: 'Q0', to: 'Q1', when: '0' }];
      const initial = 'Q0';
      const finals = ['Q1'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['Q0', 'Q1'];
      const alphabet_ = ['1'];
      const transitions_ = [{ from: 'Q0', to: 'Q1', when: '1' }];
      const initial_ = 'Q0';
      const finals_ = ['Q1'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = concatenation(fsm, fsm_);
      expect(await newFsm.recognize('01')).toBeTruthy();
    });

    it('should concat two FSM #3', async () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'A', to: 'A', when: '0' },
        { from: 'A', to: 'B', when: '1' },
        { from: 'B', to: 'D', when: '0' },
        { from: 'B', to: 'C', when: '1' },
        { from: 'C', to: 'A', when: '0' },
        { from: 'C', to: 'B', when: '1' },
        { from: 'D', to: 'B', when: '0' },
        { from: 'D', to: 'D', when: '1' },
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

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

      const newFsm = concatenation(fsm, fsm_);
      expect(await newFsm.recognize('110')).toBeTruthy();
    });

    it('should intersect two FSM #1', async () => {
      const states = ['Q0', 'Q1', 'Q2'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: '0' },
        { from: 'Q1', to: 'Q2', when: '1' },
      ];
      const initial = 'Q0';
      const finals = ['Q2'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['Q0'];
      const alphabet_ = ['a'];
      const transitions_ = [{ from: 'Q0', to: 'Q0', when: 'a' }];
      const initial_ = 'Q0';
      const finals_ = ['Q0'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = intersection(fsm, fsm_);
      expect(await newFsm.recognize('01')).toBeFalsy();
      expect(await newFsm.recognize('a')).toBeFalsy();
    });

    it('should intersect two FSM #2', async () => {
      const states = ['Q0', 'Q1'];
      const alphabet = ['0'];
      const transitions = [{ from: 'Q0', to: 'Q1', when: '0' }];
      const initial = 'Q0';
      const finals = ['Q1'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['Q0', 'Q1'];
      const alphabet_ = ['1'];
      const transitions_ = [{ from: 'Q0', to: 'Q1', when: '1' }];
      const initial_ = 'Q0';
      const finals_ = ['Q1'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = intersection(fsm, fsm_);
      expect(await newFsm.recognize('1')).toBeFalsy();
      expect(await newFsm.recognize('0')).toBeFalsy();
    });

    it('should intersect two FSM #3', async () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'A', to: 'B', when: '0' },
        { from: 'A', to: 'C', when: '1' },
        { from: 'B', to: 'B', when: '0' },
        { from: 'B', to: 'C', when: '1' },
        { from: 'C', to: 'D', when: '0' },
        { from: 'C', to: 'B', when: '1' },
        { from: 'D', to: 'C', when: '0' },
        { from: 'D', to: 'D', when: '1' },
      ];

      const initial = 'A';
      const finals = ['B'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

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

      const newFsm = intersection(fsm, fsm_);
      expect(await newFsm.recognize('1100')).toBeTruthy();
    });

    it('should intersect two FSM #4', async () => {
      const states = ['A', 'B', 'C', 'D', 'E'];
      const alphabet = ['a', 'b', 'c', 'd'];
      const transitions = [
        { from: 'A', to: 'B', when: 'a' },
        { from: 'B', to: 'C', when: 'b' },
        { from: 'C', to: 'D', when: 'c' },
        { from: 'D', to: 'E', when: 'd' },
      ];
      const initial = 'A';
      const finals = ['D', 'E'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['A', 'B', 'C', 'D'];
      const alphabet_ = ['0', '1'];
      const transitions_ = [
        { from: 'A', to: 'B', when: 'a' },
        { from: 'B', to: 'C', when: 'b' },
        { from: 'C', to: 'D', when: 'c' },
      ];
      const initial_ = 'A';
      const finals_ = ['D'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = intersection(fsm, fsm_);
      expect(await newFsm.recognize('abc')).toBeTruthy();
      expect(await newFsm.recognize('abcd')).toBeFalsy();
    });

    it('should intersect two FSM #5', async () => {
      const states = ['A', 'B', 'C'];
      const alphabet = ['a', 'b'];
      const transitions = [
        { from: 'A', to: 'B', when: 'a' },
        { from: 'A', to: 'A', when: 'b' },
        { from: 'B', to: 'C', when: 'a' },
        { from: 'B', to: 'B', when: 'b' },
        { from: 'C', to: 'A', when: 'a' },
        { from: 'C', to: 'C', when: 'b' },
      ];

      const initial = 'C';
      const finals = ['A', 'B'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['A', 'B'];
      const alphabet_ = ['a', 'b'];
      const transitions_ = [
        { from: 'A', to: 'A', when: 'a' },
        { from: 'A', to: 'B', when: 'b' },
        { from: 'B', to: 'B', when: 'a' },
        { from: 'B', to: 'A', when: 'b' },
      ];
      const initial_ = 'A';
      const finals_ = ['A'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = intersection(fsm, fsm_);
      expect(await newFsm.recognize('babbababab')).toBeTruthy();
    });

    it('should apply difference for FSM #1', async () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'A', to: 'A', when: '0' },
        { from: 'A', to: 'B', when: '1' },
        { from: 'B', to: 'D', when: '0' },
        { from: 'B', to: 'C', when: '1' },
        { from: 'C', to: 'A', when: '0' },
        { from: 'C', to: 'B', when: '1' },
        { from: 'D', to: 'B', when: '0' },
        { from: 'D', to: 'D', when: '1' },
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

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
      const newFsm = difference(fsm, fsm_);
      expect(await newFsm.recognize('11')).toBeTruthy();
      expect(await newFsm.recognize('110')).toBeFalsy();
    });

    it('should apply difference for FSM #2', async () => {
      const states = ['Q0', 'Q1', 'Q2'];
      const alphabet = ['a', 'b', 'c'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: 'a' },
        { from: 'Q1', to: 'Q2', when: 'b' },
        { from: 'Q2', to: 'Q0', when: 'c' },
      ];
      const initial = 'Q0';
      const finals = ['Q0'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      const states_ = ['Q0', 'Q1', 'Q2'];
      const alphabet_ = ['a', 'b'];
      const transitions_ = [
        { from: 'Q0', to: 'Q1', when: 'a' },
        { from: 'Q1', to: 'Q2', when: 'b' },
      ];
      const initial_ = 'Q0';
      const finals_ = ['Q2'];
      const fsm_ = new FSM(states_, alphabet_, transitions_, initial_, finals_);

      const newFsm = difference(fsm, fsm_);
      expect(await newFsm.recognize('')).toBeTruthy();
      expect(await newFsm.recognize('ab')).toBeFalsy();
      expect(await newFsm.recognize('abc')).toBeTruthy();
    });

    it('should reverse FSM #1', async () => {
      const states = ['Q0', 'Q1', 'Q2'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: '0' },
        { from: 'Q1', to: 'Q2', when: '1' },
      ];

      const initial = 'Q0';
      const finals = ['Q2'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      reverse(fsm);
      expect(await fsm.recognize('10')).toBeTruthy();
    });

    it('should reverse FSM #2', async () => {
      const states = ['Q0', 'Q1'];
      const alphabet = ['0'];
      const transitions = [{ from: 'Q0', to: 'Q1', when: '0' }];
      const initial = 'Q0';
      const finals = ['Q1'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      reverse(fsm);
      expect(await fsm.recognize('0')).toBeTruthy();
    });

    it('should reverse FSM #3', async () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'A', to: 'A', when: '0' },
        { from: 'A', to: 'B', when: '1' },
        { from: 'B', to: 'D', when: '0' },
        { from: 'B', to: 'C', when: '1' },
        { from: 'C', to: 'A', when: '0' },
        { from: 'C', to: 'B', when: '1' },
        { from: 'D', to: 'B', when: '0' },
        { from: 'D', to: 'D', when: '1' },
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      reverse(fsm);
      expect(await fsm.recognize('11')).toBeTruthy();
    });

    it('should reverse FSM #4', async () => {
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
      expect(await fsm.recognize('bcb')).toBeTruthy();
      reverse(fsm);
      expect(await fsm.recognize('bcb')).toBeTruthy();
      reverse(fsm);
      expect(await fsm.recognize('bcb')).toBeTruthy();
    });

    it('should reverse FSM #5', async () => {
      const states = ['Q0', 'Q1'];
      const alphabet = ['a', 'b'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: 'a' },
        { from: 'Q1', to: 'Q0', when: 'b' },
      ];
      const initial = 'Q0';
      const finals = ['Q0'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      reverse(fsm);
      expect(await fsm.recognize('')).toBeTruthy();
      expect(await fsm.recognize('ba')).toBeTruthy();
      expect(await fsm.recognize('baba')).toBeTruthy();
    });

    it('should negate FSM #1', async () => {
      const states = ['Q0', 'Q1', 'Q2'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'Q0', to: 'Q1', when: '0' },
        { from: 'Q1', to: 'Q2', when: '1' },
      ];
      const initial = 'Q0';
      const finals = ['Q2'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      negation(fsm);
      expect(await fsm.recognize('0')).toBeTruthy();
      expect(await fsm.recognize('1')).toBeTruthy();
      expect(await fsm.recognize('01')).toBeFalsy();
    });

    it('should negate FSM #2', async () => {
      const states = ['Q0', 'Q1'];
      const alphabet = ['0'];
      const transitions = [{ from: 'Q0', to: 'Q1', when: '0' }];
      const initial = 'Q0';
      const finals = ['Q1'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      negation(fsm);
      expect(await fsm.recognize('')).toBeTruthy();
      expect(await fsm.recognize('0')).toBeFalsy();
    });

    it('should negate FSM #3', async () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'A', to: 'A', when: '0' },
        { from: 'A', to: 'B', when: '1' },
        { from: 'B', to: 'D', when: '0' },
        { from: 'B', to: 'C', when: '1' },
        { from: 'C', to: 'A', when: '0' },
        { from: 'C', to: 'B', when: '1' },
        { from: 'D', to: 'B', when: '0' },
        { from: 'D', to: 'D', when: '1' },
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      negation(fsm);
      expect(await fsm.recognize('0')).toBeTruthy();
      expect(await fsm.recognize('010')).toBeTruthy();
      expect(await fsm.recognize('11')).toBeFalsy();
    });

    it('should obtain initial FSM when negate twice', async () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['0', '1'];
      const transitions = [
        { from: 'A', to: 'A', when: '0' },
        { from: 'A', to: 'B', when: '1' },
        { from: 'B', to: 'D', when: '0' },
        { from: 'B', to: 'C', when: '1' },
        { from: 'C', to: 'A', when: '0' },
        { from: 'C', to: 'B', when: '1' },
        { from: 'D', to: 'B', when: '0' },
        { from: 'D', to: 'D', when: '1' },
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      negation(fsm);
      negation(fsm);
      expect(await fsm.recognize('11')).toBeTruthy();
    });

    it('should obtain a closure for FSM #1', async () => {
      const states = ['A', 'B', 'C'];
      const alphabet = ['a', 'b'];
      const transitions = [
        { from: 'A', to: 'B', when: 'a' },
        { from: 'B', to: 'C', when: 'b' },
      ];
      const initial = 'A';
      const finals = ['C'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      closure(fsm);
      expect(await fsm.recognize('')).toBeTruthy();
      expect(await fsm.recognize('abab')).toBeTruthy();
    });

    it('should obtain a closure for FSM #2', async () => {
      const states = ['A'];
      const alphabet = ['a'];
      const transitions = [{ from: 'A', to: 'A', when: 'a' }];
      const initial = 'A';
      const finals = ['A'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      closure(fsm);
      expect(await fsm.recognize('')).toBeTruthy();
      expect(await fsm.recognize('a')).toBeTruthy();
      expect(await fsm.recognize('aa')).toBeTruthy();
    });

    it('should obtain a closure for FSM #3', async () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['a', 'b', 'c'];
      const transitions = [
        { from: 'A', to: 'B', when: 'a' },
        { from: 'A', to: 'C', when: 'b' },
        { from: 'A', to: 'D', when: 'c' },
      ];
      const initial = 'A';
      const finals = ['B', 'C', 'D'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      closure(fsm);
      expect(await fsm.recognize('')).toBeTruthy();
      expect(await fsm.recognize('a')).toBeTruthy();
      expect(await fsm.recognize('bcaba')).toBeTruthy();
    });

    it('should obtain a closure for a(ba)*', async () => {
      const states = ['A', 'B', 'C', 'D'];
      const alphabet = ['a', 'b', 'c'];
      const transitions = [
        { from: 'A', to: 'B', when: 'a' },
        { from: 'B', to: 'C', when: 'b' },
        { from: 'C', to: 'B', when: 'a' },
      ];
      const initial = 'A';
      const finals = ['B'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);

      expect(await fsm.recognize('a')).toBeTruthy();
      expect(await fsm.recognize('aba')).toBeTruthy();
      expect(await fsm.recognize('abab')).toBeFalsy();
      expect(await fsm.recognize('ababa')).toBeTruthy();
      closure(fsm);
      fsm.minimize();
      expect(await fsm.recognize('')).toBeTruthy();
      expect(await fsm.recognize('aaaab')).toBeFalsy();
      expect(await fsm.recognize('aaaaaba')).toBeTruthy();
      expect(await fsm.recognize('aabababaaa')).toBeTruthy();
    });
  });
});
