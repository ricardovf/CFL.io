import * as R from 'ramda';

export const EPSILON = '&';
export const SEPARATOR = '|';
export const DERIVATION = '->';

const NON_TERMINAL_REGEXP = /^[A-Z]+[0-9]*$/;
const TERMINAL_EXCEPTIONS_REGEXP = /[A-Z|\s]|\->/;

const SymbolValidator = {
  // Everything that does not contains UPPERCASE and is not empty or special grammar character is valid terminal
  isValidTerminal: terminal => {
    return (
      terminal !== undefined &&
      typeof terminal === 'string' &&
      terminal.trim() !== '' &&
      !TERMINAL_EXCEPTIONS_REGEXP.test(terminal)
    );
  },
  isValidNonTerminal: nonTerminal => {
    return (
      nonTerminal !== undefined &&
      typeof nonTerminal === 'string' &&
      NON_TERMINAL_REGEXP.test(nonTerminal)
    );
  },
  isEpsilon: str => {
    return str === EPSILON;
  },
  isValidTerminalOrNonTerminal: symbol => {
    return (
      SymbolValidator.isValidTerminal(symbol) ||
      SymbolValidator.isValidNonTerminal(symbol)
    );
  },
};

export default SymbolValidator;
