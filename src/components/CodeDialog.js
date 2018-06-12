import React from 'react';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';
import { withStyles } from 'material-ui/styles';
import { Icon } from 'material-ui';
import Tooltip from 'material-ui/Tooltip';
import IconButton from 'material-ui/IconButton';

const styles = () => ({
  icon: {
    marginLeft: '6px',
    width: '24px',
    height: '24px',
    '& > span > span': {
      fontSize: '16px',
    },
  },
});

class CodeDialog extends React.Component {
  state = {
    open: false,
  };

  generateCode(fsm) {
    if (!fsm) {
      return '';
    }

    return `const states = ${JSON.stringify(fsm.states).replace(/"/g, "'")};
      const alphabet = ${JSON.stringify(fsm.alphabet)
        .replace(/"/g, "'")
        .replace(/'&'/g, 'EPSILON')};
      const transitions = ${JSON.stringify(fsm.transitions)
        .replace(/"/g, "'")
        .replace(/'&'/g, 'EPSILON')};
      const initial = '${fsm.initial}';
      const finals = ${JSON.stringify(fsm.finals).replace(/"/g, "'")};
      const fsm = new FSM(states, alphabet, transitions, initial, finals);`.replace(
      /\n/g,
      '<br />'
    );
  }

  handleClickOpen = () => {
    this.setState({ open: true, code: this.generateCode(this.props.fsm) });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Tooltip title="Gerar código JavaScript para teste unitário">
          <IconButton
            className={classes.icon}
            aria-label="generate-code-for-fsm"
            onClick={this.handleClickOpen}
          >
            <Icon>code</Icon>
          </IconButton>
        </Tooltip>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <DialogContentText
              id="alert-dialog-description"
              dangerouslySetInnerHTML={{ __html: this.state.code }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" autoFocus>
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(CodeDialog);
