import SymbolValidator, {
  EPSILON,
  makeNewUniqueStateName,
  STATES_NAMES,
} from './SymbolValidator';

describe('SymbolValidator', () => {
  describe('Terminals', () => {
    it('should accept valid terminals', () => {
      expect(SymbolValidator.isValidTerminal(EPSILON)).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('a')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('b')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('c')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('z')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('0')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('1')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('8')).toBeTruthy();
      expect(SymbolValidator.isValidTerminal('9')).toBeTruthy();
    });

    it('should reject invalid terminals', () => {
      expect(SymbolValidator.isValidTerminal('A')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('B')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('C')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('ã ')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('é')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal(' ')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('121')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('aa')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('.')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('bbb')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('ab')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('01')).toBeFalsy();
      expect(SymbolValidator.isValidTerminal('10')).toBeFalsy();
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
    });

    it('should reject invalid non terminals', () => {
      expect(SymbolValidator.isValidNonTerminal('a')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('b')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('c')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('z')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('ã ')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('.')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('é')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal(' ')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('121')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('aa')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('bbb')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('ab')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('01')).toBeFalsy();
      expect(SymbolValidator.isValidNonTerminal('10')).toBeFalsy();
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

  describe('makeNewUniqueStateName', () => {
    it('should generate new symbols always', () => {
      expect(makeNewUniqueStateName()).toEqual('A');
      expect(makeNewUniqueStateName(['A'])).toEqual('B');
      expect(makeNewUniqueStateName(['A', 'B'])).toEqual('C');
      expect(makeNewUniqueStateName(['A', 'B', 'C'])).toEqual('D');
      expect(makeNewUniqueStateName(['A', 'C'])).toEqual('B');
    });

    it('should generate new symbols starting with q + an index when there is no more option', () => {
      expect(makeNewUniqueStateName([...STATES_NAMES])).toEqual('Q0');
      expect(makeNewUniqueStateName([...STATES_NAMES, 'Q0'])).toEqual('Q1');
      expect(makeNewUniqueStateName([...STATES_NAMES, 'Q0', 'Q1'])).toEqual(
        'Q2'
      );
    });
  });
});
