import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Indicator } from './../models/indicator';
import { DateValue, Performance } from './../models/shared';

// Backend imports
import { IndicatorApiResult } from './../../../../api/models/api/indicator';
import { 
  Operations,
  PerformanceComparisons
     } from './../../../../api/models/shared';


@Injectable()
export class IndicatorService { 

    constructor(private http : Http){
    }

    get(indicatorId:number, goalId:number): Observable<Indicator>{
        return this.http
            .get(`/api/goals/${goalId}/indicators/${indicatorId}`, { headers: this.getHeaders()})
            .map(this.mapIndicator);
    }

    save(indicator:IndicatorApiResult): Observable<Response>{
        return this.http
            .post(`/api/indicators`, indicator ,{ headers: this.getHeaders()})
            .catch(this.handleError);
    }


    handleError(error: Response) {
        console.log(error);
        return Observable.throw(error.json().error || 'Server error');
    }
    
    private getHeaders(){
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        return headers;
    }

    mapIndicator(response:Response): Indicator{
        let tmpResult = response.json() as any;
        let indicator = new Indicator();  
        indicator.id = tmpResult.id;
        indicator.title = tmpResult.title;
        indicator.unit = tmpResult.unit === 'value' ? '' : tmpResult.unit;
        indicator.operation = tmpResult.operation;
        indicator.comparison = tmpResult.comparison;
        indicator.values = tmpResult.values.map((dateValue:any) =>{
            return new DateValue(dateValue.date, dateValue.value, dateValue.expected);
        });
        
        return indicator;
    }

}