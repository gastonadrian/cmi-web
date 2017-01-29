import { Injectable }             from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';
import { GoalService } from './goal-service';
import { Observable } from 'rxjs/Rx';

import { Goal, GoalIndicator } from './../models/goal';


@Injectable()
export class GoalResolver implements Resolve<Goal> {
  constructor(private goalService: GoalService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Goal> {
    let id = route.params['goalid'];
    return this.goalService.get(id);
  }

}
