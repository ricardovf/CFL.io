import GrammarParser from './Grammar/GrammarParser';
import * as R from 'ramda';
import SymbolValidator, { EPSILON } from './SymbolValidator';
import {
  getEpsilonProducers,
  toEpsilonFree,
  isEpsilonFree,
} from './Grammar/Epsilon';
import { first } from './Grammar/First';
import { firstNT } from './Grammar/FirstNT';
import { follow } from './Grammar/Follow';
import {
  removeSimpleProductions,
  getNonTerminalsFromProduction,
  getTerminalsFromProduction,
  getSimpleProductions,
  getSimpleProductionsFromSymbol,
  getNonSimpleProductions,
  hasSimpleProductions,
} from './Grammar/SimpleProductions';
import {
  removeInfertileSymbols,
  removeUnreachableSymbols,
  getFertileSymbols,
  getInfertileSymbols,
  getReachableSymbols,
  getUnreachableSymbols,
} from './Grammar/UselessSymbols';
import { findMatchOfFromStartOfString, multiTrim } from './helpers';
import {
  removeLeftRecursion,
  getLeftRecursions,
} from './Grammar/LeftRecursion';
import {
  canBeFactored,
  getFactors,
  isFactored,
  removeFactors,
} from './Grammar/Factor';

const parser = new GrammarParser();

let currentGrammarFromText = undefined;

export const FINITE = 'Finita';
export const INFINITE = 'Infinita';
export const EMPTY = 'Vazia';

export default class Grammar {
  constructor(Vn, Vt, P, S) {
    if (Array.isArray(P) || P === null) {
      throw new Error(
        `P must be an object containing all the productions of the Grammar`
      );
    }

    this.Vn = !Vn || !Array.isArray(Vn) ? [] : Vn;
    this.Vt = !Vt || !Array.isArray(Vt) ? [] : Vt;
    this.P = P;
    this.S = S;
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
   * Return the non terminals sorted and with the initial symbol as first item of the array
   *
   * @return {Array}
   */
  nonTerminalsFirstSymbolFirst() {
    let Vn = this.Vn;

    if (Array.isArray(Vn) && this.S && Vn.includes(this.S)) {
      Vn = R.without([this.S], Vn.sort());
      Vn.unshift(this.S);
    }

    return Vn;
  }

  /**
   * @return {Object}
   */
  rules() {
    return this.P;
  }

  /**
   * @return {String}
   */
  initialSymbol() {
    return this.S;
  }

  /**
   * Returns the first of a input
   *
   * @param input
   * @return {[]}
   */
  first(input) {
    return first(this, input);
  }

  /**
   * Returns the first-NT of a input
   *
   * @param input
   * @return {[]}
   */
  firstNT(input) {
    return firstNT(this, input);
  }

  /**
   * Returns the follow of a input
   *
   * @param input
   * @return {[]}
   */
  follow(input) {
    return follow(this, input);
  }

  /**
   * Returns an object with all the non terminals as keys and its first as value
   * @return {Object}
   */
  firstsOfNonTerminals() {
    return Array.isArray(this.Vn)
      ? R.zipObj(this.Vn, R.map(R.curry(first, this), this.Vn))
      : {};
  }

  /**
   * @return {boolean}
   */
  initialSymbolDerivesEpsilon() {
    if (this.P[this.S]) {
      for (let production of this.P[this.S]) {
        if (production === '&') return true;
      }
    }
    return false;
  }

  /**
   * @return {boolean}
   */
  nonTerminalDerivesInitialSymbol() {
    if (Array.isArray(this.Vn)) {
      for (let nonTerminal of this.Vn) {
        if (Array.isArray(this.P[nonTerminal])) {
          for (let production of this.P[nonTerminal]) {
            if (production.includes(this.S)) return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * @throws
   * @private
   * @return {Boolean}
   */
  _validate() {
    if (!Array.isArray(this.Vn))
      throw new Error(`Non terminals Vn must be an array`);

    if (!Array.isArray(this.Vt))
      throw new Error(`Terminals Vt must be an array`);

    if (Array.isArray(this.P))
      throw new Error(`Productions must be an object, not an array!`);

    if (
      this.Vn.length > 0 &&
      R.filter(SymbolValidator.isValidNonTerminal, this.Vn).length === 0
    )
      throw new Error(`Invalid non terminal detected: ${this.Vn.join(', ')}`);

    if (
      this.Vt.length > 0 &&
      R.filter(SymbolValidator.isValidTerminal, this.Vt).length === 0
    )
      throw new Error(`Invalid terminal detected: ${this.Vt.join(', ')}`);

    if (
      !SymbolValidator.isValidNonTerminal(this.S) ||
      !this.Vn.includes(this.S)
    )
      throw new Error('Initial symbol is invalid non terminal or is not in Vn');

    if (!(typeof this.P === 'object'))
      throw new Error(
        `The productions should be an object with the form: {S: ['a', 'a S', '&', 'A A a']}`
      );

    if (this.P[this.S] === undefined)
      throw new Error(`There should be an ${this.S} -> x | xY | & production`);

    return true;
  }

  /**
   * @returns {string}
   */
  getFormattedText() {
    if (this.S === '' || this.S === null || this.S === undefined || !this.P) {
      return '';
    }

    // make sure that the first production is first
    let P = R.merge(R.pick([this.S], this.P), R.dissoc(this.S, this.P));

    let P_ = '';
    for (let nonTerminal in P) {
      if (P[nonTerminal].length === 0) continue;

      P_ += nonTerminal + ' -> ';
      for (let production of P[nonTerminal]) {
        P_ += production + ' | ';
      }
      P_ = P_.slice(0, -3) + '\n';
    }
    return P_.trim();
  }

  /**
   * @returns {boolean}
   */
  isValid() {
    try {
      this._validate();
    } catch (e) {
      return false;
    }

    return true;
  }

  hasEpsilonTransitions() {
    return !this.isEpsilonFree();
  }

  /**
   * @todo
   * @returns {boolean}
   */
  isEpsilonFree() {
    return isEpsilonFree(this);
  }

  /**
   * @todo
   * @returns {boolean}
   */
  hasSimpleProductions() {
    return hasSimpleProductions(this);
  }

  /**
   * @todo
   * @returns {boolean}
   */
  hasInfertileSymbols() {
    return this.isValid() && this.getFertileSymbols().length !== this.Vn.length;
  }

  /**
   * @todo
   * @returns {boolean}
   */
  hasUnreachableSymbols() {
    return (
      this.getReachableSymbols().length !== this.Vn.length + this.Vt.length
    );
  }

  /**
   * @todo
   * @returns {boolean}
   */
  hasUselessSymbols() {
    return this.hasInfertileSymbols() || this.hasUnreachableSymbols();
  }

  removeUselessSymbols(steps = []) {
    if (this.hasUselessSymbols()) {
      this.removeInfertileSymbols(steps);
      this.removeUnreachableSymbols(steps);
    }
  }

  removeUselessSymbolsWithSteps() {
    let steps = [];
    this.removeUselessSymbols(steps);
    return steps;
  }

  removeInfertileSymbols(steps = []) {
    removeInfertileSymbols(this, steps);
  }

  removeInfertileSymbolsWithSteps() {
    let steps = [];
    this.removeInfertileSymbols(steps);
    return steps;
  }

  removeUnreachableSymbols(steps = []) {
    removeUnreachableSymbols(steps, this);
  }

  removeUnreachableSymbolsWithSteps() {
    let steps = [];
    this.removeUnreachableSymbols(steps);
    return steps;
  }

  removeSimpleProductions(steps = []) {
    removeSimpleProductions(steps, this);
  }

  removeSimpleProductionsWithSteps() {
    let steps = [];
    this.removeSimpleProductions(steps);
    return steps;
  }

  toEpsilonFree(steps = []) {
    toEpsilonFree(steps, this);
  }

  /**
   * Is 'GLC Própria'?
   * @returns {boolean}
   */
  isOwn() {
    return (
      this.isValid() &&
      !this.hasEpsilonTransitions() &&
      !this.hasCycle() &&
      !this.hasUselessSymbols()
    );
  }

  toOwn(steps = []) {
    this.toEpsilonFree(steps);

    if (this.hasCycle()) this.removeSimpleProductions(steps);

    this.removeUselessSymbols(steps);
  }

  toOwnWithSteps() {
    let steps = [];
    this.toOwn(steps);
    return steps;
  }

  hasCycle(symbol = this.S, visited = []) {
    visited.push(symbol);

    if (this.P[symbol]) {
      for (let production of this.P[symbol]) {
        if (production.length === 1 && this.Vn.includes(production)) {
          if (visited.includes(production)) return true;
          visited.push(production);
          if (this.hasCycle(production, visited)) return true;
        }
      }
    }

    visited.splice(visited.indexOf(symbol), 1);
    return false;
  }
  /**
   * Cycles in the form of A -> B | B -> A or A -> A
   * @todo
   * @returns {boolean}
   */
  hasCycleInFinitude(visited = []) {
    if (!this.isValid()) return false;

    visited.push(this.S);

    if (this.P[this.S])
      for (let production of this.P[this.S])
        for (let symbol of production)
          if (this.Vn.includes(symbol))
            if (this.hasCycle_(visited, symbol)) return true;

    return false;
  }

  hasCycle_(visited, symbol) {
    visited.push(symbol);

    if (this.P[symbol]) {
      for (let production of this.P[symbol]) {
        for (let symbol_ of production)
          if (!visited.includes(symbol_) && this.Vn.includes(symbol_)) {
            visited.push(symbol_);
            if (this.hasCycle_(visited, symbol_)) return true;
          } else if (visited.includes(symbol_)) return true;
      }
    }
    visited.splice(visited.indexOf(symbol));
    return false;
  }

  getLanguageFinitude() {
    let fertileSymbols = this.getFertileSymbols();
    if (fertileSymbols.includes(this.S)) {
      if (this.hasCycleInFinitude()) return INFINITE;
      else return FINITE;
    } else {
      return EMPTY;
    }
  }

  /**
   * @return {Array}
   */
  getFertileSymbols() {
    return getFertileSymbols(this);
  }

  /**
   * @param fertileSymbols
   * @return {Array}
   */
  getInfertileSymbols(fertileSymbols) {
    return getInfertileSymbols(fertileSymbols, this);
  }

  /**
   * @return {Array}
   */
  getReachableSymbols() {
    return getReachableSymbols(this);
  }

  /**
   * @param reachableSymbols
   * @return {Array}
   */
  getUnreachableSymbols(reachableSymbols) {
    return getUnreachableSymbols(reachableSymbols, this);
  }

  getNonTerminalsFromProduction(p) {
    return getNonTerminalsFromProduction(p, this);
  }

  getTerminalsFromProduction(p) {
    return getTerminalsFromProduction(p, this);
  }

  getSimpleProductions() {
    return getSimpleProductions(this);
  }

  getSimpleProductionsFromSymbol(symbol) {
    return getSimpleProductionsFromSymbol(symbol, this);
  }

  getNonSimpleProductions(symbol) {
    return getNonSimpleProductions(symbol, this);
  }

  getEpsilonProducers() {
    return getEpsilonProducers(this);
  }

  getNumberOfProductions() {
    let i = 0;
    for (let symbol of this.Vn) for (let production of this.P[symbol]) ++i;
    return i;
  }

  productionWithOnlyTerminals(p) {
    for (let char of p) {
      if (this.Vn.includes(char)) return false;
    }
    return true;
  }

  /**
   * @param maxSteps
   * @return {boolean}
   */
  canBeFactored(maxSteps) {
    return canBeFactored(this, maxSteps);
  }

  /**
   * @param maxSteps
   * @return {boolean}
   */
  removeFactors(maxSteps = 10) {
    removeFactors(this, maxSteps);
  }

  /**
   * @return {boolean}
   */
  isFactored() {
    return isFactored(this);
  }

  /**
   * @return {Object}
   */
  getFactors() {
    return getFactors(this);
  }

  /**
   * @return {boolean}
   */
  hasLeftRecursion() {
    return !R.isEmpty(this.getLeftRecursions());
  }

  /**
   * @return {Object}
   */
  getLeftRecursions() {
    return getLeftRecursions(this);
  }

  removeLeftRecursion() {
    removeLeftRecursion(this);
  }

  /**
   * Converts a string containing terminals and non terminals into tokens
   * @param input
   * @return {Array}
   */
  tokenizeString(input) {
    if (!this.isValid())
      throw new Error('Only a valid grammar can tokenize strings');

    let tokens = [];

    input = multiTrim(input, true, false);

    do {
      let recognized = false;

      if (input.length) {
        const maybeTerminal = findMatchOfFromStartOfString(input, this.Vt);
        const maybeNonTerminal = findMatchOfFromStartOfString(input, this.Vn);
        if (maybeTerminal) {
          tokens.push(maybeTerminal);
          input = input.slice(maybeTerminal.length);
          recognized = true;
        } else if (maybeNonTerminal) {
          tokens.push(maybeNonTerminal);
          input = input.slice(maybeNonTerminal.length);
          recognized = true;
        } else {
          // Invalid char found, return empty tokens
          return [];
        }
      }

      if (!recognized) break;
    } while (true);

    return tokens;
  }

  /**
   * @returns {Grammar}
   */
  clone() {
    return new Grammar([...this.Vn], [...this.Vt], R.clone(this.P), this.S);
  }

  /**
   * @param nT
   * @return {Grammar}
   */
  addNonTerminal(nT) {
    if (!this.Vn.includes(nT)) {
      this.Vn.push(nT);
      this.Vn = this.Vn.sort();
    }

    return this;
  }

  /**
   * @param text
   * @returns {Grammar}
   */
  static fromText(text) {
    if (parser.changed(text)) {
      parser.run(text);
      currentGrammarFromText = new Grammar(
        parser.nonTerminals(),
        parser.terminals(),
        parser.rules(),
        parser.initialSymbol()
      );
    }

    return currentGrammarFromText;
  }

  /**
   * @returns {Grammar}
   */
  static makeEmptyGrammar() {
    return new Grammar([], [], {}, null);
  }

  /**
   * @param object
   * @returns {Grammar}
   */
  static fromPlainObject(object) {
    try {
      return new Grammar(object.Vn, object.Vt, object.P, object.S);
    } catch (e) {
      return null;
    }
  }

  /**
   * @returns {{Vn: *[], Vt: *[], P: *, S: *[]}}
   */
  toPlainObject() {
    return {
      Vn: [...this.Vn],
      Vt: [...this.Vt],
      P: R.clone(this.P),
      S: this.S,
    };
  }
}
