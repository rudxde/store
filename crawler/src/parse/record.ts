import { IEntry } from "./read";

export interface IRecord {
    hash: string;
    fileName: string;
    path: string;
    content: IEntry[];
    date: Date;
}
