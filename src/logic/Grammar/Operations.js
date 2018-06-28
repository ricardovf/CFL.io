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
import Grammar from '../Grammar';

export function cloneGrammarWithSteps(grammar) {
  return [grammar.clone()];
}

export function toEpsilonFreeWithSteps(grammar) {
  let steps = [grammar.clone()];
  if (!grammar.isEpsilonFree()) {
    steps = [];
    toEpsilonFree(steps, grammar.clone());
  }
  return _makeStepsUnique(steps);
}

export function eliminateSimpleProductionsWithSteps(grammar) {
  let steps = [grammar.clone()];
  if (grammar.hasSimpleProductions()) {
    steps = [];
    removeSimpleProductions(steps, grammar.clone());
    if (steps.length === 0) steps = [Grammar.makeEmptyGrammar()];
  }
  return _makeStepsUnique(steps);
}

export function eliminateInfertileSymbolsWithSteps(grammar) {
  let steps = [grammar.clone()];
  if (grammar.hasInfertileSymbols()) {
    steps = [];
    removeInfertileSymbols(grammar.clone(), steps);
    if (steps.length === 0) steps = [Grammar.makeEmptyGrammar()];
  }
  return _makeStepsUnique(steps);
}

export function eliminateUnreachableSymbolsWithSteps(grammar) {
  let steps = [grammar.clone()];
  if (grammar.hasUnreachableSymbols()) {
    steps = [];
    removeUnreachableSymbols(steps, grammar.clone());
    if (steps.length === 0) steps = [Grammar.makeEmptyGrammar()];
  }
  return _makeStepsUnique(steps);
}

export function toOwnWithSteps(grammar) {
  let steps = [grammar.clone()];
  if (!grammar.isOwn()) {
    steps = [];
    let newGrammar = grammar.clone();
    newGrammar.toOwn(steps);
    if (!newGrammar.isValid() || steps.length === 0)
      steps = [Grammar.makeEmptyGrammar()];
  }
  return _makeStepsUnique(steps);
}

function _makeStepsUnique(steps) {
  return R.uniq(steps);
}
