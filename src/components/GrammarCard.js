import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import { FormControl, FormHelperText } from 'material-ui/Form';
import { multiTrim } from '../logic/helpers';
import Grammar from '../logic/Grammar';

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
    const { classes, language, onGrammarChange } = this.props;

    let grammar = undefined;

    if (language && language.valid)
      grammar = Grammar.fromPlainObject(language.grammar);

    const isEmpty = grammar ? false : language.grammarInputText.length === 0;
    const isFocused = this.state.isFocused;

    const input = (
      <TextField
        error={!isEmpty && !language.valid}
        id="multiline-flexible"
        label=""
        multiline
        rowsMax="10"
        value={
          isFocused
            ? undefined
            : grammar
              ? grammar.getFormattedText()
              : language.grammarInputText
        }
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
            Gramática livre de contexto
          </Typography>
          <form noValidate autoComplete="off">
            <FormControl
              fullWidth
              error={!isEmpty && !language.valid}
              aria-describedby={!language.valid ? 'grammar-error-text' : ''}
            >
              {input}
              {!isEmpty &&
                !language.valid && (
                  <FormHelperText id="grammar-error-text">
                    Gramática é inválida ou não é livre de contexto
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
  language: PropTypes.object.isRequired,
  onGrammarChange: PropTypes.func,
};

export default withStyles(styles)(GrammarCard);
