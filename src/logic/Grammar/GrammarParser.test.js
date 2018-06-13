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
            `   S  -     > a    |        b        S | aB
          ç




          BC ->        b |      S     | D

          D -> a

          `
          )
          .trim()
      ).toBe(`S->a|bS|aB\nç\nBC->b|S|D\nD->a`);
    });

    it('should return trim double spaces and double new lines on any type of grammar with epsilon', () => {
      expect(
        parser
          .setInput(
            `  S -> a |     bB | ${EPSILON}
              B -> b | c \t`
          )
          .trim()
      ).toBe(`S->a|bB|${EPSILON}\nB->b|c`);
    });
  });

  describe('parser', () => {
    it('should not extract elements if grammar is malformed', () => {
      parser.setInput('S->a|bS|aB\nC\nBC->b|S|D\nD->a').run();

      expect(parser.initialSymbol()).toBeNull();
    });

    it('should extract the first symbol correctly', () => {
      parser.setInput('S->a|bS|aB|c|d|e|aF\nB->b|a').run();

      expect(parser.initialSymbol()).toBe('S');
    });

    it('should extract remove repeated rules', () => {
      parser.setInput('S->a|bS|aB|c|c|d|e|aF\nB->b|a|a\nB->b').run();

      const rules = parser.rules();
      expect(rules.B.length).toBe(2);
      expect(rules.S.length).toBe(7);
    });

    it('should extract the terminals symbol correctly ordered', () => {
      parser.setInput('S->a|bS|aB|c|d|e|aF\nB->b|a').run();

      expect(parser.terminals()).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('should extract the terminals symbol correctly when there is only terminalNonTerminal form', () => {
      parser.setInput('S->aS').run();

      expect(parser.terminals()).toEqual(['a']);
    });

    it('should extract the terminals symbol correctly ordered including epsilon', () => {
      parser.setInput('S->a|bS|aB|&|c|d|&|aF\nB->b|a').run();

      expect(parser.terminals()).toEqual(['&', 'a', 'b', 'c', 'd']);
    });

    it('should extract the non terminals symbol correctly with the first symbol first', () => {
      parser.setInput('S->a|bS|aB|c|d|e|aF\nB->b|a').run();

      expect(parser.nonTerminals()).toEqual(['S', 'B', 'F']);
    });

    it('should extract the rules correctly', () => {
      parser.setInput('S->a|bS|a|bS').run();

      const rules = parser.rules();

      expect(rules.S).toContain('a');
      expect(rules.S).toContain('bS');
      expect(rules.S.length).toBe(2);
    });

    describe('CFL', () => {
      it('should accept terminals as any non UPPERCASE character(s) separated by space(s)', () => {
        parser.setInput(`S -> ola | id S | + | - | / * | ( id )`).run();

        const rules = parser.rules();

        expect(parser.terminals()).toEqual([
          'ola',
          'id',
          '+',
          '-',
          '/',
          '*',
          '(',
          ')',
        ]);

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

        expect(parser.terminals()).toEqual(['a', 'b']);

        expect(parser.nonTerminals()).toEqual(['S', 'A1', 'A2', 'B']);
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

        expect(parser.terminals()).toEqual([
          '+',
          '-',
          '*',
          '/',
          '(',
          ')',
          'id',
        ]);

        expect(parser.nonTerminals()).toEqual(['E', 'T', 'F']);
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

        expect(parser.terminals()).toEqual(['+', '*', '(', ')', 'id', EPSILON]);

        expect(parser.nonTerminals()).toEqual(['E', 'E1', 'T', 'T1', 'F']);
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
