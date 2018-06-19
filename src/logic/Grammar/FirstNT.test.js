import Grammar from '../Grammar';

describe('First-NT', () => {
  it('should return empty when in a invalid grammar', () => {
    const grammar = Grammar.fromText('S -> aSS');
    expect(grammar.isValid()).toBeFalsy();
    expect(grammar.firstNT('S')).toHaveLength(0);
  });

  it('should return the correct first-NT on simple grammar 1 with epsilon', () => {
    const grammar = Grammar.fromText(
      `S -> A B C
        A -> a A | &
        B -> b B | A C d
        C -> c C | &`
    );
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.firstNT('S')).toEqual(['A', 'B']);
    expect(grammar.firstNT('A')).toEqual([]);
    expect(grammar.firstNT('B')).toEqual(['A', 'C']);
    expect(grammar.firstNT('C')).toEqual([]);
  });

  it('should return the correct first-NT on simple grammar 2 with epsilon', () => {
    const grammar = Grammar.fromText(
      `S -> A b C D | E F
        A -> a A | &
        C -> E C F | c
        D -> C D | d D d | &
        E -> e E | &
        F -> F S | f F | g`
    );
    expect(grammar.isValid()).toBeTruthy();

    expect(grammar.firstNT('S')).toEqual(['A', 'E', 'F']);
    expect(grammar.firstNT('A')).toEqual([]);
    expect(grammar.firstNT('C')).toEqual(['C', 'E']);
    expect(grammar.firstNT('D')).toEqual(['C']);
    expect(grammar.firstNT('E')).toEqual([]);
    expect(grammar.firstNT('F')).toEqual(['F']);
  });

  it('should return the correct first-NT on simple grammar 3 with epsilon', () => {
    const grammar = Grammar.fromText(
      ` E  -> T E0
        E0 -> + T E0 | &
        T  -> F T0
        T0 -> * F T0 | &
        F  -> ( E ) | id`
    );
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.firstNT('E')).toEqual(['T']);
    expect(grammar.firstNT('E0')).toEqual([]);
    expect(grammar.firstNT('T')).toEqual(['F']);
    expect(grammar.firstNT('T0')).toEqual([]);
    expect(grammar.firstNT('F')).toEqual([]);
  });
});
