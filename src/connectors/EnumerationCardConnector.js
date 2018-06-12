import React from 'react'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import { find, propEq } from 'ramda';
import FactorizationCard from '../components/FactorizationCard';

const mapState = state => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);
  return {
    language,
    length:
      language !== undefined
        ? parseInt(language.enumerationLength, 10)
        : undefined,
  };
};

const mapDispatch = dispatch => ({
  onLengthChange: (id, length) =>
    dispatch.languages.changeEnumerationLength({
      id,
      length: parseInt(length, 10),
    }),
});

export default connect(mapState, mapDispatch)(FactorizationCard);
