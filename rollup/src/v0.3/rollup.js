const { basename } = require('path')
const fs = require('fs')
const Bundle = require('./Bundle')

let SOURCEMAPPING_URL = 'sourceMa';
SOURCEMAPPING_URL += 'ppingURL';

function rollup ( entry, options = {} ) {
	const bundle = new Bundle({
		entry,
		resolvePath: options.resolvePath
	});

	return bundle.build().then( () => {
		return {
			generate: options => bundle.generate( options ),
			write: ( dest, options = {} ) => {
				let { code, map } = bundle.generate({
					dest,
					format: options.format,
					globalName: options.globalName
				});

				code += `\n//# ${SOURCEMAPPING_URL}=${basename( dest )}.map`;

				return Promise.all([
					// writeFile( dest, code ),
					// writeFile( dest + '.map', map.toString() ),
					fs.writeFile(dest, code),
					fs.writeFile(dest + '.map', map.toString()),
				]);
			}
		};
	});
}

module.exports = {
	rollup
}
