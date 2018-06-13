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
    const { classes, language } = this.props;

    if (!language || !language.valid) return null;
    const grammar = Grammar.fromPlainObject(language.grammar);

    const hasLanguage = language !== undefined;

    const table = (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="dense">Símbolo (Vn)</TableCell>
            <TableCell padding="dense">Recursão</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow hover={true}>
            <TableCell padding="dense">S</TableCell>
            <TableCell padding="dense">Direta</TableCell>
          </TableRow>
          <TableRow hover={true}>
            <TableCell padding="dense">B</TableCell>
            <TableCell padding="dense">Indireta</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Recursão à esquerda
          </Typography>
          {hasLanguage && (
            <div className={classes.container}>
              {table}{' '}
              <Button color="primary" size="small" className={classes.button}>
                Remover recursão
              </Button>
            </div>
          )}

          <div>
            <strong style={{ color: 'green' }}>
              A gramática não possuí recursão à esquerda
            </strong>.
          </div>
        </CardContent>
      </Card>
    );
  }
}

RecursionCard.propTypes = {
  language: PropTypes.object,
};

export default withStyles(styles)(RecursionCard);
