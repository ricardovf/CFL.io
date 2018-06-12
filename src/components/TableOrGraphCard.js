import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'material-ui';
import Tooltip from 'material-ui/Tooltip';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import EditableTransitionTableConnected from '../connectors/EditableTransitionTableConnected';

const styles = () => ({
  card: {
    height: '100%',
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

    return (
      <Card className={classes.card}>
        <CardContent>
          <EditableTransitionTableConnected />
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
