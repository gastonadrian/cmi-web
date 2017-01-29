import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Goal, GoalIndicator } from './../models/goal';
import { Indicator } from './../models/indicator';
import { DateValue, Performance } from './../models/shared';

@Injectable()
export class GoalService { 

    constructor(private http : Http){
    }

    get(goalId:number): Observable<Goal>{
        return this.http
            .get(`/api/goals/${goalId}`, { headers: this.getHeaders()})
            .map(this.mapGoal);
    }

    private getHeaders(){
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        return headers;
    }

    mapGoal(response:Response): Goal{
      let tmpResult = response.json() as any;
      let result = new Goal();      
      result.id = tmpResult.id;
      result.title = tmpResult.title;
    //   result.performance = new Performance();
      result.values = tmpResult.values.map( (values:any) => {  return new DateValue(values[0], values[1]); });
      result.indicators = new Array<GoalIndicator>();
      for(var i=0; i < tmpResult.indicators.length; i++){
            let goalIndicator = new GoalIndicator();
            goalIndicator.goalId = result.id;
            goalIndicator.factor = 0;
            goalIndicator.performance = new Performance(tmpResult.dateFrom, tmpResult.indicators[i].performance, tmpResult.indicators[i].semaphoreStatus);
            goalIndicator.performance.dateTo = tmpResult.dateTo;
            goalIndicator.indicator = new Indicator();  
            goalIndicator.indicator.title = tmpResult.indicators[i].title;
            goalIndicator.indicator.id = tmpResult.indicators[i].id;
            goalIndicator.indicator.unit = tmpResult.indicators[i].unit === 'value' ? '' : tmpResult.indicators[i].unit;
            goalIndicator.indicator.operation = tmpResult.indicators[i].operation;
            goalIndicator.indicator.comparison = tmpResult.indicators[i].comparison;
            goalIndicator.indicator.values = new Array<DateValue>();
            goalIndicator.indicator.values.push(new DateValue(new Date(tmpResult.dateFrom), tmpResult.indicators[i].value))
            result.indicators.push(goalIndicator);
      }
      return result;
    }

}