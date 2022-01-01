const { dirname, resolve } = require('path')
const acorn = require('acorn')
const analyse = require('../ast/analyse')
const { hasOwnProp } = require('../utils/object')
const { sequence } = require('../utils/promise')

class Module {
	constructor ({ path, code, bundle }) {
		this.path = path;
		this.code = code;
		this.bundle = bundle;


		this.ast = acorn.parse( code, {
			ecmaVersion: 6,
			sourceType: 'module'
		});

		analyse( this.ast );

		this.definitions = {};
		this.modifications = {};

		this.ast._topLevelStatements.forEach( statement => {
			Object.keys( statement._defines ).forEach( name => {
				this.definitions[ name ] = statement;
			});

			Object.keys( statement._modifies ).forEach( name => {
				this.modifications[ name ] = statement;
			});
		});

		this.imports = {};
		this.exports = {};

		this.ast.body.forEach( node => {
			if ( node.type === 'ImportDeclaration' ) {
				const source = node.source.value;

				node.specifiers.forEach( specifier => {
					const name = specifier.local.name;

					this.imports[ name ] = {
						source,
						name, // TODO import { foo as bar } etc
						isDefault: specifier.type === 'ImportDefaultSpecifier',
						module: null
					};
				});
			}

			else if ( node.type === 'ExportDeclaration' ) {
				// TODO
			}
		});
	}

	define ( name ) {
		if ( hasOwnProp.call( this.imports, name ) ) {
			const declaration = this.imports[ name ];
			const path = resolve( dirname( this.path ), declaration.source ) + '.js';
			return this.bundle.fetchModule( path )
				.then( module => module.define( name ) );
		}

		else {
			const statement = this.definitions[ name ];

			if ( statement ) {
				const nodes = [];

				return sequence( Object.keys( statement._dependsOn ), name => {
					return this.define( name );
				})
					.then( definitions => {
						nodes.push.apply( nodes, definitions );
					})
					.then( () => {
						nodes.push( statement );
					})
					.then( () => nodes );
			}
		}
	}
}

module.exports = Module
