import * as R from 'ramda';
import SymbolValidator, { EPSILON } from '../SymbolValidator';

export function removeSimpleProductions(steps = [], grammar) {
  if (grammar.hasEpsilonTransitions()) {
    grammar.toEpsilonFree();
  }

  let simpleProductions = grammar.getSimpleProductions();
  let newProductions = {};
  let step = grammar.clone();

  for (let nonTerminal of grammar.Vn) {
    if (newProductions[nonTerminal] === undefined)
      newProductions[nonTerminal] = [];
  }

  for (let symbol of grammar.Vn)
    for (let simpleProduction of simpleProductions[symbol])
      for (let indirectProduction of simpleProductions[simpleProduction])
        if (!simpleProductions[symbol].includes(indirectProduction))
          simpleProductions[symbol].push(indirectProduction);

  for (let symbol of grammar.Vn) {
    for (let simpleProduction of simpleProductions[symbol]) {
      let nonSimpleProductions = grammar.getNonSimpleProductions(
        simpleProduction
      );
      for (let nonSimpleProduction of nonSimpleProductions)
        if (!newProductions[symbol].includes(nonSimpleProduction))
          newProductions[symbol].push(nonSimpleProduction);
    }

    let nonSimpleProductions_ = grammar.getNonSimpleProductions(symbol);
    for (let nonSimpleProduction of nonSimpleProductions_)
      if (!newProductions[symbol].includes(nonSimpleProduction))
        newProductions[symbol].push(nonSimpleProduction);
    step.P = newProductions;
    steps.push(step);
    step = grammar.clone();
  }
  grammar.P = newProductions;
}

export function getNonTerminalsFromProduction(p, grammar) {
  let nonTerminals = [];
  for (let char of p) {
    if (grammar.Vn.includes(char)) nonTerminals.push(char);
  }
  return nonTerminals;
}

export function getTerminalsFromProduction(p, grammar) {
  let terminals = [];
  for (let char of p) {
    if (grammar.Vt.includes(char)) terminals.push(char);
  }
  return terminals;
}

export function getSimpleProductions(grammar) {
  let simpleProductions = [];

  for (let nonTerminal of grammar.Vn)
    if (simpleProductions[nonTerminal] === undefined)
      simpleProductions[nonTerminal] = [];

  for (let nonTerminal of grammar.Vn)
    for (let production of grammar.P[nonTerminal])
      if (production.length === 1 && grammar.Vn.indexOf(production) > -1)
        simpleProductions[nonTerminal].push(production);

  return simpleProductions;
}

export function getSimpleProductionsFromSymbol(symbol, grammar) {
  let simpleProductions = [];

  for (let production of grammar.P[symbol])
    if (production.length === 1 && grammar.Vn.indexOf(production) > -1)
      simpleProductions.push(production);

  return simpleProductions;
}

export function getNonSimpleProductions(symbol, grammar) {
  let nonSimpleProductions = [];

  for (let production of grammar.P[symbol]) {
    if (production.length > 1 || grammar.Vt.includes(production))
      nonSimpleProductions.push(production);
  }
  return nonSimpleProductions;
}

  export function hasSimpleProductions(grammar) {
    if (!grammar.isValid()) return false;

    for (let nonTerminal of grammar.Vn) {
      if (Array.isArray(grammar.P[nonTerminal])) {
        for (let production of grammar.P[nonTerminal]) {
          if (production.length === 1 && grammar.Vn.indexOf(production) > -1)
            return true;
        }
      }
    }
    return false;
  }
