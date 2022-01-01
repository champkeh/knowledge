const Bundle = require('./Bundle')

function rollup ( entry, options = {} ) {
	const bundle = new Bundle({
		entry
	});

	return bundle.collect().then( () => {
		return {
			generate: options => bundle.generate( options ),
			write: () => {
				throw new Error( 'TODO' );
			}
		};
	});
}

module.exports = {
	rollup,
}
