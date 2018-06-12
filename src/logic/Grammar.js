import GrammarParser from './Grammar/GrammarParser';
import FSM from './FSM';
import * as R from 'ramda';
import SymbolValidator, { ACCEPT_STATE, EPSILON } from './SymbolValidator';

const parser = new GrammarParser();

let currentGrammarFromText = undefined;

export default class Grammar {
  constructor(Vn, Vt, P, S) {
    this.Vn = Vn;
    this.Vt = Vt;
    this.P = P;
    this.S = S;
    this.fsm = null;

    this._convertToFSM();
  }

  /**
   * @todo refactor, most of the conversion logic can go to the FSM class
   *
   * @private
   */
  _convertToFSM() {
    // try to convert to FSM
    try {
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
        throw new Error(
          'Initial symbol is invalid non terminal or is not in Vn'
        );

      if (!(typeof this.P === 'object'))
        throw new Error(
          `The productions should be an object with the form: {S: ['a', 'aS']}`
        );

      if (this.P[this.S] === undefined)
        throw new Error(
          `There should be an ${this.P} -> x | xY | & production`
        );

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

      this.fsm = new FSM(states, alphabet, transitions, initial, finals);
    } catch (e) {
      // Invalid Grammar
      // console.log(this);
      // console.log(`Error converting to FSM: ${e}`);
    }
  }

  /**
   * @returns {null|FSM}
   */
  getFSM() {
    return this.fsm;
  }

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

  isValid() {
    return this.fsm !== null && this.fsm.isValid();
  }

  recognize(sentence) {
    return this.isValid() ? this.fsm.recognize(sentence) : false;
  }

  generate(size = 1) {
    return this.isValid() ? this.fsm.generate(size) : [];
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
}
