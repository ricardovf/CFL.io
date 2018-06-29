import React from 'react';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';

const styles = () => ({
  modal: {
    // minHeight: '40%',
    minWidth: '400px',
    maxWidth: '700px',
  },
  stepsCaption: {
    flexGrow: 1,
    marginLeft: '16px',
  },
});

class SaveGrammarDialog extends React.Component {
  state = {
    name: '',
  };

  constructor(props) {
    super(props);

    this.inputNameRef = null;
    this.handleSaveAndClose = this.handleSaveAndClose.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Reset the name when close
    if (nextProps.open === false)
      return {
        name: '',
      };
    else if (nextProps.defaultName) {
      return {
        name: nextProps.defaultName,
      };
    }

    return null;
  }

  handleSaveAndClose() {
    const { handleCancel, handleSave } = this.props;

    if (this.state.name.length === 0) {
      if (this.inputNameRef) this.inputNameRef.focus();
      return;
    }

    if (handleSave) handleSave(this.state.name);

    if (handleCancel) handleCancel();
  }

  render() {
    const { classes, handleCancel, defaultName } = this.props;

    return (
      <Dialog
        classes={{ paper: classes.modal }}
        maxWidth={'md'}
        open={this.props.open}
        onClose={handleCancel}
        aria-labelledby="dialog-operation-title"
        aria-describedby="dialog-operation-description"
      >
        <DialogTitle id="dialog-operation-title">Salvar gramática</DialogTitle>
        <DialogContent>
          <div>
            <TextField
              inputRef={ref => {
                this.inputNameRef = ref;
              }}
              defaultValue={defaultName}
              autoFocus={true}
              required={true}
              fullWidth
              onChange={event => {
                this.setState({ name: event.target.value.trim() });
              }}
              helperText={
                this.state.name === defaultName
                  ? 'A gramática atual será substituida. Use um nome diferente para não subsitutir.'
                  : undefined
              }
              id="name"
              label="Nome"
              margin="normal"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button
            variant="raised"
            onClick={this.handleSaveAndClose}
            color="primary"
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

SaveGrammarDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  defaultName: PropTypes.string,
  handleCancel: PropTypes.func,
  handleSave: PropTypes.func,
};

export default withStyles(styles)(SaveGrammarDialog);
