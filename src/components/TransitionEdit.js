import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'material-ui';
import { withStyles } from 'material-ui/styles';

const styles = () => ({
  input: {
    padding: '0',
    marginBottom: '-4px',
    fontWeight: 'normal',
    width: '50px',
  },
});

class TransitionEdit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocused: false,
      value: TransitionEdit.statesToText(props.toStates),
    };
  }

  static statesToText(states) {
    return Array.isArray(states) ? states.join(', ') : '';
  }

  commit() {
    const { symbol, fromState, language, changeTransition } = this.props;

    let newToState = this.state.value.split(',');
    newToState = newToState.map(s => s.trim().toUpperCase());

    changeTransition(language.id, symbol, fromState, newToState);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let text = TransitionEdit.statesToText(nextProps.toStates);

    if (prevState.value !== text) return { value: text };

    return null;
  }

  render() {
    const { classes } = this.props;

    return (
      <Input
        disableUnderline
        placeholder="–"
        value={this.state.value}
        margin="none"
        className={classes.input}
        onChange={event => {
          this.setState({ value: event.target.value.toUpperCase() });
        }}
        onKeyPress={event => {
          if (event.key === 'Enter') {
            event.target.blur();
          }
        }}
        onBlur={() => this.commit()}
      />
    );
  }
}

TransitionEdit.propTypes = {
  language: PropTypes.object,
  changeTransition: PropTypes.func.isRequired,
};

export default withStyles(styles)(TransitionEdit);
