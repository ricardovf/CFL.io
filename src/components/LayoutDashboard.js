import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import GrammarCardConnector from '../connectors/GrammarCardConnector';
import InformationCardConnector from '../connectors/InformationCardConnector';
import RecursionCardConnector from '../connectors/RecursionCardConnector';
import FirstFollowTableConnector from '../connectors/FirstFollowTableConnector';
import FactorizationCardConnector from '../connectors/FactorizationCardConnector';

const styles = theme => ({
  // root: {
  //   flexGrow: 1,
  // },
  messagePaper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary,
  },
  paper: {
    //padding: theme.spacing.unit * 2,
    // textAlign: 'center',
    height: '100%',
    color: theme.palette.text.secondary,
  },
});

function LayoutDashboard(props) {
  const { classes, language, hasLanguages } = props;

  if (language === undefined) {
    return (
      <Paper elevation={1} className={classes.messagePaper}>
        {hasLanguages
          ? 'Selecione uma gramática no menu lateral'
          : 'Crie a sua primeira gramática no menu lateral'}
      </Paper>
    );
  }

  return (
    <React.Fragment>
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={12} md={language && language.valid ? 9 : 12}>
            <Grid
              container
              spacing={24}
              style={{ height: 'calc(100% + 24px)' }}
            >
              <Grid item xs={12} sm={12}>
                <GrammarCardConnector />
              </Grid>
              <Grid item xs={12}>
                <FirstFollowTableConnector />
              </Grid>
            </Grid>
          </Grid>
          {language &&
            language.valid && (
              <Grid item xs={12} sm={12} md={3}>
                <InformationCardConnector />
              </Grid>
            )}

          <Grid item xs={12} sm={6} md={6}>
            <RecursionCardConnector />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <FactorizationCardConnector />
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
}

LayoutDashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LayoutDashboard);
