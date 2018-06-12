import React from 'react'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import { find, propEq } from 'ramda';
import InformationCard from '../components/InformationCard';

const mapState = state => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);
  return {
    language,
  };
};

const mapDispatch = dispatch => ({
  onGrammarChange: (id, text) => dispatch.languages.editGrammar({ id, text }),
  eliminateEpsilonTransitions: id =>
    dispatch.languages.eliminateEpsilonTransitions({ id }),
  determinate: id => dispatch.languages.determinate({ id }),
  minimize: id => dispatch.languages.minimize({ id }),
});

export default connect(mapState, mapDispatch)(InformationCard);
