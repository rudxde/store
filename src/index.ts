const millisecond = 1;
const second = 1000 * millisecond;
const minute = 60 * second;
const { promisify } = require('util')
const fs = require('fs')
const writeFile = promisify(fs.writeFile)
const request = require('request')

setInterval(async () => {
    await store();
}, 5 * minute);
const getHtmlFile = () => {
    return new Promise((resolve, reject) => {
        request('https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html', (err, res, body) => err ? reject(err) : resolve(body))
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