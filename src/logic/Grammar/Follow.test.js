import Grammar from '../Grammar';
import { END } from '../SymbolValidator';

describe('Follow', () => {
  it('should return empty when in a invalid grammar', () => {
    const grammar = Grammar.fromText('S -> aSS');
    expect(grammar.isValid()).toBeFalsy();
    expect(grammar.follow('S')).toHaveLength(0);
  });

  it('should return empty when we want the follow of something that is not a non terminal', () => {
    const grammar = Grammar.fromText('S -> a S | a | b | &');
    expect(grammar.isValid()).toBeTruthy();
    expect(grammar.follow('a')).toHaveLength(0);
    expect(grammar.follow('b')).toHaveLength(0);
    expect(grammar.follow('&')).toHaveLength(0);
  });

  it('should return the correct follow on simple grammar 1 with epsilon', () => {
    const grammar = Grammar.fromText(
      `S -> A B C
        A -> a A | &
        B -> b B | A C d
        C -> c C | &`
    );
    expect(grammar.isValid()).toBeTruthy();

    expect(grammar.follow('S')).toEqual([END]);
    expect(grammar.follow('A')).toEqual(['a', 'b', 'c', 'd']);
    expect(grammar.follow('B')).toEqual([END, 'c']);
    expect(grammar.follow('C')).toEqual([END, 'd']);
  });

  it('should return the correct follow on simple grammar 2 with epsilon', () => {
    const grammar = Grammar.fromText(
      `S -> A b C D | E F
        A -> a A | &
        C -> E C F | c
        D -> C D | d D d | &
        E -> e E | &
        F -> F S | f F | g`
    );
    expect(grammar.isValid()).toBeTruthy();

    expect(grammar.follow('S')).toEqual([
      END,
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
    ]);
    expect(grammar.follow('A')).toEqual(['b']);
    expect(grammar.follow('C')).toEqual([
      END,
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
    ]);
    expect(grammar.follow('D')).toEqual([
      END,
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
    ]);
    expect(grammar.follow('E')).toEqual(['c', 'e', 'f', 'g']);
    expect(grammar.follow('F')).toEqual([
      END,
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
    ]);
  });

  it('should return the correct follow on simple grammar 3 with epsilon', () => {
    const grammar = Grammar.fromText(
      ` E  -> T E0
        E0 -> + T E0 | &
        T  -> F T0
        T0 -> * F T0 | &
        F  -> ( E ) | id`
    );
    expect(grammar.isValid()).toBeTruthy();

    expect(grammar.follow('E')).toEqual([END, ')'].sort());
    expect(grammar.follow('E0')).toEqual([END, ')'].sort());
    expect(grammar.follow('T')).toEqual([END, '+', ')'].sort());
    expect(grammar.follow('T0')).toEqual([END, '+', ')'].sort());
    expect(grammar.follow('F')).toEqual([END, '+', '*', ')'].sort());
  });

  it('should return the correct follow on grammar 8a', () => {
    const grammar = Grammar.fromText(
      `P -> B P0
      P0 -> & | ; B P0
      C -> C0 | b D
      C0 -> & | com C0
      D -> C e C0 | K V ; C e C0
      B -> K V C
      K -> & | c K
      V -> & | v V`
    );
    expect(grammar.isValid()).toBeTruthy();

    expect(grammar.follow('P')).toEqual([END].sort());
    expect(grammar.follow('B')).toEqual([END, ';'].sort());
    expect(grammar.follow('C')).toEqual([END, ';', 'e'].sort());
    expect(grammar.follow('C0')).toEqual([END, ';', 'e'].sort());
    expect(grammar.follow('D')).toEqual([END, ';', 'e'].sort());
    expect(grammar.follow('K')).toEqual([END, 'v', ';', 'b', 'com'].sort());
    expect(grammar.follow('P0')).toEqual([END].sort());
    expect(grammar.follow('V')).toEqual([END, ';', 'b', 'com'].sort());
  });
});
