const { dirname, isAbsolute, resolve } = require('path')

function defaultResolver ( importee, importer ) {
	// absolute paths are left untouched
	if ( isAbsolute( importee ) ) return importee;

	// external modules stay external
	if ( importee[0] !== '.' ) return false;

	return resolve( dirname( importer ), importee ).replace( /\.js$/, '' ) + '.js';
}

module.exports = {
	defaultResolver,
}
