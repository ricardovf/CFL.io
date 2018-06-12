import React from 'react';
import Button from 'material-ui/Button';
import Menu, { MenuItem } from 'material-ui/Menu';
import Divider from 'material-ui/Divider';
import SelfOperationDialog from './SelfOperationDialog';
import {
  cloneFSMWithSteps,
  closureWithSteps,
  concatenationWithSteps,
  differenceWithSteps,
  intersectionWithSteps,
  negationWithSteps,
  reverseWithSteps,
  unionWithSteps,
} from '../../logic/FSM/Operator';
import TwoLanguagesOperationDialog from './TwoLanguagesOperationDialog';
import FSM from '../../logic/FSM';
import { determinateWithSteps } from '../../logic/FSM/Determinator';
import { minimizeWithSteps } from '../../logic/FSM/Minimizer';
import { removeEpsilonWithSteps } from '../../logic/FSM/Epsilon';

class OperationsMenu extends React.Component {
  state = {
    anchorEl: null,
    operation: null,
  };

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  makeOperationHandler = operation => {
    return event => {
      this.setState({ anchorEl: null, operation });
    };
  };

  handleClose = () => {
    this.setState({ anchorEl: null, operation: null });
  };

  render() {
    const { anchorEl, operation } = this.state;
    const { language, languages, handleSave } = this.props;

    if (!language || !language.fsm) {
      return '';
    }

    const fsm =
      language.fsm instanceof FSM
        ? language.fsm
        : FSM.fromPlainObject(language.fsm);

    return (
      <div>
        <SelfOperationDialog
          title="Minimizar"
          subtitle="Minimizando"
          open={operation === 'minimize'}
          operation={minimizeWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Determinizar"
          subtitle="Determinizando"
          open={operation === 'determinate'}
          operation={determinateWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Remover epsilon"
          subtitle="Removendo epsilon de "
          open={operation === 'removeEpsilon'}
          operation={removeEpsilonWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Complemento"
          subtitle="Complementando"
          open={operation === 'negation'}
          operation={negationWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Reverso"
          subtitle="Revertendo"
          open={operation === 'reverse'}
          operation={reverseWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Fechamento"
          subtitle="Fechando"
          operation={closureWithSteps}
          open={operation === 'closure'}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Clonar"
          subtitle="Clonando"
          open={operation === 'clone'}
          operation={cloneFSMWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <TwoLanguagesOperationDialog
          title="Concatenação"
          subtitle="Concatenando"
          actionSubtitle="concatenar com"
          operation={concatenationWithSteps}
          open={operation === 'concatenation'}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
          languages={languages}
        />
        <TwoLanguagesOperationDialog
          title="Diferença"
          subtitle="Diferenciando"
          actionSubtitle="calcular a diferença de"
          operation={differenceWithSteps}
          open={operation === 'difference'}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
          languages={languages}
        />
        <TwoLanguagesOperationDialog
          title="União"
          subtitle="Unindo"
          actionSubtitle="unir com"
          operation={unionWithSteps}
          open={operation === 'union'}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
          languages={languages}
        />
        <TwoLanguagesOperationDialog
          title="Interseção"
          subtitle="interseccionando"
          actionSubtitle="intersectar com"
          operation={intersectionWithSteps}
          open={operation === 'intersection'}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
          languages={languages}
        />
        <Button
          color="inherit"
          aria-owns={anchorEl ? 'operations-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          Operações
        </Button>
        <Menu
          id="operations-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem
            disabled={fsm.hasEpsilonTransitions() ? false : true}
            onClick={this.makeOperationHandler('removeEpsilon')}
          >
            Eliminar produções com epsilon
          </MenuItem>
          <MenuItem
            disabled={fsm.isDeterministic() ? true : false}
            onClick={this.makeOperationHandler('determinate')}
          >
            Eliminar produções simples
          </MenuItem>
          <MenuItem
            disabled={fsm.isMinimal() ? true : false}
            onClick={this.makeOperationHandler('minimize')}
          >
            Eliminar símbolos inférteis
          </MenuItem>

          <MenuItem
            disabled={fsm.isMinimal() ? true : false}
            onClick={this.makeOperationHandler('minimize')}
          >
            Eliminar símbolos inalcançáveis
          </MenuItem>

          <Divider />

          <MenuItem onClick={this.makeOperationHandler('negation')}>
            Transformar em GLC Própria
          </MenuItem>

          <Divider />

          <MenuItem onClick={this.makeOperationHandler('clone')}>
            Clonar
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

export default OperationsMenu;
