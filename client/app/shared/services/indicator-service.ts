import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Indicator } from './../models/indicator';
import { DateValue, Performance } from './../models/shared';

@Injectable()
export class IndicatorService { 

    constructor(private http : Http){
    }

    get(indicatorId:number, goalId:number): Observable<Indicator>{
        return this.http
            .get(`/api/goals/${goalId}/indicators/${indicatorId}`, { headers: this.getHeaders()})
            .map(this.mapIndicator);
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