import Grammar from './Grammar';
import { ACCEPT_STATE, EPSILON } from './SymbolValidator';

describe('Grammar', () => {
  describe('fromText', () => {
    it('should return invalid Grammar when empty text', () => {
      expect(Grammar.fromText('  ').isValid()).toBeFalsy();
      expect(Grammar.fromText('      ').isValid()).toBeFalsy();
      expect(Grammar.fromText('        ').isValid()).toBeFalsy();
      expect(Grammar.fromText('     \n   ').isValid()).toBeFalsy();
      expect(Grammar.fromText('  \r   \n   ').isValid()).toBeFalsy();
    });

    it('should return an invalid grammar on bad formed input', () => {
      expect(Grammar.fromText(`Sa -> a | aS`).isValid()).toBeFalsy();
      expect(Grammar.fromText(`S - a`).isValid()).toBeFalsy();
      expect(Grammar.fromText(`S -> S`).isValid()).toBeFalsy();
      expect(Grammar.fromText(`S a`).isValid()).toBeFalsy();
      expect(Grammar.fromText(`S -> aSS`).isValid()).toBeFalsy();
      expect(Grammar.fromText(`S -> aa`).isValid()).toBeFalsy();
      expect(
        Grammar.fromText(
          `S -> aB
          B -> S`
        ).isValid()
      ).toBeFalsy();
      expect(
        Grammar.fromText(
          `S -> a    |bS | aB
          ç
          B -> b | S`
        ).isValid()
      ).toBeFalsy();
    });

    it('should return an valid grammar when missing non terminals productions', () => {
      expect(Grammar.fromText(`S -> aSB`).isValid()).toBeFalsy();
      expect(
        Grammar.fromText(
          `S -> a | aB
          B->aC|aS`
        ).isValid()
      ).toBeTruthy();
    });

    it('should return an invalid grammar S and epsilon exits on right side', () => {
      expect(Grammar.fromText(`S -> a | aS | &`).isValid()).toBeFalsy();
    });

    it('should return an valid grammar when there is terminal and non terminal recursive', () => {
      expect(Grammar.fromText(`S -> aS`).isValid()).toBeTruthy();
    });

    it('should return an invalid grammar when there is terminal and non terminal recursive and epsilon', () => {
      expect(Grammar.fromText(`S -> a | aS | &`).isValid()).toBeFalsy();
    });

    it('should return an valid grammar when there is terminal epsilon', () => {
      expect(Grammar.fromText(`S -> a | &`).isValid()).toBeTruthy();
    });

    it('should return valid grammar on simple regular grammar without epsilon', () => {
      // expect(Grammar.fromText(`S -> a | aS`).isValid()).toBeTruthy();
      // expect(Grammar.fromText(`S -> a`).isValid()).toBeTruthy();
      expect(
        Grammar.fromText(
          `S -> a    |bS | aB

          B -> b | aS`
        ).isValid()
      ).toBeTruthy();
    });

    it('should return valid grammar on simple regular grammar with epsilon', () => {
      expect(Grammar.fromText(`S -> a | ${EPSILON} `).isValid()).toBeTruthy();
      expect(Grammar.fromText(`S -> ${EPSILON}`).isValid()).toBeTruthy();
      expect(
        Grammar.fromText(
          `S -> a | bB | ${EPSILON}
          B -> b | c`
        ).isValid()
      ).toBeTruthy();
    });

    it('should return an invalid grammar on simple regular grammar with epsilon not on the correct form', () => {
      expect(Grammar.fromText(`S -> aS | ${EPSILON} `).isValid()).toBeFalsy();
      expect(
        Grammar.fromText(`S -> ${EPSILON}${EPSILON}`).isValid()
      ).toBeFalsy();
      expect(
        Grammar.fromText(`${EPSILON} -> a | a${EPSILON}`).isValid()
      ).toBeFalsy();
      expect(
        Grammar.fromText(
          `S -> a | bB | ${EPSILON}
          B -> b | cS`
        ).isValid()
      ).toBeFalsy();
      expect(
        Grammar.fromText(
          `S -> a | bB
          B -> b | c | ${EPSILON}`
        ).isValid()
      ).toBeFalsy();
    });

    describe('fsm', () => {
      it('should return valid fsm on a pair language', () => {
        const grammar = Grammar.fromText(`S -> aB\nB -> aS | a`);
        const fsm = grammar.getFSM();

        expect(grammar.isValid()).toBeTruthy();
        expect(fsm).toBeDefined();
        expect(fsm.states).toEqual(['S', 'B', ACCEPT_STATE]);
        expect(fsm.alphabet).toEqual(['a']);
        expect(fsm.initial).toEqual('S');
        expect(fsm.finals).toEqual([ACCEPT_STATE]);
        expect(fsm.transitions).toEqual([
          { from: 'S', to: 'B', when: 'a' },
          { from: 'B', to: 'S', when: 'a' },
          { from: 'B', to: ACCEPT_STATE, when: 'a' },
        ]);
      });

      it('should return valid fsm on a pair language with epsilon', () => {
        const grammar = Grammar.fromText(`M -> aB|&\nS -> aB\nB -> aS | a`);
        const fsm = grammar.getFSM();

        expect(grammar.isValid()).toBeTruthy();
        expect(fsm).toBeDefined();
        expect(fsm.states).toEqual(['M', 'B', 'S', ACCEPT_STATE]);
        expect(fsm.alphabet).toEqual([EPSILON, 'a']);
        expect(fsm.initial).toEqual('M');
        expect(fsm.finals).toEqual(['M', ACCEPT_STATE]);
        expect(fsm.transitions).toEqual([
          { from: 'M', to: 'B', when: 'a' },
          { from: 'M', to: ACCEPT_STATE, when: '&' },
          { from: 'S', to: 'B', when: 'a' },
          { from: 'B', to: 'S', when: 'a' },
          { from: 'B', to: ACCEPT_STATE, when: 'a' },
        ]);
      });
    });
  });
});
