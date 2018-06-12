import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import LRLogo from '../media/img/LR_logo.png';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Hidden from 'material-ui/Hidden';
import Divider from 'material-ui/Divider';
import LanguagesMenuListConnector from '../connectors/LanguagesMenuListConnector';
import { Route, Switch } from 'react-router-dom';
import MainToolbarConnector from '../connectors/MainToolbarConnector';
import LayoutDashboardConnector from '../connectors/LayoutDashboardConnector';

const NotFound = () => 'Page not found';

const drawerWidth = 240;

const styles = theme => ({
  '@global': {
    html: {
      WebkitFontSmoothing: 'antialiased', // Antialiasing.
      MozOsxFontSmoothing: 'grayscale', // Antialiasing.
      boxSizing: 'border-box',
      fontSize: '18px',
    },
  },
  root: {
    flexGrow: 1,
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  appBar: {
    position: 'absolute',
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: {
    ...theme.mixins.toolbar,
    display: 'flex',
  },
  logoToolbar: {
    ...theme.mixins.toolbar,
    display: 'flex',
  },
  logo: {
    paddingLeft: theme.spacing.unit * 3,
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  drawerPaper: {
    width: drawerWidth,
    [theme.breakpoints.up('md')]: {
      position: 'relative',
    },
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
  },
});

class LayoutWithResponsiveDrawer extends React.Component {
  state = {
    mobileOpen: false,
  };

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  render() {
    const { classes, theme } = this.props;

    const drawer = (
      <div>
        <div className={classes.logoToolbar}>
          <a className={classes.logo} href="/">
            <img alt="LR.io Logo" src={LRLogo} style={{ height: '26px' }} />
          </a>
        </div>
        <Divider />
        <LanguagesMenuListConnector languages={[]} />
      </div>
    );

    return (
      <div className={classes.root}>
        <AppBar className={classes.appBar}>
          <MainToolbarConnector handleDrawerToggle={this.handleDrawerToggle} />
        </AppBar>
        <Hidden mdUp>
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={this.state.mobileOpen}
            onClose={this.handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            open
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
            <Route exact path="/" component={LayoutDashboardConnector} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    );
  }
}

LayoutWithResponsiveDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(
  LayoutWithResponsiveDrawer
);
