import uuidv4 from 'uuid/v4';
import { find, propEq, reject } from 'ramda';
import { dispatch } from '../store';
import _ from 'lodash';
import Grammar from '../logic/Grammar';
import { multiTrim } from '../logic/helpers';
import { MAX_STEPS } from '../logic/Grammar/Factor';

function _makeNewLanguage(name) {
  return {
    id: uuidv4(),
    name: name,
    valid: false,
    grammar: undefined,
    grammarInputText: '',
    factorizationSteps: 5,
  };
}

export default {
  state: [],
  reducers: {
    create(state, { language = undefined }) {
      if (!language) language = _makeNewLanguage(`Gramática #${state.length}`);

      if (language.grammar) {
        try {
          const grammar =
            language.grammar instanceof Grammar
              ? language.grammar
              : Grammar.fromPlainObject(language.grammar);
          language.grammar = grammar;
          language.valid = grammar.isValid();
          if (!language.valid && language.grammarInputText) {
            language.grammarInputText = '';
          }
        } catch (e) {
          language.grammar = undefined;
          language.valid = false;
        }
      }

      return [...state, language];
    },
    _removeLanguage(state, { id }) {
      return reject(language => language.id === id, [...state]);
    },
    _updateLanguage(state, { id, language, updateGrammar = true }) {
      if (updateGrammar) {
        if (language && language.grammar) {
          try {
            const grammar =
              language.grammar instanceof Grammar
                ? language.grammar
                : Grammar.fromPlainObject(language.grammar);

            language.valid = grammar.isValid();
            language.grammar = grammar.toPlainObject();
          } catch (e) {
            language.grammar = undefined;
            language.valid = false;
          }
        } else {
          language.grammar = undefined;
          language.valid = false;
        }
      }

      return [...state].map(item => {
        return item.id === id && language ? { ...language } : item;
      });
    },
  },
  effects: {
    async remove({ id }, rootState) {
      dispatch.languages._removeLanguage({ id });
      dispatch.selectedLanguage.select({ id: null });
    },

    // used by the modals operations
    async newLanguageFromGrammar({ id, name, grammar, select }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language) {
        if (grammar instanceof Grammar) grammar = grammar.toPlainObject();

        let newLanguage = _makeNewLanguage(name);
        newLanguage.grammar = grammar;
        newLanguage.valid = Grammar.fromPlainObject(grammar).isValid();
        newLanguage.grammarInputText = language.grammarInputText;
        newLanguage.factorizationSteps = language.factorizationSteps;

        dispatch.languages.create({ language: newLanguage });

        if (select) dispatch.selectedLanguage.select({ id: newLanguage.id });
      }
    },

    async createAndSelect({ name }, rootState) {
      const newLanguage = _makeNewLanguage(
        name ? name : `Gramática #${rootState.languages.length}`
      );
      dispatch.languages.create({ language: newLanguage });
      dispatch.selectedLanguage.select({ id: newLanguage.id });
    },

    changeFactorizationSteps({ id, steps }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && steps >= 0) {
        language = {
          ...language,
          factorizationSteps: steps > MAX_STEPS ? MAX_STEPS : steps,
        };

        dispatch.languages._updateLanguage({
          id,
          language,
        });
      }
    },

    removeFactors({ id }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (
        language &&
        language.grammar &&
        language.factorizationSteps >= 0 &&
        language.factorizationSteps <= MAX_STEPS
      ) {
        const grammar = Grammar.fromPlainObject(language.grammar);
        grammar.removeFactors(language.factorizationSteps);

        language = {
          ...language,
          grammar: grammar.toPlainObject(),
          valid: grammar.isValid(),
        };

        // If the grammar has turned invalid, we make the text empty!
        if (!grammar.isValid()) language.grammarInputText = '';

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    removeLeftRecursion({ id }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && language.grammar) {
        const grammar = Grammar.fromPlainObject(language.grammar);
        grammar.removeLeftRecursion();

        language = {
          ...language,
          grammar: grammar.toPlainObject(),
          valid: grammar.isValid(),
        };

        // If the grammar has turned invalid, we make the text empty!
        if (!grammar.isValid()) language.grammarInputText = '';

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    editGrammar: _.debounce(
      (payload, rootState) => {
        const { id, text } = payload;

        let language = find(propEq('id', id))(rootState.languages);

        if (language) {
          let trimmedText = multiTrim(text, false);

          trimmedText = trimmedText.replace(/→/g, '->');
          trimmedText = trimmedText.replace(//g, '->');
          trimmedText = trimmedText.replace(/ε/g, '&');

          const grammar = Grammar.fromText(trimmedText);
          const valid = grammar && grammar.isValid();

          language = {
            ...language,
            valid: valid,
            grammar: valid ? grammar.toPlainObject() : undefined,
            grammarInputText: trimmedText,
          };

          dispatch.languages._updateLanguage({
            id,
            language,
            updateGrammar: false,
          });
        }
      },
      250,
      { maxWait: 1000 }
    ),

    renameLanguage: _.debounce(({ id, name }, rootState) => {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && typeof name === 'string' && name.trim().length > 0) {
        language = {
          ...language,
          name: name.trim(),
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    }, 250),
  },
};
