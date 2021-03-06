import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import Grammar from '../logic/Grammar';
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'material-ui/Table';
import * as R from 'ramda';
import { DIRECT, INDIRECT, MAX_STEPS } from '../logic/Grammar/Factor';

const styles = () => ({
  card: {
    height: '100%',
  },
  form: {
    float: 'right',
  },
});

class FactorizationCard extends React.Component {
  constructor(props) {
    super(props);

    // We keep sentences local cause we do not want to full our store with generated sentences
    this.state = {
      sentences: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { language, length } = nextProps;

    // try to generate the sentences and update sentences in state
    if (language) {
      let sentences = [];

      if (language && language.grammar) {
        const grammar = Grammar.fromPlainObject(language.grammar);

        if (grammar) {
          //sentences = R.sortBy(s => s.length, fsm.generate(length).sort());
        }
      }

      // Update the current state with new sentences
      return {
        sentences,
      };
    }

    // React expects us to return null if nothing changes
    return null;
  }

  render() {
    const {
      classes,
      language,
      factorizationSteps,
      onStepsChange,
      onRemoveFactorsClick,
    } = this.props;

    if (!language || !language.valid) return null;
    const grammar = Grammar.fromPlainObject(language.grammar);
    const isFactored = grammar.isFactored();
    const factors = grammar.getFactors();
    const nonTerminals = R.intersection(
      grammar.nonTerminalsFirstSymbolFirst(),
      R.keys(factors)
    );

    let isFactorable = false;
    let isFactorableResult = (
      <strong style={{ color: 'red' }}>não é fatorável</strong>
    );
    if (!isFactored && grammar.canBeFactored(factorizationSteps)) {
      isFactorable = true;
      isFactorableResult = (
        <React.Fragment>
          <strong style={{ color: 'green' }}>é fatorável</strong>.{' '}
          <Button
            color="primary"
            size="small"
            onClick={() => {
              onRemoveFactorsClick(language.id);
            }}
          >
            Fatorar
          </Button>
        </React.Fragment>
      );
    }

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Fatoração
          </Typography>
          {!isFactored && (
            <div>
              Em até{' '}
              <Input
                type="number"
                defaultValue={factorizationSteps}
                onChange={e => {
                  let value = e.target.value < 0 ? 0 : e.target.value;
                  value = value > MAX_STEPS ? MAX_STEPS : value;
                  onStepsChange(language.id, value);
                }}
              />{' '}
              passos a gramática {isFactorableResult}
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="dense">Símbolo</TableCell>
                    <TableCell padding="dense">Direta</TableCell>
                    <TableCell padding="dense">Indireta</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nonTerminals.map(nT => (
                    <TableRow key={nT} hover={true}>
                      <TableCell padding="dense">{nT}</TableCell>
                      <TableCell
                        padding="dense"
                        dangerouslySetInnerHTML={{
                          __html: factors[nT][DIRECT]
                            ? R.values(
                                R.mapObjIndexed(
                                  (p, s) =>
                                    `${p
                                      .sort()
                                      .map(
                                        pp =>
                                          `<strong><u>${s}</u></strong>${pp.slice(
                                            s.length
                                          )}`
                                      )
                                      .join(', ')}`,
                                  factors[nT][DIRECT]
                                )
                              ).join('<br />')
                            : '–',
                        }}
                      />
                      <TableCell
                        padding="dense"
                        dangerouslySetInnerHTML={{
                          __html: factors[nT][INDIRECT]
                            ? R.values(
                                R.mapObjIndexed(
                                  (p, s) =>
                                    `<strong><u>${
                                      s === '' ? R.head(p)[0] : s
                                    }</u></strong>: ${p.sort().join(', ')}`,
                                  factors[nT][INDIRECT]
                                )
                              ).join('<br />')
                            : '–',
                        }}
                      />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {isFactored && (
            <div>
              <strong style={{ color: 'green' }}>
                A gramática está fatorada.
              </strong>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
}

FactorizationCard.propTypes = {
  language: PropTypes.object,
  factorizationSteps: PropTypes.number,
  onStepsChange: PropTypes.func,
  onRemoveFactorsClick: PropTypes.func,
};

export default withStyles(styles)(FactorizationCard);
