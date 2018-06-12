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
  });
});
