import * as fs from 'fs';
import { from } from 'rxjs';
import { map, distinctUntilChanged, tap, filter, toArray } from 'rxjs/operators';
import { join } from 'path';
import { readHeader } from './distinct-header';

const dir = 'C:/Users/rudx/Downloads/coro/files';
from(
    fs.readdirSync(dir, { withFileTypes: true })
        .filter(dirent => !dirent.isDirectory())
        .map(dirent => join(dir, dirent.name))
).pipe(
    tap(() => process.stdout.write('.')),
    map(x => ({ fileName: x, file: fs.readFileSync(x).toString() })),
    map(({ fileName, file }) => ({ fileName, header: readHeader(file) })),
    filter(x => !!x.header.html),
    distinctUntilChanged((a, b) => a.header.hash === b.header.hash),
    tap(({ fileName, header }) => console.log(JSON.stringify({ fileName, header }))),
    toArray()
).subscribe({
    next: x => fs.writeFileSync('headers.json', JSON.stringify(x)),
});
