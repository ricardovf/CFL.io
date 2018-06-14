import GrammarParser from './GrammarParser';
import { EPSILON } from '../SymbolValidator';

describe('GrammarParser', () => {
  const parser = new GrammarParser();

  describe('trim', () => {
    it('should correctly trim double spaces and double new lines', () => {
      expect(parser.setInput('  ').trim()).toBe('');
      expect(parser.setInput('      ').trim()).toBe('');
      expect(parser.setInput('        ').trim()).toBe('');
      expect(parser.setInput('     \n   ').trim()).toBe('');
      expect(parser.setInput('  \r   \n   ').trim()).toBe('');
    });

    it('should return trim double spaces and double new lines on any type of grammar', () => {
      expect(
        parser
          .setInput(
            `   S  -     > a    |        b        S | a B
          ç




          C ->        b |      S     | D

          D -> a

          `
          )
          .trim()
      ).toBe(`S - > a | b S | a B\nç\nC -> b | S | D\nD -> a`);
    });

    it('should return trim double spaces and double new lines on any type of grammar with epsilon', () => {
      expect(
        parser
          .setInput(
            `  S -> a |     b B | ${EPSILON}
              B -> b | c \t`
          )
          .trim()
      ).toBe(`S -> a | b B | ${EPSILON}\nB -> b | c`);
    });
  });

  describe('parser', () => {
    it('should not extract elements if grammar is malformed', () => {
      parser.setInput('S->a|bS|aB\nC\nBC->b|S|D\nD->a').run();

      expect(parser.initialSymbol()).toBeNull();
    });

    it('should extract the first symbol correctly', () => {
      parser.setInput('S->a|b S|a B|c|d|e|a F\nB->b|a').run();

      expect(parser.initialSymbol()).toBe('S');
    });

    it('should remove repeated rules in a simple grammar', () => {
      parser.setInput('B->b|a|a\nB->b').run();

      const rules = parser.rules();
      expect(rules.B).toEqual(['a', 'b']);
    });

    it('should extract remove repeated rules', () => {
      parser.setInput('S->a|b S|a B|c|c|d|a B|e|a F\nB->b|a|a\nB->b').run();

      const rules = parser.rules();
      expect(rules.B).toEqual(['a', 'b']);

      expect(rules.B.length).toBe(2);
      expect(rules.S.length).toBe(7);
      expect(rules.S).toContain('a');
      expect(rules.S).toContain('b S');
      expect(rules.S).toContain('a B');
      expect(rules.S).toContain('a F');
    });

    it('should extract the terminals symbol correctly ordered', () => {
      parser.setInput('S->a|b S|a B|c|d|e|a F\nB->b|a').run();

      expect(parser.terminals()).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('should extract the terminals symbol correctly when there is only terminalNonTerminal form', () => {
      parser.setInput('S->a S').run();

      expect(parser.terminals()).toEqual(['a']);
    });

    it('should extract the terminals symbol correctly ordered including epsilon', () => {
      parser.setInput('S->a|b S|a B|&|c|d|&|a F\nB->b|a').run();

      expect(parser.terminals()).toEqual(['&', 'a', 'b', 'c', 'd']);
    });

    it('should extract the non terminals symbol correctly with the first symbol first', () => {
      parser.setInput('S->a|b S|a B|c|d|e|a F\nB->b|a').run();

      expect(parser.nonTerminals()).toEqual(['B', 'F', 'S']);
    });

    it('should extract the rules correctly', () => {
      parser.setInput('S->a|b S|a|b S|a B').run();

      const rules = parser.rules();

      expect(rules.S).toContain('a');
      expect(rules.S).toContain('b S');
      expect(rules.S).toContain('a B');
      expect(rules.S.length).toBe(3);

      expect(parser.terminals()).toEqual(['a', 'b']);
      expect(parser.nonTerminals()).toEqual(['B', 'S']);
    });

    it('should not extract the rules of an invalid grammar', () => {
      parser.setInput('S -> aSS').run();

      expect(parser.terminals()).toHaveLength(0);
      expect(parser.nonTerminals()).toHaveLength(0);
      expect(parser.initialSymbol()).toBeNull();
      expect(parser.rules()).toEqual({});
    });

    it('should only accept epsilon alone', () => {
      parser.setInput('S -> & A | a | a S').run();

      expect(parser.terminals()).toHaveLength(0);
      expect(parser.nonTerminals()).toHaveLength(0);
      expect(parser.initialSymbol()).toBeNull();
      expect(parser.rules()).toEqual({});
    });

    it('should accept epsilon if it is alone', () => {
      parser.setInput('S -> & |A | a | a S').run();

      expect(parser.terminals()).toEqual([EPSILON, 'a']);
      expect(parser.nonTerminals()).toEqual(['A', 'S']);
      expect(parser.initialSymbol()).toEqual('S');
      expect(parser.rules().S).toEqual([EPSILON, 'A', 'a', 'a S'].sort());
    });

    describe('CFL', () => {
      it('should accept terminals as any non UPPERCASE character(s) separated by space(s)', () => {
        parser.setInput(`S -> ola | id S | + | - | / * | ( id )`).run();

        const rules = parser.rules();

        expect(parser.terminals()).toEqual(
          ['ola', 'id', '+', '-', '/', '*', '(', ')'].sort()
        );

        expect(parser.nonTerminals()).toEqual(['S']);
        expect(parser.initialSymbol()).toEqual('S');

        expect(rules.S).toContain('ola');
        expect(rules.S).toContain('id S');
        expect(rules.S).toContain('+');
        expect(rules.S).toContain('-');
        expect(rules.S).toContain('/ *');
        expect(rules.S).toContain('( id )');
        expect(rules.S.length).toBe(6);
      });

      it('should accept non terminals as UPPERCASE plus zero or more digits', () => {
        parser
          .setInput(
            `S -> A1 | A2 B | a A1 b A2
            A1 -> abc | S A1
            A2 -> A2 | a S
            B -> b`
          )
          .run();

        const rules = parser.rules();

        expect(parser.terminals()).toEqual(['a', 'abc', 'b']);

        expect(parser.nonTerminals()).toEqual(['S', 'A1', 'A2', 'B'].sort());
        expect(parser.initialSymbol()).toEqual('S');

        expect(rules.S).toContain('A1');
        expect(rules.S).toContain('A2 B');
        expect(rules.S).toContain('a A1 b A2');
        expect(rules.S.length).toBe(3);

        expect(rules.A1).toContain('abc');
        expect(rules.A1).toContain('S A1');
        expect(rules.A1.length).toBe(2);

        expect(rules.A2).toContain('A2');
        expect(rules.A2).toContain('a S');
        expect(rules.A2.length).toBe(2);

        expect(rules.B).toContain('b');
        expect(rules.B.length).toBe(1);
      });

      it('should work on example 1 given on work', () => {
        parser
          .setInput(
            `E -> E + T | E - T | T
            T -> T * F | T / F | F
            F -> ( E ) | id`
          )
          .run();

        const rules = parser.rules();

        expect(parser.terminals()).toEqual(
          ['+', '-', '*', '/', '(', ')', 'id'].sort()
        );

        expect(parser.nonTerminals()).toEqual(['E', 'T', 'F'].sort());
        expect(parser.initialSymbol()).toEqual('E');

        expect(rules.E).toContain('E + T');
        expect(rules.E).toContain('E - T');
        expect(rules.E).toContain('T');
        expect(rules.E.length).toBe(3);

        expect(rules.T).toContain('T * F');
        expect(rules.T).toContain('T / F');
        expect(rules.T).toContain('F');
        expect(rules.T.length).toBe(3);

        expect(rules.F).toContain('( E )');
        expect(rules.F).toContain('id');
        expect(rules.F.length).toBe(2);
      });

      it('should work on example 2 given on work', () => {
        parser
          .setInput(
            `E -> T E1
            E1 -> + T E1 | &
             T -> F T1
            T1 -> * F T1 | &
            F -> ( E ) | id`
          )
          .run();

        const rules = parser.rules();

        expect(parser.terminals()).toEqual(
          ['+', '*', '(', ')', 'id', EPSILON].sort()
        );

        expect(parser.nonTerminals()).toEqual(
          ['E', 'E1', 'T', 'T1', 'F'].sort()
        );
        expect(parser.initialSymbol()).toEqual('E');

        expect(rules.E).toContain('T E1');
        expect(rules.E.length).toBe(1);

        expect(rules.E1).toContain('+ T E1');
        expect(rules.E1).toContain(EPSILON);
        expect(rules.E1.length).toBe(2);

        expect(rules.T).toContain('F T1');
        expect(rules.T.length).toBe(1);

        expect(rules.T1).toContain('* F T1');
        expect(rules.T1).toContain(EPSILON);
        expect(rules.T1.length).toBe(2);

        expect(rules.F).toContain('( E )');
        expect(rules.F).toContain('id');
        expect(rules.F.length).toBe(2);
      });
    });
  });
});
