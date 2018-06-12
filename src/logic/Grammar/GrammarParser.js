import { multiTrim } from '../helpers';
import XRegExp from 'xregexp';
import SymbolValidator, { SEPARATOR } from '../SymbolValidator';
import * as R from 'ramda';

const fullLineRegExp = XRegExp(
  `^(?<left>[A-Z])->(?<right>((([a-z]|[0-9])([A-Z])?)|&)(\\|(([a-z]|[0-9])([A-Z])?|&))*)$`
);

export default class GrammarParser {
  constructor(input = '') {
    this.input = input;
  }

  changed(input) {
    return input !== this._originalInput;
  }

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

  run(input = undefined) {
    if (input !== undefined) {
      this.input = input;
    }

    this.trim();
    this._extractElements();

    return this;
  }

  _extractElements() {
    const lines = this._input.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      const match = XRegExp.exec(line, fullLineRegExp);

      if (match === null) {
        this._resetElements();
        return this;
      }

      // First Symbol of the Grammar
      if (lineIndex === 0) this.S = match.left;

      // Extract rules
      match.right.split(SEPARATOR).forEach(rule => {
        if (this.P[match.left] === undefined) this.P[match.left] = [];
        this.P[match.left].push(rule);
      });

      this.P[match.left] = R.uniq(this.P[match.left]);
    }

    this.Vt = this._extractTerminals(this.P);
    this.Vn = this._extractNonTerminals(this.P);
  }

  _extractTerminals(rules) {
    const symbols = R.uniq(R.map(s => s.charAt(0), R.flatten(R.values(rules))));

    return R.filter(production => {
      return SymbolValidator.isValidTerminal(production);
    }, symbols).sort();
  }

  _extractNonTerminals(rules) {
    let producers = R.keys(rules);
    const first = producers[0];

    const symbols = R.uniq(R.flatten(R.values(rules)));

    let moreProducers = R.map(production => {
      if (
        production.length === 1 &&
        SymbolValidator.isValidNonTerminal(production)
      )
        return production;
      if (
        production.length === 2 &&
        SymbolValidator.isValidNonTerminal(production.charAt(1))
      )
        return production.charAt(1);
      return null;
    }, symbols);

    moreProducers = R.reject(v => v === null, moreProducers);

    producers = R.uniq(producers.concat(moreProducers)).sort();

    if (first && first !== producers[0]) {
      producers = R.insert(0, first, R.without(first, producers));
    }

    return producers;
  }

  trim() {
    this._input = multiTrim(this._input);

    return this._input;
  }

  terminals() {
    return this.Vt;
  }

  nonTerminals() {
    return this.Vn;
  }

  rules() {
    return this.P;
  }

  initialSymbol() {
    return this.S;
  }
}
