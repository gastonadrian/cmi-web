import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { PerspectiveApiResult } from './../../../../api/models/api/perspective';
import { GoalApiResult } from './../../../../api/models/api/goal';

@Injectable()
export class PerspectiveService { 

    constructor(private http : Http){
    }

    get(): Observable<Array<PerspectiveApiResult>>{
        return this.http
            .get(`/api/perspectives`, { headers: this.getHeaders()})
            .map(this.mapPerspective);
    }

    save(perspectives:Array<PerspectiveApiResult>): Observable<Response>{
        return this.http
            .post(`/api/perspectives`, perspectives, { headers: this.getHeaders() })
            .catch(this.handleError);
    }

    private getHeaders(){
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        return headers;
    }

    getId(response:Response):string{
        let result = response.json() as any;
        return result.id as string;
    }


    handleError(error: Response) {
        console.log(error);
        return Observable.throw(error.json().error || 'Server error');
    }    

    mapPerspective(response:Response): Array<PerspectiveApiResult>{
        let tmpResult = response.json() as Array<PerspectiveApiResult>;
      return tmpResult;
    }

}