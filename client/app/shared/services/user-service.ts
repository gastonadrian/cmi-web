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

    getId(response:Response):string{
        let result = response.json() as any;
        return result.id as string;
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