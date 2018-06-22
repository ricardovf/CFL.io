import * as R from 'ramda';
import SymbolValidator, { EPSILON } from '../SymbolValidator';

/**
   * @return {Array}
   */
export function getFertileSymbols(grammar) {
  let fertileSymbols = [];

  if (!grammar.isValid()) return fertileSymbols;

  let oldSize = fertileSymbols.length;
  let newSize = 1;
  let allNonTerminalFertile = true;
  while (oldSize !== newSize) {
    for (let nonTerminal of grammar.Vn) {
      if (Array.isArray(grammar.P[nonTerminal])) {
        for (let production of grammar.P[nonTerminal]) {
          let production_ = production.replace(/\s/g, '');
          if (grammar.productionWithOnlyTerminals(production_))
            if (!fertileSymbols.includes(nonTerminal))
              fertileSymbols.push(nonTerminal);

          let nonTerminals = grammar.getNonTerminalsFromProduction(production_);
          for (let nonTerminal_ of nonTerminals) {
            if (!fertileSymbols.includes(nonTerminal_))
              allNonTerminalFertile = false;
          }

          if (allNonTerminalFertile)
            if (!fertileSymbols.includes(nonTerminal))
              fertileSymbols.push(nonTerminal);
          allNonTerminalFertile = true;
        }
      }
    }
    oldSize = newSize;
    newSize = fertileSymbols.length;
  }
  return fertileSymbols;
}

export function removeInfertileSymbols(grammar, steps) {
  let fertileSymbols = grammar.getFertileSymbols();
    let infertileSymbols = grammar.getInfertileSymbols(fertileSymbols);
    let newProductions = {};
    let step = grammar.clone();
    let newVn = [];
    let newVt = [];
    let productionIncludesInfertile = false;

    for (let nonTerminal of grammar.Vn) {
      for (let production of grammar.P[nonTerminal]) {
        let nonTerminals = grammar.getNonTerminalsFromProduction(production);
        let terminals = grammar.getTerminalsFromProduction(production);
        for (let nonTerminal_ of nonTerminals) {
          if (infertileSymbols.includes(nonTerminal_))
            productionIncludesInfertile = true;
        }
        if (!productionIncludesInfertile) {
          if (newProductions[nonTerminal] === undefined)
            newProductions[nonTerminal] = [];
          newVn.push(nonTerminal);
          newProductions[nonTerminal].push(production);
          for (let terminal of terminals) newVt.push(terminal);
        }
        productionIncludesInfertile = false;
      }
      step.P = newProductions;
      step.Vt = newVt;
      step.Vn = newVn;
      steps.push(step);
      step = grammar.clone();
    }

    grammar.P = newProductions;
    grammar.Vt = R.uniq(newVt);
    grammar.Vn = R.uniq(newVn);
}

export function removeUnreachableSymbols(steps = [], grammar) {
  let reachableSymbols = grammar.getReachableSymbols();
    let unreachableSymbols = grammar.getUnreachableSymbols(reachableSymbols);
    let newProductions = {};
    let step = grammar.clone();
    let newVn = [];
    let newVt = [];
    let productionIncludesUnreachable = false;

    for (let nonTerminal of reachableSymbols) {
      if (grammar.Vn.includes(nonTerminal)) {
        for (let production of grammar.P[nonTerminal]) {
          let production_ = production.replace(/\s/g, '');
          let nonTerminals = grammar.getNonTerminalsFromProduction(production_);
          let terminals = grammar.getTerminalsFromProduction(production_);
          for (let nonTerminal_ of nonTerminals)
            if (unreachableSymbols.includes(nonTerminal_))
              productionIncludesUnreachable = true;

          for (let terminal of terminals)
            if (unreachableSymbols.includes(terminal))
              productionIncludesUnreachable = true;

          if (!productionIncludesUnreachable) {
            if (newProductions[nonTerminal] === undefined)
              newProductions[nonTerminal] = [];
            newProductions[nonTerminal].push(production);
            newVn.push(nonTerminal);
            for (let terminal of terminals) newVt.push(terminal);
          }
          productionIncludesUnreachable = false;
        }
      }
      step.P = newProductions;
      step.Vt = newVt;
      step.Vn = newVn;
      steps.push(step);
      step = grammar.clone();
    }

    grammar.P = newProductions;
    grammar.Vn = R.uniq(newVn);
    grammar.Vt = R.uniq(newVt);
}

export function getInfertileSymbols(fertileSymbols, grammar) {
  let infertileSymbols = [];
  if (Array.isArray(grammar.Vn)) {
    for (let symbol of grammar.Vn)
      if (!fertileSymbols.includes(symbol)) infertileSymbols.push(symbol);
  }

  return infertileSymbols;
}

export function getReachableSymbols(grammar) {
  if (!grammar.isValid()) return [];

  let reachableSymbols = [grammar.initialSymbol()];
  let oldSize = reachableSymbols.length;
  let newSize = 0;
  while (oldSize !== newSize) {
    for (let symbol of reachableSymbols) {
      if (grammar.Vn.includes(symbol)) {
        if (Array.isArray(grammar.P[symbol])) {
          for (let production of grammar.P[symbol]) {
            production = production.replace(/\s/g, '');
            let nonTerminals = grammar.getNonTerminalsFromProduction(production);
            let terminals = grammar.getTerminalsFromProduction(production);
            for (let nonTerminal of nonTerminals)
              if (!reachableSymbols.includes(nonTerminal))
                reachableSymbols.push(nonTerminal);

            for (let terminal of terminals)
              if (!reachableSymbols.includes(terminal))
                reachableSymbols.push(terminal);
          }
        }
      }
    }
    oldSize = newSize;
    newSize = reachableSymbols.length;
  }
  return reachableSymbols;
}

export function getUnreachableSymbols(reachableSymbols, grammar) {
  let unreachableSymbols = [];

  if (Array.isArray(grammar.Vn)) {
    for (let symbol of grammar.Vn)
      if (!reachableSymbols.includes(symbol)) unreachableSymbols.push(symbol);
  }

  if (Array.isArray(grammar.Vt)) {
    for (let symbol of grammar.Vt)
      if (!reachableSymbols.includes(symbol)) unreachableSymbols.push(symbol);
  }

  return unreachableSymbols;
}