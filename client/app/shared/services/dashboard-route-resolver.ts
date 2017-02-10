import { Injectable }             from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';
import { DashboardService } from './dashboard-service';
import { DataPeriodService } from './data-period-service';
import { Observable } from 'rxjs/Rx';

import { Goal } from './../models/goal';
import { DataPeriod } from './../models/shared';
import { Perspective } from './../models/perspective';

@Injectable()
export class DashboardResolver implements Resolve<Array<Perspective>> {
  constructor(
    private service: DashboardService, 
    private router: Router,
    private dataPeriodService: DataPeriodService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Array<Perspective>> {
    let dataPeriod: DataPeriod = this.dataPeriodService.selectedPeriod;
    if(dataPeriod && dataPeriod.id){
      return this.service.get(dataPeriod.start, dataPeriod.end);
    }
    return this.service.get();
  }

}
