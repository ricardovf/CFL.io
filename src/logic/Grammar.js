import GrammarParser from './Grammar/GrammarParser';
import * as R from 'ramda';
import SymbolValidator, { ACCEPT_STATE, EPSILON } from './SymbolValidator';

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
        `The productions should be an object with the form: {S: ['a', 'aS']}`
      );

    if (this.P[this.S] === undefined)
      throw new Error(`There should be an ${this.S} -> x | xY | & production`);

    let hasEpsilonOnInitialNonTerminal = false;

    R.forEachObjIndexed((productions, producer) => {
      if (producer !== this.S) {
        if (productions.includes(EPSILON))
          throw new Error(
            `There should not be a production of type ${producer} -> & (epsilon)`
          );
      } else if (productions.includes(EPSILON)) {
        hasEpsilonOnInitialNonTerminal = true;
      }
    }, this.P);

    if (hasEpsilonOnInitialNonTerminal) {
      R.forEachObjIndexed((productions, producer) => {
        R.forEach(production => {
          if (production.length === 2 && production.charAt(1) === this.S)
            throw new Error(
              `There should not be a production of type ${producer} -> x${producer} when there is & (epsilon)`
            );
        }, productions);
      }, this.P);
    }

    let states = [...this.Vn, ACCEPT_STATE];
    let alphabet = [...this.Vt];
    let transitions = [];
    let initial = this.S;
    let finals = this.P[this.S].includes(EPSILON)
      ? [this.S, ACCEPT_STATE]
      : [ACCEPT_STATE];

    R.forEachObjIndexed((productions, producer) => {
      R.forEach(production => {
        if (production.length === 1) {
          if (!alphabet.includes(production))
            throw new Error(
              `The production ${producer} -> ${production} is invalid because ${production} is not on terminals/alphabet list`
            );

          // @todo review format
          transitions.push({
            from: producer,
            to: ACCEPT_STATE,
            when: production,
          });
        } else if (production.length === 2) {
          if (!alphabet.includes(production.charAt(0)))
            throw new Error(
              `The production ${producer} -> ${production} is invalid because ${production.charAt(
                0
              )} is not on terminals/alphabet list`
            );

          if (!states.includes(production.charAt(1)))
            throw new Error(
              `The production ${producer} -> ${production} is invalid because ${production.charAt(
                1
              )} is not on non terminals list`
            );

          transitions.push({
            from: producer,
            to: production.charAt(1),
            when: production.charAt(0),
          });
        }
      })(productions);
    }, this.P);

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
  hasEpsilonTransitions() {
    return true;
  }

  /**
   * @todo
   * @returns {boolean}
   */
  hasSimpleProductions() {
    return true;
  }

  /**
   * @todo
   * @returns {boolean}
   */
  hasInfertileSymbols() {
    return true;
  }

  /**
   * @todo
   * @returns {boolean}
   */
  hasUnreachableSymbols() {
    return true;
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

  /**
   * @todo
   * @return {string}
   */
  getLanguageFinitude() {
    return INFINITE;
  }

  /**
   * @todo
   * @returns {boolean}
   */
  hasEpsilonTransitions() {
    return true;
  }

  getFirst() {}

  getFirstNT() {}

  getFollow() {}

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
