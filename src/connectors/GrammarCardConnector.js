import React from 'react'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import GrammarCard from '../components/GrammarCard';
import { find, propEq } from 'ramda';

const mapState = state => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);
  return {
    language,
  };
};

const mapDispatch = dispatch => ({
  onGrammarChange: (id, text) => dispatch.languages.editGrammar({ id, text }),
});

export default connect(mapState, mapDispatch)(GrammarCard);
