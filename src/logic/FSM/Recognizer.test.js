import Grammar from '../Grammar';
import { EPSILON } from '../SymbolValidator';
import FSM from '../FSM';

describe('FSM', () => {
  describe('recognize', () => {
    it('should recognize a really simple language', async () => {
      const fsm = Grammar.fromText(`S -> a`).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize('a')).toBeTruthy();
      expect(await fsm.recognize('')).toBeFalsy();
      expect(await fsm.recognize('aa')).toBeFalsy();
      expect(await fsm.recognize('aaa')).toBeFalsy();
      expect(await fsm.recognize('aaaa')).toBeFalsy();
    });

    it('should recognize empty sentence on a really simple language', async () => {
      const fsm = Grammar.fromText(`S -> a | &`).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize('')).toBeTruthy();
    });

    it('should recognize aa pairs on an aa pairs language', async () => {
      const fsm = Grammar.fromText(`S -> aB\nB -> aS | a`).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize('aa')).toBeTruthy();
      expect(await fsm.recognize('aaaa')).toBeTruthy();
      expect(await fsm.recognize('aaaaaa')).toBeTruthy();
    });

    it('should recognize aa pairs on an aa pairs language with multiples ways', async () => {
      const fsm = Grammar.fromText(
        `S -> aC | aB \nB -> aS | a\nC -> aC`
      ).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize('aa')).toBeTruthy();
      expect(await fsm.recognize('aaaa')).toBeTruthy();
      expect(await fsm.recognize('aaaaaa')).toBeTruthy();
    });

    it('should recognize aa pairs on an aa pairs language that has epsilon', async () => {
      const fsm = Grammar.fromText(
        `Z -> aB | ${EPSILON}\nS -> aB\nB -> aS | a`
      ).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize(EPSILON)).toBeFalsy();
      expect(await fsm.recognize('')).toBeTruthy();
      expect(await fsm.recognize('aa')).toBeTruthy();
      expect(await fsm.recognize('aaaa')).toBeTruthy();
      expect(await fsm.recognize('aaaaaa')).toBeTruthy();
    });

    it('should NOT recognize even a`s or epsilon on a aa pairs language', async () => {
      const fsm = Grammar.fromText(`S -> aB\nB -> aS | a`).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize(EPSILON)).toBeFalsy();
      expect(await fsm.recognize('')).toBeFalsy();
      expect(await fsm.recognize('a')).toBeFalsy();
      expect(await fsm.recognize('aaa')).toBeFalsy();
      expect(await fsm.recognize('aaaaa')).toBeFalsy();
    });

    it('should NOT recognize anything on a grammar that generates and empty language', async () => {
      const fsm = Grammar.fromText(`S -> aB\nB -> aS`).getFSM();

      expect(fsm).toBeDefined();
      expect(await fsm.recognize(EPSILON)).toBeFalsy();
      expect(await fsm.recognize('')).toBeFalsy();
      expect(await fsm.recognize('a')).toBeFalsy();
      expect(await fsm.recognize('aa')).toBeFalsy();
      expect(await fsm.recognize('aaa')).toBeFalsy();
      expect(await fsm.recognize('aaaa')).toBeFalsy();
      expect(await fsm.recognize('aaaaa')).toBeFalsy();
    });

    it('should accept empty language when there is epsilon transitions to final states', async () => {
      const states = ['S', 'B', 'O', 'Z'];
      const alphabet = [EPSILON, 'a'];
      const transitions = [
        { from: 'S', to: 'B', when: 'a' },
        { from: 'S', to: 'Z', when: EPSILON },
        { from: 'B', to: 'S', when: 'a' },
        { from: 'B', to: 'O', when: 'a' },
      ];
      const initial = 'S';
      const finals = ['Z'];
      const fsm = new FSM(states, alphabet, transitions, initial, finals);
      expect(fsm.generate(1)).toEqual(['']);
      expect(fsm.acceptsEmptySentence()).toBeTruthy();
    });
  });
});
