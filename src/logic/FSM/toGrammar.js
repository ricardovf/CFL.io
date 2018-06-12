import Grammar from '../Grammar';
import * as R from 'ramda';
import { EPSILON, makeNewUniqueStateName } from '../SymbolValidator';

export function toGrammar(fsm) {
  fsm = fsm.clone();

  if (fsm.hasEpsilonTransitions()) fsm.eliminateEpsilonTransitions();

  fsm.ensureStatesNamesAreStandard();

  let Vn = fsm.states;
  let Vt = fsm.alphabet;
  let P = {};
  let S = fsm.initial;

  createNonEpsilonProductions(fsm, P);

  P = R.map(R.uniq, P);

  let grammar = new Grammar(Vn, Vt, P, S);

  createEpsilonProductions(fsm, grammar);

  return grammar;
}

function createEpsilonProductions(fsm, grammar) {
  // If the FSM accepts EPSILON
  if (fsm.finals.includes(fsm.initial)) {
    let SProductions = [
      ...(Array.isArray(grammar.P[fsm.initial]) ? grammar.P[fsm.initial] : []),
      EPSILON,
    ];

    // If the initial state is on the right side, we must create a new state to contain EPSILON
    let paths = [...R.filter(R.whereEq({ to: fsm.initial }))(fsm.transitions)];

    if (paths.length > 0) {
      grammar.S = fsm.states.includes('S')
        ? makeNewUniqueStateName(fsm.states)
        : 'S';

      grammar.Vt.push(EPSILON); // add epsilon to the alphabet
      grammar.Vn.push(grammar.S); // add the new initial to the non terminals
    }

    grammar.P[grammar.S] = SProductions;
  }
}

function createNonEpsilonProductions(fsm, P) {
  for (let state of fsm.states) {
    P[state] = [];
    for (let symbol of fsm.alphabet) {
      let paths = [
        ...R.filter(R.whereEq({ from: state, when: symbol }))(fsm.transitions),
      ];
      for (let path of paths) {
        P[state].push(symbol + path.to);
        if (fsm.finals.includes(path.to)) P[state].push(symbol);
      }
    }
  }
}
