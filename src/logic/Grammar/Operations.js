/**
 * @param grammar {Grammar}
 * @return {*[]}
 */
import { toEpsilonFree } from './Epsilon';
import { removeSimpleProductions } from './SimpleProductions';
import {
  removeInfertileSymbols,
  removeUnreachableSymbols,
} from './UselessSymbols';
import * as R from 'ramda';

export function cloneGrammarWithSteps(grammar) {
  return [grammar.clone()];
}

export function toEpsilonFreeWithSteps(grammar) {
  let steps = [grammar.clone()];
  toEpsilonFree(steps, grammar.clone());
  return _makeStepsUnique(steps);
}

export function eliminateSimpleProductionsWithSteps(grammar) {
  let steps = [grammar.clone()];
  removeSimpleProductions(steps, grammar.clone());
  return _makeStepsUnique(steps);
}

export function eliminateInfertileSymbolsWithSteps(grammar) {
  let steps = [grammar.clone()];
  removeInfertileSymbols(grammar.clone(), steps);
  return _makeStepsUnique(steps);
}

export function eliminateUnreachableSymbolsWithSteps(grammar) {
  let steps = [grammar.clone()];
  removeUnreachableSymbols(steps, grammar.clone());
  return _makeStepsUnique(steps);
}

export function toOwnWithSteps(grammar) {
  let steps = [grammar.clone()];
  grammar.clone().toOwn(steps);
  return _makeStepsUnique(steps);
}

function _makeStepsUnique(steps) {
  return R.uniq(steps);
}
