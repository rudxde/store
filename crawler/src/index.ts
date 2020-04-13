import fs from 'fs';
const millisecond = 1;
const second = 1000 * millisecond;
const minute = 60 * second;
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const request = require('request');

import { Parse } from './parse/read';
import { shortHash } from './parse/short-hash';
import { IRecord } from './parse/record';

setInterval(async () => {
    await store();
}, 5 * minute);

const getHtmlFile = () => {
    return new Promise<string>((resolve, reject) => {
        request('https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html', (err, res, body) => err ? reject(err) : resolve(body));
    });
}

async function store() {
    try {
        let htmlFile = await getHtmlFile();
        const date = new Date();
        const filePath = '../files/' + date.getTime() + '.html';
        await writeFile(filePath, htmlFile, 'utf8');
        parseData(htmlFile, filePath, date);
    } catch (err) {
        console.log(err)
    }
}

function parseData(html: string, filePath: string, date: Date) {
    const resultFile = '../files/result.json';
    let parsed = Parse(html);
    let hash = shortHash(JSON.stringify(parsed));
    let fileData: IRecord[] = []
    try {
        let fileDataStr = fs.readFileSync(resultFile).toString();
        fileData = JSON.parse(fileDataStr);
        if (fileData[fileData.length - 1].hash === hash) {
            return;
        }
    } catch(err) {
        
    }
    fileData.push({
        content: parsed,
        hash: hash,
        fileName: date.getTime() + '.html',
        path: filePath,
        date: date,
    });
    fs.writeFileSync(resultFile, JSON.stringify(fileData));
}
