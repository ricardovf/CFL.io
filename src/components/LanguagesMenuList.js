import React from 'react';
import PropTypes from 'prop-types';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui';
import GitCommit from '../_git_commit';
import { toEpsilonFreeWithSteps } from '../logic/Grammar/Operations';
import NewGrammarDialog from './NewGrammarDialog';

const isSelected = (item, language) =>
  language !== undefined && language.id === item.id;

const styles = theme => ({
  selected: {
    background: theme.palette.primary.main,
    '& h3': {
      color: theme.palette.primary.contrastText,
    },
    '&:hover': {
      background: theme.palette.primary.light,
    },
  },
  version: {
    color: '#999',
    fontSize: '12px',
  },
});

class LanguagesMenuList extends React.Component {
  state = {
    newGrammarDialogOpened: false,
  };

  handleClose = () => {
    this.setState({ newGrammarDialogOpened: false });
  };

  render() {
    const {
      classes,
      language,
      languages,
      selectLanguageOnClick,
      saveNewLanguage,
    } = this.props;

    const { newGrammarDialogOpened } = this.state;

    const listItems = languages.map(item => (
      <ListItem
        dense
        className={isSelected(item, language) ? classes.selected : undefined}
        button
        key={item.id}
        onClick={selectLanguageOnClick.bind(this, item.id)}
      >
        <ListItemText primary={item.name} />
      </ListItem>
    ));

    return (
      <List>
        {listItems}

        <ListItem>
          <Button
            fullWidth
            variant="raised"
            color="secondary"
            size="medium"
            onClick={event => {
              this.setState({ newGrammarDialogOpened: true });
            }}
          >
            Nova gramática
          </Button>

          <NewGrammarDialog
            open={newGrammarDialogOpened}
            handleCancel={this.handleClose}
            handleSave={saveNewLanguage}
          />
        </ListItem>

        <ListItem className={classes.version}>
          Versão:{' '}
          {GitCommit.logMessage
            .split(' ')
            .slice(1, 4)
            .join(', ')}
        </ListItem>
      </List>
    );
  }
}

LanguagesMenuList.propTypes = {
  language: PropTypes.object,
  languages: PropTypes.array.isRequired,
  selectLanguageOnClick: PropTypes.func.isRequired,
  saveNewLanguage: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(LanguagesMenuList);
