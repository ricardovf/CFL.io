import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import { FormControl, FormHelperText } from 'material-ui/Form';

const styles = () => ({
  card: {
    height: '100%',
  },
});

class GrammarCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocused: false,
    };
  }

  render() {
    const {
      classes,
      language,
      grammar,
      valid = true,
      onGrammarChange,
    } = this.props;

    const isEmpty =
      grammar === undefined ||
      (typeof grammar === 'string' && grammar.length === 0);

    const isFocused = this.state.isFocused;

    const input = (
      <TextField
        error={!isEmpty && !valid}
        id="multiline-flexible"
        label=""
        multiline
        rowsMax="10"
        value={isFocused ? undefined : isEmpty ? '' : grammar}
        onChange={event => {
          onGrammarChange(
            language ? language.id : undefined,
            event.target.value
          );
        }}
        onBlur={event => {
          this.setState({ isFocused: false });
        }}
        onFocus={event => {
          this.setState({ isFocused: true });
        }}
        placeholder="S -> a | aS"
        fullWidth
        margin="normal"
      />
    );

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Gramática regular
          </Typography>
          <form noValidate autoComplete="off">
            <FormControl
              fullWidth
              error={!isEmpty && !valid}
              aria-describedby={!valid ? 'grammar-error-text' : ''}
            >
              {input}
              {!isEmpty &&
                !valid && (
                  <FormHelperText id="grammar-error-text">
                    Gramática inválida ou não regular
                  </FormHelperText>
                )}
            </FormControl>
          </form>
        </CardContent>
      </Card>
    );
  }
}

GrammarCard.propTypes = {
  classes: PropTypes.object.isRequired,
  grammar: PropTypes.string,
  valid: PropTypes.bool,
  onGrammarChange: PropTypes.func,
};

export default withStyles(styles)(GrammarCard);
