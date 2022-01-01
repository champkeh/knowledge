const { resolve } = require('path')
const fs = require('fs')
const escodegen = require('escodegen')
const { hasOwnProp } = require('../utils/object')
const { sequence } = require('../utils/promise')
const Module = require('../Module')

class Bundle {
	constructor ( options ) {
		this.entryPath = resolve( options.entry );
		this.entryModule = null;

		this.modulePromises = {};
		this.modules = {};

		// this will store the top-level AST nodes we import
		this.body = [];
	}

	collect () {
		return this.build()
			.then( () => {
				return this;
			});
	}

	fetchModule ( path ) {
		if ( !hasOwnProp.call( this.modulePromises, path ) ) {
			this.modulePromises[ path ] = new Promise((resolve1, reject) => {
				const code = fs.readFileSync( path, 'utf-8')
				const module = new Module({
					path,
					code,
					bundle: this
				});

				this.modules[ path ] = module;
				resolve1(module)
			})
		}

		return this.modulePromises[ path ];
	}

	build () {
		// bring in top-level AST nodes from the entry module
		return this.fetchModule( this.entryPath )
			.then( entryModule => {
				this.entryModule = entryModule;

				// pull in imports
				return sequence( Object.keys( entryModule.imports ), name => {
					return entryModule.define( name )
						.then( nodes => this.body.push.apply( this.body, nodes ) );
				})
					.then( () => {
						entryModule.ast.body.forEach( node => {
							// exclude imports and exports, include everything else
							if ( !/^(?:Im|Ex)port/.test( node.type ) ) {
								this.body.push( node );
							}
						});
					});
			});
	}

	generate () {
		return {
			code: escodegen.generate({
				type: 'Program',
				body: this.body
			}),
			map: null // TODO...
		};
	}
}

module.exports = Bundle
