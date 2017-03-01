import { Injectable }             from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';
import { IndicatorService } from './indicator-service';
import { Observable } from 'rxjs/Rx';

import { IndicatorApiResult } from './../../../../api/models/api/indicator';

@Injectable()
export class IndicatorResolver implements Resolve<Array<IndicatorApiResult>> {
  constructor(private indicatorService: IndicatorService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IndicatorApiResult[]> {
    return this.indicatorService.getAll()
  }

}


