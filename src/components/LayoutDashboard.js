import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import GrammarCardConnector from '../connectors/GrammarCardConnector';
import ExpressionCardConnector from '../connectors/ExpressionCardConnector';
import FSMCardConnector from '../connectors/FSMCardConnector';
import RecognizeCardConnector from '../connectors/RecognizeCardConnector';
import EnumerationCardConnector from '../connectors/EnumerationCardConnector';
import TableOrGraphCardConnector from '../connectors/TableOrGraphCardConnector';
import EditableTransitionTable from './EditableTransitionTable';

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
          ? 'Selecione uma linguagem no menu lateral'
          : 'Crie a sua primeira linguagem no menu lateral'}
      </Paper>
    );
  }

  return (
    <React.Fragment>
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={12} md={9}>
            <Grid
              container
              spacing={24}
              style={{ height: 'calc(100% + 24px)' }}
            >
              <Grid item xs={12} sm={12}>
                <GrammarCardConnector />
              </Grid>
              <Grid item xs={12}>
                <EditableTransitionTable />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={3}>
            <FSMCardConnector />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <RecognizeCardConnector />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <EnumerationCardConnector />
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
