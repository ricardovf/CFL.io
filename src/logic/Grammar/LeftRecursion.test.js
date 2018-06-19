import Grammar from '../Grammar';

describe('First', () => {
  it('should return empty when in a invalid grammar', () => {
    const grammar = Grammar.fromText('S -> aSS | aSB');
    expect(grammar.isValid()).toBeFalsy();
    expect(grammar.getLeftRecursions()).toEqual({});
  });

  it('should return the correct direct left recursions on simple grammar 1', () => {
    const grammar = Grammar.fromText(
      `S -> A B C | S C
        A -> a A | &
        B -> b | b C
        C -> C a | C C b | C C c`
    );
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.hasLeftRecursion()).toBeTruthy();

    const leftRecursions = grammar.getLeftRecursions();
    expect(leftRecursions).toEqual({
      S: {
        direct: ['S C'],
      },
      C: {
        direct: ['C a', 'C C b', 'C C c'].sort(),
      },
    });
  });

  it('should return the correct direct left recursions on simple grammar 2', () => {
    const grammar = Grammar.fromText(
      `E -> E + T | T
       T -> T * F | F
       F -> ( E ) | id`
    );
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.hasLeftRecursion()).toBeTruthy();

    const leftRecursions = grammar.getLeftRecursions();
    expect(leftRecursions).toEqual({
      E: {
        direct: ['E + T'],
      },
      T: {
        direct: ['T * F'],
      },
    });
  });

  it('should return the correct indirect left recursions on simple grammar 3', () => {
    const grammar = Grammar.fromText(
      `S -> A a
       A -> S c | d
       B -> C d
       C -> D E
       D -> & | a
       E -> a | D B`
    );
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.hasLeftRecursion()).toBeTruthy();

    const leftRecursions = grammar.getLeftRecursions();
    expect(leftRecursions).toEqual({
      S: {
        indirect: ['A a'],
      },
      A: {
        indirect: ['S c'],
      },
      B: {
        indirect: ['C d'],
      },
      C: {
        indirect: ['D E'],
      },
    });
  });
});
