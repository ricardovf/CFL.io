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
});

class InformationCard extends React.Component {
  render() {
    const { classes, language } = this.props;

    if (!language || !language.valid) return null;
    const grammar = Grammar.fromPlainObject(language.grammar);

    const yesIcon = <Icon style={{ fontSize: 24, color: 'green' }}>check</Icon>;
    const noIcon = <Icon style={{ fontSize: 24, color: 'red' }}>close</Icon>;
    const dontKnowIcon = (
      <Icon style={{ fontSize: 24, color: 'gray' }}>help</Icon>
    );

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
                  ? noIcon
                  : yesIcon
                : dontKnowIcon}
            </ListItemIcon>
            <ListItemText primary="Sem produções simples" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>
              {grammar ? (grammar.hasCycle() ? noIcon : yesIcon) : dontKnowIcon}
            </ListItemIcon>
            <ListItemText primary="Sem ciclos" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>
              {grammar
                ? grammar.hasInfertileSymbols()
                  ? noIcon
                  : yesIcon
                : dontKnowIcon}
            </ListItemIcon>
            <ListItemText primary="Sem não terminais inférteis" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>
              {grammar
                ? grammar.hasUnreachableSymbols()
                  ? noIcon
                  : yesIcon
                : dontKnowIcon}
            </ListItemIcon>
            <ListItemText primary="Sem não terminais inalcançáveis" />
          </ListItem>
        </List>
      </React.Fragment>
    );

    return (
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Typography gutterBottom variant="headline" component="h2">
            Informações
          </Typography>

          {info}
        </CardContent>
      </Card>
    );
  }
}

InformationCard.propTypes = {
  classes: PropTypes.object.isRequired,
  language: PropTypes.object,
};

export default withStyles(styles)(InformationCard);
