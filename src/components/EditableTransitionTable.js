import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Input, Typography } from 'material-ui';
import Tooltip from 'material-ui/Tooltip';
import { withStyles } from 'material-ui/styles';
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'material-ui/Table';
import Checkbox from 'material-ui/Checkbox';
import * as R from 'ramda';
import Radio from 'material-ui/Radio';
import SymbolValidator from '../logic/SymbolValidator';

import IconButton from 'material-ui/IconButton';
import TransitionEdit from './TransitionEdit';

const NEW_SYMBOL = 'Novo símbolo';
const NEW_STATE = 'Novo estado';

const styles = () => ({
  card: {
    height: '100%',
  },
  container: {
    overflowX: 'auto',
  },
  minimalCell: {
    padding: 0,
    'text-align': 'center',
  },
  newRow: {
    background: '#ffffe5',
  },
  noPaddingRight: {
    paddingRight: '0',
  },
  tableInput: {
    padding: '0',
    marginBottom: '-4px',
    fontWeight: 'normal',
    width: '100px',
  },
  deleteIconHider: {
    '& $rowDeleteIcon': {
      opacity: '0',
    },
    '&:hover': {
      '& $rowDeleteIcon': {
        opacity: '1',
      },
    },
  },
  deleteIconHiderContent: {
    position: 'relative',
  },
  rowDeleteIcon: {
    position: 'absolute',
    left: '20px',
    top: '-3px',
    width: '24px',
    height: '24px',
    '& > span > span': {
      fontSize: '16px',
    },
  },
});

class EditableTransitionTable extends React.Component {
  constructor(props) {
    super(props);

    this.newStateInputRef = null;
    this.newSymbolInputRef = null;
  }

  buildHeader(fsm) {
    let data = ['→', 'F', 'Estado'];

    if (fsm && Array.isArray(fsm.alphabet)) {
      data = [...data, ...fsm.alphabet];
    }

    // new symbol
    data.push(NEW_SYMBOL);

    return data;
  }

  buildData(fsm) {
    const data = [];
    let newAlphabet = [];

    if (fsm && Array.isArray(fsm.states)) {
      if (Array.isArray(fsm.alphabet)) {
        fsm.alphabet.forEach(symbol => {
          newAlphabet[symbol] = '';
        });
      }

      for (const state of fsm.states) {
        const alphabet = {};

        if (Array.isArray(fsm.alphabet)) {
          fsm.alphabet.forEach(symbol => {
            let to = [];
            const transitions = R.filter(
              R.whereEq({ from: state, when: symbol })
            )(fsm.transitions);

            if (transitions.length) {
              to = [...to, ...R.pluck('to')(transitions)];
            }

            alphabet[symbol] = R.uniq(to).sort();
          });
        }

        const line = {
          state,
          initial: fsm.initial === state,
          final: Array.isArray(fsm.finals) && fsm.finals.includes(state),
          ...alphabet,
          [NEW_SYMBOL]: '',
        };

        data.push(line);
      }
    }

    // new
    newAlphabet[NEW_SYMBOL] = '';

    const line = {
      state: NEW_STATE,
      initial: false,
      final: false,
      ...newAlphabet,
    };

    data.push(line);

    return data;
  }

  render() {
    const {
      classes,
      language,
      fsm,
      changeInitialState,
      addToFinalStates,
      deleteFromFinalStates,
      addNewState,
      deleteState,
      addNewSymbol,
      deleteSymbol,
      changeTransition,
    } = this.props;

    const data = this.buildData(fsm);
    const header = this.buildHeader(fsm);

    const currentStates = fsm && Array.isArray(fsm.states) ? fsm.states : [];

    let newStateInput = (
      <Tooltip
        title="Digite uma letra e pressione a tecla ↵ ENTER"
        placement="right"
      >
        <Input
          inputRef={e => (this.newStateInputRef = e)}
          disableUnderline
          // fullWidth
          placeholder="Novo estado"
          margin="none"
          className={classes.tableInput}
          onChange={event => {
            event.target.value = event.target.value
              .toUpperCase()
              .charAt(event.target.value.length - 1);
          }}
          onKeyPress={event => {
            if (event.key === 'Enter') {
              if (
                SymbolValidator.isValidNonTerminal(event.target.value) &&
                !currentStates.includes(event.target.value)
              ) {
                addNewState(language.id, event.target.value);
                event.target.value = '';
                setTimeout(() => {
                  this.newStateInputRef.focus();
                }, 250);
              }
            }
          }}
        />
      </Tooltip>
    );

    let newSymbolInput = (
      <Tooltip
        title="Digite uma letra ou número e pressione a tecla ↵ ENTER"
        placement="left"
      >
        <Input
          inputRef={e => (this.newSymbolInputRef = e)}
          disableUnderline
          // fullWidth
          placeholder="Novo símbolo"
          margin="none"
          className={classes.tableInput}
          onChange={event => {
            event.target.value = event.target.value
              .toLowerCase()
              .charAt(event.target.value.length - 1);
          }}
          onKeyPress={event => {
            if (event.key === 'Enter') {
              if (
                SymbolValidator.isValidTerminal(event.target.value) &&
                !currentStates.includes(event.target.value)
              ) {
                addNewSymbol(language.id, event.target.value);
                event.target.value = '';
                setTimeout(() => {
                  this.newSymbolInputRef.focus();
                }, 250);
              }
            }
          }}
        />
      </Tooltip>
    );

    return (
      <div>
        <Typography gutterBottom variant="headline" component="h2">
          Tabela de transições
        </Typography>

        <div className={classes.container}>
          <Table>
            <TableHead>
              <TableRow>
                {header.map((h, index) => {
                  return (
                    <TableCell
                      key={index}
                      className={
                        index < 2
                          ? classes.minimalCell
                          : language.fsm && language.fsm.alphabet.includes(h)
                            ? classes.deleteIconHider
                            : ''
                      }
                      padding="dense"
                    >
                      <div className={classes.deleteIconHiderContent}>
                        {h === NEW_SYMBOL ? newSymbolInput : h}
                        {language.fsm &&
                          language.fsm.alphabet.includes(h) && (
                            <IconButton
                              className={classes.rowDeleteIcon}
                              aria-label="delete"
                              onClick={() => {
                                deleteSymbol(language.id, h);
                              }}
                            >
                              <Icon>delete</Icon>
                            </IconButton>
                          )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((t, index) => {
                return (
                  <TableRow
                    hover={t.state === NEW_STATE ? undefined : true}
                    key={index}
                    className={
                      t.state === NEW_STATE
                        ? classes.newRow
                        : classes.deleteIconHider
                    }
                  >
                    <TableCell
                      padding="checkbox"
                      className={classes.minimalCell}
                    >
                      {t.state !== NEW_STATE && (
                        <Radio
                          checked={t.initial}
                          onChange={event => {
                            changeInitialState(language.id, t.state);
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell
                      padding="checkbox"
                      className={classes.minimalCell}
                    >
                      {t.state !== NEW_STATE && (
                        <Checkbox
                          checked={t.final}
                          onChange={event => {
                            if (event.target.checked) {
                              addToFinalStates(language.id, t.state);
                            } else {
                              deleteFromFinalStates(language.id, t.state);
                            }
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell padding="dense">
                      <div className={classes.deleteIconHiderContent}>
                        {t.state === NEW_STATE ? newStateInput : t.state}
                        {t.state !== NEW_STATE && (
                          <IconButton
                            className={classes.rowDeleteIcon}
                            aria-label="delete"
                            onClick={() => {
                              deleteState(language.id, t.state);
                            }}
                          >
                            <Icon>delete</Icon>
                          </IconButton>
                        )}
                      </div>
                    </TableCell>
                    {header.slice(3).map((h, index) => {
                      return (
                        <TableCell key={index} padding="dense">
                          {t.state !== NEW_STATE &&
                            language.fsm &&
                            language.fsm.alphabet.includes(h) && (
                              <TransitionEdit
                                symbol={h}
                                fromState={t.state}
                                toStates={t[h]}
                                language={language}
                                changeTransition={changeTransition}
                              />
                            )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
}

EditableTransitionTable.propTypes = {
  classes: PropTypes.object.isRequired,
  fsm: PropTypes.object,
  valid: PropTypes.bool,
  changeInitialState: PropTypes.func,
  addToFinalStates: PropTypes.func,
  deleteFromFinalStates: PropTypes.func,
  addNewState: PropTypes.func,
  deleteState: PropTypes.func,
  addNewSymbol: PropTypes.func,
  deleteSymbol: PropTypes.func,
  changeTransition: PropTypes.func,
};

export default withStyles(styles)(EditableTransitionTable);
