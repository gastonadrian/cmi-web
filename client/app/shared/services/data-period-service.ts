import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import { DataPeriod } from './../models/shared';

@Injectable()
export class DataPeriodService {
  // Observable string sources
  private dataPeriodChangeSource:Subject<DataPeriod> = new Subject<DataPeriod>();
  public selectedPeriod: DataPeriod;

  // Observable string streams
  public dataPeriodChanged$:any = this.dataPeriodChangeSource.asObservable();

  // Service message commands
  public changePeriod(period: DataPeriod) {
    this.selectedPeriod = period;
    this.dataPeriodChangeSource.next(period);
  }
}
