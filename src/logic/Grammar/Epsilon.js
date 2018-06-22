import Grammar from '../Grammar';
import { ACCEPT_STATE, EPSILON } from '../SymbolValidator';
import { makeNewUniqueNonTerminalName } from '../helpers';

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

    oldSize = newSize;
    newSize = epsilonProducers.length;
  }
  return epsilonProducers;
}

export function toEpsilonFree(steps = [], grammar) {
  grammar.removeUselessSymbols();
  let epsilonProducers = grammar.getEpsilonProducers();
  let oldNumProductions = grammar.getNumberOfProductions();
  let step = grammar.clone();
  let newProductions = 0;
  let newProduction;

  while (oldNumProductions !== newProductions) {
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
    }
    step.P = grammar.P;
    steps.push(step);
    step = grammar.clone();
    oldNumProductions = newProductions;
    newProductions = grammar.getNumberOfProductions();
  }
  for (let symbol of grammar.Vn)
    if (symbol !== grammar.initialSymbol())
      grammar.P[symbol].splice(grammar.P[symbol].indexOf('&'), 1);

  step.P = grammar.P;
  steps.push(step);
  step = grammar.clone();
  if (
    grammar.nonTerminalDerivesInitialSymbol() &&
    grammar.initialSymbolDerivesEpsilon()
  ) {
    let oldInitialSymbol = grammar.S;
    const newInitialSymbol = makeNewUniqueNonTerminalName(grammar.Vn, grammar.S);
    grammar.addNonTerminal(newInitialSymbol);
    grammar.P[grammar.S].splice(grammar.P[grammar.S].indexOf('&'), 1);
    grammar.S = newInitialSymbol;
    grammar.P[grammar.S] = [oldInitialSymbol, '&'];
    grammar.Vn.push(grammar.S);
  }
  step.P = grammar.P;
  steps.push(step);
}

export function isEpsilonFree(grammar) {
  if (!grammar.isValid()) return false;

  for (let nonTerminal of grammar.Vn) {
    if (Array.isArray(grammar.P[nonTerminal])) {
      for (let production_ of grammar.P[nonTerminal]) {
        if (production_ === '&' && nonTerminal !== grammar.initialSymbol()) {
          return false;
        } else {
          if (
            grammar.initialSymbolDerivesEpsilon() &&
            grammar.nonTerminalDerivesInitialSymbol()
          ) {
            return false;
          }
        }
      }
    }
  }
  return true;
}
