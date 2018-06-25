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

export function cloneGrammarWithSteps(grammar) {
  return [grammar.clone()];
}

export function toEpsilonFreeWithSteps(grammar) {
  let steps = [grammar.clone()];
  toEpsilonFree(steps, grammar.clone());
  return steps;
}

export function eliminateSimpleProductionsWithSteps(grammar) {
  let steps = [grammar.clone()];
  removeSimpleProductions(steps, grammar.clone());
  return steps;
}

export function eliminateInfertileSymbolsWithSteps(grammar) {
  let steps = [grammar.clone()];
  removeInfertileSymbols(grammar.clone(), steps);
  return steps;
}

export function eliminateUnreachableSymbolsWithSteps(grammar) {
  let steps = [grammar.clone()];
  removeUnreachableSymbols(steps, grammar.clone());
  return steps;
}

export function toOwnWithSteps(grammar) {
  let steps = [grammar.clone()];
  grammar.clone().toOwn(steps);
  return steps;
}
