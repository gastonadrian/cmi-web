import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Goal } from './../models/goal';
import { Perspective } from './../models/perspective';


@Injectable()
export class PerspectiveService { 

    constructor(private http : Http){
    }

    get(): Observable<Array<Perspective>>{
        return this.http
            .get(`/api/perspectives`, { headers: this.getHeaders()})
            .map(this.mapPerspective);
    }

    private getHeaders(){
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        return headers;
    }

    mapPerspective(response:Response): Array<Perspective>{
        let tmpResult = response.json() as Array<any>;
        let result = new Array<Perspective>();    

        for(var j=0; j < tmpResult.length; j++){
            let perspective = new Perspective();      
            perspective.id = tmpResult[j].id;
            perspective.title = tmpResult[j].title;
            perspective.goals = new Array<Goal>();

            for(var i=0; i < tmpResult[j].goals.length; i++){
                let goal = new Goal();
                goal.id = tmpResult[j].goals[i].id;
                goal.title = tmpResult[j].goals[i].title;
                perspective.goals.push(goal);
            }
            result.push(perspective);                
        }
      return result;
    }

}