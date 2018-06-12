import FSM from '../FSM';
import { multiTrimNoLines } from '../helpers';
import SymbolValidator, { makeNewUniqueStateName } from '../SymbolValidator';
import Node from './Node';
import * as R from 'ramda';

export const LAMBDA = 'λ';
export const OPERATOR_STAR = '*';
export const OPERATOR_STAR_PRECEDENCE = 1;
export const OPERATOR_MAYBE = '?';
export const OPERATOR_MAYBE_PRECEDENCE = 1;
export const OPERATOR_DOT = '.';
export const OPERATOR_DOT_PRECEDENCE = 2;
export const OPERATOR_UNION = '|';
export const OPERATOR_UNION_PRECEDENCE = 3;
export const OPERATORS = [
  OPERATOR_STAR,
  OPERATOR_MAYBE,
  OPERATOR_DOT,
  OPERATOR_UNION,
];

export default class Parser {
  constructor(input = '') {
    this.input = input;
    this.fsm = null;
  }

  /**
   * @param input
   * @returns {boolean}
   */
  changed(input) {
    return input !== this._originalInput;
  }

  /**
   * @returns {string}
   */
  get input() {
    return this._input;
  }

  /**
   * @param input
   * @returns {Parser}
   */
  setInput(input) {
    this.input = input;
    return this;
  }

  /**
   * @param input
   */
  set input(input) {
    if (this.changed(input)) {
      this._originalInput = input;
      this.fsm = null;

      if (typeof input !== 'string' || input === undefined || input === null) {
        input = '';
      }

      this._input = input;
    }
  }

  /**
   * Tries to convert the text regular expression to an FSM using De Simone
   * @param input
   * @throws
   * @returns {FSM}
   */
  run(input = undefined) {
    if (input !== undefined) {
      this.input = input;
    }

    // apply multiTrim (remove spaces and new lines)
    const trimmed = multiTrimNoLines(this._input);

    // check if contains invalid chars
    checkForInvalidSymbols(trimmed);

    // make operations explicit
    const explicit = toExplicit(trimmed);

    // change to post order
    const postFixed = toPostfix(explicit);

    // build the tree nodes from the post order expression
    const tree = buildTree(postFixed);

    this.fsm = buildFSMFromTree(tree);

    return this.fsm;
  }

  /**
   * Return the precedence of the operator
   *
   * @param operator
   * @return {int} the order of the operator if its valid, otherwise, -1
   */
  static getOperatorPrecedence(operator) {
    switch (operator) {
      case OPERATOR_STAR:
        return OPERATOR_STAR_PRECEDENCE;
      case OPERATOR_MAYBE:
        return OPERATOR_MAYBE_PRECEDENCE;
      case OPERATOR_DOT:
        return OPERATOR_DOT_PRECEDENCE;
      case OPERATOR_UNION:
        return OPERATOR_UNION_PRECEDENCE;
      default:
        return -1;
    }
  }

  /**
   * @param char
   * @returns {boolean}
   */
  static isOperator(char) {
    return OPERATORS.includes(char);
  }
}

const parser = new Parser();

/**
 * @param text
 * @throws
 * @returns {FSM}
 */
export function convertFromExpressionToFSM(text) {
  return parser.run(text);
}

/**
 * Explicit the dots/concatenation (.) in the regular expression
 *
 * @param input
 * @returns {string}
 */
export function toExplicit(input) {
  let output = '';

  for (let i = 0; i < input.length - 1; i++) {
    let currentChar = input.charAt(i);
    output += currentChar;

    let nextChar = input.charAt(i + 1);

    if (
      (!Parser.isOperator(currentChar) &&
        !Parser.isOperator(nextChar) &&
        currentChar !== '(' &&
        nextChar !== ')') ||
      (currentChar === ')' && nextChar === '(') ||
      (Parser.getOperatorPrecedence(currentChar) === OPERATOR_STAR_PRECEDENCE &&
        nextChar !== ')' &&
        (!Parser.isOperator(nextChar) || nextChar === '('))
    ) {
      output += '.';
    }
  }
  output += input.charAt(input.length - 1);

  return output;
}

/**
 * Inspired by https://gist.github.com/dineshrajpurohit/d14349fc48c6da937a04
 * Reference: http://interactivepython.org/runestone/static/pythonds/BasicDS/InfixPrefixandPostfixExpressions.html
 *
 * Infix to postfix implementation
 *
 * Algorithm:
 *  - Whenever an non operation character comes from expression we append to postfix string
 *  - Whenever a operator comes in we check the precedence of the incoming operator with the
 *    operator on the top of the stack if the stack is not null
 *  - If the precedence of the incoming operator is lower than or equal to operator on the top of
 *    the stack - Pop the operator on the stack and check the precedence again until the operator
 *    is greater than that of the operator on the stack
 *  - Append the popped operator to the postfix string
 *  - If there are no expressions left in the stack pop all the operators and append to the string
 *
 * @param input In a explicit format
 * @returns {string} The expression on postfix format
 */
export function toPostfix(input) {
  let output = '';
  let stack = [];

  let char;
  let precedence;
  for (let i = 0; i < input.length; i++) {
    char = input.charAt(i);
    if (char === '(') {
      stack.push(char);
    } else if (char === ')') {
      while (stack[stack.length - 1] !== '(') {
        output += stack.pop();
      }
      stack.pop();
    } else if ((precedence = Parser.getOperatorPrecedence(char)) >= 0) {
      while (
        stack.length > 0 &&
        Parser.getOperatorPrecedence(stack[stack.length - 1]) <= precedence &&
        stack[stack.length - 1] !== '('
      ) {
        output += stack.pop();
      }
      stack.push(char);
    } else {
      output += char;
    }
  }

  while (stack.length > 0) {
    output += stack.pop();
  }

  return output;
}

/**
 * Inspired by https://gist.github.com/dineshrajpurohit/3730c63619a828f47c52
 *
 * @param input Input text in a postfix format
 * @returns {Node} The root node of the tree
 */
export function buildTree(input) {
  let stack = [];

  for (let i = 0; i < input.length; i++) {
    let c = input.charAt(i);

    if (Parser.isOperator(c)) {
      // If it is an operator
      let node = new Node(c);

      if (Parser.getOperatorPrecedence(c) === OPERATOR_STAR_PRECEDENCE) {
        // If its an * or ? operator, it just have one left child
        let leftNode = stack.pop();
        leftNode.father = node;
        node.left = leftNode;
      } else {
        // If its an . or |, then there are two children
        let rightNode = stack.pop();
        rightNode.father = node;
        node.right = rightNode;

        let leftNode = stack.pop();
        leftNode.father = node;
        node.left = leftNode;
      }

      stack.push(node);
    } else {
      // If its not an operator, just create the node and put it on the stack
      // @todo maybe here we should validate if its a valid terminal and throw if not?
      stack.push(new Node(c));
    }
  }

  return stack.pop();
}

/**
 * @param node Node
 * @returns {FSM}
 */
export function buildFSMFromTree(node) {
  let fsm = FSM.makeEmptyFSM();

  // maps a list of nodes to FSM states
  let statesByNodeComposition = new Map();

  // List of [list of nodes] pending to analyse
  let pending = [];

  // Add the initial state
  let initialState = makeNewUniqueStateName();
  fsm.states.push(initialState);
  fsm.initial = initialState;

  // Collect nodes going down from the root node and add them to the pending list
  let firstComposition = node.collectNodesGoingDown();
  let firstCompositionId = _uniqueNameToComposition(firstComposition);
  statesByNodeComposition.set(firstCompositionId, initialState);
  pending.push(firstComposition);
  let analysed = [];

  // If one of the nodes is lambda, then we add this state to the finals
  if (
    firstComposition &&
    R.map(n => n.value, firstComposition).includes(LAMBDA)
  ) {
    fsm.finals.push(initialState);
  }

  // Build the FSM by consuming the pending list of node composition
  while (pending.length > 0) {
    let currentNodeComposition = pending.pop();
    let currentNodeCompositionId = _uniqueNameToComposition(
      currentNodeComposition
    );
    analysed.push(currentNodeCompositionId);

    let from = statesByNodeComposition.get(currentNodeCompositionId);

    // Map from each symbol to the composition of nodes
    let compositionsBySymbol = new Map();

    // Build de compositions for each symbol
    for (let compositionNode of currentNodeComposition) {
      if (!compositionNode.isLambda()) {
        let upComposition = compositionNode.collectNodesGoingUp();

        let symbolComposition =
          compositionsBySymbol.get(compositionNode.value) || [];

        compositionsBySymbol.set(
          compositionNode.value,
          R.union(symbolComposition, upComposition)
        );
      }
    }

    // Add to FSM one symbol at a time
    for (let symbol of Array.from(compositionsBySymbol.keys())) {
      if (!fsm.alphabet.includes(symbol)) fsm.alphabet.push(symbol);

      let symbolComposition = compositionsBySymbol.get(symbol);
      let symbolCompositionId = _uniqueNameToComposition(symbolComposition);

      let destiny = statesByNodeComposition.get(symbolCompositionId);
      if (destiny === undefined) {
        destiny = makeNewUniqueStateName(fsm.states);

        if (!fsm.states.includes(destiny)) fsm.states.push(destiny);

        statesByNodeComposition.set(symbolCompositionId, destiny);

        // If we have not yet analysed this composition, then we add it to pending
        if (!analysed.includes(symbolCompositionId))
          pending.push(symbolComposition);

        // If one of the nodes is lambda, then we add this state to the finals
        if (
          symbolComposition &&
          R.map(n => n.value, symbolComposition).includes(LAMBDA)
        ) {
          if (!fsm.finals.includes(destiny)) fsm.finals.push(destiny);
        }
      }

      let transition = {
        from: from,
        to: destiny,
        when: symbol,
      };

      if (!fsm.transitions.includes(transition))
        fsm.transitions.push(transition);
    }
  }

  return fsm;
}

function _uniqueNameToComposition(composition) {
  return R.uniq(R.map(n => n.id, composition))
    .sort()
    .join(', ');
}

/**
 * Checks if expression only contains operators (?|.*) or valid terminals or parentheses
 * @throws if invalid symbol is found
 * @param input
 * @returns {boolean}
 */
function checkForInvalidSymbols(input) {
  if (input === '') {
    throw new Error('Expression can`t be empty!');
  }

  for (let i = 0; i < input.length; i++) {
    let char = input.charAt(i);

    if (
      !Parser.isOperator(char) &&
      !SymbolValidator.isValidTerminalWithoutEpsilon(char) &&
      char !== '(' &&
      char !== ')'
    ) {
      throw new Error(`Invalid symbol "${char}" detected on the expression.`);
    }
  }

  if (!hasUnboundParentheses(input))
    throw new Error('Invalid parentheses matching');
}

function hasUnboundParentheses(exp) {
  // Only check if we have parentheses
  if (exp.indexOf('(') === false && exp.indexOf(')') === false) return true;

  return (
    exp.split('').reduce((acc, char) => {
      if (acc < 0) {
        return acc;
      }
      if (char === '(') {
        acc++;
      } else if (char === ')') {
        acc--;
      }
      return acc;
    }, 0) === 0
  );
}
