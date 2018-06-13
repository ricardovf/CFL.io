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
                  <TableRow hover={true}>
                    <TableCell padding="dense">S</TableCell>
                    <TableCell padding="dense">a, b, c</TableCell>
                    <TableCell padding="dense">$, b, &</TableCell>
                    <TableCell padding="dense">a, b</TableCell>
                  </TableRow>
                  <TableRow hover={true}>
                    <TableCell padding="dense">B</TableCell>
                    <TableCell padding="dense">a, b, c</TableCell>
                    <TableCell padding="dense">b</TableCell>
                    <TableCell padding="dense">a</TableCell>
                  </TableRow>
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
