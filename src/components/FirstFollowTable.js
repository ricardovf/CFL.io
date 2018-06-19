import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'material-ui/Table';
import Card, { CardContent } from 'material-ui/Card';
import Grammar from '../logic/Grammar';

const styles = () => ({
  card: {
    height: '100%',
  },
  container: {
    overflowX: 'auto',
  },
});

class FirstFollowTable extends React.Component {
  render() {
    const { classes, language } = this.props;

    if (!language || !language.valid) return null;
    const grammar = Grammar.fromPlainObject(language.grammar);
    const nonTerminals = grammar.nonTerminalsFirstSymbolFirst();

    return (
      <Card className={classes.card}>
        <CardContent>
          <div>
            <Typography gutterBottom variant="headline" component="h2">
              First & Follow
            </Typography>

            <div className={classes.container}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="dense">Símbolo</TableCell>
                    <TableCell padding="dense">First</TableCell>
                    <TableCell padding="dense">Follow</TableCell>
                    <TableCell padding="dense">First-NT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nonTerminals.map(nT => (
                    <TableRow key={nT} hover={true}>
                      <TableCell padding="dense">{nT}</TableCell>
                      <TableCell padding="dense">
                        {grammar
                          .first(nT)
                          .sort()
                          .join(', ')}
                      </TableCell>
                      <TableCell padding="dense">$, b, &</TableCell>
                      <TableCell padding="dense">a, b</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

FirstFollowTable.propTypes = {
  classes: PropTypes.object.isRequired,
  language: PropTypes.object,
};

export default withStyles(styles)(FirstFollowTable);
