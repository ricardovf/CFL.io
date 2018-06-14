import SymbolValidator, { EPSILON } from './SymbolValidator';

describe('SymbolValidator', () => {
  describe('Terminals', () => {
    it('should accept valid terminals', () => {
      expect(SymbolValidator.isValidTerminal(EPSILON)).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('a')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('aaaa')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('b')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('bbababaac')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('c')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('caa000aaaa011')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('z')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('0')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('1')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('8aaadccc')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('8')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('82828')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('118')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('0001')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('9')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('+')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('-')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('/')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('*')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('(')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal(')')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('aaa-0011cc')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('aaa>>aa')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('>')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('a..a')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('ã')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('aaaéebb')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('ação')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('olá')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('olá001')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('.')).toBeTruthy();
    });

    it('should reject invalid terminals', () => {
      expect(SymbolValidator.isValidTerminal('A')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('B')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('C')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('C0')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('C1')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('AAC')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('aaa->aa')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('a|b')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal(' ')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('  ')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('aSS')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('0S')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('abSc')).toBeFalsy();
    });
  });

  describe('Non terminals', () => {
    it('should accept valid non terminals', () => {
      expect(SymbolValidator.isValidNonTerminal('A')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('B')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('C')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('E')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('Y')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('Z')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('Z0')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('ABC1')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('ABC10')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('ABC1112')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('ABC0001')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('ABC0001')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('T1')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('E1')).toBeTruthy();
      expect(SymbolValidator.isValidNonTerminal('E2')).toBeTruthy();
    });

    it('should reject invalid non terminals', () => {
      expect(SymbolValidator.isValidNonTerminal(EPSILON)).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal(' ')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('  ')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('a1')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('Aa')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('Aa1')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('A 1')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('a')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('b')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('c')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('z')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('ã ')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('.')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('é')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('121')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('aa')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('bbb')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('ab')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('ação')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('01')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('10')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('aA')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('0AA')).toBeFalsy();
    });
  });

  describe('Epsilon', () => {
    it('should accept valid epsilon', () => {
      expect(SymbolValidator.isEpsilon(EPSILON)).toBeTruthy();
    });

    it('should reject invalid epsilon', () => {
      expect(SymbolValidator.isEpsilon('a')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('b')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('c')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('C')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('A')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('B')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('z')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('ã ')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('.')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('é')).toBeFalsy();
      expect(SymbolValidator.isEpsilon(' ')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('121')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('aa')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('bbb')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('ab')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('01')).toBeFalsy();
      expect(SymbolValidator.isEpsilon('10')).toBeFalsy();
    });
  });
});
