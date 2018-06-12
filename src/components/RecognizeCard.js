import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import ChipInput from 'material-ui-chip-input';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import FSM from '../logic/FSM';

const styles = () => ({
  card: {
    height: '100%',
  },
  greenAvatar: {
    color: '#fff',
    backgroundColor: 'green',
  },
  redAvatar: {
    color: '#fff',
    backgroundColor: 'red',
  },
  avatarIcon: {
    fontSize: '16px',
  },
});

class RecognizeCard extends React.Component {
  constructor(props) {
    super(props);

    // We keep the accepted sentences local cause we do not want to full our store with it and its always up to date
    this.state = {
      acceptedSentences: [],
    };
  }

  componentDidMount() {
    // noinspection JSIgnoredPromiseFromCall
    this.fetchAcceptedSentences();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.language !== this.props.language ||
      prevProps.sentences !== this.props.sentences
    ) {
      // noinspection JSIgnoredPromiseFromCall
      this.fetchAcceptedSentences();
    }
  }

  async fetchAcceptedSentences() {
    const { language } = this.props;

    let acceptedSentences = [];

    // try to generate the sentences and update sentences in state
    if (language) {
      if (language && language.fsm) {
        const fsm = FSM.fromPlainObject(language.fsm);

        if (fsm) {
          for (const sentence of this.props.sentences) {
            if (await fsm.recognize(sentence)) acceptedSentences.push(sentence);
          }
        }
      }
    }

    this.setState({
      acceptedSentences,
    });
  }

  render() {
    const {
      classes,
      language,
      sentences,
      onSentenceAdd,
      onSentenceDelete,
    } = this.props;

    const hasLanguage = language !== undefined;

    const chipRenderer = (
      { value, isFocused, isDisabled, handleClick, handleDelete, defaultStyle },
      key
    ) => (
      <Chip
        style={{
          ...defaultStyle,
          marginBottom: '8px',
          marginRight: '8px',
          // pointerEvents: isDisabled ? 'none' : undefined,
        }}
        onClick={handleClick}
        onDelete={handleDelete}
        label={value}
        key={key}
        avatar={
          <Avatar
            className={
              this.state.acceptedSentences.includes(value)
                ? classes.greenAvatar
                : classes.redAvatar
            }
          >
            <Icon className={classes.avatarIcon}>
              {this.state.acceptedSentences.includes(value)
                ? 'check'
                : 'warning'}
            </Icon>
          </Avatar>
        }
      />
    );

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Reconhecimento
          </Typography>
          {hasLanguage && (
            <ChipInput
              fullWidth
              fullWidthInput
              placeholder="Ex: aabb"
              value={sentences}
              onAdd={chipText => {
                onSentenceAdd(language.id, chipText);
              }}
              onDelete={chipText => {
                onSentenceDelete(language.id, chipText);
              }}
              chipRenderer={chipRenderer}
            />
          )}
        </CardContent>
      </Card>
    );
  }
}

RecognizeCard.propTypes = {
  language: PropTypes.object,
  sentences: PropTypes.array,
  onSentenceAdd: PropTypes.func,
  onSentenceDelete: PropTypes.func,
};

export default withStyles(styles)(RecognizeCard);
