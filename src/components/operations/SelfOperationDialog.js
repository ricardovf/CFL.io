import React from 'react';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import { withStyles } from 'material-ui/styles';
import { Typography } from 'material-ui';
import Grammar from '../../logic/Grammar';
import * as R from 'ramda';
import PropTypes from 'prop-types';
import SaveGrammarDialog from './SaveGrammarDialog';

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

class SelfOperationDialog extends React.Component {
  state = {
    steps: undefined,
    step: undefined,
    saveGrammarDialogOpened: false,
    closeAfterSave: false,
  };

  constructor(props) {
    super(props);

    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleSaveAndCloseButtonClick = this.handleSaveAndCloseButtonClick.bind(
      this
    );
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
      let grammars = nextProps.operation
        ? nextProps.operation(
            Grammar.fromPlainObject(nextProps.language.grammar)
          )
        : [];

      if (grammars.length > 0) {
        return {
          steps: grammars,
          step: 1,
        };
      } else {
        reset = true;
      }
    }

    if (reset)
      return {
        steps: undefined,
        step: undefined,
        saveGrammarDialogOpened: false,
      };

    return null;
  }

  handleNext() {
    if (Array.isArray(this.state.steps)) {
      this.setState({ step: this.state.step + 1 });
    }
  }

  handlePrevious() {
    if (Array.isArray(this.state.steps)) {
      this.setState({ step: this.state.step - 1 });
    }
  }

  handleSaveAndCloseButtonClick() {
    const { language, handleSave } = this.props;

    if (handleSave && language && Array.isArray(this.state.steps)) {
      this.setState({ saveGrammarDialogOpened: true, closeAfterSave: true });
    }
  }

  handleSaveButtonClick() {
    const { language, handleSave } = this.props;

    if (handleSave && language && Array.isArray(this.state.steps)) {
      this.setState({ saveGrammarDialogOpened: true, closeAfterSave: false });
    }
  }

  handleSave(saveName) {
    const { language, handleSave, handleCancel } = this.props;

    if (handleSave && language && Array.isArray(this.state.steps)) {
      handleSave(
        language.id,
        saveName,
        this.state.steps[this.state.step - 1],
        this.state.closeAfterSave
      );
    }

    if (this.state.closeAfterSave && handleCancel) handleCancel();
  }

  handleSaveDialogClose = () => {
    this.setState({ saveGrammarDialogOpened: false, closeAfterSave: false });
  };

  render() {
    const {
      classes,
      title,
      subtitle,
      language,
      handleCancel,
      savedName,
    } = this.props;

    let actionButton = (
      <Button
        variant="raised"
        onClick={this.handleNext}
        color="primary"
        autoFocus
      >
        Próximo
      </Button>
    );

    let saveButton, previousButton;

    if (Array.isArray(this.state.steps)) {
      if (this.state.step === this.state.steps.length)
        actionButton = (
          <Button
            disabled={!this.state.steps[this.state.step - 1].isValid()}
            variant="raised"
            onClick={this.handleSaveAndCloseButtonClick}
            color="primary"
            autoFocus
          >
            Salvar
          </Button>
        );
      else if (
        this.state.steps.length > 1 &&
        this.state.steps[this.state.step - 1].isValid()
      ) {
        saveButton = (
          <Button onClick={this.handleSaveButtonClick} color="secondary">
            Salvar intermediário
          </Button>
        );
      }

      if (this.state.steps.length > 1 && this.state.step !== 1) {
        previousButton = (
          <Button onClick={this.handlePrevious} color="primary">
            Anterior
          </Button>
        );
      }
    }

    return (
      <Dialog
        classes={{ paper: classes.modal }}
        fullWidth
        maxWidth={'md'}
        open={this.props.open}
        onClose={handleCancel}
        aria-labelledby="dialog-operation-title"
        aria-describedby="dialog-operation-description"
      >
        <DialogTitle id="dialog-operation-title">
          {title}
          <DialogContentText id="dialog-operation-description">
            {subtitle} <strong>{language.name}</strong>
          </DialogContentText>
        </DialogTitle>
        <DialogContent>
          {Array.isArray(this.state.steps) && (
            <div>
              {this.state.steps[this.state.step - 1].isValid() ? (
                <div
                  className={classes.graphContainer}
                  dangerouslySetInnerHTML={{
                    __html: this.state.steps[this.state.step - 1]
                      .getFormattedText()
                      .replace(/\n/g, '<br />'),
                  }}
                />
              ) : (
                '(Resultou em uma gramática vazia)'
              )}
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
          <SaveGrammarDialog
            open={this.state.saveGrammarDialogOpened}
            defaultName={language.name}
            handleCancel={this.handleSaveDialogClose}
            handleSave={this.handleSave}
          />
        </DialogActions>
      </Dialog>
    );
  }
}

SelfOperationDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  savedName: PropTypes.string,
  language: PropTypes.object,
  handleCancel: PropTypes.func,
  handleSave: PropTypes.func,
};

export default withStyles(styles)(SelfOperationDialog);
