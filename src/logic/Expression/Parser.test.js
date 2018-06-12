import Parser, {
  buildFSMFromTree,
  buildTree,
  convertFromExpressionToFSM,
  LAMBDA,
  toExplicit,
  toPostfix,
} from './Parser';
import { multiTrimNoLines } from '../helpers';
import * as R from 'ramda';

describe('Expression', () => {
  describe('Parser', () => {
    const parser = new Parser();

    describe('trim', () => {
      it('should remove spaces and new lines from expression', () => {
        expect(multiTrimNoLines('')).toEqual('');
        expect(multiTrimNoLines(' ')).toEqual('');
        expect(multiTrimNoLines(' a    \n   ')).toEqual('a');
        expect(multiTrimNoLines(' a   b    \n   ')).toEqual('ab');
        expect(multiTrimNoLines('a . b. c* (aaab?)\n\n*')).toEqual(
          'a.b.c*(aaab?)*'
        );
      });
    });

    describe('toExplicit', () => {
      it('should add . where needed to the regular expression', () => {
        for (let _case of cases) {
          expect(toExplicit(_case.text)).toEqual(_case.explicit);
        }
      });
    });

    describe('toPostFix', () => {
      it('should transform an explicit regular expression to postfix', () => {
        for (let _case of cases) {
          expect(toPostfix(_case.explicit)).toEqual(_case.postfix);
        }
      });
    });

    describe('buildTree', () => {
      it('should transform a simple postfix regular expression to a tree', () => {
        for (let _case of cases) {
          if (_case.tree) {
            const tree = buildTree(_case.postfix);
            expect(tree.toFormattedString()).toEqual(_case.tree);
          }
        }
      });
    });

    describe('collectNodes up and down', () => {
      it('should collect the nodes going down correctly', () => {
        const tree = buildTree(toPostfix(toExplicit('(ab)*')));
        expect(tree.toFormattedString()).toEqual('[*, [., [a], [b]]]');

        expect(tree.value).toEqual('*');
        expect(tree.left.value).toEqual('.');
        expect(tree.left.left.value).toEqual('a');
        expect(tree.left.right.value).toEqual('b');
        expect(tree.left.right.lastFather.value).toEqual('*');
        expect(R.map(n => n.value)(tree.collectNodesGoingDown())).toEqual([
          'a',
          LAMBDA,
        ]);
      });

      it('should collect the nodes going up correctly', () => {
        const tree = buildTree(toPostfix(toExplicit('(ab)*')));
        expect(tree.toFormattedString()).toEqual('[*, [., [a], [b]]]');

        expect(
          R.map(n => n.value)(tree.left.left.collectNodesGoingUp())
        ).toEqual(['b']);

        expect(R.map(n => n.value)(tree.left.collectNodesGoingUp())).toEqual([
          'b',
        ]);
      });
    });

    describe('make fsm', () => {
      it('should generate the correct FSM from a static one letter expression', () => {
        const tree = buildTree(toPostfix(toExplicit('a')));
        const fsm = buildFSMFromTree(tree);

        expect(fsm.states).toEqual(['A', 'B']);
        expect(fsm.initial).toEqual('A');
        expect(fsm.finals).toEqual(['B']);
        expect(fsm.alphabet).toEqual(['a']);
        expect(fsm.transitions).toEqual([{ from: 'A', to: 'B', when: 'a' }]);
        expect(fsm.generate(10)).toEqual(['a']);
      });

      it('should generate the correct FSM from a expression with union (|)', () => {
        const tree = buildTree(toPostfix(toExplicit('(aa|bb)*')));
        const fsm = buildFSMFromTree(tree);

        expect(fsm.states).toEqual(['A', 'B', 'C', 'D']);
        expect(fsm.initial).toEqual('A');
        expect(fsm.finals).toEqual(['A', 'D']);
        expect(fsm.alphabet).toEqual(['a', 'b']);
        expect(fsm.transitions).toEqual([
          { from: 'A', to: 'B', when: 'a' },
          { from: 'A', to: 'C', when: 'b' },
          { from: 'C', to: 'D', when: 'b' },
          { from: 'D', to: 'B', when: 'a' },
          { from: 'D', to: 'C', when: 'b' },
          { from: 'B', to: 'D', when: 'a' },
        ]);
        expect(fsm.generate(4).sort()).toEqual(
          ['', 'aa', 'bb', 'aaaa', 'aabb', 'bbbb', 'bbaa'].sort()
        );
      });

      it('should generate the correct FSM from a complex expression', () => {
        const expression = '(bb|(ab|ba)(aa|bb)*(ab|ba))*';
        const explicit = '(b.b|(a.b|b.a).(a.a|b.b)*.(a.b|b.a))*';
        const postfix = 'bb.ab.ba.|aa.bb.|*.ab.ba.|.|*';

        expect(toExplicit(expression)).toEqual(explicit);
        expect(toPostfix(explicit)).toEqual(postfix);

        const tree = buildTree(postfix);

        const fsm = buildFSMFromTree(tree);

        // expect(fsm.states).toEqual(['A', 'B']);
        // expect(fsm.initial).toEqual('A');
        // expect(fsm.finals).toEqual(['A']);
        // expect(fsm.alphabet).toEqual(['a', 'b']);
        // expect(fsm.transitions).toEqual([
        //   { from: 'A', to: 'B', when: 'a' },
        //   { from: 'A', to: 'B', when: 'b' },
        //   { from: 'B', to: 'A', when: 'a' },
        //   { from: 'B', to: 'B', when: 'b' },
        // ]);
        expect(fsm.generate(4).sort()).toEqual(
          ['', 'abab', 'abba', 'baab', 'baba', 'bb', 'bbbb'].sort()
        );
      });

      it('should generate the correct FSM from a simple expression', () => {
        const tree = buildTree(toPostfix(toExplicit('(ab)*')));
        const fsm = buildFSMFromTree(tree);

        expect(fsm.states).toEqual(['A', 'B', 'C']);
        expect(fsm.initial).toEqual('A');
        expect(fsm.finals).toEqual(['A', 'C']);
        expect(fsm.alphabet).toEqual(['a', 'b']);
        expect(fsm.transitions).toEqual([
          { from: 'A', to: 'B', when: 'a' },
          { from: 'B', to: 'C', when: 'b' },
          { from: 'C', to: 'B', when: 'a' },
        ]);
        expect(fsm.generate(10)).toEqual([
          '',
          'ab',
          'abab',
          'ababab',
          'abababab',
          'ababababab',
        ]);
      });
    });

    describe('enumerate', () => {
      it('should correctly enumerate all strings generated by a FSM converted from an regular expression', () => {
        for (let _case of cases) {
          if (_case.enumeration) {
            const length = Math.max(...R.map(e => e.length, _case.enumeration));
            const tree = buildTree(_case.postfix);
            const fsm = buildFSMFromTree(tree);

            expect(fsm.generate(length).sort()).toEqual(
              _case.enumeration.sort()
            );
          }
        }
      });
    });

    describe('invalid expressions', () => {
      it('should throw error when the expression is empty', () => {
        expect(() => {
          convertFromExpressionToFSM('    \n \t');
        }).toThrowError('empty');
      });

      it('should throw error when the expression is invalid because of invalid chars', () => {
        expect(() => {
          convertFromExpressionToFSM('* `dwqdj2918-é');
        }).toThrow();
        expect(() => {
          convertFromExpressionToFSM('aç');
        }).toThrow();
        expect(() => {
          convertFromExpressionToFSM('a+c');
        }).toThrow();
      });

      it('should throw error when the expression is invalid because of parentheses', () => {
        expect(() => {
          convertFromExpressionToFSM('*(');
        }).toThrowError('parentheses');
        expect(() => {
          convertFromExpressionToFSM('(ab');
        }).toThrowError('parentheses');
        expect(() => {
          convertFromExpressionToFSM('(ab))');
        }).toThrowError('parentheses');
        expect(() => {
          convertFromExpressionToFSM('(()))');
        }).toThrowError('parentheses');
      });

      it('should throw error when the expression only has operators', () => {
        expect(() => {
          convertFromExpressionToFSM('.');
        }).toThrow();
        expect(() => {
          convertFromExpressionToFSM('...');
        }).toThrow();
        expect(() => {
          convertFromExpressionToFSM('*');
        }).toThrow();
        expect(() => {
          convertFromExpressionToFSM('**');
        }).toThrow();
        expect(() => {
          convertFromExpressionToFSM('|.*?');
        }).toThrow();
      });
      it('should throw error when the expression only operators in sequence', () => {
        expect(() => {
          convertFromExpressionToFSM('.ab');
        }).toThrow();
        expect(() => {
          convertFromExpressionToFSM('**ab');
        }).toThrow();
      });
      it('should not throw error when the expression has correct operators *', () => {
        expect(() => {
          convertFromExpressionToFSM('ab*');
        }).not.toThrow();
        expect(() => {
          convertFromExpressionToFSM('ab**');
        }).not.toThrow();
      });
      it('should not generate the correct FSM from a simple expression with operator in incorrect place', () => {
        expect(() => {
          convertFromExpressionToFSM('(a|b|*c)');
        }).toThrow();
      });
    });
  });
});

const cases = [
  {
    text: 'a',
    explicit: 'a',
    postfix: 'a',
    tree: '[a]',
    enumeration: ['a'],
  },
  {
    text: 'ab',
    explicit: 'a.b',
    postfix: 'ab.',
    tree: '[., [a], [b]]',
    enumeration: ['ab'],
  },
  {
    text: 'ab*',
    explicit: 'a.b*',
    postfix: 'ab*.',
    tree: '[., [a], [*, [b]]]',
    enumeration: ['a', 'ab', 'abb', 'abbb', 'abbbb'],
  },
  {
    text: '(ab)*',
    explicit: '(a.b)*',
    postfix: 'ab.*',
    enumeration: ['', 'ab', 'abab', 'ababab', 'abababab'],
  },
  {
    text: 'ab.c*(aaab?)*',
    explicit: 'a.b.c*.(a.a.a.b?)*',
    postfix: 'ab.c*.aa.a.b?.*.',
    enumeration: ['ab', 'abc'],
  },
  {
    text: 'a?(ba)*b?',
    explicit: 'a?.(b.a)*.b?',
    postfix: 'a?ba.*.b?.',
    tree: '[., [., [?, [a]], [*, [., [b], [a]]]], [?, [b]]]',
    enumeration: [
      '',
      'a',
      'ab',
      'aba',
      'abab',
      'ababa',
      'b',
      'ba',
      'bab',
      'baba',
      'babab',
    ],
  },
  {
    text: '(a?(ba)*b?)|(b?(ab)*a?)',
    explicit: '(a?.(b.a)*.b?)|(b?.(a.b)*.a?)',
    postfix: 'a?ba.*.b?.b?ab.*.a?.|',
    tree:
      '[|, [., [., [?, [a]], [*, [., [b], [a]]]], [?, [b]]], [., [., [?, [b]], [*, [., [a], [b]]]], [?, [a]]]]',
    enumeration: [
      '',
      'a',
      'ab',
      'aba',
      'abab',
      'ababa',
      'b',
      'ba',
      'bab',
      'baba',
      'babab',
    ],
  },
];
