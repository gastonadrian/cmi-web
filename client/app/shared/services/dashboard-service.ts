import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Goal } from './../models/goal';
import { Perspective } from './../models/perspective';

import { Indicator } from './../models/indicator';
import { DateValue, Performance, AppSettings } from './../models/shared';
import { PerspectiveApiResult } from "../../../../api/models/api/perspective";

declare let moment:any;

@Injectable()
export class DashboardService { 
    
    constructor(private http : Http){
    }

    get(from?:Date, to?:Date): Observable<Array<PerspectiveApiResult>>{

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

    mapPerspective(response:Response): Array<PerspectiveApiResult>{
        let tmpResult = response.json() as any;
        let result = tmpResult.data as Array<PerspectiveApiResult>;

        return result;
    }
}