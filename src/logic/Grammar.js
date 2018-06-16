import GrammarParser from './Grammar/GrammarParser';
import * as R from 'ramda';
import SymbolValidator, { EPSILON } from './SymbolValidator';

const parser = new GrammarParser();

let currentGrammarFromText = undefined;

export const FINITE = 'Finita';
export const INFINITE = 'Infinita';
export const EMPTY = 'Vazia';

export default class Grammar {
  constructor(Vn, Vt, P, S) {
    this.Vn = !Vn || !Array.isArray(Vn) ? [] : Vn;
    this.Vt = !Vt || !Array.isArray(Vt) ? [] : Vt;
    this.P = P;
    this.S = S;
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

  initialSymbolDerivesEpsilon() {
    for (let production of this.P[this.S]) {
      if (production === '&') return true;
    }
    return false;
  }

  nonTerminalDerivesInitialSymbol() {
    for (let nonTerminal of this.Vn) {
      for (let production of this.P[nonTerminal]) {
        if (production.includes(this.S)) return true;
      }
    }
    return false;
  }

  /**
   * @todo implement
   * @throws
   * @private
   * @return {Boolean}
   */
  _validate() {
    if (
      !Array.isArray(this.Vn) ||
      (this.Vn.length > 0 &&
        R.filter(SymbolValidator.isValidNonTerminal, this.Vn).length === 0)
    )
      throw new Error(`Invalid non terminal detected: ${this.Vn.join(', ')}`);

    if (
      !Array.isArray(this.Vt) ||
      (this.Vt.length > 0 &&
        R.filter(SymbolValidator.isValidTerminal, this.Vt).length === 0)
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

    // Restrictions on epsilon no longer apply
    // let hasEpsilonOnInitialNonTerminal = false;
    //
    // R.forEachObjIndexed((productions, producer) => {
    //   if (producer !== this.S) {
    //     if (productions.includes(EPSILON))
    //       throw new Error(
    //         `There should not be a production of type ${producer} -> & (epsilon)`
    //       );
    //   } else if (productions.includes(EPSILON)) {
    //     hasEpsilonOnInitialNonTerminal = true;
    //   }
    // }, this.P);
    //
    // if (hasEpsilonOnInitialNonTerminal) {
    //   R.forEachObjIndexed((productions, producer) => {
    //     R.forEach(production => {
    //       if (production.length === 2 && production.charAt(1) === this.S)
    //         throw new Error(
    //           `There should not be a production of type ${producer} -> x${producer} when there is & (epsilon)`
    //         );
    //     }, productions);
    //   }, this.P);
    // }

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
      // console.log(e);
      return false;
    }

    return true;
  }

  /**
   * @todo
   * @returns {boolean}
   */
  isEpsilonFree() {
    for (let nonTerminal of this.Vn) {
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
    return true;
  }

  /**
   * @todo
   * @returns {boolean}
   */
  hasSimpleProductions() {
    for (let nonTerminal of this.Vn) {
      for (let production of this.P[nonTerminal]) {
        if (production.length === 1 && this.Vn.indexOf(production) > -1)
          return true;
      }
    }
    return false;
  }

  /**
   * @todo
   * @returns {boolean}
   */
  hasInfertileSymbols() {
    let fertileSymbols = [];
    let oldSize = fertileSymbols.length;
    let newSize = 1;
    while (oldSize != newSize) {
      for (let nonTerminal of this.Vn) {
        for (let production of this.P[nonTerminal]) {
          production = production.replace(/\s/g, '');
          if (this.productionWithOnlyTerminals(production))
            if (!fertileSymbols.includes(nonTerminal))
              fertileSymbols.push(nonTerminal);

          let nonTerminals = this.getNonTerminalsFromProduction(production);
          for (let nonTerminal_ of nonTerminals)
            if (fertileSymbols.includes(nonTerminal_))
              if (!fertileSymbols.includes(nonTerminal))
                fertileSymbols.push(nonTerminal);
        }
      }
      oldSize = newSize;
      newSize = fertileSymbols.length;
    }
    return fertileSymbols.length !== this.Vn.length;
  }

  /**
   * @todo
   * @returns {boolean}
   */
  hasUnreachableSymbols() {
    let reachableSymbols = [this.initialSymbol()];
    let oldSize = reachableSymbols.length;
    let newSize = 0;
    while (oldSize != newSize) {
      for (let symbol of reachableSymbols) {
        if (this.Vn.includes(symbol)) {
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
      oldSize = newSize;
      newSize = reachableSymbols.length;
    }
    return reachableSymbols.length === (this.Vn.length + this.Vt.length)
  }

  /**
   * @todo
   * @returns {boolean}
   */
  hasUselessSymbols() {
    return this.hasInfertileSymbols() || this.hasUnreachableSymbols();
  }

  /**
   * Cycles in the form of A -> B | B -> A or A -> A
   * @todo
   * @returns {boolean}
   */
  hasCycle() {
    return false;
  }

  /**
   * Is 'GLC Própria'?
   * @todo
   * @returns {boolean}
   */
  isOwn() {
    return (
      !this.hasEpsilonTransitions() &&
      !this.hasCycle() &&
      !this.hasUselessSymbols()
    );
  }

  getLanguageFinitude() {
    return INFINITE;
  }

  getFirst() {}

  getFirstNT() {}

  getFollow() {}

  getNonTerminalsFromProduction(p) {
    let nonTerminals = [];
    for (let char of p) {
      if (char !== '&' && char ===  char.toUpperCase())
        nonTerminals.push(char)
    }
    return nonTerminals;
  }

  getTerminalsFromProduction(p) {
    let terminals = [];
    for (let char of p) {
      if (char === char.toLowerCase())
        terminals.push(char);
    }
    return terminals;
  }

  productionWithOnlyTerminals(p) {
    for (let char of p) {
      if (char !== char.toLowerCase())
        return false;
    }
    return true;
  }

  isFactorable(steps) {
    return true;
  }

  isFactored() {
    return false;
  }

  hasLeftRecursion() {
    return true;
  }

  getLeftRecursions() {
    return [{ A: 'direct' }, { B: 'indirect' }];
  }

  // /**
  //  * Check if the automata has cycle in the graph
  //  *
  //  * @param state
  //  * @param visitedStates
  //  * @returns {boolean}
  //  */
  // hasCycle(state, visitedStates = new Set()) {
  //   if (visitedStates.has(state)) {
  //     return true;
  //   } else {
  //     visitedStates.add(state);
  //     let paths = R.filter(R.whereEq({ from: state }))(this.transitions);
  //     let neighbours = R.pluck('to')(paths);
  //     // Will iterate through all neighbours from the current state searching for cycle
  //     for (let neighbour of neighbours) {
  //       if (neighbour !== state) {
  //         return this.hasCycle(state, visitedStates);
  //       } else {
  //         return true;
  //       }
  //     }
  //   }
  //   visitedStates.delete(state);
  //   return false;
  // }

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
    return new Grammar([], [], [], null);
  }

  /**
   * @param object
   * @returns {Grammar}
   */
  static fromPlainObject(object) {
    try {
      // if (typeof object === 'string') return Grammar.fromText(object);

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
      P: this.P,
      S: [...this.S],
    };
  }
}
