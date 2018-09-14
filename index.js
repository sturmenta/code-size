const fs = require('fs');
const walk = require('walk');

exports = module.exports = path => {

	let non_codeFilesExtensions = [
		'jpg',
		'png',
		'gif',
		'pdf',
		'md',
		'p12',
		'DS_Store'
	];

	const walker = walk.walk(path, { followLinks: false });
	const files = [];

	walker.on('file', (root, stat, next) => {
		files.push(root + '/' + stat.name);
		next();
	});

	let numberOfTotalCharacters = 0;
	let numberOfTotalLines = 0;

	const qCodeSizeCounted = [];

	walker.on('end', () => {
		files.map(filePath => {
			qCodeSizeCounted.push(new Promise(resolve => {
				const notCodeFile = non_codeFilesExtensions.includes(filePath.split('.')[filePath.split('.').length - 1]);
				if (!notCodeFile) {
					const lines = fs.readFileSync(filePath, 'utf8').split('\n');

					let numberOfCharacters = 0;
					let numberOfLines = 0;

					lines.map(line => numberOfCharacters += (line.length + 1)); // for \n
					numberOfCharacters--;
					lines.map(line => line !== '' ? numberOfLines++ : null); // \n it's not in the last line

					numberOfTotalCharacters += numberOfCharacters;
					numberOfTotalLines += numberOfLines;
				}
				resolve();
			}));
		});

		Promise.all(qCodeSizeCounted).then(() =>
			console.log(`\n\n\nYour code-size is ${numberOfTotalLines} lines and ${numberOfTotalCharacters} characters\n\n\n`));
	});
};