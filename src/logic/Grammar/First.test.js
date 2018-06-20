import Grammar from '../Grammar';

describe('First', () => {
  it('should return empty when in a invalid grammar', () => {
    const grammar = Grammar.fromText('S -> aSS');
    expect(grammar.isValid()).toBeFalsy();
    expect(grammar.first('S')).toHaveLength(0);
  });

  it('should return the correct first on simple grammar 1 with epsilon', () => {
    const grammar = Grammar.fromText(
      `S -> A B C
        A -> a A | &
        B -> b B | A C d
        C -> c C | &`
    );
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.first('a')).toEqual(['a']);
    expect(grammar.first('b')).toEqual(['b']);
    expect(grammar.first('c')).toEqual(['c']);
    expect(grammar.first('d')).toEqual(['d']);
    expect(grammar.first('&')).toEqual(['&']);
    expect(grammar.first('')).toEqual([]);

    expect(grammar.first('abcd')).toEqual(['a']);
    expect(grammar.first('Cd')).toEqual(['c']);
    expect(grammar.first('CAd')).toEqual(['c']);

    expect(grammar.first('S')).toEqual(['a', 'b', 'c', 'd']);
    expect(grammar.first('A')).toEqual(['&', 'a']);
    expect(grammar.first('B')).toEqual(['a', 'b', 'c', 'd']);
    expect(grammar.first('C')).toEqual(['&', 'c']);
  });

  it('should return the correct first on simple grammar 2 with epsilon', () => {
    const grammar = Grammar.fromText(
      `S -> A b C D | E F
        A -> a A | &
        C -> E C F | c
        D -> C D | d D d | &
        E -> e E | &
        F -> F S | f F | g`
    );
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.first('a')).toEqual(['a']);
    expect(grammar.first('b')).toEqual(['b']);
    expect(grammar.first('c')).toEqual(['c']);
    expect(grammar.first('d')).toEqual(['d']);
    expect(grammar.first('e')).toEqual(['e']);
    expect(grammar.first('f')).toEqual(['f']);
    expect(grammar.first('g')).toEqual(['g']);
    expect(grammar.first('&')).toEqual(['&']);
    expect(grammar.first('')).toEqual([]);

    expect(grammar.first('S')).toEqual(['a', 'b', 'e', 'f', 'g']);
    expect(grammar.first('A')).toEqual(['&', 'a']);
    expect(grammar.first('C')).toEqual(['c', 'e']);
    expect(grammar.first('D')).toEqual(['&', 'c', 'd', 'e']);
    expect(grammar.first('E')).toEqual(['&', 'e']);
    expect(grammar.first('F')).toEqual(['f', 'g']);
  });

  it('should return the correct first on simple grammar 3 with epsilon', () => {
    const grammar = Grammar.fromText(
      ` E  -> T E0
        E0 -> + T E0 | &
        T  -> F T0
        T0 -> * F T0 | &
        F  -> ( E ) | id`
    );
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.first('+')).toEqual(['+']);
    expect(grammar.first('*')).toEqual(['*']);
    expect(grammar.first('(')).toEqual(['(']);
    expect(grammar.first(')')).toEqual([')']);
    expect(grammar.first('id')).toEqual(['id']);

    expect(grammar.first('id + id')).toEqual(['id']);

    expect(grammar.first('E')).toEqual(['(', 'id'].sort());
    expect(grammar.first('E0')).toEqual(['+', '&'].sort());
    expect(grammar.first('T')).toEqual(['(', 'id'].sort());
    expect(grammar.first('T0')).toEqual(['*', '&'].sort());
    expect(grammar.first('F')).toEqual(['(', 'id'].sort());
  });
});
