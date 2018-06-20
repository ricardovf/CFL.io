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
});
