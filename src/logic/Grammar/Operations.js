/**
 * @param grammar {Grammar}
 * @return {*[]}
 */
import { toEpsilonFree } from './Epsilon';

export function cloneGrammarWithSteps(grammar) {
  return [grammar.clone()];
}

export function toEpsilonFreeWithSteps(grammar) {
  let steps = [];
  toEpsilonFree(steps, grammar.clone());
  return steps;
}
