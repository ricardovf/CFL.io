import uuidv4 from 'uuid/v4';
import { find, propEq, reject } from 'ramda';
import { dispatch } from '../store';
import _ from 'lodash';
import Grammar from '../logic/Grammar';
import { multiTrim } from '../logic/helpers';

function _makeNewLanguage(name) {
  return {
    id: uuidv4(),
    name: name,
    valid: false,
    grammar: undefined,
    grammarInputText: '',
    factorizationLength: 5,
  };
}

export default {
  state: [],
  reducers: {
    create(state, { language = undefined }) {
      if (!language)
        language = _makeNewLanguage(`Nova linguagem #${state.length}`);

      if (language.grammar) {
        try {
          const grammar =
            language.grammar instanceof Grammar
              ? language.grammar
              : Grammar.fromPlainObject(language.grammar);
          language.grammar = grammar.getFormattedText();
          language.valid = grammar.isValid();
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
    async newLanguageFromFSM({ id, name, fsm, select }, rootState) {
      // let language = find(propEq('id', id))(rootState.languages);
      //
      // if (language) {
      //   if (fsm instanceof FSM) fsm = fsm.toPlainObject();
      //
      //   let newLanguage = _makeNewLanguage(name);
      //   newLanguage.fsm = fsm;
      //   newLanguage.expression = language.expression;
      //   newLanguage.userSentences = language.userSentences;
      //   newLanguage.enumerationLength = language.enumerationLength;
      //
      //   dispatch.languages.create({ language: newLanguage });
      //
      //   if (select) dispatch.selectedLanguage.select({ id: newLanguage.id });
      // }
    },

    async createAndSelect(payload, rootState) {
      const newLanguage = _makeNewLanguage(
        `Nova linguagem #${rootState.languages.length}`
      );
      dispatch.languages.create({ language: newLanguage });
      dispatch.selectedLanguage.select({ id: newLanguage.id });
    },

    changeEnumerationLength({ id, length }, rootState) {
      // let language = find(propEq('id', id))(rootState.languages);
      //
      // if (language && length >= 1 && length <= GENERATE_MAX_SIZE) {
      //   language = {
      //     ...language,
      //     enumerationLength: length,
      //   };
      //
      //   dispatch.languages._updateLanguage({
      //     id,
      //     language,
      //     updateExpression: false,
      //     updateGrammar: false,
      //   });
      // }
    },

    eliminateEpsilonTransitions({ id }, rootState) {
      // let language = find(propEq('id', id))(rootState.languages);
      //
      // if (language && language.grammar) {
      //   const fsm = Grammar.fromPlainObject(language.fsm);
      //   fsm.eliminateEpsilonTransitions();
      //
      //   language = {
      //     ...language,
      //     fsm: fsm.toPlainObject(),
      //   };
      //
      //   dispatch.languages._updateLanguage({ id, language });
      // }
    },

    // determinate({ id }, rootState) {
    //   let language = find(propEq('id', id))(rootState.languages);
    //
    //   if (language && language.grammar) {
    //     const fsm = Grammar.fromPlainObject(language.fsm);
    //     fsm.determinate();
    //
    //     language = {
    //       ...language,
    //       fsm: fsm.toPlainObject(),
    //     };
    //
    //     dispatch.languages._updateLanguage({ id, language });
    //   }
    // },
    //
    removeLeftRecursion({ id }, rootState) {
      let language = find(propEq('id', id))(rootState.languages);

      if (language && language.grammar) {
        const grammar = Grammar.fromPlainObject(language.grammar);
        grammar.removeLeftRecursion();

        language = {
          ...language,
          grammar: grammar.toPlainObject(),
        };

        dispatch.languages._updateLanguage({ id, language });
      }
    },

    editGrammar: _.debounce(
      (payload, rootState) => {
        const { id, text } = payload;

        let language = find(propEq('id', id))(rootState.languages);

        if (language) {
          const trimmedText = multiTrim(text, false);

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
