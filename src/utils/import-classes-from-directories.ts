import * as path from 'path';
import glob = require('glob');
import { Type } from '@nestjs/common';

/**
 * Loads all exported classes from the given directory.
 */
export function importClassesFromDirectories(directories: string[], formats = ['.js', '.ts']): Type<any>[] {

	const loadFileClasses = function (exported: any, allLoaded: Type<any>[]) {
		if (exported instanceof Function) {
			allLoaded.push(exported);
		} else if (exported instanceof Array) {
			exported.forEach((i: any) => loadFileClasses(i, allLoaded));
		} else if (exported instanceof Object || typeof exported === 'object') {
			Object.keys(exported).forEach(key => loadFileClasses(exported[key], allLoaded));
		}

		return allLoaded;
	};

	const allFiles = directories.reduce((allDirs, dir) => {
		return allDirs.concat(glob.sync(path.normalize(dir)));
	}, [] as string[]);

	const dirs = allFiles
			.filter(file => {
				const dtsExtension = file.substring(file.length - 5, file.length);
				return formats.indexOf(path.extname(file)) !== -1 && dtsExtension !== '.d.ts';
			})
			.map(file => {
				return require(file);
			});

	return loadFileClasses(dirs, []);
}