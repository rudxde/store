import { load as cheerioLoad } from 'cheerio';
import * as fs from 'fs';
import { readHeader } from './distinct-header';

export interface IEntry {
    state?: string;
    cases?: number;
    death?: number;
    differenceToPrevDay?: number;
    casesPer1000Residents?: number;
    electronicSubmitted_cases?: number;
    electronicSubmitted_death?: number;
    severeRegion?: string;
}

function bracedExtra(input: string): { root: string, braced: string } {
    let braceStart = input.indexOf('(');
    if (braceStart === -1) return { root: input, braced: '' };
    return {
        root: input.substring(0, braceStart),
        braced: input.substring(braceStart + 1, input.length - 1),
    }
}

function parseDottedInt(cnt: string): number {
    return parseInt(cnt.replace(/\./g, '')) || 0;
}

export function Parse(html: string): IEntry[] {
    let result = [];
    const cheerioDocument = cheerioLoad(html);
    const table = cheerioDocument('div#main div.text table');
    const header = readHeader(html);
    if (!header.html) return;
    let headerHash = header.hash;
    const tbody = table.find('tbody');
    tbody.children('tr').each((i, element) => {
        let tds = cheerioDocument(element).children();
        let entry: IEntry = {};
        switch (headerHash) {
            case '710ee6c251':
                entry.state = cheerioDocument(tds.get(0)).text();
                entry.cases = parseDottedInt(cheerioDocument(tds.get(1)).text());
                entry.death = parseDottedInt(cheerioDocument(tds.get(2)).text());
                entry.severeRegion = cheerioDocument(tds.get(3)).text().replace(/\n/g, '').trim() || undefined;
                break;
            case 'bc2a7a7597':
                entry.state = cheerioDocument(tds.get(0)).text();
                const tds_1 = bracedExtra(cheerioDocument(tds.get(1)).text());
                entry.cases = parseDottedInt(tds_1.root);
                entry.death = parseDottedInt(tds_1.braced);
                const tds_2 = bracedExtra(cheerioDocument(tds.get(2)).text());
                entry.electronicSubmitted_cases = parseDottedInt(tds_2.root);
                entry.electronicSubmitted_death = parseDottedInt(tds_2.braced);
                entry.severeRegion = cheerioDocument(tds.get(3)).text().replace(/\n/g, '').trim() || undefined;
                break;
            case '207f691314':
            case 'b77e919548': // Fall through
            case 'c00ec258af': // Fall through
            case '2fb12621bb': // Fall through
            case 'af455db7da': // Fall through
                entry.state = cheerioDocument(tds.get(0)).text();
                entry.cases = parseDottedInt(cheerioDocument(tds.get(1)).text());
                entry.electronicSubmitted_cases = entry.cases;
                entry.differenceToPrevDay = parseDottedInt(cheerioDocument(tds.get(2)).text());
                entry.casesPer1000Residents = parseDottedInt(cheerioDocument(tds.get(3)).text());
                entry.death = parseDottedInt(cheerioDocument(tds.get(4)).text());
                entry.electronicSubmitted_death = entry.death;
                entry.severeRegion = cheerioDocument(tds.get(5)).text() || undefined;
                break;
            default:
                console.log('unknown Header!')
        }
        result.push(entry);
    });
    return result;
}

// let s = fs.readFileSync('test1.html').toString();
// console.log(ParseFormat(s));