import * as R from 'ramda';
import { EPSILON } from '../SymbolValidator';
import FSM from '../FSM';

/**
 * Works in deterministic and non deterministic FSM, with or without epsilon
 *
 * @param fsm FSM
 * @param sentence
 * @param currentState
 * @returns {Promise<*>}
 */
export async function recognize(fsm, sentence, currentState = fsm.initial) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);

  if (
    !fsm.isValid() ||
    sentence === EPSILON ||
    sentence === undefined ||
    sentence === null ||
    typeof sentence !== 'string'
  )
    return false;

  sentence = sentence.toString();

  // If the sentence is empty and the current state is final, accept the sentence
  if (sentence === '') {
    return fsm.finals.includes(currentState);
  }

  // Get the current symbol
  const symbol = sentence.charAt(0);

  // Find all transitions going from current state with the current symbol or EPSILON
  let paths = [
    ...R.filter(R.whereEq({ from: currentState, when: symbol }))(
      fsm.transitions
    ),
    ...R.filter(R.whereEq({ from: currentState, when: EPSILON }))(
      fsm.transitions
    ),
  ];

  // If we found possible paths
  if (paths.length) {
    // make a new Promise for each path to run
    paths = R.map(path => {
      return recognize(
        path.when === EPSILON ? sentence : sentence.substring(1),
        path.to
      );
    }, paths);

    // @todo make it in a way that if one promise returns true, then cancel all others branches
    return (await Promise.all(paths)).includes(true);
  }

  return false;
}
