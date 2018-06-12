import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Grammar from '../logic/Grammar';

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

class InformationCard extends React.Component {
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

    /** @type {Grammar} */
    let grammar = null;

    if (language && language.grammar) {
      grammar = Grammar.fromPlainObject(language.grammar);
    }

    const info = grammar && (
      <React.Fragment>
        <List dense>
          <ListItem disableGutters>
            <ListItemText
              secondary={'Não terminais (Vn)'}
              primary={grammar.Vn.join(', ')}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              secondary="Terminais (Vt)"
              primary={grammar.Vt.join(', ')}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText secondary="Símbolo inicial" primary={grammar.S} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText
              secondary="Linguagem"
              primary={grammar.getLanguageFinitude()}
            />
          </ListItem>
        </List>
        <Divider />
        <List dense className={classes.lastList}>
          <ListItem disableGutters>
            <ListItemIcon>
              {grammar
                ? grammar.hasEpsilonTransitions()
                  ? noIcon
                  : yesIcon
                : dontKnowIcon}
            </ListItemIcon>
            <ListItemText primary="Sem transições por epsilon" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>
              {grammar
                ? grammar.hasSimpleProductions()
                  ? yesIcon
                  : noIcon
                : dontKnowIcon}
            </ListItemIcon>
            <ListItemText primary="Sem produções simples" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>
              {grammar ? (grammar.hasCycle() ? yesIcon : noIcon) : dontKnowIcon}
            </ListItemIcon>
            <ListItemText primary="Sem ciclos" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>
              {grammar
                ? grammar.hasInfertileSymbols()
                  ? yesIcon
                  : noIcon
                : dontKnowIcon}
            </ListItemIcon>
            <ListItemText primary="Sem não terminais inférteis" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>
              {grammar
                ? grammar.hasUnreachableSymbols()
                  ? yesIcon
                  : noIcon
                : dontKnowIcon}
            </ListItemIcon>
            <ListItemText primary="Sem não terminais inalcançáveis" />
          </ListItem>
        </List>
      </React.Fragment>
    );

    let message,
      actionText,
      action,
      actions = null;

    // if (grammar) {
    //   if (grammar.hasEpsilonTransitions()) {
    //     message = 'Você pode eliminar as transições por epsilon';
    //     action = eliminateEpsilonTransitions;
    //     actionText = 'Eliminar epsilon';
    //   } else if (!grammar.isDeterministic()) {
    //     message = 'Você pode tornar esse autômato determinístico';
    //     action = determinate;
    //     actionText = 'Determinizar';
    //   } else if (!grammar.isMinimal()) {
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
            Informações
          </Typography>

          {info}
        </CardContent>
        {actions}
      </Card>
    );
  }
}

InformationCard.propTypes = {
  classes: PropTypes.object.isRequired,
  language: PropTypes.object,
  determinate: PropTypes.func,
  eliminateEpsilonTransitions: PropTypes.func,
  minimize: PropTypes.func,
};

export default withStyles(styles)(InformationCard);
