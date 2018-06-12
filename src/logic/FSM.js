import { EPSILON, makeNewUniqueStateName } from './SymbolValidator';
import Grammar from './Grammar';
import * as R from 'ramda';
import { determinate, isDeterministic } from './FSM/Determinator';
import { isMinimal, minimize } from './FSM/Minimizer';
import {
  eliminateEpsilonTransitions,
  hasEpsilonTransitions,
} from './FSM/Epsilon';
import { generate } from './FSM/Generator';
import { toGrammar } from './FSM/toGrammar';
import SymbolValidator from './SymbolValidator';

export const GENERATE_MAX_SIZE = 100;

export default class FSM {
  constructor(states, alphabet, transitions, initial, finals) {
    this.states = !states || !Array.isArray(states) ? [] : states;
    this.alphabet = !alphabet || !Array.isArray(alphabet) ? [] : alphabet;
    this.transitions =
      !transitions || !Array.isArray(transitions) ? [] : transitions;
    this.initial = initial;
    this.finals = !finals || !Array.isArray(finals) ? [] : finals;
  }

  /**
   * For each state, will check if has more than one transition with the same symbol
   *
   * @returns {boolean}
   */
  isDeterministic() {
    return isDeterministic(this);
  }

  /**
   * Determinate automate, if not already determinated
   *
   * @returns {void}
   */
  determinate() {
    determinate(this);
  }

  /**
   * Return a new Grammar from the FSM
   *
   * @returns {Grammar}
   */
  toGrammar() {
    return toGrammar(this);
  }

  /**
   * Makes sure that all states names are from A...Z and then from Q0...Q9999999
   */
  ensureStatesNamesAreStandard() {
    this.states = Array.isArray(this.states) ? R.uniq(this.states) : [];
    this.finals = Array.isArray(this.finals) ? R.uniq(this.finals) : [];
    this.transitions = Array.isArray(this.transitions)
      ? R.uniq(this.transitions)
      : [];

    let statesToRename = R.reject(
      SymbolValidator.isStandardAtoZName,
      this.states
    );

    for (let name of statesToRename) {
      // make a new unique name for this state
      let newName = makeNewUniqueStateName(this.states);

      // delete old name and insert new
      this.states.splice(this.states.indexOf(name), 1, newName);

      // change initial state if equal old name
      if (this.initial === name) this.initial = newName;

      // change finals
      if (this.finals.includes(name))
        this.finals.splice(this.finals.indexOf(name), 1, newName);

      // change transitions
      this.transitions = R.map(transition => {
        if (transition.from === name) transition.from = newName;
        if (transition.to === name) transition.to = newName;
        return transition;
      }, this.transitions);
    }

    this.states.sort();
    this.finals.sort();
  }

  // getGenerator(prodution) {
  //   let generator = '';
  //   for (let char of prodution) {
  //     if (char == ' ' || char == '-') break;
  //     generator += char;
  //   }
  //   return generator;
  // }
  //
  // getProdution(prodution) {
  //   let prodution_ = '';
  //   let arrowReaded = false;
  //   for (let char of prodution) {
  //     if (arrowReaded) if (char != ' ') prodution_ += char;
  //
  //     if (char == '>') arrowReaded = true;
  //   }
  //   return prodution_;
  // }

  /**
   * Check if the state has other than epsilon transitions
   *
   * @param state
   * @param symbol
   * @returns {boolean}
   */
  stateHasEpsilonAndNonEpsilonTransactions(state, symbol) {
    let nonEpsilonPaths = [
      ...R.filter(R.whereEq({ from: state, when: symbol }))(this.transitions),
    ];
    let epsilonPaths = [
      ...R.filter(R.whereEq({ from: state, when: EPSILON }))(this.transitions),
    ];
    return nonEpsilonPaths.length >= 1 && epsilonPaths.length >= 1;
  }

  isMinimal() {
    return isMinimal(this);
  }

  minimize() {
    minimize(this);
  }

  hasIndefinition() {
    for (let symbol of this.alphabet) {
      for (let state of this.states) {
        let paths = [
          ...R.filter(R.whereEq({ from: state, when: symbol }))(
            this.transitions
          ),
        ];
        if (paths.length == 0) return true;
      }
    }

    return false;
  }

  /**
   * Check if the automata has cycle in the graph
   *
   * @param state
   * @param visitedStates
   * @returns {boolean}
   */
  hasCycle(state, visitedStates = new Set()) {
    if (visitedStates.has(state)) {
      return true;
    } else {
      visitedStates.add(state);
      let paths = R.filter(R.whereEq({ from: state }))(this.transitions);
      let neighbours = R.pluck('to')(paths);
      // Will iterate through all neighbours from the current state searching for cycle
      for (let neighbour of neighbours) {
        if (neighbour !== state) {
          return this.hasCycle(state, visitedStates);
        } else {
          return true;
        }
      }
    }
    visitedStates.delete(state);
    return false;
  }

  /**
   * Check if the automata has any epsilon transitions
   *
   * @returns {boolean}
   */
  hasEpsilonTransitions() {
    return hasEpsilonTransitions(this);
  }

  /**
   * Eliminate all epsilon transitions from the automata
   *
   * @returns {void}
   */
  eliminateEpsilonTransitions() {
    eliminateEpsilonTransitions(this);
  }

  /**
   * Returns true if the FSM accepts the sentence '' as valid
   * @returns {boolean}
   */
  acceptsEmptySentence() {
    return this.generate(1).includes('');
  }

  isValid() {
    return true;
  }

  /**
   * Works in deterministic and non deterministic FSM, with or without epsilon
   *
   * @param sentence
   * @param currentState
   * @returns {Promise<*>}
   */
  async recognize(sentence, currentState = this.initial) {
    if (
      !this.isValid() ||
      sentence === EPSILON ||
      sentence === undefined ||
      sentence === null ||
      typeof sentence !== 'string'
    )
      return false;

    sentence = sentence.toString();

    // If the sentence is empty and the current state is final, accept the sentence
    if (sentence === '') {
      return this.finals.includes(currentState);
    }

    // Get the current symbol
    const symbol = sentence.charAt(0);

    // Find all transitions going from current state with the current symbol or EPSILON
    /**
     * @type {Array}
     */
    let paths = [
      ...R.filter(R.whereEq({ from: currentState, when: symbol }))(
        this.transitions
      ),
      ...R.filter(R.whereEq({ from: currentState, when: EPSILON }))(
        this.transitions
      ),
    ];

    // If we found possible paths
    if (paths.length) {
      // make a new Promise for each path to run
      paths = R.map(path => {
        return this.recognize(
          path.when === EPSILON ? sentence : sentence.substring(1),
          path.to
        );
      }, paths);

      // @todo make it in a way that if one promise returns true, then cancel all others branches
      return (await Promise.all(paths)).includes(true);
    }

    return false;
  }

  /**
   * Generates all sentences less or equal the length passed
   *
   * @param maxLength
   * @returns {Array}
   */
  generate(maxLength) {
    return generate(this, maxLength);
  }

  /**
   * @returns {{states: *[], alphabet: *[], initial: *, finals: *[], transitions: *[]}}
   */
  toPlainObject() {
    return {
      states: [...this.states],
      alphabet: [...this.alphabet],
      initial: this.initial,
      finals: [...this.finals],
      transitions: [...R.clone(this.transitions)],
    };
  }

  nonFinalStates() {
    let nonFinalStates = [];
    for (let state of this.states) {
      if (!this.finals.includes(state)) nonFinalStates.push(state);
    }
    return nonFinalStates;
  }

  /**
   * @param object
   * @returns {FSM}
   */
  static fromPlainObject(object) {
    try {
      return new this(
        object.states,
        object.alphabet,
        object.transitions,
        object.initial,
        object.finals
      );
    } catch (e) {
      return null;
    }
  }

  /**
   * @returns {FSM}
   */
  static makeEmptyFSM() {
    return new FSM([], [], [], null, []);
  }

  clone() {
    return new FSM(
      [...this.states],
      [...this.alphabet],
      [...R.clone(this.transitions)],
      this.initial,
      [...this.finals]
    );
  }
}
