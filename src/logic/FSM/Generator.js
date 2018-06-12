import * as R from 'ramda';
import FSM, { GENERATE_MAX_SIZE } from '../FSM';

/**
 * Generates all sentences less or equal the length passed
 *
 * @param fsm FSM
 * @param maxLength
 * @param currentState
 * @param currentSentence
 * @returns {Array}
 */
export function generate(
  fsm,
  maxLength,
  currentState = fsm.initial,
  currentSentence = ''
) {
  if (!fsm instanceof FSM)
    throw new Error(`Received ${fsm} instead of an FSM instance.`);

  if (
    typeof maxLength !== 'number' ||
    maxLength < 1 ||
    maxLength > GENERATE_MAX_SIZE
  )
    throw new RangeError(
      `Size must be an integer between 1 and ${GENERATE_MAX_SIZE}. The value passed was: ${maxLength}`
    );

  if (fsm.hasEpsilonTransitions()) {
    fsm = makeClonedNonEpsilonFSM(fsm);
  }

  let sentences = [];

  if (fsm.finals.includes(currentState)) {
    sentences.push(currentSentence);
  }

  if (currentSentence.length < maxLength) {
    // Find all transitions going from current state
    let paths = R.filter(R.whereEq({ from: currentState }))(fsm.transitions);

    for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
      const path = paths[pathIndex];
      const innerCurrentSentence = currentSentence + path.when;

      sentences = R.union(
        sentences,
        generate(fsm, maxLength, path.to, innerCurrentSentence)
      );
    }
  }

  return currentState === fsm.initial ? R.uniq(sentences).sort() : sentences;
}

/**
 * When we have an FSM that has epsilon transitions, we remove then, and after that we convert
 * @param fsm
 * @returns {FSM}
 */
function makeClonedNonEpsilonFSM(fsm) {
  // create a new FSM without epsilon transitions and run the generate there, so we prevent infinite loops
  const fsmWithoutEpsilon = fsm.clone();

  fsmWithoutEpsilon.eliminateEpsilonTransitions();

  if (fsmWithoutEpsilon.hasEpsilonTransitions()) {
    throw new Error(
      'FSM.generate expects that the FSM to be generated can be converted to a version without epsilon transitions.'
    );
  }

  return fsmWithoutEpsilon;
}
