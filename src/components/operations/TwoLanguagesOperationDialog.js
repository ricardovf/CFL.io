import React from 'react';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import { withStyles } from 'material-ui/styles';
import { FormControlLabel, Radio, RadioGroup, Typography } from 'material-ui';
import Grammar from '../../logic/Grammar';
import * as R from 'ramda';
import PropTypes from 'prop-types';

const styles = () => ({
  graphContainer: {
    marginTop: '10px',
    marginBottom: '10px',
  },
  modal: {
    minHeight: '60%',
    maxWidth: '700px',
  },
  stepsCaption: {
    flexGrow: 1,
    marginLeft: '16px',
  },
});

class TwoLanguagesOperationDialog extends React.Component {
  state = {
    steps: undefined,
    step: undefined,
    selectedLanguage: undefined,
    confirmed: undefined,
  };

  constructor(props) {
    super(props);

    this.handleNext = this.handleNext.bind(this);
    this.handleToEnd = this.handleToEnd.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleSaveAndClose = this.handleSaveAndClose.bind(this);
    this.handleSelectLanguage = this.handleSelectLanguage.bind(this);
    this.handleConfirmSelection = this.handleConfirmSelection.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let reset = false;
    if (
      nextProps.open === false ||
      !nextProps.language ||
      !nextProps.language.grammar
    ) {
      reset = true;
    } else if (nextProps.open === true) {
      reset = true;
    }

    if (reset)
      return {
        steps: undefined,
        step: undefined,
        selectedLanguage: undefined,
        confirmed: undefined,
      };

    return null;
  }

  handleNext() {
    if (Array.isArray(this.state.steps)) {
      this.setState({ step: this.state.step + 1 });
    }
  }

  handleToEnd() {
    if (Array.isArray(this.state.steps)) {
      this.setState({ step: this.state.steps.length });
    }
  }

  handleSelectLanguage(event) {
    this.setState({ selectedLanguage: event.target.value });
  }

  handleConfirmSelection() {
    this.setState({ confirmed: true });

    let selectedLanguage = R.find(R.propEq('id', this.state.selectedLanguage))(
      this.props.languages
    );

    if (
      this.props.operation &&
      this.props.language &&
      this.props.language.grammar &&
      selectedLanguage &&
      selectedLanguage.grammar
    ) {
      let grammars = this.props.operation(
        Grammar.fromPlainObject(this.props.language.grammar),
        Grammar.fromPlainObject(selectedLanguage.grammar)
      );

      if (grammars.length > 0) {
        grammars = R.map(grammar => grammar.toPlainObject(), grammars);

        this.setState({
          steps: grammars,
          step: 1,
        });
      }
    }
  }

  handlePrevious() {
    if (Array.isArray(this.state.steps)) {
      this.setState({ step: this.state.step - 1 });
    }
  }

  handleSaveAndClose() {
    const { language, title, handleCancel, handleSave } = this.props;

    if (handleSave && language && Array.isArray(this.state.steps))
      handleSave(
        language.id,
        language.name + ` (${title})`,
        this.state.steps[this.state.step - 1],
        true
      );

    if (handleCancel) handleCancel();
  }

  handleSave() {
    const { language, title, handleSave } = this.props;

    if (handleSave && language && Array.isArray(this.state.steps))
      handleSave(
        language.id,
        language.name + ` (${title} - Passo ${this.state.step})`,
        this.state.steps[this.state.step - 1],
        false
      );
  }

  _makeSelectorDialogContent() {
    const {
      title,
      actionSubtitle,
      language,
      languages,
      handleCancel,
    } = this.props;

    let actionButton = (
      <Button
        variant="raised"
        onClick={this.handleConfirmSelection}
        color="primary"
        autoFocus
        disabled={!this.state.selectedLanguage}
      >
        Continuar
      </Button>
    );

    return (
      <React.Fragment>
        <DialogTitle id="dialog-operation-title">
          {title}
          <DialogContentText id="dialog-operation-description">
            Selecione uma linguagem para {actionSubtitle}{' '}
            <strong>{language.name}</strong>
          </DialogContentText>
        </DialogTitle>
        <DialogContent>
          <RadioGroup
            aria-label="selectedLanguage"
            name="selectedLanguage"
            onChange={this.handleSelectLanguage}
            value={this.state.selectedLanguage}
          >
            {languages &&
              languages.map(radioLanguage => (
                <FormControlLabel
                  value={radioLanguage.id}
                  key={radioLanguage.id}
                  control={<Radio />}
                  label={radioLanguage.name}
                  disabled={!radioLanguage.grammar}
                />
              ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancelar</Button>
          {actionButton}
        </DialogActions>
      </React.Fragment>
    );
  }

  _makeStepsDialogContent() {
    const { classes, title, subtitle, language, handleCancel } = this.props;

    let actionButton = (
      <Button
        variant="raised"
        onClick={this.handleNext}
        color="primary"
        autoFocus
      >
        →
      </Button>
    );

    let saveButton, previousButton, toEndButton;

    if (Array.isArray(this.state.steps)) {
      if (this.state.step === this.state.steps.length)
        actionButton = (
          <Button
            variant="raised"
            onClick={this.handleSaveAndClose}
            color="primary"
            autoFocus
          >
            Salvar
          </Button>
        );
      else if (this.state.steps.length > 1) {
        if (this.state.steps.length > 4) {
          toEndButton = (
            <Button variant="raised" onClick={this.handleToEnd}>
              Último
            </Button>
          );
        }

        saveButton = (
          <Button onClick={this.handleSave} color="secondary">
            Salvar atual
          </Button>
        );
      }

      if (this.state.steps.length > 1 && this.state.step !== 1) {
        previousButton = (
          <Button onClick={this.handlePrevious} color="primary">
            ←
          </Button>
        );
      }
    }

    let selectedLanguage = R.find(R.propEq('id', this.state.selectedLanguage))(
      this.props.languages
    );

    return (
      <React.Fragment>
        <DialogTitle id="dialog-operation-title">
          {title}
          <DialogContentText id="dialog-operation-description">
            {subtitle} <strong>{language.name}</strong> com{' '}
            <strong>{selectedLanguage.name}</strong>
          </DialogContentText>
        </DialogTitle>
        <DialogContent>
          {Array.isArray(this.state.steps) && (
            <div>
              <div className={classes.graphContainer}>
                {/*<FSMGraph*/}
                {/*showTitle={false}*/}
                {/*grammar={this.state.steps[this.state.step - 1]}*/}
                {/*/>*/}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {Array.isArray(this.state.steps) && (
            <Typography variant="caption" className={classes.stepsCaption}>
              Passo {this.state.step} de {this.state.steps.length}
            </Typography>
          )}
          <Button onClick={handleCancel}>Cancelar</Button>
          {saveButton}
          {previousButton}
          {actionButton}
          {toEndButton}
        </DialogActions>
      </React.Fragment>
    );
  }

  render() {
    const { classes, handleCancel } = this.props;

    return (
      <Dialog
        disableBackdropClick
        classes={{ paper: classes.modal }}
        fullWidth
        maxWidth={'md'}
        open={this.props.open}
        onClose={handleCancel}
        aria-labelledby="dialog-operation-title"
        aria-describedby="dialog-operation-description"
      >
        {this.state.selectedLanguage && this.state.confirmed
          ? this._makeStepsDialogContent()
          : this._makeSelectorDialogContent()}
      </Dialog>
    );
  }
}

TwoLanguagesOperationDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  language: PropTypes.object,
  handleCancel: PropTypes.func,
  handleSave: PropTypes.func,
};

export default withStyles(styles)(TwoLanguagesOperationDialog);
