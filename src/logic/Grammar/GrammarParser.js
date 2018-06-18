import { multiTrim, removeDoubleSpaces } from '../helpers';
import SymbolValidator, {
  DERIVATION,
  EPSILON,
  SEPARATOR,
} from '../SymbolValidator';
import * as R from 'ramda';

export default class GrammarParser {
  constructor(input = '') {
    this.input = input;
  }

  /**
   * @param input
   * @return {boolean}
   */
  changed(input) {
    return input !== this._originalInput;
  }

  /**
   * @return {String}
   */
  get input() {
    return this._input;
  }

  setInput(input) {
    this.input = input;
    return this;
  }

  set input(input) {
    if (this.changed(input)) {
      this._originalInput = input;

      if (typeof input !== 'string' || input === undefined || input === null) {
        input = '';
      }

      this._input = input;
      this._resetElements();
    }
  }

  _resetElements() {
    this.Vn = [];
    this.Vt = [];
    this.P = {};
    this.S = null;
  }

  /**
   * @param input
   * @return {GrammarParser}
   */
  run(input = undefined) {
    if (input !== undefined) {
      this.input = input;
    }

    this.trim();
    this._extractElements();

    return this;
  }

  /**
   * Will extract the elements of the grammar only if all lines and all productions are valid
   *
   * @private
   */
  _extractElements() {
    const lines = this._input.split('\n');
    let P = {},
      S = undefined,
      validLines = 0;

    // For each line of the grammar we extract productions
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      // Breaks in two parts using the -> separator, should result in two parts
      let [left, right] = lines[lineIndex].split(DERIVATION);

      if (left === undefined || right === undefined) continue;

      left = left.trim();
      right = right.trim();

      // If left is not a Non Terminal, we abort
      if (!SymbolValidator.isValidNonTerminal(left)) continue;

      // Break the right into productions
      let productions = right.split(SEPARATOR);
      let validProductions = 0;

      // If we do not have productions on this line, abort
      if (productions.length === 0) continue;

      // Extract productions in the form a b C
      productions.forEach(production => {
        const productionSymbols = production
          .trim()
          .split(' ')
          .map(s => s.trim());

        // If symbols include & it is not the only production, we abort
        if (
          productionSymbols.includes(EPSILON) &&
          productionSymbols.length !== 1
        )
          return;

        if (
          R.all(SymbolValidator.isValidTerminalOrNonTerminal)(productionSymbols)
        ) {
          if (P[left] === undefined) P[left] = [];
          P[left].push(productionSymbols.join(' '));
          validProductions++;
        }
      });

      // If we found valid productions we can increment the valid lines count
      if (validProductions === productions.length) {
        validLines++;

        // If this is the first line, we set the initial symbol
        if (lineIndex === 0) S = left;
      }

      // Make productions unique and sort
      if (P[left] !== undefined) P[left] = R.uniq(P[left]).sort();
    }

    // We only extract elements if all the lines and its productions are valid
    if (lines.length > 0 && validLines === lines.length) {
      this.S = S;
      this.P = P;
      this.Vt = this._extractTerminals(P);
      this.Vn = this._extractNonTerminals(P);
    }
  }

  _extractTerminals(rules) {
    const symbols = R.uniq(
      R.flatten(R.map(s => s.split(' '), R.flatten(R.values(rules))))
    );

    return R.filter(production => {
      return SymbolValidator.isValidTerminal(production);
    }, symbols).sort();
  }

  _extractNonTerminals(rules) {
    const symbols = R.uniq(
      R.flatten(R.map(s => s.split(' '), R.flatten(R.values(rules))))
    );

    const nonTerminalsOnRight = R.filter(production => {
      return SymbolValidator.isValidNonTerminal(production);
    }, symbols);

    const nonTerminalsOnLeft = R.keys(rules);

    return R.union(nonTerminalsOnLeft, nonTerminalsOnRight).sort();
  }

  /**
   * @return {String}
   */
  trim() {
    this._input = removeDoubleSpaces(multiTrim(this._input, false).trim());

    return this._input;
  }

  /**
   * @return {Array}
   */
  terminals() {
    return this.Vt;
  }

  /**
   * @return {Array}
   */
  nonTerminals() {
    return this.Vn;
  }

  /**
   * @return {{}}
   */
  rules() {
    return this.P;
  }

  /**
   * @return {null|String}
   */
  initialSymbol() {
    return this.S;
  }
}
