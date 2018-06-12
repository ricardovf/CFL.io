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
    const { classes, language, length, onLengthChange } = this.props;

    const table = (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="dense">Símbolo (Vn)</TableCell>
            <TableCell padding="dense">Fatorado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow hover={true}>
            <TableCell padding="dense">S</TableCell>
            <TableCell padding="dense">Sim</TableCell>
          </TableRow>
          <TableRow hover={true}>
            <TableCell padding="dense">B</TableCell>
            <TableCell padding="dense">Não</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            Fatoração
          </Typography>
          <div>
            Em até <Input type="number" value={100} /> passos a gramática{' '}
            <strong style={{ color: 'green' }}>é fatorável</strong>.{' '}
            <Button color="primary" size="small">
              Fatorar
            </Button>
          </div>
          <div>
            Em até <Input type="number" value={10} /> passos a gramática{' '}
            <strong style={{ color: 'red' }}>não é fatorável</strong>.
          </div>
          <div>
            <strong style={{ color: 'green' }}>
              A gramática está fatorada
            </strong>.
          </div>
        </CardContent>
      </Card>
    );
  }
}

FactorizationCard.propTypes = {
  language: PropTypes.object,
  length: PropTypes.number,
  onLengthChange: PropTypes.func,
};

export default withStyles(styles)(FactorizationCard);
