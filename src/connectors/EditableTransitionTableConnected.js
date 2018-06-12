import React from 'react'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import { find, propEq } from 'ramda';
import EditableTransitionTable from '../components/EditableTransitionTable';

const mapState = state => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);
  return {
    language,
    valid: language !== undefined && language.valid,
    fsm: language !== undefined ? language.fsm : undefined,
  };
};

const mapDispatch = dispatch => ({
  changeInitialState: (id, state) =>
    dispatch.languages.changeInitialState({ id, state }),
  addToFinalStates: (id, state) =>
    dispatch.languages.addToFinalStates({ id, state }),
  deleteFromFinalStates: (id, state) =>
    dispatch.languages.deleteFromFinalStates({ id, state }),
  addNewState: (id, state) => dispatch.languages.addNewState({ id, state }),
  deleteState: (id, state) => dispatch.languages.deleteState({ id, state }),
  addNewSymbol: (id, symbol) => dispatch.languages.addNewSymbol({ id, symbol }),
  deleteSymbol: (id, symbol) => dispatch.languages.deleteSymbol({ id, symbol }),
  changeTransition: (id, symbol, fromState, toStates) =>
    dispatch.languages.changeTransition({ id, symbol, fromState, toStates }),
});

export default connect(mapState, mapDispatch)(EditableTransitionTable);
