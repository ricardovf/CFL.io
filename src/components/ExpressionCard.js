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

class ExpressionCard extends React.Component {
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
      expression,
      valid = true,
      onExpressionChange,
    } = this.props;

    const isEmpty =
      expression === undefined ||
      (typeof expression === 'string' && expression.length === 0);

    const isFocused = this.state.isFocused;

    const input = (
      <TextField
        error={!isEmpty && !valid}
        id="multiline-flexible"
        label=""
        multiline
        rowsMax="10"
        value={isFocused ? undefined : isEmpty ? '' : expression}
        onChange={event => {
          onExpressionChange(
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
        placeholder="(aa)*"
        fullWidth
        margin="normal"
      />
    );

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Expressão regular
          </Typography>
          <form noValidate autoComplete="off">
            <FormControl
              fullWidth
              error={!isEmpty && !valid}
              aria-describedby={!valid ? 'expression-error-text' : ''}
            >
              {input}
              {!isEmpty &&
                !valid && (
                  <FormHelperText id="expression-error-text">
                    Expressão inválida ou não regular
                  </FormHelperText>
                )}
            </FormControl>
          </form>
        </CardContent>
      </Card>
    );
  }
}

ExpressionCard.propTypes = {
  classes: PropTypes.object.isRequired,
  expression: PropTypes.string,
  valid: PropTypes.bool,
  onExpressionChange: PropTypes.func,
};

export default withStyles(styles)(ExpressionCard);
