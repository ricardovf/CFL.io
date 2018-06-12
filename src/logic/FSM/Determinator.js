import FSM from '../FSM';
import * as R from 'ramda';
import { EPSILON } from '../SymbolValidator';
import { difference } from './Operator';

/**
 * For each state, will check if has more than one transition with the same symbol
 *
 * @param fsm FSM
 * @returns {boolean}
 */
export function isDeterministic(fsm) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);
  if (Array.isArray(fsm.transitions)) {
    let groupByFromAndWhen = R.groupBy(transition => {
      return transition.from + transition.when;
    })(fsm.transitions);
    let epsilons = R.filter(R.whereEq({ when: EPSILON }))(fsm.transitions);

    for (let epsilonTransition of epsilons) {
      // If we have other transitions with different symbols from the same state, we include in the group
      let sameStateTransitions = R.filter(
        R.where({
          from: R.equals(epsilonTransition.from),
          when: R.complement(R.equals(EPSILON)),
        })
      )(fsm.transitions);

      for (let same of sameStateTransitions) {
        groupByFromAndWhen[same.from + same.when].push(epsilonTransition);
      }
    }

    return (
      R.values(
        R.filter(group => {
          return group.length > 1;
        }, groupByFromAndWhen)
      ).length === 0
    );
  }

  return false;
}

export function determinateWithSteps(fsm) {
  let automatas = [fsm.clone()];
  determinate(fsm.clone(), automatas);
  return automatas;
}

/**
 * Determinate automate
 *
 * @param fsm FSM
 * @param automatas Array
 * @return {Array}
 */
export function determinate(fsm, automatas = []) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);

  if (!isDeterministic(fsm)) {
    // Eliminate epsilon transitions to ensure the determinism
    if (fsm.hasEpsilonTransitions()) {
      fsm.eliminateEpsilonTransitions();
      automatas.push(fsm.clone());
    }

    // We can only determinate if we have the initial state
    if (fsm.initial && fsm.states.includes(fsm.initial)) {
      let currentComposedState = [fsm.initial];
      let newInitial = currentComposedState;
      let newStates = [currentComposedState];
      let newFinals = [];
      let newTransitions = formComposedState(
        currentComposedState,
        fsm.alphabet,
        fsm.transitions,
        newStates
      );

      // Mark the final states
      for (let state of newStates) {
        if (R.intersection(fsm.finals, state).length > 0) {
          newFinals.push(state);
        }
      }

      // Convert all composed array states to string
      newInitial = newInitial.join('');
      newStates = newStates.map(state => state.join(''));
      newFinals = newFinals.map(final => final.join(''));
      newTransitions = newTransitions.map(transition => {
        transition.to = transition.to.join('');
        transition.from = transition.from.join('');
        return transition;
      });

      fsm.initial = newInitial;
      fsm.states = newStates;
      fsm.transitions = newTransitions;
      fsm.finals = newFinals;
    }

    automatas.push(fsm.clone());
  }

  return automatas;
}

/**
 * @param currentComposedState []
 * @param alphabet []
 * @param transitions []
 * @param states Set
 * @returns {Array}
 * @private
 */
function formComposedState(
  currentComposedState,
  alphabet,
  transitions,
  states
) {
  let newTransitions = [];

  // for each symbol of the alphabet, lets see where we can go on the original FSM and compose the state
  for (let symbol of alphabet) {
    let pathsWithSymbol = [];
    // for each independent state of the current state
    for (let state of currentComposedState) {
      pathsWithSymbol = [
        ...pathsWithSymbol,
        ...R.filter(R.whereEq({ from: state, when: symbol }))(transitions),
      ];
    }

    // If we found transitions from the symbol, we use it to create a new composed state
    if (pathsWithSymbol.length) {
      // Will be in a form of ['A', 'C'] for example
      const newComposedState = R.uniq(R.pluck('to', pathsWithSymbol)).sort();

      // Create the new transition to the composedState
      newTransitions.push({
        from: currentComposedState,
        to: newComposedState,
        when: symbol,
      });

      // If the state is new, lets calculate its transitions and maybe new derived composed states
      if (!R.contains(newComposedState, states)) {
        states.push(newComposedState);
        newTransitions = [
          ...newTransitions,
          ...formComposedState(newComposedState, alphabet, transitions, states),
        ];
      }
    }
  }

  return newTransitions;
}
