import Grammar from '../Grammar';
import { ACCEPT_STATE, EPSILON } from '../SymbolValidator';

describe('Grammar', () => {
    describe('useless symbols', () => {
        it('should not detect unreachable symbols', () => {
            const grammar = Grammar.fromText(`S -> A | &\nA -> a S b | a b`);
            expect(grammar.hasUnreachableSymbols()).toBeFalsy();
        });

        it('should detect unreachable symbols', () => {
            const grammar = Grammar.fromText(
                `S -> A | &\nA -> a S b | a b\nB -> c B | c`
            );
            expect(grammar.hasUnreachableSymbols()).toBeTruthy();
        });

        it('should detect only fertile symbols', () => {
            const grammar = Grammar.fromText(
                `S -> A | &\nA -> a S b | a b\nB -> c B | c`
            );
            expect(grammar.hasInfertileSymbols()).toBeFalsy();
        });

        it('should detect infertile symbols', () => {
            const grammar = Grammar.fromText(
                `S -> A | &\nA -> a S b | a b\nB -> c B | c\nC -> c C`
            );
            expect(grammar.hasInfertileSymbols()).toBeTruthy();
        });

        it('should remove infertile symbols', () => {
            const grammar = Grammar.fromText(
                `S -> A | &\nA -> a S b C | a b\nC -> c C`
            );
            grammar.removeInfertileSymbols();
            expect(grammar.hasInfertileSymbols()).toBeFalsy();
        });

        it('should not remove infertile symbols', () => {
            const grammar = Grammar.fromText(
                `S -> A | &\nA -> a S b C | a b\nC -> c C | c`
            );
            grammar.removeInfertileSymbols();
            expect(grammar.hasInfertileSymbols()).toBeFalsy();
        });

        it('should remove infertile symbols (list example)', () => {
            const grammar = Grammar.fromText(
                `S -> A a S| &\nA -> S A a | B b | C d\nB -> C B c | S A B a\nC -> B c | S C a | A b | &`
            );
            grammar.removeInfertileSymbols();
            expect(grammar.hasInfertileSymbols()).toBeFalsy();
        });

        it('should remove unreachable symbols', () => {
            const grammar = Grammar.fromText(
                `S -> A | &\nA -> a S b | a b\nC -> c C | c`
            );
            grammar.removeUnreachableSymbols();
            expect(grammar.hasUnreachableSymbols()).toBeFalsy();
        });

        it('should not remove unreachable symbols', () => {
            const grammar = Grammar.fromText(
                `S -> A | &\nA -> a S b C | a b\nC -> c C | c`
            );
            grammar.removeUnreachableSymbols();
            expect(grammar.hasUnreachableSymbols()).toBeFalsy();
        });

        it('should remove useless symbols', () => {
            const grammar = Grammar.fromText(
                `S -> A a S | &\nA -> S A a | B b | C d\nB -> C B c | S A B a\nC -> B c | S C a | A b | &`
            );
            grammar.removeUselessSymbols();
            expect(grammar.hasInfertileSymbols()).toBeFalsy();
            expect(grammar.hasUnreachableSymbols()).toBeFalsy();
        });

        it('should return reachable symbols', () => {
            const grammar = Grammar.fromText(
                `S -> A B C S0
                A -> & | a A
                B -> b | b C
                C -> C0
                C0 -> & | C b C0 | C c C0 | a C0
                S0 -> & | C S0`
            );
            const reachableLen = grammar.getReachableSymbols().length;
            const alphabetLen = grammar.Vt.length + grammar.Vn.length;
            expect(reachableLen === alphabetLen).toBeTruthy();
        });

        it('should return reachable symbols (if statement)', () => {
            const grammar = Grammar.fromText(
                `C -> com | if E then C | if E then C else C\nE -> exp`
            );

            const reachableLen = grammar.getReachableSymbols().length;
            const alphabetLen = grammar.Vt.length + grammar.Vn.length;
            expect(reachableLen === alphabetLen).toBeTruthy();
        });

        it('should transform to own #1', () => {
            const grammar = Grammar.fromText(
                `S -> A a
                A -> S c | d
                B -> C d
                C -> D E
                D -> & | a
                E -> a | D B`
            );
            grammar.toOwn();
            expect(grammar.isOwn()).toBeTruthy();
        });

        it('should not transform to own', () => {
            const grammar = Grammar.fromText(
                `S -> A B C | S C
                A -> a A | &
                B -> b | b C
                C -> C a | C C b | C C c`
            );
            grammar.toOwn();
            expect(grammar.isOwn()).toBeFalsy();
        });
    });
});
