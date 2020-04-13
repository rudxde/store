import { load as cheerioLoad } from 'cheerio';
import { shortHash } from './short-hash';

export function readHeader(html: string): { hash: string, fields: { index: number, tag: string }[], html: string } {
    const cheerioDocument = cheerioLoad(html);
    const table = cheerioDocument('div#main table');
    const thead = table.find('thead');
    const headHtml = thead.html();
    let fields = [];
    thead.children('tr').children().each((index, element) => {
        fields.push({
            index,
            tag: cheerioDocument(element).text(),
        });
    });
    return {
        hash: shortHash(headHtml || ''),
        fields,
        html: headHtml,
    };
}

