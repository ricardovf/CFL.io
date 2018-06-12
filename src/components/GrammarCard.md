Empty grammar
```js
<GrammarCard />
```

Valid grammar
```js
<GrammarCard grammarText="S -> aA | a | aS\nA -> a" />
```

Invalid grammar
```js
<GrammarCard grammarText="S -> aaS | a" valid={false} />
```
