import Grammar from '../Grammar';

describe('Factor', () => {
  it('should return empty when in a invalid grammar', () => {
    const grammar = Grammar.fromText('S -> aSS | aSB');
    expect(grammar.isValid()).toBeFalsy();
    expect(grammar.isFactored()).toBeTruthy();
    expect(grammar.canBeFactored(10)).toBeFalsy();
  });

  it('should return the correct status of factorization on simple grammar 1', () => {
    const grammar = Grammar.fromText(
      `S -> a S | a B | d S
       B -> b B | b`
    );
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.isFactored()).toBeFalsy();
    expect(grammar.getFactors()).toEqual({
      S: {
        direct: {
          a: ['a B', 'a S'],
        },
      },
      B: {
        direct: {
          b: ['b', 'b B'],
        },
      },
    });

    // Expect that it can be factored in 1 step, because its direct
    // expect(grammar.canBeFactored(1)).toBeTruthy();
  });

  it('should return the correct status of indirect factorization on simple grammar 1', () => {
    const grammar = Grammar.fromText(
      `S -> A | a S
       A -> & | a A c`
    );
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.isFactored()).toBeFalsy();
    expect(grammar.getFactors()).toEqual({
      S: {
        indirect: {
          a: ['a S', 'A'],
        },
      },
    });

    // Expect that it can be factored in 1 step, because its direct
    // expect(grammar.canBeFactored(1)).toBeTruthy();
  });
});
