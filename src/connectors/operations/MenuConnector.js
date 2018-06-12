import React from 'react'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import { find, propEq } from 'ramda';
import Menu from '../../components/operations/Menu';

const mapState = state => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);
  return {
    language,
    languages: state.languages,
  };
};

const mapDispatch = dispatch => ({
  handleSave: (id, name, fsm, select = false) =>
    dispatch.languages.newLanguageFromFSM({ id, name, fsm, select }),
});

export default connect(mapState, mapDispatch)(Menu);
