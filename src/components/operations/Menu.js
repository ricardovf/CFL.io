import React from 'react';
import Button from 'material-ui/Button';
import Menu, { MenuItem } from 'material-ui/Menu';
import Divider from 'material-ui/Divider';
import SelfOperationDialog from './SelfOperationDialog';
import Grammar from '../../logic/Grammar';
import {
  cloneGrammarWithSteps,
  eliminateInfertileSymbolsWithSteps,
  eliminateSimpleProductionsWithSteps,
  eliminateUnreachableSymbolsWithSteps,
  toEpsilonFreeWithSteps,
  toOwnWithSteps,
} from '../../logic/Grammar/Operations';
const mockWithSteps = () => {};

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

    if (!language || !language.valid) return null;
    const grammar = Grammar.fromPlainObject(language.grammar);

    return (
      <div>
        <SelfOperationDialog
          title="Eliminar epsilon"
          subtitle="Eliminando produções com epsilon de "
          open={operation === 'eliminate-epsilon'}
          operation={toEpsilonFreeWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Eliminar produções simples"
          subtitle="Eliminando produções simples de "
          open={operation === 'eliminate-simple'}
          operation={eliminateSimpleProductionsWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Eliminar inférteis"
          subtitle="Eliminando produções inférteis de "
          open={operation === 'eliminate-infertile'}
          operation={eliminateInfertileSymbolsWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Eliminar inalcançáveis"
          subtitle="Eliminando símbolos inalcançáveis de "
          operation={eliminateUnreachableSymbolsWithSteps}
          open={operation === 'eliminate-unreachable'}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Transformar em GLC Própria"
          subtitle="Transformando em GLC Própria "
          open={operation === 'transform-to-own'}
          operation={toOwnWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
        />
        <SelfOperationDialog
          title="Clonar"
          subtitle="Clonando"
          open={operation === 'clone'}
          operation={cloneGrammarWithSteps}
          handleCancel={this.handleClose}
          handleSave={handleSave}
          language={language}
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
            // disabled={!grammar.hasEpsilonTransitions()}
            onClick={this.makeOperationHandler('eliminate-epsilon')}
          >
            Eliminar produções com epsilon
          </MenuItem>
          <MenuItem
            // disabled={!grammar.hasSimpleProductions()}
            onClick={this.makeOperationHandler('eliminate-simple')}
          >
            Eliminar produções simples
          </MenuItem>
          <MenuItem
            // disabled={!grammar.hasInfertileSymbols()}
            onClick={this.makeOperationHandler('eliminate-infertile')}
          >
            Eliminar símbolos inférteis
          </MenuItem>

          <MenuItem
            // disabled={!grammar.hasUnreachableSymbols()}
            onClick={this.makeOperationHandler('eliminate-unreachable')}
          >
            Eliminar símbolos inalcançáveis
          </MenuItem>

          <Divider />

          <MenuItem
            // disabled={grammar.isOwn()}
            onClick={this.makeOperationHandler('transform-to-own')}
          >
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
