import React from 'react'; // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import MainToolbar from '../components/MainToolbar';
import { find, propEq } from 'ramda';

const mapState = state => ({
  language: find(propEq('id', state.selectedLanguage))(state.languages),
});

const mapDispatch = dispatch => ({
  deleteOnClick: id => dispatch.languages.remove({ id }),
  renameLanguage: (id, name) => dispatch.languages.renameLanguage({ id, name }),
});

export default connect(mapState, mapDispatch)(MainToolbar);
