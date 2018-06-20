import GrammarParser from './Grammar/GrammarParser';
import * as R from 'ramda';
import SymbolValidator, { EPSILON } from './SymbolValidator';
import { first } from './Grammar/First';
import { firstNT } from './Grammar/FirstNT';
import { follow } from './Grammar/Follow';
import { findMatchOfFromStartOfString, multiTrim } from './helpers';
import {
  removeLeftRecursion,
  getLeftRecursions,
} from './Grammar/LeftRecursion';
import { canBeFactored, getFactors, isFactored } from './Grammar/Factor';

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
    if (!this.S || !this.P) {
      return '';
    }

    let P = this.P;

    // make sure that the first production is first
    P = R.merge(R.pick([this.S], this.P), R.dissoc(this.S, this.P));

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
    if (!this.isValid()) return false;

    for (let nonTerminal of this.Vn) {
      if (Array.isArray(this.P[nonTerminal])) {
        for (let production_ of this.P[nonTerminal]) {
          if (production_ === '&' && nonTerminal !== this.initialSymbol()) {
            return false;
          } else {
            if (
              this.initialSymbolDerivesEpsilon() &&
              this.nonTerminalDerivesInitialSymbol()
            ) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  /**
   * @todo
   * @returns {boolean}
   */
  hasSimpleProductions() {
    if (!this.isValid()) return false;

    for (let nonTerminal of this.Vn) {
      if (Array.isArray(this.P[nonTerminal])) {
        for (let production of this.P[nonTerminal]) {
          if (production.length === 1 && this.Vn.indexOf(production) > -1)
            return true;
        }
      }
    }
    return false;
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
    let fertileSymbols = this.getFertileSymbols();
    let infertileSymbols = this.getInfertileSymbols(fertileSymbols);
    let newProductions = {};
    let step = this.clone();
    let newVn = [];
    let newVt = [];
    let productionIncludesInfertile = false;

    for (let nonTerminal of this.Vn) {
      for (let production of this.P[nonTerminal]) {
        let nonTerminals = this.getNonTerminalsFromProduction(production);
        let terminals = this.getTerminalsFromProduction(production);
        for (let nonTerminal_ of nonTerminals) {
          if (infertileSymbols.includes(nonTerminal_))
            productionIncludesInfertile = true;
        }
        if (!productionIncludesInfertile) {
          if (newProductions[nonTerminal] === undefined)
            newProductions[nonTerminal] = [];
          newVn.push(nonTerminal);
          newProductions[nonTerminal].push(production);
          for (let terminal of terminals) newVt.push(terminal);
        }
        productionIncludesInfertile = false;
      }
      step.P = newProductions;
      step.Vt = newVt;
      step.Vn = newVn;
      steps.push(step);
      step = this.clone();
    }

    this.P = newProductions;
    this.Vt = R.uniq(newVt);
    this.Vn = R.uniq(newVn);
  }

  removeInfertileSymbolsWithSteps() {
    let steps = [];
    this.removeInfertileSymbols(steps);
    return steps;
  }

  removeUnreachableSymbols(steps = []) {
    let reachableSymbols = this.getReachableSymbols();
    let unreachableSymbols = this.getUnreachableSymbols(reachableSymbols);
    let newProductions = {};
    let step = this.clone();
    let newVn = [];
    let newVt = [];
    let productionIncludesUnreachable = false;

    for (let nonTerminal of reachableSymbols) {
      if (this.Vn.includes(nonTerminal)) {
        for (let production of this.P[nonTerminal]) {
          let production_ = production.replace(/\s/g, '');
          let nonTerminals = this.getNonTerminalsFromProduction(production_);
          let terminals = this.getTerminalsFromProduction(production_);
          for (let nonTerminal_ of nonTerminals)
            if (unreachableSymbols.includes(nonTerminal_))
              productionIncludesUnreachable = true;

          for (let terminal of terminals)
            if (unreachableSymbols.includes(terminal))
              productionIncludesUnreachable = true;

          if (!productionIncludesUnreachable) {
            if (newProductions[nonTerminal] === undefined)
              newProductions[nonTerminal] = [];
            newProductions[nonTerminal].push(production);
            newVn.push(nonTerminal);
            for (let terminal of terminals) newVt.push(terminal);
          }
          productionIncludesUnreachable = false;
        }
      }
      step.P = newProductions;
      step.Vt = newVt;
      step.Vn = newVn;
      steps.push(step);
      step = this.clone();
    }

    this.P = newProductions;
    this.Vn = R.uniq(newVn);
    this.Vt = R.uniq(newVt);
  }

  removeUnreachableSymbolsWithSteps() {
    let steps = [];
    this.removeUnreachableSymbols(steps);
    return steps;
  }

  removeSimpleProductions(steps = []) {
    let simpleProductions = this.getSimpleProductions();
    let newProductions = {};
    let step = this.clone();

    for (let nonTerminal of this.Vn) {
      if (newProductions[nonTerminal] === undefined)
        newProductions[nonTerminal] = [];
    }

    for (let symbol of this.Vn)
      for (let simpleProduction of simpleProductions[symbol])
        for (let indirectProduction of simpleProductions[simpleProduction])
          if (!simpleProductions[symbol].includes(indirectProduction))
            simpleProductions[symbol].push(indirectProduction);

    for (let symbol of this.Vn) {
      for (let simpleProduction of simpleProductions[symbol]) {
        let nonSimpleProductions = this.getNonSimpleProductions(
          simpleProduction
        );
        for (let nonSimpleProduction of nonSimpleProductions)
          if (!newProductions[symbol].includes(nonSimpleProduction))
            newProductions[symbol].push(nonSimpleProduction);
      }

      let nonSimpleProductions_ = this.getNonSimpleProductions(symbol);
      for (let nonSimpleProduction of nonSimpleProductions_)
        if (!newProductions[symbol].includes(nonSimpleProduction))
          newProductions[symbol].push(nonSimpleProduction);
      step.P = newProductions;
      steps.push(step);
      step = this.clone();
    }
    this.P = newProductions;
  }

  removeSimpleProductionsWithSteps() {
    let steps = [];
    this.removeSimpleProductions(steps);
    return steps;
  }

  toEpsilonFree(steps = []) {
    this.removeUselessSymbols();
    let epsilonProducers = this.getEpsilonProducers();
    let oldNumProductions = this.getNumberOfProductions();
    let step = this.clone();
    let newProductions = 0;
    let newProduction;

    while (oldNumProductions !== newProductions) {
      for (let symbol of this.Vn) {
        for (let production of this.P[symbol]) {
          for (let epsilonProducer of epsilonProducers) {
            if (production.includes(epsilonProducer)) {
              newProduction = production
                .replace(epsilonProducer, '')
                .replace(/\s+/g, ' ')
                .replace(/^\s|\s$/g, '');
              if (newProduction === '') newProduction = '&';
              if (!this.P[symbol].includes(newProduction))
                this.P[symbol].push(newProduction);
            }
          }
          if (
            this.P[symbol].includes('&') &&
            !epsilonProducers.includes(symbol)
          )
            epsilonProducers.push(symbol);
        }
      }
      step.P = this.P;
      steps.push(step);
      step = this.clone();
      oldNumProductions = newProductions;
      newProductions = this.getNumberOfProductions();
    }
    for (let symbol of this.Vn)
      if (symbol !== this.initialSymbol())
        this.P[symbol].splice(this.P[symbol].indexOf('&'), 1);

    step.P = this.P;
    steps.push(step);
    step = this.clone();
    if (
      this.nonTerminalDerivesInitialSymbol() &&
      this.initialSymbolDerivesEpsilon()
    ) {
      let newInitialSymbol;
      let oldInitialSymbol = this.S;
      let index = 0;
      do {
        newInitialSymbol = 'S' + index.toString();
        ++index;
      } while (this.Vn.includes(newInitialSymbol));
      this.P[this.S].splice(this.P[this.S].indexOf('&'), 1);
      this.S = newInitialSymbol;
      this.P[this.S] = [oldInitialSymbol, '&'];
      this.Vn.push(this.S);
    }
    step.P = this.P;
    steps.push(step);
  }

  toOwn() {
    this.removeUselessSymbols();
    this.toEpsilonFree();
  }

  toOwnWithSteps() {
    let steps = [];
    this.removeUselessSymbols(steps);
    this.toEpsilonFree(steps);
    return steps;
  }

  /**
   * Cycles in the form of A -> B | B -> A or A -> A
   * @todo
   * @returns {boolean}
   */
  hasCycle(visited = []) {
    visited.push(this.S);

    for (let production of this.P[this.S])
      for (let symbol of production)
        if (this.Vn.includes(symbol)) return this.hasCycle_(visited, symbol);

    return false;
  }

  hasCycle_(visited, symbol) {
    if (visited.includes(symbol)) return true;

    visited.push(symbol);
    if (this.P[symbol]) {
      for (let production of this.P[symbol]) {
        for (let symbol_ of production)
          if (!visited.includes(symbol_) && this.Vn.includes(symbol_)) {
            visited.push(symbol_);
            if (this.hasCycle_(visited, symbol_)) return true;
          }
      }
    }
    visited.splice(visited.indexOf(symbol));
    return false;
  }

  /**
   * Is 'GLC Própria'?
   * @todo
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

  getLanguageFinitude() {
    let fertileSymbols = this.getFertileSymbols();
    if (fertileSymbols.includes(this.S)) {
      if (this.hasCycle()) return INFINITE;
      else return FINITE;
    } else {
      return EMPTY;
    }
  }

  getFirst() {}

  getFirstNT() {}

  getFollow() {}

  /**
   * @return {Array}
   */
  getFertileSymbols() {
    let fertileSymbols = [];

    if (!this.isValid()) return fertileSymbols;

    let oldSize = fertileSymbols.length;
    let newSize = 1;
    let allNonTerminalFertile = true;
    while (oldSize !== newSize) {
      for (let nonTerminal of this.Vn) {
        if (Array.isArray(this.P[nonTerminal])) {
          for (let production of this.P[nonTerminal]) {
            let production_ = production.replace(/\s/g, '');
            if (this.productionWithOnlyTerminals(production_))
              if (!fertileSymbols.includes(nonTerminal))
                fertileSymbols.push(nonTerminal);

            let nonTerminals = this.getNonTerminalsFromProduction(production_);
            for (let nonTerminal_ of nonTerminals) {
              if (!fertileSymbols.includes(nonTerminal_))
                allNonTerminalFertile = false;
            }

            if (allNonTerminalFertile)
              if (!fertileSymbols.includes(nonTerminal))
                fertileSymbols.push(nonTerminal);
            allNonTerminalFertile = true;
          }
        }
      }
      oldSize = newSize;
      newSize = fertileSymbols.length;
    }
    return fertileSymbols;
  }

  /**
   * @param fertileSymbols
   * @return {Array}
   */
  getInfertileSymbols(fertileSymbols) {
    let infertileSymbols = [];
    if (Array.isArray(this.Vn)) {
      for (let symbol of this.Vn)
        if (!fertileSymbols.includes(symbol)) infertileSymbols.push(symbol);
    }

    return infertileSymbols;
  }

  /**
   * @return {Array}
   */
  getReachableSymbols() {
    if (!this.isValid()) return [];

    let reachableSymbols = [this.initialSymbol()];
    let oldSize = reachableSymbols.length;
    let newSize = 0;
    while (oldSize !== newSize) {
      for (let symbol of reachableSymbols) {
        if (this.Vn.includes(symbol)) {
          if (Array.isArray(this.P[symbol])) {
            for (let production of this.P[symbol]) {
              production = production.replace(/\s/g, '');
              let nonTerminals = this.getNonTerminalsFromProduction(production);
              let terminals = this.getTerminalsFromProduction(production);
              for (let nonTerminal of nonTerminals)
                if (!reachableSymbols.includes(nonTerminal))
                  reachableSymbols.push(nonTerminal);

              for (let terminal of terminals)
                if (!reachableSymbols.includes(terminal))
                  reachableSymbols.push(terminal);
            }
          }
        }
      }
      oldSize = newSize;
      newSize = reachableSymbols.length;
    }
    return reachableSymbols;
  }

  /**
   * @param reachableSymbols
   * @return {Array}
   */
  getUnreachableSymbols(reachableSymbols) {
    let unreachableSymbols = [];

    if (Array.isArray(this.Vn)) {
      for (let symbol of this.Vn)
        if (!reachableSymbols.includes(symbol)) unreachableSymbols.push(symbol);
    }

    if (Array.isArray(this.Vt)) {
      for (let symbol of this.Vt)
        if (!reachableSymbols.includes(symbol)) unreachableSymbols.push(symbol);
    }

    return unreachableSymbols;
  }

  getNonTerminalsFromProduction(p) {
    let nonTerminals = [];
    for (let char of p) {
      if (this.Vn.includes(char)) nonTerminals.push(char);
    }
    return nonTerminals;
  }

  getTerminalsFromProduction(p) {
    let terminals = [];
    for (let char of p) {
      if (this.Vt.includes(char)) terminals.push(char);
    }
    return terminals;
  }

  getSimpleProductions() {
    let simpleProductions = [];

    for (let nonTerminal of this.Vn)
      if (simpleProductions[nonTerminal] === undefined)
        simpleProductions[nonTerminal] = [];

    for (let nonTerminal of this.Vn)
      for (let production of this.P[nonTerminal])
        if (production.length === 1 && this.Vn.indexOf(production) > -1)
          simpleProductions[nonTerminal].push(production);

    return simpleProductions;
  }

  getSimpleProductionsFromSymbol(symbol) {
    let simpleProductions = [];

    for (let production of this.P[symbol])
      if (production.length === 1 && this.Vn.indexOf(production) > -1)
        simpleProductions.push(production);

    return simpleProductions;
  }

  getNonSimpleProductions(symbol) {
    let nonSimpleProductions = [];

    for (let production of this.P[symbol]) {
      if (production.length > 1 || this.Vt.includes(production))
        nonSimpleProductions.push(production);
    }
    return nonSimpleProductions;
  }

  getEpsilonProducers() {
    let epsilonProducers = [];
    let oldSize = epsilonProducers.length;
    let newSize = 1;

    while (oldSize !== newSize) {
      for (let symbol of this.Vn)
        for (let production of this.P[symbol])
          if (
            (production === '&' || epsilonProducers.includes(production)) &&
            !epsilonProducers.includes(symbol)
          )
            epsilonProducers.push(symbol);

      oldSize = newSize;
      newSize = epsilonProducers.length;
    }
    return epsilonProducers;
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
   * @param steps
   * @return {boolean}
   */
  canBeFactored(steps) {
    return canBeFactored(this, steps);
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
    return new Grammar(
      [...this.Vn],
      [...this.Vt],
      [...R.clone(this.P)],
      this.S
    );
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
