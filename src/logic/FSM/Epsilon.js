import FSM from '../FSM';
import * as R from 'ramda';
import { EPSILON } from '../SymbolValidator';
import { determinate } from './Determinator';

/**
 * Check if the automata has any epsilon transitions
 *
 * @param fsm FSM
 * @returns {boolean}
 */
export function hasEpsilonTransitions(fsm) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);

  return (
    Array.isArray(fsm.transitions) &&
    R.filter(R.whereEq({ when: EPSILON }))(fsm.transitions).length > 0
  );
}

export function removeEpsilonWithSteps(fsm) {
  let automatas = [fsm.clone()];
  eliminateEpsilonTransitions(fsm.clone(), automatas);
  return automatas;
}

/**
 * Eliminate all epsilon transitions from the automata
 *
 * @param fsm FSM
 * @param automatas Array
 * @returns {Array}
 */
export function eliminateEpsilonTransitions(fsm, automatas = []) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);

  while (hasEpsilonTransitions(fsm)) {
    // Get one epsilon transition
    let transition = R.find(R.whereEq({ when: EPSILON }))(fsm.transitions);

    // Select the transitions that goes from the transition
    let newTransitions = R.filter(
      R.where({
        from: R.equals(transition.to),
      })
    )(fsm.transitions);

    newTransitions = R.map(t => {
      t.to = t.to === t.from ? transition.from : t.to;
      t.from = transition.from;
      return t;
    })(newTransitions);

    // Set the new transitions
    fsm.transitions = R.uniq([...fsm.transitions, ...newTransitions]);

    // If the state is final
    if (
      fsm.finals.includes(transition.to) &&
      !fsm.finals.includes(transition.from)
    ) {
      fsm.finals.push(transition.from);
    }

    // Remove the epsilon transactions
    fsm.transitions = R.reject(R.whereEq(transition))(fsm.transitions);

    automatas.push(fsm.clone());
  }

  fsm.alphabet.splice(fsm.alphabet.indexOf(EPSILON), 1);

  automatas.push(fsm.clone());

  return automatas;
}
