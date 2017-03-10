import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';


@Injectable()
export class UserService { 

    constructor(private http : Http){
    }

    save(user:any): Observable<Response>{
        return this.http
            .post(`/api/customers`, user ,{ headers: this.getHeaders()})
            .map(this.getId)
            .catch(this.handleError);
    }

    getAll():Observable<any[]>{
        return this.http
            .get(`/api/customers`, { headers: this.getHeaders() })
            .map(this.mapResponse)
            .catch(this.handleError);
    }

    getId(response:Response):string{
        let result = response.json() as any;
        return result.id as string;
    }

    mapResponse(response:Response):any[]{
        return response.json() as any[];
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
}