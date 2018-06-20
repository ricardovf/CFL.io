import React from 'react'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import { find, propEq } from 'ramda';
import RecursionCard from '../components/RecursionCard';

const mapState = state => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);
  return {
    language,
    sentences:
      language !== undefined
        ? Array.isArray(language.userSentences)
          ? language.userSentences
          : []
        : [],
  };
};

const mapDispatch = dispatch => ({
  onRemoveLeftRecursion: id => dispatch.languages.removeLeftRecursion({ id }),
});

export default connect(mapState, mapDispatch)(RecursionCard);
