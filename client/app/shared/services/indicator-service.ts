import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Indicator } from './../models/indicator';
import { DateValue, Performance } from './../models/shared';

// Backend imports
import { IndicatorApiResult } from './../../../../api/models/api/indicator';
import { IExpectation } from './../../../../api/models/api/expectation';

import { 
  Operations,
  PerformanceComparisons,
  IColumnOperationOption,
  BackendAppSettings
     } from './../../../../api/models/shared';


@Injectable()
export class IndicatorService { 

    constructor(private http : Http){
    }

    _get(indicatorId:number, goalId:number): Observable<Response>{
        return this.http
            .get(`/api/goals/${goalId}/indicators/${indicatorId}`, { headers: this.getHeaders()})
    }

    get(indicatorId:string):Observable<IndicatorApiResult>{
        return this.http
            .get(`/api/indicators/${indicatorId}`, {headers: this.getHeaders()})
            .map(this.mapIndicator)
            .catch(this.handleError);
    }

    getAll(): Observable<Array<IndicatorApiResult>>{
        return this.http
            .get(`/api/indicatorsgetall`, { headers: this.getHeaders()})
            .map(this.mapGetAll);
    }

    mapGetAll(response:Response):Array<IndicatorApiResult>{
        let temp:Array<IndicatorApiResult> = response.json() as Array<IndicatorApiResult>;
        
        for(var i=0; i< temp.length; i++){
            temp[i].columnOperationTitle = BackendAppSettings.columnOperations.find( (value:IColumnOperationOption, index:any, obj:any) => { return value.id === temp[i].datasource.columnOperation; }).title;
        }

        return temp;
    }

    mapIndicator(response:Response):IndicatorApiResult{
        return response.json() as IndicatorApiResult;
    }

    save(indicator:IndicatorApiResult): Observable<Response>{
        return this.http
            .post(`/api/indicatorcreate`, indicator ,{ headers: this.getHeaders()})
            .map(this.getId)
            .catch(this.handleError);
    }

    setQuarterExpectation(indicatorId:string, expectation:IExpectation): Observable<Response>{
        return this.http
            .post(`/api/indicatorexpectation/${indicatorId}`, expectation, { headers: this.getHeaders() })
            .map(this.resultOk)
            .catch(this.handleError);
    }

    removeGoal(indicatorId:string, goalId:string):Observable<Response>{
        return this.http
            .post(`api/goalindicatorremove`, { goalId: goalId, indicatorId:indicatorId }, { headers: this.getHeaders() } )
            .map(this.resultOk)
            .catch(this.handleError);
    }

    getId(response:Response):string{
        let result = response.json() as any;
        return result.id as string;
    }

    handleError(error: Response) {
        console.log(error);
        return Observable.throw(error.json().error || 'Server error');
    }
    resultOk(response:Response):Boolean{
        return (response.json() as any).ok;
    }
    
    private getHeaders(){
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        return headers;
    }
}