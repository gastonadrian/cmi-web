import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Goal } from './../models/goal';
import { Perspective } from './../models/perspective';

import { Indicator } from './../models/indicator';
import { DateValue, Performance, AppSettings } from './../models/shared';

declare let moment:any;

@Injectable()
export class DashboardService { 
    
    constructor(private http : Http){
    }

    get(from?:Date, to?:Date): Observable<Array<Perspective>>{

        let paramString:string = '';
        if(to && from){
            let fromString:string = moment(from).format(AppSettings.dateFormat);
            let toString:string = moment(to).format(AppSettings.dateFormat);
            paramString = `${fromString}/${toString}`;
        }

        return this.http
            .get(`/api/dashboard/${paramString}`, { headers: this.getHeaders()})
            .map(this.mapPerspective);
    }

    private getHeaders(){
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        return headers;
    }

    mapPerspective(response:Response): Array<Perspective>{
        let tmpResult = response.json() as any;
        let result = tmpResult.data as Array<Perspective>;
        for(var i = 0; i < result.length; i ++){
            result[i].performance = new Performance(result[i].performance.dateFrom, result[i].performance.value, result[i].performance.semaphoreStatus, result[i].performance.dateTo);
        
            for(var j=0; j < result[i].goals.length; j++){
                var tmpPerformance = result[i].goals[j].performance;
                result[i].goals[j].performance = new Performance(tmpPerformance.dateFrom, tmpPerformance.value*100, tmpPerformance.semaphoreStatus, tmpPerformance.dateTo);
            }
        }

        return result;
    }
}