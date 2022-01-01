const walk = require('./walk')
const Scope = require('./Scope')
const { getName } = require('../utils/map-helpers')

function isStatement ( node ) {
	return node.type === 'ExpressionStatement' ||
		   node.type === 'VariableDeclaration' ||
	       node.type === 'FunctionDeclaration'; // TODO or any of the other various statement-ish things it could be
}

function analyse ( ast ) {
	let scope = new Scope();
	let topLevelStatements = [];
	let currentTopLevelStatement;

	function addToScope ( declarator ) {
		var name = declarator.id.name;
		scope.add( name, false );

		if ( !scope.parent ) {
			currentTopLevelStatement._defines[ name ] = true;
		}
	}

	function addToBlockScope ( declarator ) {
		var name = declarator.id.name;
		scope.add( name, true );

		if ( !scope.parent ) {
			currentTopLevelStatement._defines[ name ] = true;
		}
	}

	walk( ast, {
		enter ( node, parent ) {
			if ( !currentTopLevelStatement && isStatement( node ) ) {
				node._defines = {};
				node._modifies = {};
				node._dependsOn = {};

				currentTopLevelStatement = node;
				topLevelStatements.push( node );
			}

			switch ( node.type ) {
				case 'FunctionExpression':
				case 'FunctionDeclaration':
				case 'ArrowFunctionExpression':
					if ( node.id ) {
						addToScope( node );
					}

					let names = node.params.map( getName );

					scope = node._scope = new Scope({
						parent: scope,
						params: names, // TODO rest params?
						block: false
					});

					break;

				case 'BlockStatement':
					scope = node._scope = new Scope({
						parent: scope,
						block: true
					});

					break;

				case 'VariableDeclaration':
					// node.declarations.forEach( node.kind === 'let' ? addToBlockScope : addToScope ); // TODO const?
					node.kind === 'let' ? node.declarations.forEach(addToBlockScope) : node.declarations.forEach(addToScope)
					break;

				case 'ClassExpression':
				case 'ClassDeclaration':
					addToScope( node );
					break;
			}
		},
		leave ( node ) {
			if ( node === currentTopLevelStatement ) {
				currentTopLevelStatement = null;
			}

			switch ( node.type ) {
				case 'FunctionExpression':
				case 'FunctionDeclaration':
				case 'ArrowFunctionExpression':
				case 'BlockStatement':
					scope = scope.parent;
					break;
			}
		}
	});

	ast._scope = scope;
	ast._topLevelStatements = topLevelStatements;
}

module.exports = analyse
