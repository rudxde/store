import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
const millisecond = 1;
const second = 1000 * millisecond;
const minute = 60 * second;
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile)
const request = require('request')

let countTillCompress = 0;

setInterval(async () => {
    await store();
}, 5 * minute);
const getHtmlFile = () => {
    return new Promise((resolve, reject) => {
        request('https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html', (err, res, body) => err ? reject(err) : resolve(body));
        countTillCompress++;
        if (countTillCompress > 500) compress();
    });
}

async function store() {
    try {
        let htmlFile = await getHtmlFile();
        await writeFile('../files/' + new Date().getTime() + '.html', htmlFile, 'utf8');
    } catch (err) {
        console.log(err)
    }
}



function compress() {
    countTillCompress = 0;
    const dirPath = '/usr/src/files/';

    var output = fs.createWriteStream(path.join(dirPath, new Date().getTime().toString(), '.html'));
    var archive = archiver('zip', {
        gzip: true,
        zlib: { level: 9 } // Sets the compression level.
    });

    archive.on('error', function (err) {
        throw err;
    });
    let files: string[] = fs.readdirSync(dirPath);
    archive.pipe(output);

    files.filter(x => x.endsWith('.html')).forEach(file => {
        archive.file(path.join(dirPath, file), { name: file });
    });

    archive.finalize();
}