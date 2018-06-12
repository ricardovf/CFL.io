import React from 'react';
import { withStyles } from 'material-ui/styles';

import Viz from 'viz.js';
import { Typography } from 'material-ui';

const styles = () => ({
  graphContainer: {
    // 'overflow-y': 'auto',
    // maxHeight: '1200px',
    // maxWidth: '100%',
  },
});

class FSMGraph extends React.Component {
  renderDiagram(fsm) {
    if (!fsm || !Array.isArray(fsm.states) || fsm.states.length === 0)
      return '';

    let graph = `
      digraph fsm {
        rankdir=LR;
        size="8,5"
        node [shape = doublecircle]; ${fsm.finals
          .map(s => JSON.stringify(s))
          .join(' ') + (fsm.finals.length > 0 ? ';' : '')}
        node [shape = circle];
        ${fsm.transitions
          .map(
            transition =>
              `${JSON.stringify(transition.from)} -> ${JSON.stringify(
                transition.to
              )} [ label = ${JSON.stringify(transition.when)} ];`
          )
          .join('\n')}
        node [shape = point ]; start
        start -> ${JSON.stringify(fsm.initial)}
      }`;

    return (
      <div
        dangerouslySetInnerHTML={{
          __html: Viz(graph, { format: 'svg', engine: 'dot' }),
        }}
      />
    );
  }

  render() {
    const { classes, fsm = null, showTitle = true } = this.props;

    // Gotta return a div, otherwise React goes crazy with viz.js
    return (
      <div>
        {showTitle && (
          <Typography gutterBottom variant="headline" component="h2">
            Grafo
          </Typography>
        )}

        {fsm && (
          <div className={classes.graphContainer}>
            {this.renderDiagram(fsm)}
          </div>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(FSMGraph);
