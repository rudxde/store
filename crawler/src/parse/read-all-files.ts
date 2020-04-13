import * as fs from 'fs';
import { from } from 'rxjs';
import { map, distinctUntilChanged, tap, filter, toArray, take } from 'rxjs/operators';
import { join } from 'path';
import { readHeader } from './distinct-header';
import { Parse } from './read';
import { shortHash } from './short-hash';

const dir = 'C:/Users/rudx/Downloads/coro/files';
from(
    fs.readdirSync(dir, { withFileTypes: true })
        .filter(dirent => !dirent.isDirectory())
        .map(dirent => ({ fileName: dirent.name, path: join(dir, dirent.name) }))
).pipe(
    tap(() => process.stdout.write('.')),
    map(({ fileName, path }) => ({ fileName, path, file: fs.readFileSync(path).toString() })),
    map(({ file, path, fileName }) => ({ fileName, path, content: Parse(file) })),
    filter(x => !!x.content),
    map(x => ({ ...x, hash: shortHash(JSON.stringify(x.content)) })),
    distinctUntilChanged((a, b) => a.hash === b.hash),
    map(x => ({ ...x, date: new Date(parseInt(x.fileName.split('.')[0])) })),
    toArray()
).subscribe({
    next: x => fs.writeFileSync('../files/result.json', JSON.stringify(x)),
});
