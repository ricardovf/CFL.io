import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import FSM from '../logic/FSM';
import { SnackbarContent } from 'material-ui/Snackbar';
import Button from 'material-ui/Button';

const styles = () => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
  },
  lastList: {
    paddingTop: '5px',
    paddingBottom: 0,
  },
  snackbar: {
    minWidth: '100px',
  },
});

class FSMCard extends React.Component {
  render() {
    const {
      classes,
      language,
      determinate,
      eliminateEpsilonTransitions,
      minimize,
    } = this.props;

    const yesIcon = <Icon style={{ fontSize: 24, color: 'green' }}>check</Icon>;
    const noIcon = <Icon style={{ fontSize: 24, color: 'red' }}>close</Icon>;
    const dontKnowIcon = (
      <Icon style={{ fontSize: 24, color: 'gray' }}>help</Icon>
    );

    /** @type {FSM} */
    let fsm = null;

    if (language && language.fsm) {
      fsm = FSM.fromPlainObject(language.fsm);
    }

    const info = fsm && (
      <React.Fragment>
        <List dense>
          <ListItem disableGutters>
            <ListItemText
              secondary={'Estados'}
              primary={fsm.states.join(', ')}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              secondary="Alfabeto"
              primary={fsm.alphabet.join(', ')}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText secondary="Estado inicial" primary={fsm.initial} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              secondary={
                fsm.finals.length > 1 ? 'Estados finais' : 'Estado final'
              }
              primary={fsm.finals.join(', ')}
            />
          </ListItem>
        </List>
        <Divider />
        <List dense className={classes.lastList}>
          <ListItem disableGutters>
            <ListItemIcon>
              {fsm
                ? fsm.acceptsEmptySentence()
                  ? yesIcon
                  : noIcon
                : dontKnowIcon}
            </ListItemIcon>
            <ListItemText primary="Aceita sentença vazia" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>
              {fsm
                ? fsm.hasEpsilonTransitions()
                  ? noIcon
                  : yesIcon
                : dontKnowIcon}
            </ListItemIcon>
            <ListItemText primary="Sem transições por epsilon" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>
              {fsm ? (fsm.isDeterministic() ? yesIcon : noIcon) : dontKnowIcon}
            </ListItemIcon>
            <ListItemText primary="Determinístico" />
          </ListItem>

          <ListItem disableGutters>
            <ListItemIcon>
              {fsm ? (fsm.isMinimal() ? yesIcon : noIcon) : dontKnowIcon}
            </ListItemIcon>
            <ListItemText primary="Mínimo" />
          </ListItem>
        </List>
      </React.Fragment>
    );

    let message,
      actionText,
      action,
      actions = null;

    // if (fsm) {
    //   if (fsm.hasEpsilonTransitions()) {
    //     message = 'Você pode eliminar as transições por epsilon';
    //     action = eliminateEpsilonTransitions;
    //     actionText = 'Eliminar epsilon';
    //   } else if (!fsm.isDeterministic()) {
    //     message = 'Você pode tornar esse autômato determinístico';
    //     action = determinate;
    //     actionText = 'Determinizar';
    //   } else if (!fsm.isMinimal()) {
    //     message = 'Você pode minimizar o autômato';
    //     action = minimize;
    //     actionText = 'Minimizar';
    //   }
    // }

    // actions = message && (
    //   <React.Fragment>
    //     <SnackbarContent
    //       className={classes.snackbar}
    //       message={message}
    //       action={
    //         <Button
    //           color="secondary"
    //           size="small"
    //           onClick={() => {
    //             action(language.id);
    //           }}
    //         >
    //           {actionText}
    //         </Button>
    //       }
    //     />
    //   </React.Fragment>
    // );

    return (
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Typography gutterBottom variant="headline" component="h2">
            Autômato finito
          </Typography>

          {info}
        </CardContent>
        {actions}
      </Card>
    );
  }
}

FSMCard.propTypes = {
  classes: PropTypes.object.isRequired,
  language: PropTypes.object,
  determinate: PropTypes.func,
  eliminateEpsilonTransitions: PropTypes.func,
  minimize: PropTypes.func,
};

export default withStyles(styles)(FSMCard);
