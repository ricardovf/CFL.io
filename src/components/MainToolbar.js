import React from 'react';
import PropTypes from 'prop-types';
import { Icon, IconButton, Toolbar, Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import RenameLanguage from './RenameLanguage';
import OperationsMenuConnector from '../connectors/operations/MenuConnector';
import Tooltip from 'material-ui/Tooltip';

const styles = theme => ({
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: {
    ...theme.mixins.toolbar,
    display: 'flex',
  },
  nameInput: {
    color: 'white',
  },
});

class MainToolbar extends React.Component {
  render() {
    const {
      classes,
      language,
      handleDrawerToggle,
      deleteOnClick,
      renameLanguage,
    } = this.props;

    const buttons = language && (
      <React.Fragment>
        <OperationsMenuConnector />
        <Tooltip title="Remover a gramática" placement="bottom-start">
          <IconButton
            color="inherit"
            size="small"
            onClick={deleteOnClick.bind(this, language.id)}
          >
            <Icon>delete</Icon>
          </IconButton>
        </Tooltip>
      </React.Fragment>
    );

    return (
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          className={classes.navIconHide}
        >
          <Icon>menu</Icon>
        </IconButton>
        <Typography
          style={{ flex: '1 0 auto' }}
          variant="title"
          color="inherit"
          noWrap
        >
          {language && (
            <RenameLanguage
              language={language}
              renameLanguage={renameLanguage}
            />
          )}
        </Typography>
        {buttons}
      </Toolbar>
    );
  }
}

MainToolbar.propTypes = {
  language: PropTypes.object,
  handleDrawerToggle: PropTypes.func.isRequired,
  deleteOnClick: PropTypes.func.isRequired,
  renameLanguage: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(MainToolbar);
