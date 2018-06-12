import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'material-ui';
import Tooltip from 'material-ui/Tooltip';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import FSMGraph from '../components/FSMGraph';
import EditableTransitionTableConnected from '../connectors/EditableTransitionTableConnected';

import IconButton from 'material-ui/IconButton';
import CodeDialog from './CodeDialog';

const styles = () => ({
  card: {
    height: '100%',
    overflow: 'auto',
  },
  icons: {
    float: 'right',
  },
  icon: {
    marginLeft: '6px',
    width: '24px',
    height: '24px',
    '& > span > span': {
      fontSize: '16px',
    },
  },
});

class TableOrGraphCard extends React.Component {
  render() {
    const {
      classes,
      view = 'table',
      alternateView,
      renameStatesToStandard,
      language,
      fsm,
    } = this.props;

    const renameStates = fsm && (
      <Tooltip title="Renomear estados para A...Z">
        <IconButton
          className={classes.icon}
          aria-label="rename-states"
          onClick={() => renameStatesToStandard(language.id)}
        >
          <Icon>spellcheck</Icon>
        </IconButton>
      </Tooltip>
    );

    return (
      <Card className={classes.card}>
        <CardContent>
          <div className={classes.icons}>
            <IconButton
              title="Alternar entre o grafo e a tabela de transições"
              className={classes.icon}
              aria-label="generate-code-for-fsm"
              onClick={alternateView}
            >
              <Icon color={view === 'table' ? undefined : 'primary'}>
                bubble_chart
              </Icon>
            </IconButton>
            {fsm && (
              <React.Fragment>
                {<CodeDialog fsm={fsm} />}
                {renameStates}
              </React.Fragment>
            )}
          </div>
          {view === 'graph' ? (
            <FSMGraph fsm={fsm} />
          ) : (
            <EditableTransitionTableConnected />
          )}
        </CardContent>
      </Card>
    );
  }
}

TableOrGraphCard.propTypes = {
  classes: PropTypes.object.isRequired,
  language: PropTypes.object,
  view: PropTypes.string,
  alternateView: PropTypes.func,
  renameStatesToStandard: PropTypes.func,
};

export default withStyles(styles)(TableOrGraphCard);
