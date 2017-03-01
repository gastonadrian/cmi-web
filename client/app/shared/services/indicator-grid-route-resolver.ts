import { Injectable }             from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';
import { IndicatorService } from './indicator-service';
import { Observable } from 'rxjs/Rx';

import { Indicator } from './../models/indicator';


@Injectable()
export class IndicatorGridResolver implements Resolve<any> {
  constructor(private indicatorService: IndicatorService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let id = route.params['indicatorid'];
    let goalId = route.params['goalid'];

    return this.indicatorService._get(id, goalId);
  }
}
