import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

// import { GoalIndicator } from './../models/goal';
// import { Indicator } from './../models/indicator';
// import { DateValue, Performance } from './../models/shared';

import { PerspectiveApiResult } from './../../../../api/models/api/perspective';
import { GoalApiResult } from './../../../../api/models/api/goal';

import { GoalIndicatorApiResult } from './../../../../api/models/api/goal-indicator';
import { BackendAppSettings, IColumnOperationOption } from './../../../../api/models/shared';

@Injectable()
export class GoalService { 

    constructor(private http : Http){
    }

    get(goalId:number): Observable<GoalApiResult>{
        return this.http
            .get(`/api/goals/${goalId}`, { headers: this.getHeaders()})
            .map(this.mapGoal);
    }

    getPerformance(goalId:string, from?:Date, to?:Date): Observable<GoalApiResult>{
        return this.http
            .get(`/api/goaldetailedperformance/${goalId}/${from}/${to}`, { headers: this.getHeaders()})
            .map(this.mapGoal);
    }

    private getHeaders(){
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        return headers;
    }

    save(goal:GoalApiResult): Observable<Response>{
        return this.http
            .post(`/api/goalcreate`, goal, { headers: this.getHeaders() })
            .map(this.getId)
            .catch(this.handleError);
    }

    update(goal:GoalApiResult): Observable<Response>{
        return this.http
            .post(`/api/goalupdate`, goal, { headers: this.getHeaders() })
            .catch(this.handleError);
    }

    delete(goal:GoalApiResult): Observable<Response>{
        return this.http
            .post(`/api/goalremove/${goal._id}`, {}, { headers: this.getHeaders() })
            .map(this.resultOk)
            .catch(this.handleError);
    }

    assignIndicator(goalIndicator:GoalIndicatorApiResult): Observable<Response>{
        return this.http
            .post(`/api/goalindicator`, goalIndicator, { headers: this.getHeaders() })
            .map(this.resultOk)
            .catch(this.handleError);
    }

    resultOk(response:Response):Boolean{
        return (response.json() as any).ok;
    }
    getId(response:Response):string{
        let result = response.json() as any;
        return result.id as string;
    }

    handleError(error: Response) {
        return Observable.throw(error.json().error || 'Server error');
    }

    mapGoal(response:Response): GoalApiResult{
      let tmp:any = response.json();
      if(typeof tmp.ok !== undefined){
          Observable.throw('El Objetivo no existe!');
      }

      for(var i=0; i < tmp.indicators.length; i++){
          tmp.indicators[i].columnOperationTitle = BackendAppSettings.columnOperations.find( (value:IColumnOperationOption, index:any, obj:any) => { return value.id === tmp.indicators[i].datasource.columnOperation; }).title;
      }

      return tmp as GoalApiResult;
    }
}