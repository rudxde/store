import { createHash } from 'crypto';

export function shortHash(input: string): string {
    let shasum = createHash('sha1');
    shasum.update(input);
    let longHash = shasum.digest('hex');
    return longHash.substr(-10);
}
