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

  it('should return the correct status of indirect factorization on simple grammar 2', () => {
    const grammar = Grammar.fromText(
      `S -> A | a S
       A -> & | a A c`
    );
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.isFactored()).toBeFalsy();
    expect(grammar.getFactors()).toEqual({
      S: {
        indirect: {
          a: ['A', 'a S'],
        },
      },
    });

    // Expect that it can be factored in 1 step, because its direct
    // expect(grammar.canBeFactored(1)).toBeTruthy();
  });

  it('should return the correct status of indirect factorization on simple grammar 3', () => {
    const grammar = Grammar.fromText(
      `S -> A | a S | a A | b A | b S
       A -> & | a A c | B B
       B -> b B`
    );
    expect(grammar.isValid()).toBeTruthy();
    // expect(grammar.isFactored()).toBeFalsy();
    expect(grammar.getFactors()).toEqual({
      S: { indirect: { a: ['A', 'a A', 'a S'], b: ['A', 'b A', 'b S'] } },
    });

    // Expect that it can be factored in 1 step, because its direct
    // expect(grammar.canBeFactored(1)).toBeTruthy();
  });

  it('should return the correct status of indirect factorization on simple grammar 3', () => {
    const grammar = Grammar.fromText(
      `S -> A B | B C
       A -> a A | &
       B -> b B | d
       C -> c C | c`
    );
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.isFactored()).toBeFalsy();
    expect(grammar.getFactors()).toEqual({
      C: { direct: { c: ['c', 'c C'] } },
      S: { indirect: { b: ['A B', 'B C'], d: ['A B', 'B C'] } },
    });

    // Expect that it can be factored in 1 step, because its direct
    // expect(grammar.canBeFactored(1)).toBeTruthy();
  });

  it('should return the correct status of direct factorization on if grammar', () => {
    const grammar = Grammar.fromText(
      `C -> com | if E then C | if E then C else C
       E -> exp`
    );
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.isFactored()).toBeFalsy();
    expect(grammar.getFactors()).toEqual({
      C: { direct: { 'if E then C': ['if E then C', 'if E then C else C'] } },
    });

    // Expect that it can be factored in 1 step, because its direct
    // expect(grammar.canBeFactored(1)).toBeTruthy();
  });
});
