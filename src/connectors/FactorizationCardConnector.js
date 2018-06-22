import React from 'react'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import { find, propEq } from 'ramda';
import FactorizationCard from '../components/FactorizationCard';

const mapState = state => {
  const language = find(propEq('id', state.selectedLanguage))(state.languages);
  return {
    language,
    factorizationSteps:
      language !== undefined
        ? language.factorizationSteps !== undefined
          ? parseInt(language.factorizationSteps, 10)
          : 5
        : undefined,
  };
};

const mapDispatch = dispatch => ({
  onRemoveFactorsClick: id => dispatch.languages.removeFactors({ id }),
  onStepsChange: (id, steps) =>
    dispatch.languages.changeFactorizationSteps({
      id,
      steps: parseInt(steps, 10),
    }),
});

export default connect(mapState, mapDispatch)(FactorizationCard);
