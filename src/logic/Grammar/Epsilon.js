import Grammar from '../Grammar';
import * as R from 'ramda';
import { ACCEPT_STATE, EPSILON } from '../SymbolValidator';
import { makeNewUniqueNonTerminalName } from '../helpers';
import { first } from './First';

export function getEpsilonProducers(grammar) {
  let epsilonProducers = [];
  let oldSize = epsilonProducers.length;
  let newSize = 1;

  while (oldSize !== newSize) {
    for (let symbol of grammar.Vn)
      for (let production of grammar.P[symbol])
        if (
          (production === '&' || epsilonProducers.includes(production)) &&
          !epsilonProducers.includes(symbol)
        )
          epsilonProducers.push(symbol);
    epsilonProducers = R.uniq(epsilonProducers);
    oldSize = newSize;
    newSize = epsilonProducers.length;
  }
  return epsilonProducers;
}

export function toEpsilonFree(steps = [], grammar) {
  if (isEpsilonFree(grammar)) {
    steps.push(grammar.clone());
    return;
  }

  grammar.removeUselessSymbols();

  let epsilonProducers = grammar.getEpsilonProducers();
  let oldNumProductions = grammar.getNumberOfProductions();
  let step = grammar.clone();
  let newProductionsNum = 0;
  let newProduction;
  while (oldNumProductions !== newProductionsNum) {
    for (let symbol of grammar.Vn) {
      for (let production of grammar.P[symbol]) {
        for (let epsilonProducer of epsilonProducers) {
          if (production.includes(epsilonProducer)) {
            newProduction = production
              .replace(epsilonProducer, '')
              .replace(/\s+/g, ' ')
              .replace(/^\s|\s$/g, '');
            if (newProduction === '') newProduction = '&';
            if (!grammar.P[symbol].includes(newProduction))
              grammar.P[symbol].push(newProduction);
          }
        }
        if (
          grammar.P[symbol].includes('&') &&
          !epsilonProducers.includes(symbol)
        )
          epsilonProducers.push(symbol);
      }
      grammar.P = R.map(p => R.uniq(p).sort(), grammar.P);
    }
    step.P = grammar.P;
    steps.push(step);
    oldNumProductions = newProductionsNum;
    newProductionsNum = grammar.getNumberOfProductions();
  }
  for (let symbol of grammar.Vn)
    if (symbol !== grammar.initialSymbol())
      if (grammar.P[symbol].indexOf('&') > -1)
        grammar.P[symbol].splice(grammar.P[symbol].indexOf('&'), 1);

  step.P = grammar.P;
  steps.push(step);
  step = grammar.clone();
  if (
    grammar.nonTerminalDerivesInitialSymbol() &&
    grammar.initialSymbolDerivesEpsilon()
  ) {
    let oldInitialSymbol = grammar.S;
    const newInitialSymbol = makeNewUniqueNonTerminalName(
      grammar.Vn,
      grammar.S
    );
    grammar.addNonTerminal(newInitialSymbol);
    grammar.P[grammar.S].splice(grammar.P[grammar.S].indexOf('&'), 1);
    grammar.S = newInitialSymbol;
    grammar.P[grammar.S] = [oldInitialSymbol, '&'];
    grammar.P = R.map(p => R.uniq(p).sort(), grammar.P);
    grammar.Vn.push(grammar.S);
  }
  grammar.removeEmptyNonTerminal();
  step.P = grammar.P;
  steps.push(step);
}

export function isEpsilonFree(grammar) {
  if (!grammar.isValid()) return true;

  for (let nonTerminal of R.without([grammar.initialSymbol()], grammar.Vn)) {
    if (first(grammar, nonTerminal).includes(EPSILON)) return false;
  }
  if (
    grammar.initialSymbolDerivesEpsilon() &&
    grammar.nonTerminalDerivesInitialSymbol()
  )
    return false;

  return true;
}
