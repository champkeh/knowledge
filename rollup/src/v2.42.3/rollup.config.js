import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import fs from 'fs';
import path from 'path';
import { string } from 'rollup-plugin-string';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript';
import addCliEntry from './build-plugins/add-cli-entry.js';
import conditionalFsEventsImport from './build-plugins/conditional-fsevents-import';
import emitModulePackageFile from './build-plugins/emit-module-package-file.js';
import esmDynamicImport from './build-plugins/esm-dynamic-import.js';
import getLicenseHandler from './build-plugins/generate-license-file';
import replaceBrowserModules from './build-plugins/replace-browser-modules.js';
import pkg from './package.json';

const commitHash = (function () {
	try {
		return fs.readFileSync('.commithash', 'utf-8');
	} catch (err) {
		return 'unknown';
	}
})();

const now = new Date(
	process.env.SOURCE_DATE_EPOCH ? process.env.SOURCE_DATE_EPOCH * 1000 : new Date().getTime()
).toUTCString();

const banner = `/*
  @license
	Rollup.js v${pkg.version}
	${now} - commit ${commitHash}

	https://github.com/rollup/rollup

	Released under the MIT License.
*/`;

const onwarn = warning => {
	// eslint-disable-next-line no-console
	console.error(
		'Building Rollup produced warnings that need to be resolved. ' +
			'Please keep in mind that the browser build may never have external dependencies!'
	);
	throw new Error(warning.message);
};

const moduleAliases = {
	resolve: ['.js', '.json', '.md'],
	entries: [
		{ find: 'help.md', replacement: path.resolve('cli/help.md') },
		{ find: 'package.json', replacement: path.resolve('package.json') },
		{ find: 'acorn', replacement: path.resolve('node_modules/acorn/dist/acorn.mjs') }
	]
};

const treeshake = {
	moduleSideEffects: false,
	propertyReadSideEffects: false,
	tryCatchDeoptimization: false
};

const nodePlugins = [
	alias(moduleAliases),
	resolve(),
	json(),
	conditionalFsEventsImport(),
	string({ include: '**/*.md' }),
	commonjs({ include: 'node_modules/**' }),
	typescript()
];

export default command => {
	const { collectLicenses, writeLicense } = getLicenseHandler();
	const commonJSBuild = {
		input: {
			'rollup.js': 'src/node-entry.ts',
			'loadConfigFile.js': 'cli/run/loadConfigFile.ts'
		},
		onwarn,
		plugins: [
			...nodePlugins,
			addCliEntry(),
			esmDynamicImport(),
			!command.configTest && collectLicenses()
		],
		// fsevents is a dependency of chokidar that cannot be bundled as it contains binary code
		external: [
			'assert',
			'crypto',
			'events',
			'fs',
			'fsevents',
			'module',
			'path',
			'os',
			'stream',
			'url',
			'util'
		],
		treeshake,
		strictDeprecations: true,
		output: {
			banner,
			chunkFileNames: 'shared/[name].js',
			dir: 'dist',
			entryFileNames: '[name]',
			// TODO Only loadConfigFile is using default exports mode; this should be changed in Rollup@3
			exports: 'auto',
			externalLiveBindings: false,
			format: 'cjs',
			freeze: false,
			interop: id => {
				if (id === 'fsevents') {
					return 'defaultOnly';
				}
				return 'default';
			},
			manualChunks: { rollup: ['src/node-entry.ts'] },
			sourcemap: true
		}
	};

	if (command.configTest) {
		return commonJSBuild;
	}

	const esmBuild = {
		...commonJSBuild,
		input: { 'rollup.js': 'src/node-entry.ts' },
		plugins: [...nodePlugins, emitModulePackageFile(), collectLicenses()],
		output: {
			...commonJSBuild.output,
			dir: 'dist/es',
			format: 'es',
			sourcemap: false,
			minifyInternalExports: false
		}
	};

	const browserBuilds = {
		input: 'src/browser-entry.ts',
		onwarn,
		plugins: [
			replaceBrowserModules(),
			alias(moduleAliases),
			resolve({ browser: true }),
			json(),
			commonjs(),
			typescript(),
			terser({ module: true, output: { comments: 'some' } }),
			collectLicenses(),
			writeLicense()
		],
		treeshake,
		strictDeprecations: true,
		output: [
			{ file: 'dist/rollup.browser.js', format: 'umd', name: 'rollup', banner, sourcemap: true },
			{ file: 'dist/es/rollup.browser.js', format: 'es', banner }
		]
	};

	// return [commonJSBuild, esmBuild, browserBuilds];
	return [commonJSBuild, esmBuild];
};
