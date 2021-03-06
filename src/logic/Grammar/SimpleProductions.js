import * as R from 'ramda';
import SymbolValidator, { EPSILON } from '../SymbolValidator';

export function removeSimpleProductions(steps = [], grammar) {
  // Remove productions of kind C -> C
  for (let nT of grammar.Vn) {
    if (grammar.P[nT] && grammar.P[nT].includes(nT)) {
      grammar.P[nT] = R.without([nT], grammar.P[nT]);
    }
  }

  if (!hasSimpleProductions(grammar)) {
    grammar.removeEmptyNonTerminal();
    steps.push(grammar.clone());
    return;
  }

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
    for (let simpleProduction of simpleProductions[symbol]) {
      for (let indirectProduction of simpleProductions[simpleProduction])
        if (!simpleProductions[symbol].includes(indirectProduction))
          simpleProductions[symbol].push(indirectProduction);
    }

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
    newProductions = R.map(p => R.uniq(p).sort(), newProductions);
    step.P = newProductions;
    step.Vn = R.uniq(step.Vn);
    step.Vt = R.uniq(step.Vt);
    step.removeEmptyNonTerminal();
    if (R.keys(step.P).length > 0) {
      // if (step.S === null) step.S = R.head(R.keys(step.P));
      steps.push(step);
    }

    step = grammar.clone();
  }
  grammar.P = newProductions;
  grammar.removeEmptyNonTerminal();
}

export function getNonTerminalsFromProduction(p, grammar) {
  let nonTerminals = [];
  let nonTerminal = '';

  for (let char of p) {
    if (char !== ' ') {
      nonTerminal += char;
    } else {
      if (nonTerminal !== '' && grammar.Vn.includes(nonTerminal)) {
        nonTerminals.push(nonTerminal);
      }
      nonTerminal = '';
    }
  }
  if (nonTerminal !== '' && grammar.Vn.includes(nonTerminal)) {
    nonTerminals.push(nonTerminal);
  }
  return nonTerminals;
}

export function getTerminalsFromProduction(p, grammar) {
  let terminals = [];
  let terminal = '';

  for (let char of p) {
    if (char !== ' ') {
      terminal += char;
    } else {
      if (terminal !== '' && grammar.Vt.includes(terminal)) {
        terminals.push(terminal);
      }
      terminal = '';
    }
  }
  if (terminal !== '' && grammar.Vt.includes(terminal)) {
    terminals.push(terminal);
  }
  return terminals;
}

export function getSimpleProductions(grammar) {
  let simpleProductions = [];

  for (let nonTerminal of grammar.Vn)
    if (simpleProductions[nonTerminal] === undefined)
      simpleProductions[nonTerminal] = [];

  for (let nonTerminal of grammar.Vn)
    if (grammar.P[nonTerminal]) {
      for (let production of grammar.P[nonTerminal]) {
        if (production.length === 1 && grammar.Vn.indexOf(production) > -1)
          simpleProductions[nonTerminal].push(production);
      }
    }
  return simpleProductions;
}

export function getSimpleProductionsFromSymbol(symbol, grammar) {
  let simpleProductions = [];

  if (grammar.P[symbol]) {
    for (let production of grammar.P[symbol])
      if (production.length === 1 && grammar.Vn.indexOf(production) > -1)
        simpleProductions.push(production);
  }

  return simpleProductions;
}

export function getNonSimpleProductions(symbol, grammar) {
  let nonSimpleProductions = [];

  if (grammar.P[symbol]) {
    for (let production of grammar.P[symbol]) {
      if (production.length > 1 || grammar.Vt.includes(production))
        nonSimpleProductions.push(production);
    }
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
