import { Injectable }             from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';
import { PerspectiveService } from './perspective-service';
import { Observable } from 'rxjs/Rx';

import { PerspectiveApiResult } from './../../../../api/models/api/perspective';

@Injectable()
export class PerspectiveResolver implements Resolve<Array<PerspectiveApiResult>> {
  constructor(private perspectiveService: PerspectiveService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PerspectiveApiResult[]> {
    return this.perspectiveService.get();
  }

}


