import React from 'react';
import PropTypes from 'prop-types';
import { Button, Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'material-ui/Table';
import Grammar from '../logic/Grammar';
import { DIRECT, INDIRECT } from '../logic/Grammar/LeftRecursion';
import * as R from 'ramda';

const styles = () => ({
  card: {
    height: '100%',
  },
  container: {
    overflowX: 'auto',
  },
  button: {
    marginTop: '1em',
  },
});

class RecursionCard extends React.Component {
  render() {
    const { classes, language, onRemoveLeftRecursion } = this.props;

    if (!language || !language.valid) return null;
    const grammar = Grammar.fromPlainObject(language.grammar);

    const hasRecursions = grammar.hasLeftRecursion();
    const recursions = grammar.getLeftRecursions();

    const table = hasRecursions && (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="dense">Símbolo (Vn)</TableCell>
            <TableCell padding="dense">Recursão</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {R.keys(recursions).map(nT => (
            <TableRow key={nT} hover={true}>
              <TableCell padding="dense">{nT}</TableCell>
              <TableCell padding="dense">
                {recursions[nT][DIRECT] ? (
                  <div>Direta ({recursions[nT][DIRECT].join(', ')})</div>
                ) : (
                  ''
                )}
                {recursions[nT][INDIRECT] ? (
                  <div>Indireta ({recursions[nT][INDIRECT].join(', ')})</div>
                ) : (
                  ''
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Recursão à esquerda
          </Typography>
          {hasRecursions && (
            <div className={classes.container}>
              {table}{' '}
              <Button
                onClick={event => onRemoveLeftRecursion(language.id)}
                color="primary"
                size="small"
                className={classes.button}
              >
                Remover recursão
              </Button>
            </div>
          )}

          {!hasRecursions && (
            <div>
              <strong style={{ color: 'green' }}>
                A gramática não possuí recursão à esquerda
              </strong>.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
}

RecursionCard.propTypes = {
  language: PropTypes.object,
  onRemoveLeftRecursion: PropTypes.func,
};

export default withStyles(styles)(RecursionCard);
