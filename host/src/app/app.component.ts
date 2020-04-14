import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fromEvent } from 'rxjs';

export interface IRecord {
  hash: string;
  fileName: string;
  path: string;
  content: IEntry[];
  date: Date;
}
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

interface IDiagramLine {
  name: string;
  series: { name: string | number | Date, value: number }[]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  view: [number, number];
  data: IDiagramLine[] = [];
  colorScheme = {
    domain: ["#5AA454", "#E44D25", "#CFC0BB", "#7aa3e5", "#a8385d", "#aae3f5"]
  };

  records: IRecord[];

  constructor(
    private http: HttpClient,
  ) {

  }
  ngOnInit(): void {
    this.setView();
    this.http.get<IRecord[]>('/assets/result.json').subscribe({
      next: x => {
        this.records = x;
        this.createData(false, false, true);
      }
    });

    fromEvent(window, 'resize').subscribe({
      next: () => this.setView(),
    })
  }

  setView() {
    this.view = [window.innerWidth, window.innerWidth/16*8];
  }

  createData(cumulation: boolean, death: boolean, cases: boolean): void {
    let dataDeath: IDiagramLine[] = [];
    let dataCases: IDiagramLine[] = [];
    let dataCumulationDeath: IDiagramLine = { name: 'Gesamt Tote', series: [] };
    let dataCumulationCases: IDiagramLine = { name: 'Gesamt Fälle', series: [] };
    let nameIndexMap = new Map<string, number>();
    for (let record of this.records) {
      let date = new Date(record.date);
      for (let recordState of record.content) {
        if (recordState.state === 'Gesamt') {
          dataCumulationCases.series.push({ name: date, value: recordState.cases });
          dataCumulationDeath.series.push({ name: date, value: recordState.death });
        } else {
          if (!nameIndexMap.get(recordState.state.trim())) {
            dataDeath.push({ name: recordState.state + ' Tote', series: [] });
            dataCases.push({ name: recordState.state + ' Fälle', series: [] });
            nameIndexMap.set(recordState.state.trim(), dataCases.length - 1);
          }
          let stateIndex = nameIndexMap.get(recordState.state.trim());
          dataCases[stateIndex].series.push({ name: date, value: recordState.cases });
          dataDeath[stateIndex].series.push({ name: date, value: recordState.death });
        }
      }
    }
    this.data = [
      ...(cumulation && death ? [dataCumulationDeath] : []),
      ...(cumulation && cases ? [dataCumulationCases] : []),
      ...(cases ? dataCases : []),
      ...(death ? dataDeath : []),
    ]
  }

}
