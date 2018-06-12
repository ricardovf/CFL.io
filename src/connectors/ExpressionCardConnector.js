import React from 'react'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import ExpressionCard from '../components/ExpressionCard';
import { find, propEq } from 'ramda';

const mapState = state => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);
  return {
    language,
    valid: language !== undefined && language.valid,
    expression: language !== undefined ? language.expression : undefined,
  };
};

const mapDispatch = dispatch => ({
  onExpressionChange: (id, text) =>
    dispatch.languages.editExpression({ id, text }),
});

export default connect(mapState, mapDispatch)(ExpressionCard);
