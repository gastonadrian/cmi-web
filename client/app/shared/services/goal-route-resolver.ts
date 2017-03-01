import { Injectable }             from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';
import { GoalService } from './goal-service';
import { Observable } from 'rxjs/Rx';

import { GoalApiResult } from './../../../../api/models/api/goal';

@Injectable()
export class GoalResolver implements Resolve<GoalApiResult> {
  constructor(private goalService: GoalService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<GoalApiResult> {
    let id = route.params['goalid'];
    return this.goalService.get(id);
  }

}